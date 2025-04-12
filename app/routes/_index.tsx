import { defer } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { SubTitle, Title } from "~/components/atoms/typography";
import { ContentTimelineItem } from "~/components/molecules/content";
import { contentOrders } from "~/components/organisms/content/ContentTimeline";
import { RaidCard } from "~/components/organisms/raid";
import { graphql } from "~/graphql";
import type { IndexQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getFavoritedCounts } from "~/models/favorite-students";

const indexQuery = graphql(`
  query Index($now: ISO8601DateTime!) {
    events(untilAfter: $now, sinceBefore: $now) {
      nodes {
        name since until eventId type rerun
        pickups {
          type rerun
          student { studentId name }
        }
      }
    }
    raids(untilAfter: $now, types: [total_assault, elimination], first: 2) {
      nodes {
        name since until raidId type boss attackType defenseType terrain
      }
    }
  }
`);

export const meta: MetaFunction = () => {
  return [
    { title: "몰루로그" },
    { name: "description", content: "블루 아카이브 이벤트/컨텐츠 미래시 정보 모음" },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const truncatedNow = new Date();
  truncatedNow.setMinutes(0, 0, 0);

  const { data, error } = await runQuery<IndexQuery>(indexQuery, { now: truncatedNow.toISOString() });
  if (error || !data) {
    throw error ?? "failed to fetch events";
  }

  const { env } = context.cloudflare;
  const pickupStudentIds = data.events.nodes.flatMap((event) => {
    if (event.__typename === "Event") {
      return event.pickups?.map((pickup) => pickup.student?.studentId ?? null) ?? [];
    }
    return [];
  }).filter((studentId) => studentId !== null);

  return defer({
    events: data.events.nodes,
    raids: data.raids.nodes,
    favoritedCounts: await getFavoritedCounts(env, pickupStudentIds),
  });
}

export default function Index() {
  const { events, raids, favoritedCounts } = useLoaderData<typeof loader>();
  return (
    <>
      <Title text="진행중인 컨텐츠" />

      <div className="p-4 md:px-6 md:py-4 border border-neutral-200 dark:border-neutral-700 rounded-xl">
        <div className="my-2 flex items-center">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          <p className="ml-2 text-red-600 font-bold">진행중 이벤트</p>
        </div>

        {events.sort((a, b) => {
          return contentOrders.indexOf(a.type) - contentOrders.indexOf(b.type);
        }).map((event) => {
          const showLink = ["event", "immortal_event", "main_story"];

          const contentFavoritedCounts: Record<string, number> = {};
          favoritedCounts.filter((each) => each.contentId === event.eventId)
            .forEach((each) => contentFavoritedCounts[each.studentId] = each.count);

          return (
            <ContentTimelineItem
              key={event.eventId}
              name={event.name}
              contentType={event.type}
              rerun={event.rerun}
              until={new Date(event.until)}
              link={showLink ? `/events/${event.eventId}` : null}
              showMemo={false}
              pickups={event.pickups.map((pickup) => ({
                type: pickup.type,
                rerun: pickup.rerun,
                studentName: pickup.student?.name ?? "",
                student: {
                  studentId: pickup.student?.studentId ?? "",
                },
              }))}
              favoritedCounts={contentFavoritedCounts}
            />
          )
        })}
      </div>
      <Link to="/futures" className="hover:underline hover:opacity-75">
        <p className="mx-2 my-4 mb-8 text-right">모든 미래시 보러가기 →</p>
      </Link>

      <SubTitle text="총력전 / 대결전 정보" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {raids.map((raid) => (
          <Link to={`/raids/${raid.raidId}`} key={raid.raidId} className="hover:opacity-50 transition-opacity">
            <RaidCard
              {...raid}
              since={new Date(raid.since)}
              until={new Date(raid.until)}
            />
          </Link>
        ))}
      </div>
    </>
  );
}
