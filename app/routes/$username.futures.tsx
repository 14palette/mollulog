import { ArrowRightIcon } from "@heroicons/react/24/outline";
import type { LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { FuturePlan } from "~/components/organisms/future";
import type { UserFuturesQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { Link, useLoaderData } from "@remix-run/react";
import { graphql } from "~/graphql";
import { SubTitle } from "~/components/atoms/typography";
import { sanitizeClassName } from "~/prophandlers";
import { getUserMemos } from "~/models/content";
import { getUserFavoritedStudents } from "~/models/favorite-students";
import { getRouteSensei } from "./$username";

const userFuturesQuery = graphql(`
  query UserFutures($now: ISO8601DateTime!) {
    events(first: 999, untilAfter: $now) {
      nodes {
        eventId
        name
        since
        pickups {
          type
          rerun
          student { studentId schaleDbId name school equipments }
        }
      }
    }
  }
`);

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""} - 학생 모집 계획 | 몰루로그`.trim() },
    { name: "description", content: `${params.username} 선생님의 학생 모집 계획을 확인해보세요` },
    { name: "og:title", content: `${params.username || ""} - 학생 모집 계획 | 몰루로그`.trim() },
    { name: "og:description", content: `${params.username} 선생님의 학생 모집 계획을 확인해보세요` },
  ];
};

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const truncatedNow = new Date();
  truncatedNow.setMinutes(0, 0, 0);

  const { data, error } = await runQuery<UserFuturesQuery>(userFuturesQuery, { now: truncatedNow.toISOString() });
  if (error || !data) {
    throw error ?? "failed to fetch events";
  }

  const env = context.cloudflare.env;
  const sensei = await getRouteSensei(env, params);

  const favoritedStudents = await getUserFavoritedStudents(env, sensei.id);
  const plannedContentIds = favoritedStudents.map(({ contentId }) => contentId);

  const events = data.events.nodes.filter((event) => plannedContentIds.includes(event.eventId));
  const memos = (await getUserMemos(env, sensei.id)).filter((memo) => plannedContentIds.includes(memo.contentId));

  return json({
    events,
    favoritedStudents,
    memos,
  });
}

export default function UserFutures() {
  const { events, favoritedStudents, memos } = useLoaderData<typeof loader>();
  

  if (events.length === 0) {
    return (
      <div className="my-16">
        <p className="text-center my-4">아직 관심 모집 학생을 등록하지 않았어요</p>
        <Link to="/futures" className="text-center underline">
          <p>미래시 보고 등록하러 가기 →</p>
        </Link>
      </div>
    )
  }

  return (
    <div className="my-8">
      <SubTitle text="학생 모집 계획" />
      <FuturePlan events={events.map((event) => {
        const favoriteStudentIds = favoritedStudents.filter(({ contentId }) => contentId === event.eventId).map(({ studentId }) => studentId);
        return {
          eventId: event.eventId,
          name: event.name,
          since: new Date(event.since),
          memo: memos.find((memo) => memo.contentId === event.eventId)?.body ?? null,
          pickups: event.pickups.filter(({ student }) => favoriteStudentIds.includes(student?.studentId ?? "")).map((pickup) => ({
            type: pickup.type,
            rerun: pickup.rerun,
            student: pickup.student!,
          })),
        };
      })} />

      <Link to="/futures">
        <div className={sanitizeClassName(`
            my-8 p-4 flex justify-center items-center border border-neutral-200
            rounded-lg text-neutral-500 hover:bg-neutral-100 transition cursor-pointer
          `)}>
          <span>전체 미래시 보러 가기</span>
          <ArrowRightIcon className="size-4 ml-1" strokeWidth={2} />
        </div>
      </Link>
    </div>
  );
}
