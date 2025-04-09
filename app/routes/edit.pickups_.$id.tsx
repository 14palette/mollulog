import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams, useSubmit } from "@remix-run/react";
import dayjs from "dayjs";
import { useState } from "react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Button } from "~/components/atoms/form";
import { StudentCard } from "~/components/atoms/student";
import { SubTitle, Title } from "~/components/atoms/typography";
import { ContentSelector } from "~/components/molecules/editor";
import { PickupHistoryEditor, PickupHistoryImporter } from "~/components/organisms/pickup";
import { graphql } from "~/graphql";
import { type PickupEventsQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { createPickupHistory, getPickupHistory, PickupHistory, updatePickupHistory } from "~/models/pickup-history";
import { getAllStudents } from "~/models/student";

const pickupEventsQuery = graphql(`
  query PickupEvents {
    events(first: 9999) {
      nodes {
        eventId name since until type rerun
        pickups {
          student { studentId }
          studentName
        }
      }
    }
  }
`);

export const meta: MetaFunction = () => [
  { title: "모집 이력 관리 | 몰루로그" },
];

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }

  let currentPickupHistory = null;
  if (params.id && params.id !== "new") {
    currentPickupHistory = await getPickupHistory(env, sensei.id, params.id, true);
  }

  const { data, error } = await runQuery<PickupEventsQuery>(pickupEventsQuery, {});
  if (!data) {
    console.error(error);
    throw "failed to load data";
  }

  const now = dayjs();
  return json({
    events: data.events.nodes.filter((event) => event.pickups.length > 0 && dayjs(event.since).isBefore(now)).reverse(),
    tier3Students: (await getAllStudents(env))
      .filter((student) => student.initialTier === 3)
      .map((student) => ({ studentId: student.id, name: student.name })),
    currentPickupHistory,
  });
};

type ActionData = {
  eventId: string;
  result: PickupHistory["result"];
  rawResult?: string;
};

export const action = async ({ context, request, params }: ActionFunctionArgs) => {
  const data = await request.json<ActionData>();

  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }

  if (params.id && params.id !== "new") {
    await updatePickupHistory(env, sensei.id, params.id, data.eventId, data.result, data.rawResult);
  } else {
    await createPickupHistory(env, sensei.id, data.eventId, data.result, data.rawResult ?? null);
  }
  return redirect("/edit/pickups");
}

export default function EditPickup() {
  const { events, tier3Students, currentPickupHistory } = useLoaderData<typeof loader>();

  let initialEventId = null;
  if (currentPickupHistory) {
    initialEventId = currentPickupHistory.eventId;
  } else {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get("eventId");
    if (eventId) {
      initialEventId = eventId;
    }
  }

  let initialTotalCount: number | undefined = undefined;
  let initialTier3Count: number | undefined = undefined;
  let initialTier3StudentIds: string[] | undefined = undefined;
  if (currentPickupHistory?.result) {
    initialTotalCount = Math.max(...currentPickupHistory.result.map((trial) => trial.trial));
    currentPickupHistory.result.forEach((trial) => {
      initialTier3Count = (initialTier3Count ?? 0) + trial.tier3Count;
      initialTier3StudentIds = (initialTier3StudentIds ?? []).concat(trial.tier3StudentIds);
    });
  }

  const initialEvent = initialEventId ? events.find((event) => event.eventId === initialEventId) : null;
  const [eventId, setEventId] = useState<string | null>(initialEvent?.eventId ?? null);

  const [editorMode, setEditorMode] = useState<"edit" | "import">(currentPickupHistory?.rawResult ? "import" : "edit");

  const rawSubmit = useSubmit();
  const submit = (data: ActionData) => rawSubmit(data, { method: "post", encType: "application/json" });

  return (
    <div className="min-h-screen max-w-4xl pb-96">
      <ContentSelector
        contents={events.map((event) => ({
          contentId: event.eventId,
          name: event.name,
          imageUrl: null,
          description: (
            <div className="flex gap-x-2">
              {event.pickups.map((pickup) => (
                <div className="w-8" key={pickup.studentName}>
                  <StudentCard studentId={pickup.student?.studentId ?? null} />
                </div>
              ))}
            </div>
          ),
          searchKeyword: `${event.name} ${event.pickups.map((pickup) => pickup.studentName).join(" ")}`,
        }))}
        placeholder="모집 이력을 기록할 이벤트를 선택하세요"
        initialContentId={eventId ?? undefined}
        onSelectContent={setEventId}
        searchable
      />

      {eventId && (
        <>
          <SubTitle text="모집 내용" />
          {!currentPickupHistory && (
            <Button
              text={editorMode === "edit" ? "외부 데이터 불러오기" : "직접 입력하기"}
              onClick={() => setEditorMode((prev) => prev === "edit" ? "import" : "edit")}
            />
          )}
          {editorMode === "edit" && (
            <PickupHistoryEditor
              tier3Students={tier3Students}
              initialTotalCount={initialTotalCount}
              initialTier3Count={initialTier3Count}
              initialTier3StudentIds={initialTier3StudentIds}
              onComplete={(result) => submit({
                eventId,
                result: [{ trial: result.totalCount, tier3Count: result.tier3Count, tier3StudentIds: result.tier3StudentIds }],
              })}
            />
          )}
          {editorMode === "import" && (
            <PickupHistoryImporter
              tier3Students={tier3Students}
              initialResult={currentPickupHistory?.result ?? undefined}
              initialRawResult={currentPickupHistory?.rawResult ?? undefined}
              onComplete={({ result, rawResult }) => submit({ eventId, result, rawResult })}
            />
          )}
        </>
      )}
    </div>
  );
}
