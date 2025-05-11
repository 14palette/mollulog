import { ChevronRightIcon } from "@heroicons/react/16/solid";
import dayjs from "dayjs";
import { Link } from "react-router";
import { OptionBadge, StudentCard } from "~/components/atoms/student";
import { KeyValueTable } from "~/components/atoms/typography";
import { defenseTypeLocale, difficultyLocale, terrainLocale } from "~/locales/ko";
import { defenseTypeColor } from "~/locales/ko";
import { TierCounts } from "~/components/molecules/student";
import { raidTypeLocale } from "~/locales/ko";
import { bossImageUrl } from "~/models/assets";
import type { DefenseType, RaidType, Terrain } from "~/models/content.d";
import { useState } from "react";

type SlotCountInfoProps = {
  student?: { studentId: string; name: string };
  raid?: {
    raidId: string;
    name: string;
    type: RaidType;
    boss: string;
    defenseType: DefenseType;
    difficulty: string;
    since: Date;
    until: Date;
    terrain: Terrain;
  };
  slotsCount: number;
  slotsByTier: { tier: number; count: number }[];
  assistsCount: number;
  assistsByTier: { tier: number; count: number }[];
};

export default function SlotCountInfo({ student, raid, slotsCount, assistsCount, slotsByTier, assistsByTier }: SlotCountInfoProps) {
  const [showSlots, setShowSlots] = useState(true);

  const slotsByTierMap = slotsByTier.reduce((acc, { tier, count }) => {
    acc[tier] = count;
    return acc;
  }, {} as { [tier: number]: number });

  const assistsByTierMap = assistsByTier.reduce((acc, { tier, count }) => {
    acc[tier] = count;
    return acc;
  }, {} as { [tier: number]: number });

  return (
    <div className="my-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
      {raid && (
        <div className="pl-4 xl:pl-6 py-4 relative flex">
          <Link
            to={`/raids/${raid.raidId}`}
            className="grow group z-10 relative "
          >
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {raidTypeLocale[raid.type]}
            </p>
            <p className="text-lg font-bold group-hover:underline">
              {raid.name}
              <ChevronRightIcon className="size-4 inline-block" />
            </p>
            <p className="text-xs">{dayjs(raid.since).format("YYYY-MM-DD")} ~ {dayjs(raid.until).format("YYYY-MM-DD")}</p>
          </Link>
          <div
            className="absolute top-0 right-0 w-3/5 md:w-1/2 h-full rounded-tr-lg bg-cover"
            style={{ backgroundImage: `url(${bossImageUrl(raid.boss)})` }}
          />
          <div className="absolute right-2 bottom-1 z-10 flex gap-1">
            <OptionBadge text={difficultyLocale[raid.difficulty]} dark />
            <OptionBadge text={terrainLocale[raid.terrain]} dark />
            <OptionBadge text={defenseTypeLocale[raid.defenseType]} color={defenseTypeColor[raid.defenseType]} dark />
          </div>
        </div>
      )}
      {student && (
        <div className="pt-4 px-4 xl:px-6 flex items-center grow">
          <div className="w-16">
            <StudentCard studentId={student.studentId} />
          </div>
          <div className="mx-4 grow">
            <Link to={`/students/${student.studentId}`}>
              <p className="font-bold mb-1 hover:underline">
                <span>{student.name}</span>
                <ChevronRightIcon className="inline size-4" />
              </p>
            </Link>
            <KeyValueTable keyPrefix={`${student.studentId}-slots-count`} items={[
              { key: "편성 횟수", value: `${slotsCount} 회 (${formatPercentage(slotsCount / 20000)})` },
              { key: "조력 횟수", value: `${assistsCount} 회 (${formatPercentage(assistsCount / 20000)})` },
            ]} />
          </div>
        </div>
      )}

      {!student && raid && (
        <div className="px-4 xl:px-6">
          <KeyValueTable keyPrefix={`${raid.raidId}-slots-count`} items={[
            { key: "편성 횟수", value: `${slotsCount} 회 (${formatPercentage(slotsCount / 20000)})` },
            { key: "조력 횟수", value: `${assistsCount} 회 (${formatPercentage(assistsCount / 20000)})` },
          ]} />
        </div>
      )}

      <div className="p-4 xl:px-6">
        <div className="-mx-1 mb-2 flex gap-2">
          <TierCountToggleButton text="편성 횟수" active={showSlots} onClick={() => setShowSlots(true)} />
          <TierCountToggleButton text="조력 횟수" active={!showSlots} onClick={() => setShowSlots(false)} />
        </div>
        <TierCounts tierCounts={showSlots ? slotsByTierMap : assistsByTierMap} visibleTiers={[8, 7, 6, 5, 4, 3]} reducePaddings totalCount={20000} />
      </div>
    </div>
  );
}

function TierCountToggleButton({ text, active, onClick }: { text: string, active: boolean, onClick: () => void }) {
  return (
    <button
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${active ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200"}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

function formatPercentage(ratio: number) {
  return (ratio * 100).toFixed(1) + "%";
}
