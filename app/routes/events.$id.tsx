import { ChevronRightIcon, ExclamationTriangleIcon } from "@heroicons/react/16/solid";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import { ClockIcon, HeartIcon as HeartIconSolid, StarIcon, XCircleIcon } from "@heroicons/react/24/solid";
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
import { OptionBadge, ProfileImage, StudentCard } from "~/components/atoms/student";
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
import { attackTypeColor, attackTypeLocale, defenseTypeColor, defenseTypeLocale, eventTypeLocale, pickupLabelLocale, roleColor, roleLocale } from "~/locales/ko";
import { getContentMemos, setMemo, setMemoVisibility } from "~/models/content";
import { favoriteStudent, getFavoritedCounts, getUserFavoritedStudents, unfavoriteStudent } from "~/models/favorite-students";
import { getRecruitedStudents } from "~/models/recruited-student";

const eventDetailQuery = graphql(`
  query EventDetail($eventUid: String!) {
    event(uid: $eventUid) {
      uid name type since until imageUrl
      videos { title youtube start }
      pickups {
        type rerun since until
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

export default function EventDetail() {
  const { event, stages, signedIn, recruitedStudentUids, favoritedStudents, favoritedCounts, memos, myMemo } = useLoaderData<typeof loader>();

  const { showSignIn } = useSignIn();

  const fetcher = useFetcher();
  const submit = (data: ActionData) => fetcher.submit(data, { method: "post", encType: "application/json" });

  const isPickupSinceDifferent = event.pickups.length > 0 && !dayjs(event.pickups[0].since).isSame(dayjs(event.since), "day");
  const isPickupUntilDifferent = event.pickups.length > 0 && !dayjs(event.pickups[0].until).isSame(dayjs(event.until), "day");
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

      {event.type === "fes" && <FesInfo />}

      {event.pickups.length > 0 && (
        <div className="my-8">
          <SubTitle text="픽업 모집 학생" />
          {isPickupSinceDifferent || isPickupUntilDifferent && (
            <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="size-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-amber-700 dark:text-amber-300 mb-1">
                    이벤트 개최 기간과 픽업 모집 기간이 달라요
                  </p>
                  <div className="text-sm text-amber-600 dark:text-amber-400">
                    픽업 모집은&nbsp;
                    <span className={isPickupSinceDifferent ? "font-semibold" : ""}>{dayjs(event.pickups[0].since).format("M월 D일")}</span>부터&nbsp;
                    <span className={isPickupUntilDifferent ? "font-semibold" : ""}>{dayjs(event.pickups[0].until).format("M월 D일")}</span>까지만 진행해요.
                  </div>
                </div>
              </div>
            </div>
          )}
          {event.pickups.map((pickup) => {
            const studentUid = pickup.student?.uid ?? null;
            const { attackType, defenseType, role } = pickup.student ?? {};

            const favorited = favoritedStudents.some((favorited) => favorited.studentId === studentUid);
            return (
              <div key={`pickup-${studentUid}`} className="relative my-4 p-2 flex flex-col md:flex-row bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                <div className="flex items-center grow">
                  <div className="w-12 md:w-16 mx-1 md:mx-2">
                    <StudentCard uid={studentUid} />
                  </div>
                  <div className="px-2 grow">
                    <div className="pt-2">
                      <p className="text-sm text-neutral-500">{pickupLabelLocale(pickup)}</p>
                      <Link to={`/students/${studentUid}`} className="flex items-center hover:underline">
                        <span className="font-bold text-lg">{pickup.studentName}</span>
                        {studentUid && <ChevronRightIcon className="ml-1 size-4 inline" />}
                      </Link>
                    </div>
                    {attackType && defenseType && role && (
                      <div className="py-1 flex text-sm gap-x-1 tracking-tighter md:tracking-normal">
                        <OptionBadge text={attackTypeLocale[attackType]} color={attackTypeColor[attackType]} />
                        <OptionBadge text={defenseTypeLocale[defenseType]} color={defenseTypeColor[defenseType]} />
                        <OptionBadge text={roleLocale[role]} color={roleColor[role]} />
                      </div>
                    )}
                  </div>
                </div>
                {studentUid && (
                  <div className="absolute right-4 top-4 md:top-0 h-full flex items-start md:items-center justify-end">
                    <div
                      className={`group inline-flex items-center gap-2 px-4 py-1 md:py-2 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                        favorited
                          ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                        : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shadow-lg shadow-neutral-200/50 dark:shadow-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      }`}
                      onClick={() => signedIn ? submit({ favorite: { studentUid, favorited: !favorited } }) : showSignIn()}
                    >
                      {favorited ? <HeartIconSolid className="size-4" /> : <HeartIconOutline className="size-4" strokeWidth={2} />}
                      <span className="font-semibold">
                        {favoritedCounts.find((favorited) => favorited.studentId === studentUid)?.count ?? 0}
                      </span>
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

function FesInfo() {
  const FesInfoCard = ({ Icon, title, description }: { Icon: React.ElementType, title: string, description: string }) => (
    <div className="my-2 flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
      <div className="flex-shrink-0 p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
        <Icon className="size-5 text-neutral-600 dark:text-neutral-300" />
      </div>
      <div>
        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{title}</h4>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="my-8">
      <SubTitle text="페스 모집 소개" />
      <div>
        <FesInfoCard
          Icon={StarIcon}
          title="모집 확률 상승"
          description="★3 학생 모집 확률이 6%로 상승해요"
        />
        <FesInfoCard
          Icon={ClockIcon}
          title="기간 한정 모집"
          description={"일부 학생은 페스 기간에만 모집할 수 있어요. 아래 \"페스 신규/복각\" 학생 목록을 확인해주세요."}
        />
        <FesInfoCard
          Icon={XCircleIcon}
          title="모집 포인트 교환 불가"
          description={"\"페스 복각\" 학생은 모집 포인트(천장)로는 교환할 수 없어요."}
        />
      </div>
    </div>
  );
}
