import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { EventTypeEnum, type UserPickupEventsQuery, type UserPickupEventsQueryVariables } from "~/graphql/graphql";
import { getAuthenticator } from "~/auth/authenticator.server";
import { runQuery } from "~/lib/baql";
import { getPickupHistories } from "~/models/pickup-history";
import { useLoaderData } from "react-router";
import { ErrorPage } from "~/components/organisms/error";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { AddContentButton } from "~/components/molecules/editor";
import { PickupHistoryView } from "~/components/organisms/pickup";
import { SubTitle } from "~/components/atoms/typography";
import { graphql } from "~/graphql";
import { getAllStudentsMap } from "~/models/student";
import dayjs from "dayjs";
import { getRouteSensei } from "./$username";

export const userPickupEventsQuery = graphql(`
  query UserPickupEvents($eventUids: [String!]!) {
    events(uids: $eventUids) {
      nodes {
        uid name type since
        pickups {
          student { uid }
        }
      }
    }
  }
`);

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""} - 모집 이력 | 몰루로그`.trim() },
    { name: "description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
    { name: "og:title", content: `${params.username || ""} - 모집 이력 | 몰루로그`.trim() },
    { name: "og:description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
  ];
};

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getRouteSensei(env, params);

  const pickupHistories = await getPickupHistories(env, sensei.id);
  const eventUids = pickupHistories.map((history) => history.eventId);
  const { data, error } = await runQuery<UserPickupEventsQuery, UserPickupEventsQueryVariables>(userPickupEventsQuery, { eventUids });
  if (!data) {
    console.error(error);
    throw "failed to load data";
  }

  const allStudentsMap = await getAllStudentsMap(env);
  const aggregatedHistories = (await getPickupHistories(env, sensei.id)).map((history) => ({
    ...history,
    event: data.events.nodes.find((event) => event.uid === history.eventId)!,
    students: history.result
      .flatMap((trial) => trial.tier3StudentIds.filter((studentId) => studentId).map((studentId) => allStudentsMap[studentId]))
      .map((student) => ({ studentId: student.id, name: student.name })),
  })).sort((a, b) => dayjs(b.event.since).diff(dayjs(a.event.since)));

  let tier3Count = 0, tier3RateCount = 0;
  let pickupCount = 0, pickupRateCount = 0;
  aggregatedHistories.forEach((history) => {
    const currentTier3Count = history.result.map((trial) => trial.tier3Count).reduce((a, b) => a + b);

    const pickupStudentUids = history.event.pickups.map((pickup) => pickup.student?.uid).filter((id) => id !== undefined);
    const currentPickupCount = history.result.flatMap((trial) => trial.tier3StudentIds).filter((uid) => pickupStudentUids.includes(uid)).length;

    tier3Count += currentTier3Count;
    pickupCount += currentPickupCount;

    if (history.event.type === EventTypeEnum.Fes) {
      tier3RateCount += currentTier3Count * 0.5;
      pickupRateCount += currentPickupCount * 0.5;
    } else {
      tier3RateCount += currentTier3Count;
      pickupRateCount += currentPickupCount;
    }
  });

  const pickupStatistics = {
    trial: pickupHistories.map((history) => Math.max(...history.result.map((result) => result.trial))).reduce((a, b) => a + b, 0),
    tier3Count,
    tier3RateCount,
    pickupCount,
    pickupRateCount,
  };

  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  return {
    me: sensei.username === currentUser?.username,
    pickupHistories: aggregatedHistories.map((history) => ({
      uid: history.uid,
      event: history.event,
      tier3Students: history.students,
      trial: history.result.length > 0 ? history.result[history.result.length - 1].trial : 0,
    })),
    pickupStatistics,
  };
};

export default function UserPickups() {
  const { pickupHistories, pickupStatistics, me } = useLoaderData<typeof loader>();
  if (pickupHistories.length === 0) {
    return (
      <div className="my-8">
        {me && <AddContentButton text="새로운 모집 이력 추가하기" link="/edit/pickups/new" />}
        <ErrorPage Icon={SparklesIcon} message="아직 모집 이력이 없어요" />
      </div>
    );
  }

  return (
    <div className="my-8">
      <SubTitle text="모집 통계" />
      <div className="p-4 flex grid md:grid-cols-3 border border-neutral-200 dark:border-neutral-700 rounded-lg">
        <div className="my-4 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">총 모집 횟수</p>
          <p className="text-2xl font-bold">{pickupStatistics.trial} 번</p>
        </div>
        <div className="my-4 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">★3 학생 모집 횟수</p>
          <p className="text-2xl font-bold">{pickupStatistics.tier3Count} 번</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{(pickupStatistics.tier3RateCount / pickupStatistics.trial * 100).toFixed(2)} %</p>
        </div>
        <div className="my-4 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">픽업 학생 모집 횟수</p>
          <p className="text-2xl font-bold">{pickupStatistics.pickupCount} 번</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{(pickupStatistics.pickupRateCount / pickupStatistics.trial * 100).toFixed(2)} %</p>
        </div>
      </div>
      <p className="mt-4 mb-16 text-neutral-500 dark:text-neutral-400 text-sm">
        페스 기간에 모집한 ★3 학생은 확률이 0.5배로 계산됩니다.
      </p>

      <SubTitle text="모집 이력" />
      {me && <AddContentButton text="새로운 모집 이력 추가하기" link="/edit/pickups/new" />}
      {pickupHistories.map(({ uid, event, tier3Students, trial }) => {
        const pickupStudentUids = event.pickups.map((pickup) => pickup.student?.uid).filter((id) => id !== undefined);
        return (
          <PickupHistoryView
            key={uid}
            uid={uid}
            event={{ ...event, since: new Date(event.since) }}
            tier3Students={tier3Students.map((student) => ({ uid: student.studentId, name: student.name }))}
            pickupStudentUids={pickupStudentUids}
            trial={trial}
          />
        );
      })}
    </div>
  );
}
