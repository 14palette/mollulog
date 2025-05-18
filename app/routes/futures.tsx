import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useFetcher, useLoaderData } from "react-router";
import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Title } from "~/components/atoms/typography";
import type { ContentTimelineProps } from "~/components/organisms/content";
import { ContentTimeline } from "~/components/organisms/content";
import { graphql } from "~/graphql";
import type { FutureContentsQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { sanitizeClassName } from "~/prophandlers";
import { getUserMemos } from "~/models/content";
import { getFavoritedCounts, getUserFavoritedStudents } from "~/models/favorite-students";
import { useState } from "react";
import { useSignIn } from "~/contexts/SignInProvider";
import { ActionData } from "./api.contents";

export const futureContentsQuery = graphql(`
  query FutureContents($now: ISO8601DateTime!) {
    contents(untilAfter: $now, first: 9999) {
      nodes {
        name
        since
        until
        confirmed
        uid
        ... on Event {
          eventType: type
          rerun
          pickups {
            type
            rerun
            student { studentId attackType defenseType role schaleDbId }
            studentName
          }
        }
        ... on Raid {
          raidType: type
          rankVisible
          boss terrain attackType defenseType
        }
      }
    }
  }
`);

export const meta: MetaFunction = () => {
  const title = "블루 아카이브 이벤트, 픽업 미래시";
  const description = "블루 아카이브 한국 서버의 이벤트 및 총력전, 픽업 미래시 정보 모음";
  return [
    { title: `${title} | 몰루로그` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const truncatedNow = new Date();
  truncatedNow.setMinutes(0, 0, 0);

  const { data, error } = await runQuery<FutureContentsQuery>(futureContentsQuery, { now: truncatedNow.toISOString() });
  if (error || !data) {
    throw error ?? "failed to fetch events";
  }

  const allStudentIds = data.contents.nodes.flatMap((content) => {
    if (content.__typename === "Event") {
      return content.pickups?.map((pickup) => pickup.student?.studentId ?? null) ?? [];
    }
    return [];
  }).filter((studentId) => studentId !== null);

  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  const signedIn = currentUser !== null;
  return {
    signedIn,
    contents: data.contents.nodes,
    favoritedStudents: signedIn ? await getUserFavoritedStudents(env, currentUser.id) : null,
    favoritedCounts: await getFavoritedCounts(env, allStudentIds),
    memos: signedIn ? await getUserMemos(env, currentUser.id) : [],
  };
};

function equalFavorites(a: { contentUid: string, studentId: string }, b: { contentUid: string, studentId: string }): boolean {
  return a.contentUid === b.contentUid && a.studentId === b.studentId;
}

export default function Futures() {
  const loaderData = useLoaderData<typeof loader>();
  const { signedIn, contents } = loaderData;
  const memos = loaderData.memos ?? {};

  const { showSignIn } = useSignIn();

  const fetcher = useFetcher();
  const submit = (data: ActionData) => fetcher.submit(data, { action: "/api/contents", method: "post", encType: "application/json" });

  const [favoritedStudents, setFavoritedStudents] = useState<{ contentUid: string, studentId: string }[] | undefined>(loaderData.favoritedStudents?.map(f => ({ contentUid: f.contentId, studentId: f.studentId })) ?? undefined);
  const [favoritedCounts, setFavoritedCounts] = useState(loaderData.favoritedCounts.map(f => ({ contentUid: f.contentId, studentId: f.studentId, count: f.count })));
  const toggleFavorite = (contentUid: string, studentId: string, favorited: boolean) => {
    submit({ favorite: { contentUid, studentId, favorited } });

    setFavoritedStudents((prev) => {
      const alreadyFavorited = prev && prev.some((favorite) => equalFavorites(favorite, { contentUid, studentId }));
      if (favorited && !alreadyFavorited) {
        return prev && [...prev, { contentUid, studentId }];
      } else if (!favorited && alreadyFavorited) {
        return prev && prev.filter((fav) => !equalFavorites(fav, { contentUid, studentId }));
      }
    });

    setFavoritedCounts((prev) => {
      let found = false;
      const newCounts = prev.map((favorite) => {
        if (equalFavorites(favorite, { contentUid, studentId })) {
          found = true;
          return { ...favorite, count: favorite.count + (favorited ? 1 : -1) };
        }
        return favorite;
      });
      if (!found && favorited) {
        newCounts.push({ contentUid, studentId, count: 1 });
      }
      return newCounts.filter((favorite) => favorite.count > 0);
    });
  };

  return (
    <>
      <Title text="미래시" />
      <p className="text-neutral-500 dark:text-neutral-400 -mt-2 mb-4">미래시는 일본 서버 일정을 바탕으로 추정된 것으로, 실제 일정과 다를 수 있습니다.</p>

      <ContentTimeline
        contents={contents.map((content) => {
          const contentAttrs: Partial<ContentTimelineProps["contents"][number]> = {
            ...content,
            since: new Date(content.since),
            until: new Date(content.until),
          };

          if (content.__typename === "Event") {
            contentAttrs.contentType = content.eventType;
            contentAttrs.rerun = content.rerun;
            contentAttrs.pickups = content.pickups ?? undefined;
            contentAttrs.link = `/events/${content.uid}`;
          } else if (content.__typename === "Raid") {
            contentAttrs.contentType = content.raidType;
            contentAttrs.rerun = false;
            contentAttrs.link = `/raids/${content.uid}`;
            contentAttrs.raidInfo = {
              uid: content.uid,
              boss: content.boss,
              terrain: content.terrain,
              attackType: content.attackType,
              defenseType: content.defenseType,
              rankVisible: content.rankVisible,
            };
          }

          return contentAttrs as ContentTimelineProps["contents"][number];
        })}

        favoritedStudents={favoritedStudents}
        favoritedCounts={favoritedCounts}
        onFavorite={(contentUid, studentId, favorited) => {
          if (!signedIn) {
            showSignIn();
            return;
          }
          toggleFavorite(contentUid, studentId, favorited);
        }}

        memos={memos.map((memo) => ({ contentUid: memo.contentId, body: memo.body }))}
        onMemoUpdate={signedIn ? (contentUid, memo) => submit({ memo: { contentUid, body: memo } }) : undefined}
      />

      {signedIn && (
        <Link to="/my?path=futures">
          <div
            className={sanitizeClassName(`
              m-4 md:m-8 px-4 py-2 fixed bottom-safe-b right-0 flex items-center bg-neutral-900 hover:bg-neutral-700
              text-white shadow-xl rounded-full transition cursor-pointer
            `)}
          >
            <CalendarDateRangeIcon className="size-4 mr-2" />
            <span>모집 계획</span>
          </div>
        </Link>
      )}
    </>
  );
}
