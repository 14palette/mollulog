import { ChevronRightIcon, HeartIcon } from "@heroicons/react/16/solid";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import {
  Await,
  isRouteErrorResponse,
  Link,
  useFetcher,
  useLoaderData,
  useRouteError,
} from "react-router";
import dayjs from "dayjs";
import { Suspense } from "react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { ProfileImage, StudentCard } from "~/components/atoms/student";
import { SubTitle } from "~/components/atoms/typography";
import { MemoEditor } from "~/components/molecules/editor";
import { ContentHeader } from "~/components/organisms/content";
import { ErrorPage } from "~/components/organisms/error";
import { EventStages } from "~/components/organisms/event";
import { TimelinePlaceholder } from "~/components/organisms/useractivity";
import { useSignIn } from "~/contexts/SignInProvider";
import { graphql } from "~/graphql";
import type { EventStagesQuery, EventDetailQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { attackTypeLocale, defenseTypeLocale, eventTypeLocale, pickupLabelLocale, roleLocale } from "~/locales/ko";
import { getContentMemos, setMemo, setMemoVisibility } from "~/models/content";
import { favoriteStudent, getFavoritedCounts, getUserFavoritedStudents, unfavoriteStudent } from "~/models/favorite-students";
import { getRecruitedStudents } from "~/models/recruited-student";

const eventDetailQuery = graphql(`
  query EventDetail($eventUid: String!) {
    event(uid: $eventUid) {
      uid name type since until imageUrl
      videos { title youtube start }
      pickups {
        type
        rerun
        student { uid attackType defenseType role }
        studentName
      }
    }
  }
`);

const eventStagesQuery = graphql(`
  query EventStages($eventUid: String!) {
    event(uid: $eventUid) {
      stages {
        difficulty index entryAp
        rewards {
          item {
            itemId name imageId
            eventBonuses {
              student { uid role }
              ratio
            }
          }
          amount
        }
      }
    }
  }
`);

async function getEventStages(eventUid: string): Promise<Exclude<EventStagesQuery["event"], null>["stages"] | []> {
  const { data, error } = await runQuery<EventStagesQuery>(eventStagesQuery, { eventUid });
  if (error || !data?.event) {
    return [];
  }
  return data.event.stages;
}

export const loader = async ({ params, context, request }: LoaderFunctionArgs) => {
  const { data, error } = await runQuery<EventDetailQuery>(eventDetailQuery, { eventUid: params.id });
  let errorMessage: string | null = null;
  if (error || !data) {
    errorMessage = error?.message ?? "이벤트 정보를 가져오는 중 오류가 발생했어요";
  } else if (!data.event) {
    errorMessage = "이벤트 정보를 찾을 수 없어요";
  }

  if (errorMessage) {
    throw new Response(
      JSON.stringify({ error: { message: errorMessage } }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const content = data!.event!;
  const pickupStudentUids = content.pickups.map((pickup) => pickup.student?.uid).filter((id) => id !== undefined);

  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  let recruitedStudentUids: string[] = [];
  if (sensei) {
    const recruitedStudents = await getRecruitedStudents(env, sensei.id);
    recruitedStudentUids = recruitedStudents.map((student) => student.studentUid);
  }

  const memos = await getContentMemos(env, content.uid, sensei?.id);
  const myMemo = memos.find((memo) => memo.sensei.username === sensei?.username);

  return {
    event: content,
    stages: getEventStages(params.id as string),
    recruitedStudentUids,
    favoritedStudents: sensei ? await getUserFavoritedStudents(env, sensei.id, content.uid) : [],
    favoritedCounts: (await getFavoritedCounts(env, pickupStudentUids)).filter((favorited) => favorited.contentId === content.uid),
    signedIn: sensei !== null,
    memos: memos.filter((memo) => memo.uid !== myMemo?.uid),
    myMemo,
  };
};

type ActionData = {
  memo?: {
    body?: string;
    visibility?: "private" | "public";
  };
  favorite?: {
    studentUid: string;
    favorited: boolean;
  };
};

export const action = async ({ params, request, context }: ActionFunctionArgs) => {
  const { env } = context.cloudflare;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect("/unauthorized");
  }

  const contentId = params.id!;
  const actionData = await request.json() as ActionData;
  if (actionData.favorite) {
    const { studentUid, favorited } = actionData.favorite;
    const run = favorited ? favoriteStudent : unfavoriteStudent;
    await run(env, currentUser.id, studentUid, contentId);
  }

  if (actionData.memo?.body !== undefined) {
    await setMemo(env, currentUser.id, contentId, actionData.memo.body);
  } else if (actionData.memo?.visibility) {
    await setMemoVisibility(env, currentUser.id, contentId, actionData.memo.visibility);
  }

  return {};
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: "이벤트 정보 | 몰루로그" }];
  }

  const { event } = data;
  const title = event.name;
  const description = `블루 아카이브 "${event.name}" 이벤트의 픽업, 보상 정보 등을 확인해보세요.`;
  return [
    { title: `${title} - 이벤트 | 몰루로그` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:image", content: event.imageUrl },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};

export const ErrorBoundary = () => {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorPage message={error.data.error.message} />;
  } else {
    return <ErrorPage />;
  }
};

const attackTypeColor = {
  explosive: "bg-red-500",
  piercing: "bg-yellow-500",
  mystic: "bg-blue-500",
  sonic: "bg-purple-500",
};

const defenseTypeColor = {
  light: "bg-red-500",
  heavy: "bg-yellow-500",
  special: "bg-blue-500",
  elastic: "bg-purple-500",
};

const roleColor = {
  striker: "bg-red-500",
  special: "bg-blue-500",
};

export default function EventDetail() {
  const { event, stages, signedIn, recruitedStudentUids, favoritedStudents, favoritedCounts, memos, myMemo } = useLoaderData<typeof loader>();

  const { showSignIn } = useSignIn();

  const fetcher = useFetcher();
  const submit = (data: ActionData) => fetcher.submit(data, { method: "post", encType: "application/json" });

  return (
    <>
      <ContentHeader
        name={event.name}
        type={eventTypeLocale[event.type]}
        since={dayjs(event.since)}
        until={dayjs(event.until)}
        image={event.imageUrl}
        videos={event.videos}
      />

      {event.pickups.length > 0 && (
        <div className="my-8">
          <SubTitle text="픽업 모집 학생" />
          {event.pickups.map((pickup) => {
            const studentUid = pickup.student?.uid ?? null;
            const { attackType, defenseType, role } = pickup.student ?? {};

            const favorited = favoritedStudents.some((favorited) => favorited.studentId === studentUid);
            return (
              <div key={`pickup-${studentUid}`} className="my-4 p-2 flex flex-col md:flex-row bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                <div className="flex items-center grow">
                  <div className="w-16 mx-2">
                    <StudentCard uid={studentUid} />
                  </div>
                  <div className="px-2 md:px-4 grow">
                    <p className="text-xs text-neutral-500">{pickupLabelLocale(pickup)}</p>
                    <Link to={`/students/${studentUid}`} className="hover:underline">
                      <span className="font-bold">{pickup.studentName}</span>
                      {studentUid && <ChevronRightIcon className="ml-1 size-4 inline" />}
                    </Link>
                    {attackType && defenseType && role && (
                      <div className="py-1 flex text-sm gap-x-1 tracking-tighter md:tracking-normal">
                        <div className="px-2 flex items-center bg-neutral-200 dark:bg-neutral-800 rounded-full">
                          <div className={`size-2.5 rounded-full ` + attackTypeColor[attackType]} />
                          <span className="ml-1">{attackTypeLocale[attackType]}</span>
                        </div>
                        <div className="px-2 flex items-center bg-neutral-200 dark:bg-neutral-800 rounded-full">
                          <div className={`size-2.5 rounded-full ` + defenseTypeColor[defenseType]} />
                          <span className="ml-1">{defenseTypeLocale[defenseType]}</span>
                        </div>
                        <div className="px-2 flex items-center bg-neutral-200 dark:bg-neutral-800 rounded-full">
                          <div className={`size-2.5 rounded-full ` + roleColor[role]} />
                          <span className="ml-1">{roleLocale[role]}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {studentUid && (
                  <div className="py-2 flex items-center justify-end">
                    <div
                      className={`mx-2 px-2 flex items-center rounded-full text-white hover:opacity-50 transition cursor-pointer ${(!signedIn || favorited) ? "bg-red-500" : "bg-neutral-500"}`}
                      onClick={() => signedIn ? submit({ favorite: { studentUid, favorited: !favorited } }) : showSignIn()}
                    >
                      <HeartIcon className="size-4" strokeWidth={2} />
                      <span className="ml-1 font-bold">{favoritedCounts.find((favorited) => favorited.studentId === studentUid)?.count ?? 0}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <SubTitle text="이벤트 메모" />
      {signedIn && (
        <>
          <MemoEditor
            initialText={myMemo?.body}
            initialVisibility={myMemo?.visibility || "private"}
            onUpdate={(body) => submit({ memo: { body } })}
            onVisibilityChange={(visiblity) => submit({ memo: { visibility: visiblity } })}
          />
          {myMemo?.visibility === "public" && <p className="text-xs text-neutral-500">공개 메모에 스포일러가 포함되지 않도록 주의해주세요.</p>}
        </>
      )}
      <div className="my-4">
        {memos.length === 0 && <p className="my-4 text-neutral-500 dark:text-neutral-400">아직 아무도 메모를 공개하지 않았어요</p>}
        {memos.map((memo) => (
          <p key={memo.uid} className="my-4">
            <Link to={`/@${memo.sensei.username}`} className="hover:underline">
              <ProfileImage studentUid={memo.sensei.profileStudentId} imageSize={6} />
              <span className="ml-2 font-semibold">{memo.sensei.username}</span>
            </Link>
            <span className="ml-2">{memo.body}</span>
            {memo.visibility === "private" && <span className="ml-1 text-xs text-neutral-500">(비공개)</span>}
          </p>
        ))}
      </div>

      <Suspense fallback={<TimelinePlaceholder />}>
        <Await resolve={stages}>
          {(stages) => event.type === "event" && stages && stages.length > 0 && (
            <EventStages
              stages={stages}
              signedIn={signedIn}
              ownedStudentUids={recruitedStudentUids}
            />
          )}
        </Await>
      </Suspense>
    </>
  );
}
