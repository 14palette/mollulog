import { attackTypeColor, attackTypeLocale, contentTypeLocale, defenseTypeColor, defenseTypeLocale, pickupLabelLocale, terrainLocale } from "~/locales/ko";
import { bossImageUrl } from "~/models/assets";
import type { AttackType, DefenseType, EventType, PickupType, RaidType, Role, Terrain } from "~/models/content.d";
import { StudentCards } from "../student";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { MemoEditor } from "../editor";
import { ChevronRightIcon, ChartBarIcon, ClockIcon, CheckCircleIcon } from "@heroicons/react/16/solid";
import dayjs from "dayjs";
import { OptionBadge } from "~/components/atoms/student";
import { ArrowTopRightOnSquareIcon, IdentificationIcon, HeartIcon as EmptyHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as FilledHeartIcon } from "@heroicons/react/24/solid";

export type ContentTimelineItemProps = {
  name: string;
  contentType: EventType | RaidType;
  rerun: boolean;
  since?: Date | null;
  until: Date | null;
  link: string;
  confirmed?: boolean;

  showMemo: boolean;
  initialMemo?: string;
  onUpdateMemo?: (text: string) => void;

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
      schaleDbId?: string;
    } | null;
    studentName: string;
  }[];
  raidInfo?: {
    uid: string;
    boss: string;
    terrain: Terrain;
    attackType: AttackType;
    defenseType: DefenseType;
    rankVisible: boolean;
  };
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

export default function ContentTimelineItem(
  {
    name, contentType, rerun, since, until, link, confirmed, raidInfo, pickups,
    showMemo, initialMemo, onUpdateMemo, favoritedStudents, favoritedCounts, onFavorite,
  }: ContentTimelineItemProps,
) {
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

      {/* 메모 */}
      {showMemo && (
        <MemoEditor initialText={initialMemo} onUpdate={(text) => onUpdateMemo?.(text)} />
      )}
    </div>
  );
}
