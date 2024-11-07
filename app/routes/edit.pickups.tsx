import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Title } from "~/components/atoms/typography";
import { AddContentButton } from "~/components/molecules/editor";
import { PickupHistoryView } from "~/components/organisms/pickup";
import { UserPickupEventsQuery, UserPickupEventsQueryVariables } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { deletePickupHistory, getPickupHistories } from "~/models/pickup-history";
import { getAllStudentsMap } from "~/models/student";
import { userPickupEventsQuery } from "./$username.pickups";

export const meta: MetaFunction = () => [
  { title: "모집 이력 관리 | 몰루로그" },
];

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const pickupHistories = await getPickupHistories(env, sensei.id);
  const eventIds = pickupHistories.map((history) => history.eventId);
  const { data, error } = await runQuery<UserPickupEventsQuery, UserPickupEventsQueryVariables>(userPickupEventsQuery, { eventIds });
  if (!data) {
    console.error(error);
    throw "failed to load data";
  }

  const allStudentsMap = await getAllStudentsMap(env);
  const aggregatedHistories = (await getPickupHistories(env, sensei.id)).map((history) => ({
    uid: history.uid,
    event: data.events.nodes.find((event) => event.eventId === history.eventId)!,
    students: history.result
      .flatMap((trial) => trial.tier3StudentIds.map((studentId) => allStudentsMap[studentId]))
      .map((student) => ({ studentId: student.id, name: student.name })),
  }));

  return json({ pickupHistories: aggregatedHistories });
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  if (request.method !== "DELETE") {
    return redirect("/edit/pickups");
  }

  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const body = new URLSearchParams(await request.text());
  const uid = body.get("uid")!;
  await deletePickupHistory(env, sensei.id, uid);

  return redirect("/edit/pickups");
};

export default function EditPickups() {
  const { pickupHistories } = useLoaderData<typeof loader>();

  return (
    <>
      <Title text="모집 이력 관리" />
      <div className="max-w-4xl">
        <AddContentButton text="새로운 모집 이력 추가하기" link="/edit/pickups/new" />

        {pickupHistories.map(({ uid, event, students }) => {
          const pickupStudentIds = event.pickups
            .map((pickup) => pickup.student?.studentId)
            .filter((id) => id !== undefined);

          return (
            <PickupHistoryView
              key={uid} uid={uid}
              event={{ ...event, since: new Date(event.since) }}
              students={students}
              pickupStudentIds={pickupStudentIds}
              editable={true}
            />
          );
        })}
      </div>
    </>
  );
}
