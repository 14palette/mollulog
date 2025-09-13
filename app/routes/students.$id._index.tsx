import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { isRouteErrorResponse, useLoaderData, useRouteError, Link } from "react-router";
import dayjs from "dayjs";
import { useState, useMemo } from "react";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";
import { EmptyView, SubTitle, Title } from "~/components/atoms/typography";
import { ChevronDownIcon, ChevronUpIcon, PlusCircleIcon, PencilSquareIcon } from "@heroicons/react/16/solid";
import { ErrorPage } from "~/components/organisms/error";
import { SlotCountInfo } from "~/components/organisms/raid";
import { PickupHistories } from "~/components/organisms/student";
import { StudentInfo } from "~/components/molecules/student";
import { getMaxTierAt } from "~/models/student";
import { FilterButtons } from "~/components/molecules/content";
import { BarsArrowDownIcon } from "@heroicons/react/24/outline";
import { getTagCountsByStudent, STUDENT_GRADING_TAG_CONSTANTS, type StudentGradingTagValue } from "~/models/student-grading-tag";
import { getStudentGradingsByStudentWithUsers } from "~/models/student-grading";
import { getAuthenticator } from "~/auth/authenticator.server";
import ProfileImage from "~/components/atoms/student/ProfileImage";
import TagIcon from "~/components/atoms/student/TagIcon";
import { useSignIn } from "~/contexts/SignInProvider";

const studentDetailQuery = graphql(`
  query StudentDetail($uid: String!, $raidSince: ISO8601DateTime!) {
    student(uid: $uid) {
      name uid attackType defenseType role school schaleDbId
      pickups {
        since until
        event { type uid name rerun imageUrl }
      }
      raidStatistics(raidSince: $raidSince) {
        raid { uid name boss type since until terrain }
        difficulty
        defenseType
        slotsCount
        slotsByTier { tier count }
        assistsCount
        assistsByTier { tier count }
      }
    }
  }
`);

export const loader = async ({ params, context, request }: LoaderFunctionArgs) => {
  const uid = params.id!;
  const { env } = context.cloudflare;

  const raidSince = dayjs().subtract(6, "month").toDate();
  const { data, error } = await runQuery(studentDetailQuery, { uid, raidSince });
  let errorMessage: string | null = null;
  if (error || !data) {
    console.error(error);
    errorMessage = "학생 정보를 가져오는 중 오류가 발생했어요";
  } else if (!data.student) {
    errorMessage = "학생 정보를 찾을 수 없어요";
  }

  if (errorMessage) {
    throw new Response(JSON.stringify({ error: { message: errorMessage } }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get current user
  const currentUser = await getAuthenticator(env).isAuthenticated(request);

  // Get grading tag counts for this student
  const tagCounts = await getTagCountsByStudent(env, uid);

  // Get all gradings with comments and user information for this student
  const allGradings = await getStudentGradingsByStudentWithUsers(env, uid, true);
  return { student: data!.student!, tagCounts, allGradings, currentUser };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: `학생 정보 | 몰루로그` }];
  }

  const { student } = data;
  const title = `${student.name} - 학생 정보`;
  const description = `블루 아카이브 ${student.name} - 학생의 총력전/대결전 통계 정보, 선생님들의 성능 평가를 확인해보세요.`;
  return [
    { title: `${title} | 몰루로그` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
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

export default function StudentDetail() {
  const { student, tagCounts, allGradings, currentUser } = useLoaderData<typeof loader>();

  const [raidShowMore, setRaidShowMore] = useState(false);
  const [sort, setSort] = useState<"recent" | "old">("recent");

  // Memoize the filtered statistics to prevent re-computation on every render
  const statistics = useMemo(() => 
    student.raidStatistics.filter(({ slotsCount }) => slotsCount > 100),
    [student.raidStatistics]
  );

  // Memoize the sorted and sliced statistics
  const filteredStatistics = useMemo(() => {
    const sorted = statistics.sort((a, b) => {
      if (sort === "recent") {
        return new Date(b.raid.since).getTime() - new Date(a.raid.since).getTime();
      } else {
        return new Date(a.raid.since).getTime() - new Date(b.raid.since).getTime();
      }
    });
    return raidShowMore ? sorted : sorted.slice(0, 5);
  }, [statistics, sort, raidShowMore]);

  return (
    <>
      <Title text="학생부" />
      <StudentInfo student={student} />

      {/* Grading Section */}
      <SubTitle text="학생 평가" />
      <StudentGradingChart student={student} tagCounts={tagCounts} noGrading={allGradings.length === 0} signedIn={currentUser !== null} />
      <StudentGradingComments student={student} gradings={allGradings} currentUser={currentUser} />

      <SubTitle
        text="총력전/대결전 통계"
        description="최근 1년간 개최된 총력전/대결전의 편성 횟수를 제공해요."
      />
      <div>
        {filteredStatistics.length === 0 ?
          <EmptyView text="편성된 충력전/대결전 정보가 없어요" /> :
          <FilterButtons
            Icon={BarsArrowDownIcon}
            buttonProps={[
              { text: "최신순", onToggle: () => setSort("recent"), active: sort === "recent" },
              { text: "과거순", onToggle: () => setSort("old"), active: sort === "old" },
            ]}
            exclusive atLeastOne
          />
        }
        {filteredStatistics.map(({ raid, defenseType, difficulty, slotsByTier, slotsCount, assistsCount, assistsByTier }) => {
          return (
            <SlotCountInfo
              key={`${raid.uid}-${defenseType}`}
              raid={{
                ...raid,
                defenseType,
                difficulty,
                since: new Date(raid.since),
                until: new Date(raid.until),
              }}
              slotsCount={slotsCount}
              slotsByTier={slotsByTier}
              assistsCount={assistsCount}
              assistsByTier={assistsByTier}
              maxTier={getMaxTierAt(new Date(raid.since))}
            />
          );
        })}
        {statistics.length > 5 && (
          <div
            className="py-2 mb-4 text-center cursor-pointer hover:underline flex items-center justify-center"
            onClick={() => setRaidShowMore(!raidShowMore)}
          >
            {raidShowMore ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
            <span className="ml-1">{raidShowMore ? "접기" : "더 보기"}</span>
          </div>
        )}
      </div>

      {student.pickups.length > 0 && (
        <>
          <SubTitle text="픽업 일정 정보" />
          <PickupHistories pickups={student.pickups} />
        </>
      )}
    </>
  );
}

// StudentGradingChart component for displaying tag counts
type StudentGradingChartProps = {
  student: { uid: string; name: string };
  tagCounts: Array<{ tag: StudentGradingTagValue; displayName: string; count: number }>;
  noGrading: boolean;
  signedIn: boolean;
};

function StudentGradingChart({ student, tagCounts, noGrading, signedIn }: StudentGradingChartProps) {
  const { showSignIn } = useSignIn();

  // Get the maximum count for scaling the bars
  const maxCount = Math.max(...tagCounts.map(tc => tc.count), 1);

  // Show all tags, even with 0 count, and sort by count (descending)
  const allTagsWithCounts = tagCounts;

  const noGradingView = (
    <div className="mb-4 p-4 text-center text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 bg-neutral-100 dark:bg-neutral-900 transition rounded-lg cursor-pointer">
      <p className="text-sm">아직 평가가 없어요</p>
      <p className="text-xs mt-1 text-blue-600 dark:text-blue-400 group-hover:underline">
        {signedIn ? "첫 번째 평가를 작성해보세요!" : "로그인 후 첫 번째 평가를 작성해보세요!"}
      </p>
    </div>
  );

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-white dark:bg-neutral-800/50">
      <div className="space-y-3">
        {noGrading && (
          signedIn ?
            <Link to={`/students/${student.uid}/grade`} className="group">
              {noGradingView}
            </Link> :
            <div onClick={() => showSignIn()}>
              {noGradingView}
            </div>
        )}

        {allTagsWithCounts.map(({ tag, displayName, count }) => (
          <div key={tag} className="flex items-center gap-2">
            {/* Icon */}
            <div className="flex-shrink-0">
              <TagIcon tag={tag} />
            </div>

            {/* Text */}
            <div className="flex-shrink-0 w-32">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {displayName}
              </span>
            </div>

            {/* Bar */}
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 relative">
                <div 
                  className="bg-neutral-700 dark:bg-neutral-50 h-2 rounded-full transition-all duration-300 absolute left-0 top-0 min-w-0"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="ml-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 min-w-0 flex-shrink-0">
                {count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Reusable CommentCard component
type CommentCardProps = {
  grading: { uid: string; studentUid: string; comment: string | null; tags?: StudentGradingTagValue[]; user: { username: string; profileStudentId: string | null } };
  isCurrentUser: boolean;
};

function CommentCard({ grading, isCurrentUser }: CommentCardProps) {
  const cardClasses = "flex-shrink-0 w-64 p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg";

  return (
    <div key={grading.uid} className={cardClasses}>
      <div className="space-y-2">
        {/* User Info */}
        {isCurrentUser ?
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">내가 작성한 평가</p>
            <Link 
              to={`/students/${grading.studentUid}/grade`}
              className="px-2 py-1 -mr-2 flex items-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-500 dark:text-neutral-400"
            >
              <PencilSquareIcon className="size-4 mr-0.5" />
              <span className="text-sm">수정</span>
            </Link>
          </div> :
          <Link to={`/@${grading.user.username}`} className="py-1 flex items-center gap-2">
            <ProfileImage studentUid={grading.user.profileStudentId} imageSize={6} />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:underline">
              {grading.user.username}
            </span>
          </Link>
        }

        {/* Tags */}
        {grading.tags && grading.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {grading.tags
              .sort((a, b) => {
                // Sort tags according to the declaration order
                const order = Object.values(STUDENT_GRADING_TAG_CONSTANTS);
                return order.indexOf(a) - order.indexOf(b);
              })
              .map((tag) => (
                <div key={tag} className="p-1 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <TagIcon tag={tag} size="sm" />
                </div>
              ))}
          </div>
        )}

        {/* Comment */}
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {grading.comment}
        </p>
      </div>
    </div>
  );
}

// StudentGradingComments component for displaying comments horizontally
type StudentGradingCommentsProps = {
  student: { uid: string; name: string };
  gradings: Array<{ uid: string; studentUid: string; comment: string | null; tags?: StudentGradingTagValue[]; user: { username: string; profileStudentId: string | null } }>;
  currentUser: { username: string } | null;
};

function StudentGradingComments({ student, gradings, currentUser }: StudentGradingCommentsProps) {
  const currentUserGrading = gradings.find((grading) => grading.user.username === currentUser?.username);
  const otherComments = gradings.filter((grading) => grading.uid !== currentUserGrading?.uid);

  // If no comments at all, don't show anything
  if (gradings.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
          {/* Current user's comment or link button */}
           {currentUserGrading ? <CommentCard grading={currentUserGrading} isCurrentUser={true} /> :
             currentUser ?
                <Link to={`/students/${student.uid}/grade`} className="flex-shrink-0 w-32 text-neutral-500">
                  <div className="bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition rounded-lg cursor-pointer p-3 h-full">
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <PlusCircleIcon className="size-6 mb-2" />
                      <p className="text-sm">내 평가 작성하기</p>
                    </div>
                  </div>
                </Link>
             : null
           }

          {/* Other users' comments */}
          {otherComments.map((grading) => (
            <CommentCard key={grading.uid} grading={grading} isCurrentUser={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
