import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Title } from "~/components/atoms/typography";
import type { ContentTimelineProps } from "~/components/organisms/content";
import { ContentTimeline } from "~/components/organisms/content";
import { ContentFilter, type ContentFilterType } from "~/components/molecules/content";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";
import { getContentsMemos, getUserMemos } from "~/models/content";
import { getFavoritedCounts, getUserFavoritedStudents } from "~/models/favorite-students";
import { useState, useEffect } from "react";
import { useSignIn } from "~/contexts/SignInProvider";
import { ActionData } from "./api.contents";
import { ActionData as MemoActionData } from "./api.contents.$uid.memos";

export const futureContentsQuery = graphql(`
  query FutureContents($now: ISO8601DateTime!) {
    contents(untilAfter: $now, first: 9999) {
      nodes {
        uid name since until confirmed
        ... on Event {
          eventType: type
          rerun endless
          pickups {
            type rerun since until
            student { uid attackType defenseType role schaleDbId }
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

  const { data, error } = await runQuery(futureContentsQuery, { now: truncatedNow });
  if (error || !data) {
    throw error ?? "failed to fetch events";
  }

  const allStudentUids = data.contents.nodes.flatMap((content) => {
    if (content.__typename === "Event") {
      return content.pickups?.map((pickup) => pickup.student?.uid ?? null) ?? [];
    }
    return [];
  }).filter((studentUid) => studentUid !== null);

  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  const signedIn = currentUser !== null;
  return {
    signedIn,
    contents: data.contents.nodes,
    favoritedStudents: signedIn ? await getUserFavoritedStudents(env, currentUser.id) : null,
    favoritedCounts: await getFavoritedCounts(env, allStudentUids),
    myMemos: signedIn ? await getUserMemos(env, currentUser.id) : [],
    allMemos: await getContentsMemos(env, data.contents.nodes.map((content) => content.uid), currentUser?.id),
  };
};

function equalFavorites(a: { contentUid: string, studentUid: string }, b: { contentUid: string, studentUid: string }): boolean {
  return a.contentUid === b.contentUid && a.studentUid === b.studentUid;
}

const futuresContentFilterKey = "futures::content-filter";

export default function Futures() {
  const loaderData = useLoaderData<typeof loader>();
  const { signedIn, contents } = loaderData;
  const { showSignIn } = useSignIn();

  const fetcher = useFetcher();
  const submit = (data: ActionData) => fetcher.submit(data, { action: "/api/contents", method: "post", encType: "application/json" });

  const [favoritedStudents, setFavoritedStudents] = useState<{ contentUid: string, studentUid: string }[] | undefined>(loaderData.favoritedStudents?.map(f => ({ contentUid: f.contentId, studentUid: f.studentId })) ?? undefined);
  const [favoritedCounts, setFavoritedCounts] = useState(loaderData.favoritedCounts.map(f => ({ contentUid: f.contentId, studentUid: f.studentId, count: f.count })));

  const [contentFilter, setContentFilter] = useState<ContentFilterType>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(futuresContentFilterKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn("Failed to parse saved content filter:", e);
        }
      }
    }
    return { types: [], onlyPickups: false };
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(futuresContentFilterKey, JSON.stringify(contentFilter));
    }
  }, [contentFilter]);

  const toggleFavorite = (contentUid: string, studentUid: string, favorited: boolean) => {
    submit({ favorite: { contentUid, studentUid, favorited } });

    setFavoritedStudents((prev) => {
      const alreadyFavorited = prev && prev.some((favorite) => equalFavorites(favorite, { contentUid, studentUid }));
      if (favorited && !alreadyFavorited) {
        return prev && [...prev, { contentUid, studentUid }];
      } else if (!favorited && alreadyFavorited) {
        return prev && prev.filter((fav) => !equalFavorites(fav, { contentUid, studentUid }));
      }
    });

    setFavoritedCounts((prev) => {
      let found = false;
      const newCounts = prev.map((favorite) => {
        if (equalFavorites(favorite, { contentUid, studentUid })) {
          found = true;
          return { ...favorite, count: favorite.count + (favorited ? 1 : -1) };
        }
        return favorite;
      });
      if (!found && favorited) {
        newCounts.push({ contentUid, studentUid, count: 1 });
      }
      return newCounts.filter((favorite) => favorite.count > 0);
    });
  };

  // Filter contents based on the selected filter
  const filteredContents = contents.filter((content) => {
      if (content.__typename === "Event") {
        if (contentFilter.types.length > 0 && !contentFilter.types.includes(content.eventType)) {
          return false;
        } else if (contentFilter.onlyPickups && content.pickups?.length === 0) {
          return false;
        }
        return true;
      } else if (content.__typename === "Raid") {
        if (contentFilter.types.length > 0 && !contentFilter.types.includes(content.raidType)) {
          return false;
        } else if (contentFilter.onlyPickups) {
          return false;
        }
        return true;
      }
      return false;
    });

  return (
    <>
      <Title text="미래시" />
      <p className="text-neutral-500 dark:text-neutral-400 -mt-2 mb-4">미래시는 일본 서버 일정을 바탕으로 추정된 것으로, 실제 일정과 다를 수 있습니다.</p>

      <div className="flex flex-col xl:flex-row">
        <div className="w-full xl:max-w-2xl shrink-0">
          <ContentTimeline
            contents={filteredContents.map((content) => {
              const contentAttrs: Partial<ContentTimelineProps["contents"][number]> = {
                ...content,
                since: new Date(content.since),
                until: new Date(content.until),
                myMemo: loaderData.myMemos.find((memo) => memo.contentId === content.uid) ?? undefined,
                allMemos: loaderData.allMemos[content.uid] ?? [],
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
                contentAttrs.raidInfo = content;
              }

              return contentAttrs as ContentTimelineProps["contents"][number];
            })}

            favoritedStudents={favoritedStudents}
            favoritedCounts={favoritedCounts}
            onFavorite={(contentUid, studentUid, favorited) => {
              if (!signedIn) {
                showSignIn();
                return;
              }
              toggleFavorite(contentUid, studentUid, favorited);
            }}

            onMemoUpdate={(contentUid, body, visibility) => {
              const actionData: MemoActionData = { body, visibility };
              fetcher.submit(actionData, { action: `/api/contents/${contentUid}/memos`, method: "post", encType: "application/json" });
            }}
            isSubmittingMemo={fetcher.state !== "idle"}

            signedIn={signedIn}
          />
        </div>

        <div className="w-full xl:grow xl:sticky xl:top-4 xl:self-start xl:pl-6">
          <ContentFilter initialFilter={contentFilter} onFilterChange={setContentFilter} />
        </div>
      </div>
    </>
  );
}
