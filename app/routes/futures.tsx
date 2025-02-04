import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction} from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { CalendarDateRangeIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Callout, Title } from "~/components/atoms/typography";
import type { ContentTimelineProps } from "~/components/organisms/content";
import { ContentTimeline } from "~/components/organisms/content";
import { graphql } from "~/graphql";
import type { FutureContentsQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import type { FuturePlan} from "~/models/future";
import { getFuturePlan, setFuturePlan } from "~/models/future";
import { sanitizeClassName } from "~/prophandlers";
import { getUserFavoriteStudents, getUserMemos } from "~/models/future-content";

export const futureContentsQuery = graphql(`
  query FutureContents($now: ISO8601DateTime!) {
    contents(untilAfter: $now, first: 9999) {
      nodes {
        name
        since
        until
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
  const { data, error } = await runQuery<FutureContentsQuery>(futureContentsQuery, { now: new Date().toISOString() });
  if (error || !data) {
    throw error ?? "failed to fetch events";
  }

  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  const signedIn = currentUser !== null;
  return json({
    signedIn,
    contents: data.contents.nodes,
    futurePlans: signedIn ? await getFuturePlan(env, currentUser.id) : null,
    noticeMessage: await env.KV_STATIC_DATA.get("futures::noticeMessage"),
    favoriteStudents: signedIn ? await getUserFavoriteStudents(env, currentUser.id) : [],
    memos: signedIn ? await getUserMemos(env, currentUser.id) : [],
  });
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/signin");
  }

  const updatedPlans = await request.json<FuturePlan>();
  await setFuturePlan(env, currentUser.id, updatedPlans);

  return json({});
};

export default function Futures() {
  const loaderData = useLoaderData<typeof loader>();
  const { signedIn, contents, noticeMessage } = loaderData;

  const submit = useSubmit();
  const [futurePlans, setFuturePlans] = useState(loaderData.futurePlans ?? {});
  useEffect(() => {
    if (!signedIn) {
      return;
    }

    const timer = setTimeout(() => {
      submit(futurePlans, { method: "post", encType: "application/json" });
    }, 500);
    return () => clearTimeout(timer);
  }, [futurePlans])

  const [favoriteStudents, setFavoriteStudents] = useState(loaderData.favoriteStudents ?? []);
  const [memos, setMemos] = useState(loaderData.memos ?? {});

  return (
    <div className="pb-64">
      <Title text="미래시" />
      <p className="text-neutral-500 dark:text-neutral-400 -mt-2 mb-4">미래시는 일본 서버 일정을 바탕으로 추정된 것으로, 실제 일정과 다를 수 있습니다.</p>

      {noticeMessage && (
        <Callout emoji="📅" className="bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-700 dark:to-orange-700 text-white shadow">
          <p>{noticeMessage}</p>
        </Callout>
      )}

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
              boss: content.boss,
              terrain: content.terrain,
              attackType: content.attackType,
              defenseType: content.defenseType,
            };
          }

          return contentAttrs as ContentTimelineProps["contents"][number];
        })}

        favoriteStudents={favoriteStudents}
        memos={memos}

        onMemoUpdate={(eventId, memo) => {
          setFuturePlans((prev) => ({ ...prev, memos: { ...prev.memos, [eventId]: memo } }));
        }}
        onFavorite={(eventId, studentId, favorited) => {
          setFuturePlans((prev) => {
            let pickups = (prev.pickups ?? {})[eventId] ?? [];
            if (favorited) {
              pickups.push(studentId);
            } else {
              pickups = pickups.filter((id) => id !== studentId);
            }

            return { ...prev, pickups: { ...prev.pickups, [eventId]: pickups } };
          });
        }}
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
    </div>
  );
}
