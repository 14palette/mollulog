import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import dayjs from "dayjs";
import { ChevronRightIcon, ChartBarIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/16/solid";
import { ArrowTopRightOnSquareIcon, IdentificationIcon, HeartIcon as EmptyHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as FilledHeartIcon } from "@heroicons/react/24/solid";
import type { AttackType, DefenseType, EventType, PickupType, RaidType, Role, Terrain } from "~/models/content.d";
import { attackTypeColor, attackTypeLocale, contentTypeLocale, defenseTypeColor, defenseTypeLocale, pickupLabelLocale, terrainLocale } from "~/locales/ko";
import { bossImageUrl } from "~/models/assets";
import { StudentCards } from "~/components/molecules/student";
import { ContentMemoEditor } from "~/components/molecules/content";
import { OptionBadge } from "~/components/atoms/student";
import { BottomSheet } from "~/components/atoms/layout";

export type ContentTimelineItemProps = {
  uid: string;
  name: string;
  contentType: EventType | RaidType;
  rerun: boolean;
  since?: Date | null;
  until: Date | null;
  link: string;
  confirmed?: boolean;

  allMemos?: {
    uid: string;
    body: string;
    visibility: "private" | "public";
    sensei: {
      username: string;
      profileStudentId: string | null;
    };
  }[];
  myMemo?: {
    body: string;
    visibility: "private" | "public";
  };
  onUpdateMemo?: ({ body, visibility }: { body: string, visibility: "private" | "public" }) => void;
  isSubmittingMemo?: boolean;

  favoritedStudents?: string[];
  favoritedCounts?: Record<string, number>;
  onFavorite?: (studentUid: string, favorited: boolean) => void;

  pickups?: {
    type: PickupType;
    rerun: boolean;
    student: {
      uid: string;
      attackType?: AttackType;
      defenseType?: DefenseType;
      role?: Role;
      schaleDbId?: string | null;
    } | null;
    studentName: string;
    since?: Date | null;
    until?: Date | null;
  }[];
  raidInfo?: {
    uid: string;
    boss: string;
    terrain: Terrain;
    attackType: AttackType;
    defenseType: DefenseType;
    rankVisible: boolean;
  };

  signedIn: boolean;
};

function ContentTitles({ name, showLink }: { name: string, showLink: boolean }): ReactNode {
  const titles = name.split("\n");
  return (
    titles.map((titleLine, index) => {
      const key = `${name}-${index}`;
      if (index < titles.length - 1) {
        return <p key={key} className="text-lg md:text-xl font-bold">{titleLine}</p>;
      } else {
        return (
          <div key={key} className="text-lg md:text-xl font-bold flex items-center">
            <span className="inline">{titleLine}</span>
            {showLink && <ChevronRightIcon className="inline size-4" strokeWidth={2} />}
          </div>
        );
      }
    })
  )
}

const MEMO_CONTENT_TYPES = ["event", "pickup", "fes", "immortal_event"];

export default function ContentTimelineItem(
  {
    name, contentType, rerun, since, until, link, confirmed, raidInfo, pickups,
    allMemos, myMemo, onUpdateMemo, isSubmittingMemo, favoritedStudents, favoritedCounts, onFavorite, signedIn,
  }: ContentTimelineItemProps,
) {
  const showMemo = MEMO_CONTENT_TYPES.includes(contentType);
  const [memoEditing, setMemoEditing] = useState(false);

  let daysLabel = null;
  const now = dayjs();
  const sinceDayjs = dayjs(since);
  const untilDayjs = dayjs(until);

  let finishSoon = false;
  if (since && until && sinceDayjs.isBefore(now)) {
    const remainingDays = untilDayjs.startOf("day").diff(now.startOf("day"), "day");
    if (remainingDays >= 2) {
      daysLabel = `${remainingDays}일`;
    } else {
      const remainingHours = untilDayjs.startOf("hour").diff(now.startOf("hour"), "hour");
      finishSoon = true;
      if (remainingHours > 24) {
        daysLabel = `내일 종료`;
      } else {
        daysLabel = `${remainingHours}시간 남음`;
      }
    }
  }

  const RaidInfo = () => raidInfo ? (
    <div className="mt-2 mb-6 relative md:w-96">
      <img
        className="md:w-96 rounded-lg bg-linear-to-br from-neutral-50 to-neutral-300 dark:from-neutral-600 dark:to-neutral-800"
        src={bossImageUrl(raidInfo.boss)} alt={`총력전 보스 ${name}`} loading="lazy"
      />
      <div className="absolute bottom-0 right-0 flex gap-x-1 p-1 text-white text-sm">
        <OptionBadge dark text={terrainLocale[raidInfo.terrain]} />
        <OptionBadge dark text={attackTypeLocale[raidInfo.attackType]} color={attackTypeColor[raidInfo.attackType]} />
        <OptionBadge dark text={defenseTypeLocale[raidInfo.defenseType]} color={defenseTypeColor[raidInfo.defenseType]} />
      </div>
    </div>
  ) : null;

  const pickupSince = pickups?.[0]?.since;
  const pickupUntil = pickups?.[0]?.until;
  const isPickupDayDifferent = pickupSince && pickupUntil &&
    (!dayjs(pickupSince).isSame(dayjs(since), "day") || !dayjs(pickupUntil).isSame(dayjs(until), "day"));

  return (
    <div className="my-4 md:my-6">
      {/* 컨텐츠 분류 */}
      <div className="flex items-center gap-x-1 md:my-1">
        <div className="my-1 flex flex-wrap gap-1 text-sm">
          <span className="pr-1 py-0.5 text-neutral-500 dark:text-neutral-400">
            {(contentType === "event" || contentType === "pickup") && rerun && "복각 "}{contentTypeLocale[contentType]}
          </span>
          {daysLabel && (
            <span className={`flex items-center px-2 py-0.5 rounded-full ${finishSoon ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-neutral-100 dark:bg-neutral-700"}`}>
              <ClockIcon className="inline size-4 mr-1" />
              {daysLabel}
            </span>
          )}
          {confirmed && (since && sinceDayjs.isAfter(now)) && (
            <span className="flex items-center px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              <CheckCircleIcon className="inline size-4 mr-1" />
              확정
            </span>
          )}
          {raidInfo && raidInfo.rankVisible && (
            <span className="flex items-center px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
              <ChartBarIcon className="inline size-4 mr-1" />
              순위 정보
            </span>
          )}
        </div>
      </div>

      {/* 컨텐츠 이름 */}
      <Link to={link} className="cursor-pointer hover:underline tracking-tight">
        <ContentTitles name={name} showLink={true} />
        <RaidInfo />
      </Link> 

      {/* 픽업 정보 */}
      {pickups && (
        <div className="my-2">
          <StudentCards
            mobileGrid={5}
            students={pickups.map((pickup) => {
              const student = pickup.student;
              const colorClass = pickup.rerun ? "text-white" : "text-yellow-500";
              return {
                ...student,
                uid: student?.uid ?? null,
                name: pickup.studentName,
                label: <span className={`${colorClass}`}>{pickupLabelLocale(pickup)}</span>,
                state: student?.uid ? {
                  favorited: favoritedStudents?.includes(student.uid),
                  favoritedCount: favoritedCounts?.[student.uid],
                } : undefined,
                popups: (student?.uid && student?.schaleDbId) ? [
                  favoritedStudents?.includes(student.uid) ? {
                    Icon: FilledHeartIcon,
                    text: "관심 학생에서 해제",
                    onClick: () => onFavorite?.(student.uid, false),
                  } : {
                    Icon: EmptyHeartIcon,
                    text: "관심 학생에 등록",
                    onClick: () => onFavorite?.(student.uid, true),
                  },
                  {
                    Icon: IdentificationIcon,
                    text: "학생부 보기",
                    link: `/students/${student?.uid}`,
                  },
                  {
                    Icon: ArrowTopRightOnSquareIcon,
                    text: "샬레DB에서 학생 정보 보기",
                    link: `https://schaledb.com/student/${student?.schaleDbId}`,
                  },
                ] : undefined,
              };
            })}
          />
        </div>
      )}

      {isPickupDayDifferent && (
        <div className="mb-2 px-2 py-2 flex items-center gap-x-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl text-sm">
          <ExclamationTriangleIcon className="shrink-0 size-5 text-amber-600 dark:text-amber-400" />
          <div className="flex flex-wrap gap-x-1">
            <p className="shrink-0 text-amber-700 dark:text-amber-300">
              {dayjs(pickupUntil).isBefore(dayjs()) ? "픽업 모집은 종료되었어요." : "이벤트 개최 기간과 픽업 모집 기간이 달라요."}
            </p>
            <Link to={link} className="flex-shrink-0 text-amber-600 dark:text-amber-400 underline cursor-pointer hover:text-amber-700 dark:hover:text-amber-300">
              자세히 보기
            </Link>
          </div>
        </div>
      )}

      {/* 메모 */}
      {showMemo && onUpdateMemo && (
        <>
          <div
            className="w-full p-2 flex items-center gap-x-1 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg text-sm cursor-pointer transition"
            onClick={() => setMemoEditing(true)}
          >
            <ChatBubbleOvalLeftEllipsisIcon className="shrink-0 size-4 text-neutral-500 dark:text-neutral-400" />
            {allMemos?.length !== undefined && <span className="text-neutral-500 dark:text-neutral-400">{allMemos.length}</span>}

            <p className={`ml-1 pl-2 border-l border-neutral-200 dark:border-neutral-700 grow ${myMemo?.body ? "" : "text-neutral-400 dark:text-neutral-600"}`}>
              {myMemo?.body || "메모를 남겨보세요"}
            </p>
          </div>

          {memoEditing && (
            <BottomSheet Icon={ChatBubbleOvalLeftEllipsisIcon} title="이벤트 메모" onClose={() => setMemoEditing(false)}>
              <ContentMemoEditor
                allMemos={allMemos ?? []}
                myMemo={myMemo}
                onUpdate={onUpdateMemo}
                isSubmitting={isSubmittingMemo}
                signedIn={signedIn}
                autoFocus={true}
              />
            </BottomSheet>
          )}
        </>
      )}
    </div>
  );
}
