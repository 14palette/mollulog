import dayjs from "dayjs";
import { useState } from "react";
import { Link } from "react-router";
import { ChevronRightIcon } from "@heroicons/react/16/solid";
import { OptionBadge, StudentCard } from "~/components/atoms/student";
import { KeyValueTable } from "~/components/atoms/typography";
import { FilterButtons, TierCounts } from "~/components/molecules/student";
import { defenseTypeLocale, difficultyLocale, terrainLocale } from "~/locales/ko";
import { defenseTypeColor } from "~/locales/ko";
import { raidTypeLocale } from "~/locales/ko";
import { bossImageUrl } from "~/models/assets";
import type { DefenseType, RaidType, Terrain } from "~/models/content.d";

type SlotCountInfoProps = {
  student?: { uid: string; name: string };
  raid?: {
    uid: string;
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
            to={`/raids/${raid.uid}`}
            className="grow group z-10 relative "
          >
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {raidTypeLocale[raid.type]}
            </p>
            <p className="text-lg font-bold group-hover:underline">
              {raid.name}
              <ChevronRightIcon className="size-4 inline-block" />
            </p>
            <p className="text-xs">
              {dayjs(raid.since).format("YYYY-MM-DD")}<span className="hidden md:inline"> ~ {dayjs(raid.until).format("YYYY-MM-DD")}</span>
            </p>
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
            <StudentCard uid={student.uid} />
          </div>
          <div className="mx-4 grow">
            <Link to={`/students/${student.uid}`}>
              <p className="font-bold mb-1 hover:underline">
                <span>{student.name}</span>
                <ChevronRightIcon className="inline size-4" />
              </p>
            </Link>
            <KeyValueTable keyPrefix={`${student.uid}-slots-count`} items={[
              { key: "편성 횟수", value: `${slotsCount} 회 (${formatPercentage(slotsCount / 20000)})` },
              { key: "조력 횟수", value: `${assistsCount} 회 (${formatPercentage(assistsCount / 20000)})` },
            ]} />
          </div>
        </div>
      )}

      {!student && raid && (
        <div className="px-4 xl:px-6">
          <KeyValueTable keyPrefix={`${raid.uid}-slots-count`} items={[
            { key: "편성 횟수", value: `${slotsCount} 회 (${formatPercentage(slotsCount / 20000)})` },
            { key: "조력 횟수", value: `${assistsCount} 회 (${formatPercentage(assistsCount / 20000)})` },
          ]} />
        </div>
      )}

      <div className="p-4 xl:px-6 xl:pb-6">
        <div className="-mx-1 flex gap-2">
          <FilterButtons
            buttonProps={[
              { text: "편성 횟수", active: true, onToggle: () => setShowSlots(true) },
              { text: "조력 횟수", onToggle: () => setShowSlots(false) },
            ]}
            exclusive atLeastOne inBlock
          />
        </div>
        <TierCounts tierCounts={showSlots ? slotsByTierMap : assistsByTierMap} visibleTiers={[8, 7, 6, 5, 4, 3]} reducePaddings totalCount={20000} />
      </div>
    </div>
  );
}

function formatPercentage(ratio: number) {
  return (ratio * 100).toFixed(1) + "%";
}
