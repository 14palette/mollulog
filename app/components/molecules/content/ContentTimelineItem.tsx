import { Chip } from "~/components/atoms/button";
import { attackTypeLocale, contentTypeLocale, defenseTypeLocale, pickupLabelLocale, terrainLocale } from "~/locales/ko";
import { bossImageUrl } from "~/models/assets";
import { attackTypeColorMap, defenseTypeColorMap } from "~/models/content.d";
import type { AttackType, DefenseType, EventType, PickupType, RaidType, Role, Terrain } from "~/models/content.d";
import { StudentCards } from "../student";
import type { ReactNode } from "react";
import { Link } from "@remix-run/react";
import { MemoEditor } from "../editor";
import { CheckIcon, ChevronRightIcon, ChartBarIcon } from "@heroicons/react/16/solid";
import dayjs from "dayjs";

export type ContentTimelineItemProps = {
  name: string;
  contentType: EventType | RaidType;
  rerun: boolean;
  since?: Date | null;
  until: Date | null;
  link: string | null;
  confirmed?: boolean;

  showMemo: boolean;
  initialMemo?: string;
  onUpdateMemo?: (text: string) => void;

  favoritedStudents?: string[];
  favoritedCounts?: Record<string, number>;
  onFavorite?: (studentId: string, favorited: boolean) => void;

  pickups?: {
    type: PickupType;
    rerun: boolean;
    student: {
      studentId: string;
      attackType?: AttackType;
      defenseType?: DefenseType;
      role?: Role;
      schaleDbId?: string;
    } | null;
    studentName: string;
  }[];
  raidInfo?: {
    raidId: string;
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
        return <p key={key} className="my-1">{titleLine}</p>;
      } else {
        return (
          <div key={key}>
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
  const now = dayjs();
  const remainingDays = until ? dayjs(until).startOf("day").diff(now.startOf("day"), "day") : null;

  let remainingDaysText = "";
  if (remainingDays === 1) {
    remainingDaysText = "내일 종료";
  } else if (remainingDays === 0) {
    remainingDaysText = "오늘 종료";
  } else if (remainingDays !== null) {
    remainingDaysText = `${remainingDays}일 남음`;
  }

  const RaidInfo = () => raidInfo ? (
    <div className="mt-2 mb-6 relative md:w-96">
      <img
        className="md:w-96 rounded-lg bg-linear-to-br from-neutral-50 to-neutral-300 dark:from-neutral-600 dark:to-neutral-800"
        src={bossImageUrl(raidInfo.boss)} alt={`총력전 보스 ${name}`} loading="lazy"
      />
      <div className="absolute bottom-0 right-0 flex gap-x-1 p-1 text-white text-sm">
        <Chip text={terrainLocale[raidInfo.terrain]} color="black" />
        <Chip text={attackTypeLocale[raidInfo.attackType]} color={attackTypeColorMap[raidInfo.attackType]} />
        <Chip text={defenseTypeLocale[raidInfo.defenseType]} color={defenseTypeColorMap[raidInfo.defenseType]} />
      </div>
    </div>
  ) : null;

  return (
    <div className="my-6">
      {/* 컨텐츠 분류 */}
      <div className="my-1 flex items-center gap-x-1">
        <span className="mr-1 text-sm text-neutral-500 dark:text-neutral-400">
          {(contentType === "event" || contentType === "pickup") && rerun && "복각 "}{contentTypeLocale[contentType]}
        </span>
        {remainingDaysText && (
          <span className="py-0.5 px-2 text-xs bg-neutral-900 text-white rounded-full">
            {remainingDaysText}
          </span>
        )}
        {confirmed && (since && dayjs(since).isAfter(now)) && (
          <span className="p-0.5 px-2 text-xs bg-green-600 text-white rounded-full">
            <CheckIcon className="inline size-4" />
            확정
          </span>
        )}
        {raidInfo && raidInfo.rankVisible && (
          <span className="p-0.5 px-2 text-xs bg-neutral-900 text-white rounded-full">
            <ChartBarIcon className="inline size-4 mr-1" />
            순위 정보
          </span>
        )}
      </div>

      {/* 컨텐츠 이름 */}
      {link ?
        <Link to={link} className="font-bold text-lg md:text-xl cursor-pointer hover:underline tracking-tight">
          <ContentTitles name={name} showLink={true} />
          <RaidInfo />
        </Link> :
        <div className="font-bold text-lg md:text-xl">
          <ContentTitles name={name} showLink={false} />
          <RaidInfo />
        </div>
      }

      {/* 픽업 정보 */}
      {pickups && (
        <div className="my-2">
          <StudentCards
            pcGrid={10}
            mobileGrid={5}
            students={pickups.map((pickup) => {
              const student = pickup.student;
              const colorClass = pickup.rerun ? "text-white" : "text-yellow-500";
              return {
                ...student,
                studentId: student?.studentId ?? null,
                name: pickup.studentName,
                label: <span className={`${colorClass}`}>{pickupLabelLocale(pickup)}</span>,
                state: student?.studentId ? {
                  favorited: favoritedStudents?.includes(student.studentId),
                  favoritedCount: favoritedCounts?.[student.studentId],
                } : undefined,
              };
            })}
            onFavorite={onFavorite}
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
