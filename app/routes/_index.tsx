import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useFetcher, useLoaderData } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { SubTitle, Title } from "~/components/atoms/typography";
import { ContentTimelineItem } from "~/components/molecules/content";
import { contentOrders } from "~/components/organisms/content/ContentTimeline";
import { RaidCard } from "~/components/organisms/raid";
import { useSignIn } from "~/contexts/SignInProvider";
import { graphql } from "~/graphql";
import type { IndexQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { getFavoritedCounts, getUserFavoritedStudents } from "~/models/favorite-students";
import type { ActionData } from "./api.contents";

const indexQuery = graphql(`
  query Index($now: ISO8601DateTime!) {
    events(untilAfter: $now, sinceBefore: $now) {
      nodes {
        name since until uid type rerun
        pickups {
          type rerun
          student { uid name attackType defenseType role schaleDbId }
        }
      }
    }
    raids(untilAfter: $now, types: [total_assault, elimination], first: 2) {
      nodes {
        name since until uid type boss attackType defenseType terrain
      }
    }
  }
`);

export const meta: MetaFunction = () => {
  return [
    { title: "몰루로그 - 블루 아카이브 미래시/컨텐츠 정보 모음" },
    { name: "description", content: "게임 <블루 아카이브>의 미래시, 컨텐츠 통계 정보 등을 확인하고 내 정보와 계획을 관리해보세요." },
  ];
};

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const truncatedNow = new Date();
  truncatedNow.setMinutes(0, 0, 0);

  const { data, error } = await runQuery<IndexQuery>(indexQuery, { now: truncatedNow.toISOString() });
  if (error || !data) {
    throw error ?? "failed to fetch events";
  }

  const { env } = context.cloudflare;
  const pickupStudentIds = data.events.nodes.flatMap((event) => {
    if (event.__typename === "Event") {
      return event.pickups?.map((pickup) => pickup.student?.uid ?? null) ?? [];
    }
    return [];
  }).filter((studentUid) => studentUid !== null);

  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  const signedIn = currentUser !== null;
  return {
    events: data.events.nodes,
    raids: data.raids.nodes,
    favoritedCounts: await getFavoritedCounts(env, pickupStudentIds),
    favoritedStudents: signedIn ? await getUserFavoritedStudents(env, currentUser.id) : [],
    signedIn,
  };
}

export default function Index() {
  const { showSignIn } = useSignIn();
  const { events, raids, favoritedCounts, favoritedStudents, signedIn } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const submit = (data: ActionData) => fetcher.submit(data, { action: "/api/contents", method: "post", encType: "application/json" });

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
          const contentFavoritedCounts: Record<string, number> = {};
          favoritedCounts.filter((each) => each.contentId === event.uid)
            .forEach((each) => contentFavoritedCounts[each.studentId] = each.count);

          return (
            <ContentTimelineItem
              key={event.uid}
              name={event.name}
              contentType={event.type}
              rerun={event.rerun}
              since={new Date(event.since)}
              until={new Date(event.until)}
              link={`/events/${event.uid}`}
              showMemo={false}
              pickups={event.pickups.map((pickup) => ({
                type: pickup.type,
                rerun: pickup.rerun,
                studentName: pickup.student?.name ?? "",
                student: {
                  uid: pickup.student?.uid ?? "",
                  attackType: pickup.student?.attackType,
                  defenseType: pickup.student?.defenseType,
                  role: pickup.student?.role,
                  schaleDbId: pickup.student?.schaleDbId,
                },
              }))}
              favoritedCounts={contentFavoritedCounts}
              favoritedStudents={signedIn ? favoritedStudents.filter((each) => each.contentId === event.uid).map((each) => each.studentId) : undefined}
              onFavorite={(studentUid, favorited) => {
                if (!signedIn) {
                  showSignIn();
                  return;
                }
                submit({ favorite: { contentUid: event.uid, studentUid, favorited } });
              }}
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
          <Link to={`/raids/${raid.uid}`} key={raid.uid} className="hover:opacity-50 transition-opacity">
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
