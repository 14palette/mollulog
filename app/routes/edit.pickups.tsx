import { type ActionFunctionArgs, type LoaderFunctionArgs, type MetaFunction, redirect } from "react-router";
import { useLoaderData } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { AddContentButton } from "~/components/molecules/editor";
import { PickupHistoryView } from "~/components/organisms/pickup";
import type { UserPickupEventsQuery, UserPickupEventsQueryVariables } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { deletePickupHistory, getPickupHistories } from "~/models/pickup-history";
import { getAllStudentsMap } from "~/models/student";
import { userPickupEventsQuery } from "./$username.pickups";
import dayjs from "dayjs";

export const meta: MetaFunction = () => [
  { title: "모집 이력 관리 | 몰루로그" },
];

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }

  const pickupHistories = await getPickupHistories(env, sensei.id);
  const eventUids = pickupHistories.map((history) => history.eventId);
  const { data, error } = await runQuery<UserPickupEventsQuery, UserPickupEventsQueryVariables>(userPickupEventsQuery, { eventUids });
  if (!data) {
    console.error(error);
    throw "failed to load data";
  }

  const allStudentsMap = await getAllStudentsMap(env);
  const aggregatedHistories = (await getPickupHistories(env, sensei.id)).map((history) => ({
    uid: history.uid,
    event: data.events.nodes.find((event) => event.uid === history.eventId)!,
    students: history.result
      .flatMap((trial) => trial.tier3StudentIds.filter((studentId) => studentId).map((studentId) => allStudentsMap[studentId]))
      .map((student) => ({ studentId: student.uid, name: student.name })),
  })).sort((a, b) => dayjs(b.event.since).diff(dayjs(a.event.since)));

  return { pickupHistories: aggregatedHistories };
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  if (request.method !== "DELETE") {
    return redirect("/edit/pickups");
  }

  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
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
      <AddContentButton text="새로운 모집 이력 추가하기" link="/edit/pickups/new" />

      {pickupHistories.map(({ uid, event, students }) => {
        const pickupStudentUids = event.pickups
          .map((pickup) => pickup.student?.uid)
          .filter((id) => id !== undefined);

        return (
          <PickupHistoryView
            key={uid}
            uid={uid}
            event={{ ...event, since: new Date(event.since) }}
            tier3Students={students.map((student) => ({ uid: student.studentId, name: student.name }))}
            pickupStudentUids={pickupStudentUids}
            editable={true}
          />
        );
      })}
    </>
  );
}
