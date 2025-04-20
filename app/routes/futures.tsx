import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Title } from "~/components/atoms/typography";
import type { ContentTimelineProps } from "~/components/organisms/content";
import { ContentTimeline } from "~/components/organisms/content";
import { graphql } from "~/graphql";
import type { FutureContentsQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { sanitizeClassName } from "~/prophandlers";
import { getUserMemos, setMemo } from "~/models/content";
import { favoriteStudent, getFavoritedCounts, getUserFavoritedStudents, unfavoriteStudent } from "~/models/favorite-students";
import { useState } from "react";
import { useSignIn } from "~/contexts/SignInProvider";

export const futureContentsQuery = graphql(`
  query FutureContents($now: ISO8601DateTime!) {
    contents(untilAfter: $now, first: 9999) {
      nodes {
        name
        since
        until
        confirmed
        ... on Event {
          contentId: eventId
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
          contentId: raidId
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
  return json({
    signedIn,
    contents: data.contents.nodes,
    favoritedStudents: signedIn ? await getUserFavoritedStudents(env, currentUser.id) : null,
    favoritedCounts: await getFavoritedCounts(env, allStudentIds),
    memos: signedIn ? await getUserMemos(env, currentUser.id) : [],
  });
};

type ActionData = {
  memo?: {
    contentId: string;
    body: string;
  };
  favorite?: {
    studentId: string;
    contentId: string;
    favorited: boolean;
  };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/unauthorized");
  }

  const actionData = await request.json<ActionData>();
  if (actionData.memo) {
    await setMemo(env, currentUser.id, actionData.memo.contentId, actionData.memo.body);
  }
  if (actionData.favorite) {
    if (actionData.favorite.favorited) {
      await favoriteStudent(env, currentUser.id, actionData.favorite.studentId, actionData.favorite.contentId);
    } else {
      await unfavoriteStudent(env, currentUser.id, actionData.favorite.studentId, actionData.favorite.contentId);
    }
  }

  return json({});
};

function equalFavorites(a: { contentId: string, studentId: string }, b: { contentId: string, studentId: string }): boolean {
  return a.contentId === b.contentId && a.studentId === b.studentId;
}

export default function Futures() {
  const loaderData = useLoaderData<typeof loader>();
  const { signedIn, contents } = loaderData;
  const memos = loaderData.memos ?? {};

  const { showSignIn } = useSignIn();

  const fetcher = useFetcher();
  const submit = (data: ActionData) => fetcher.submit(data, { method: "post", encType: "application/json" });

  const [favoritedStudents, setFavoritedStudents] = useState<{ contentId: string, studentId: string }[] | undefined>(loaderData.favoritedStudents ?? undefined);
  const [favoritedCounts, setFavoritedCounts] = useState(loaderData.favoritedCounts);
  const toggleFavorite = (contentId: string, studentId: string, favorited: boolean) => {
    submit({ favorite: { contentId, studentId, favorited } });

    setFavoritedStudents((prev) => {
      const alreadyFavorited = prev && prev.some((favorite) => equalFavorites(favorite, { contentId, studentId }));
      if (favorited && !alreadyFavorited) {
        return prev && [...prev, { contentId, studentId }];
      } else if (!favorited && alreadyFavorited) {
        return prev && prev.filter((fav) => !equalFavorites(fav, { contentId, studentId }));
      }
    });

    setFavoritedCounts((prev) => {
      let found = false;
      const newCounts = prev.map((favorite) => {
        if (equalFavorites(favorite, { contentId, studentId })) {
          found = true;
          return { ...favorite, count: favorite.count + (favorited ? 1 : -1) };
        }
        return favorite;
      });
      if (!found && favorited) {
        newCounts.push({ contentId, studentId, count: 1 });
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
            if (["event", "immortal_event", "main_story"].includes(content.eventType)) {
              contentAttrs.link = `/events/${content.contentId}`;
            }
          } else if (content.__typename === "Raid") {
            contentAttrs.contentType = content.raidType;
            contentAttrs.rerun = false;
            contentAttrs.link = `/raids/${content.contentId}`;
            contentAttrs.raidInfo = {
              raidId: content.contentId,
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
        onFavorite={(contentId, studentId, favorited) => {
          if (!signedIn) {
            showSignIn();
            return;
          }
          toggleFavorite(contentId, studentId, favorited);
        }}

        memos={memos}
        onMemoUpdate={signedIn ? (eventId, memo) => submit({ memo: { contentId: eventId, body: memo } }) : undefined}
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
