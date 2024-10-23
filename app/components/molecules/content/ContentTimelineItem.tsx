import { NavArrowRight } from "iconoir-react";
import { Chip } from "~/components/atoms/button";
import { attackTypeLocale, contentTypeLocale, defenseTypeLocale, pickupLabelLocale, terrainLocale } from "~/locales/ko";
import { bossImageUrl } from "~/models/assets";
import type { AttackType, DefenseType, EventType, PickupType, RaidType, Role, Terrain } from "~/models/content";
import { StudentCards } from "../student";
import type { ReactNode } from "react";
import { Link } from "@remix-run/react";
import { MemoEditor } from "../editor";

export type ContentTimelineItemProps = {
  name: string;
  contentType: EventType | RaidType;
  rerun: boolean;
  remainingDays: number | null;
  link: string | null;

  showMemo: boolean;
  initialMemo?: string;
  onUpdateMemo?: (text: string) => void;

  favoritedStudents?: string[];
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
    boss: string;
    terrain: Terrain;
    attackType: AttackType;
    defenseType: DefenseType;
  };
};

const attachTypeColorMap: Record<AttackType, "red" | "yellow" | "blue" | "purple"> = {
  explosive: "red",
  piercing: "yellow",
  mystic: "blue",
  sonic: "purple",
};

const defenseTypeColorMap: Record<DefenseType, "red" | "yellow" | "blue" | "purple"> = {
  light: "red",
  heavy: "yellow",
  special: "blue",
  elastic: "purple",
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
            {showLink && <NavArrowRight className="inline size-4" strokeWidth={2} />}
          </div>
        );
      }
    })
  )
}

export default function ContentTimelineItem(
  {
    name, contentType, rerun, remainingDays, link, raidInfo, pickups,
    showMemo, initialMemo, onUpdateMemo, favoritedStudents, onFavorite,
  }: ContentTimelineItemProps,
) {
  let remainingDaysText = "";
  if (remainingDays === 1) {
    remainingDaysText = "내일 종료";
  } else if (remainingDays === 0) {
    remainingDaysText = "오늘 종료";
  } else if (remainingDays !== null) {
    remainingDaysText = `${remainingDays}일 남음`;
  }

  return (
    <div className="my-6">
      {/* 컨텐츠 분류 */}
      <div className="my-1 flex items-center gap-x-2">
        <span className="text-sm text-neutral-500">
          {(contentType === "event" || contentType === "pickup") && rerun && "복각 "}{contentTypeLocale[contentType]}
        </span>
        {remainingDaysText && (
          <span className="py-0.5 px-2 text-xs bg-neutral-900 text-white rounded-full">
            {remainingDaysText}
          </span>
        )}
      </div>

      {/* 컨텐츠 이름 */}
      {link ? 
        <Link to={link} className="font-bold text-lg md:text-xl cursor-pointer hover:underline">
          <ContentTitles name={name} showLink={true} />
        </Link> :
        <div className="font-bold text-lg md:text-xl">
          <ContentTitles name={name} showLink={false} />
        </div>
      }

      {/* 레이드 정보 */}
      {raidInfo && (
        <div className="mt-2 mb-6 relative md:w-3/5">
          <img
            className="rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-300"
            src={bossImageUrl(raidInfo.boss)} alt={`총력전 보스 ${name}`} loading="lazy"
          />
          <div className="absolute bottom-0 right-0 flex gap-x-1 p-1 text-white text-sm">
            <Chip text={terrainLocale[raidInfo.terrain]} color="black" />
            <Chip text={attackTypeLocale[raidInfo.attackType]} color={attachTypeColorMap[raidInfo.attackType]} />
            <Chip text={defenseTypeLocale[raidInfo.defenseType]} color={defenseTypeColorMap[raidInfo.defenseType]} />
          </div>
        </div>
      )}

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
                studentId: student?.studentId ?? null,
                name: pickup.studentName,
                label: <span className={`${colorClass}`}>{pickupLabelLocale(pickup)}</span>,
                state: {
                  favorited: student?.studentId ? favoritedStudents?.includes(student.studentId) : false,
                },
              };
            })}
            onFavorite={onFavorite}
          />
        </div>
      )}

      {/* 메모 */}
      {showMemo && <MemoEditor initialText={initialMemo} onUpdate={(text) => onUpdateMemo?.(text)} />}
    </div>
  );
}
