import { type ActionFunctionArgs, type LoaderFunctionArgs, type MetaFunction, redirect } from "react-router";
import { useLoaderData, useSearchParams, useSubmit } from "react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Button } from "~/components/atoms/form";
import { StudentCard } from "~/components/atoms/student";
import { SubTitle } from "~/components/atoms/typography";
import { ContentSelector } from "~/components/molecules/editor";
import { PickupHistoryEditor, PickupHistoryImporter } from "~/components/organisms/pickup";
import { graphql } from "~/graphql";
import type { PickupEventsQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { createPickupHistory, getPickupHistory, type PickupHistory, updatePickupHistory } from "~/models/pickup-history";
import { getAllStudents } from "~/models/student";

const pickupEventsQuery = graphql(`
  query PickupEvents {
    events(first: 9999) {
      nodes {
        uid name since until type rerun
        pickups {
          student { uid }
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
  return {
    events: data.events.nodes.filter((event) => event.pickups.length > 0 && dayjs(event.since).isBefore(now)).reverse(),
    tier3Students: (await getAllStudents(env))
      .filter((student) => student.initialTier === 3)
      .map((student) => ({ uid: student.uid, name: student.name })),
    currentPickupHistory,
  };
};

type ActionData = {
  eventUid: string;
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
    await updatePickupHistory(env, sensei.id, params.id, data.eventUid, data.result, data.rawResult);
  } else {
    await createPickupHistory(env, sensei.id, data.eventUid, data.result, data.rawResult ?? null);
  }
  return redirect("/edit/pickups");
}

export default function EditPickup() {
  const { events, tier3Students, currentPickupHistory } = useLoaderData<typeof loader>();

  let initialEventUid = null;
  if (currentPickupHistory) {
    initialEventUid = currentPickupHistory.eventId;
  } else {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get("eventId");
    if (eventId) {
      initialEventUid = eventId;
    }
  }

  let initialTotalCount: number | undefined = undefined;
  let initialTier3Count: number | undefined = undefined;
  let initialTier3StudentUids: string[] | undefined = undefined;
  if (currentPickupHistory?.result) {
    initialTotalCount = Math.max(...currentPickupHistory.result.map((trial) => trial.trial));
    currentPickupHistory.result.forEach((trial) => {
      initialTier3Count = (initialTier3Count ?? 0) + trial.tier3Count;
      initialTier3StudentUids = (initialTier3StudentUids ?? []).concat(trial.tier3StudentIds);
    });
  }

  const initialEvent = initialEventUid ? events.find((event) => event.uid === initialEventUid) : null;
  const [eventUid, setEventUid] = useState<string | null>(initialEvent?.uid ?? null);

  const [editorMode, setEditorMode] = useState<"edit" | "import">(currentPickupHistory?.rawResult ? "import" : "edit");

  const rawSubmit = useSubmit();
  const submit = (data: ActionData) => rawSubmit(data, { method: "post", encType: "application/json" });

  return (
    <div className="min-h-screen max-w-4xl pb-96">
      <ContentSelector
        contents={events.map((event) => ({
          uid: event.uid,
          name: event.name,
          imageUrl: null,
          description: (
            <div className="flex gap-x-2">
              {event.pickups.map((pickup) => (
                <div className="w-8" key={pickup.studentName}>
                  <StudentCard uid={pickup.student?.uid ?? null} />
                </div>
              ))}
            </div>
          ),
          searchKeyword: `${event.name} ${event.pickups.map((pickup) => pickup.studentName).join(" ")}`,
        }))}
        placeholder="모집 이력을 기록할 이벤트를 선택하세요"
        initialContentUid={eventUid ?? undefined}
        onSelectContent={setEventUid}
        searchable
      />

      {eventUid && (
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
              initialTier3StudentIds={initialTier3StudentUids}
              onComplete={(result) => submit({
                eventUid,
                result: [{ trial: result.totalCount, tier3Count: result.tier3Count, tier3StudentIds: result.tier3StudentIds }],
              })}
            />
          )}
          {editorMode === "import" && (
            <PickupHistoryImporter
              tier3Students={tier3Students}
              initialResult={currentPickupHistory?.result ?? undefined}
              initialRawResult={currentPickupHistory?.rawResult ?? undefined}
              onComplete={({ result, rawResult }) => submit({ eventUid, result, rawResult })}
            />
          )}
        </>
      )}
    </div>
  );
}
