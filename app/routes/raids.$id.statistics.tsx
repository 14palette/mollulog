import { useFetcher, useOutletContext } from "@remix-run/react";
import { RaidStatisticsData } from "./raids.data.$id.statistics";
import { buttonColors, OutletContext } from "./raids.$id";
import { defenseTypeLocale } from "~/locales/ko";
import { FilterButtons } from "~/components/molecules/student";
import { useEffect, useState } from "react";
import { type DefenseType } from "~/models/content.d";
import { StudentCard } from "~/components/atoms/student";
import { EmptyView, KeyValueTable } from "~/components/atoms/typography";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";
import { Progress } from "~/components/atoms/profile";
import { type ProgressProps } from "~/components/atoms/profile/Progress";
import { TimelinePlaceholder } from "~/components/organisms/useractivity";

export default function RaidStatistics() {
  const { raid } = useOutletContext<OutletContext>();

  const [defenseType, setDefenseType] = useState<DefenseType>(raid.defenseTypes[0].defenseType);

  const fetcher = useFetcher<RaidStatisticsData>();
  useEffect(() => {
    fetcher.load(`/raids/data/${raid.raidId}/statistics?defenseType=${defenseType}`);
  }, [defenseType]);

  return (
    <div className="flex flex-col">
      {raid.rankVisible && raid.type === "elimination" && (
        <div className="mb-6">
          <FilterButtons exclusive buttonProps={
            raid.defenseTypes.map((each) => ({
              text: defenseTypeLocale[each.defenseType],
              color: buttonColors[each.defenseType],
              active: each.defenseType === defenseType,
              onToggle: () => setDefenseType(each.defenseType),
            }))
          } />
        </div>
      )}
      {(!fetcher.data || fetcher.state !== "idle") && <TimelinePlaceholder />}
      {fetcher.data?.statistics && fetcher.data.statistics.length > 0 ?
        <div className="xl:grid xl:grid-cols-2 xl:gap-4">
          <div>
            <p className="text-lg font-bold">스트라이커 편성 횟수</p>
            <SlotCountInfos statistics={fetcher.data.statistics!.filter(({ student }) => student.role === "striker")} />
          </div>
          <div>
            <p className="text-lg font-bold">스페셜 편성 횟수</p>
            <SlotCountInfos statistics={fetcher.data.statistics!.filter(({ student }) => student.role === "special")} />
          </div>
        </div> :
        <EmptyView text="통계 정보를 준비중이에요" />
      }
    </div>
  );
}

function SlotCountInfos({ statistics }: { statistics: Exclude<RaidStatisticsData["statistics"], undefined> }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {statistics.slice(0, showMore ? undefined : 5).map(({ student, slotsCount, slotsByTier, assistsCount }) => (
        <SlotCountInfo key={student.studentId} student={student} slotsCount={slotsCount} slotsByTier={slotsByTier} assistsCount={assistsCount} />
      ))}
      {statistics.length > 5 && (
        <div
          className="py-2 mb-4 text-center cursor-pointer hover:underline flex items-center justify-center"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
          <span className="ml-1">{showMore ? "접기" : "더 보기"}</span>
        </div>
      )}
    </>
  );
}

type SlotCountInfoProps = {
  student: { studentId: string; name: string; role: string };
  slotsCount: number;
  slotsByTier: { tier: number; count: number }[];
  assistsCount: number;
}

const colors: { [tier: number]: ProgressProps["color"] } = {
  1: "red",
  2: "orange",
  3: "yellow",
  4: "green",
  5: "cyan",
  6: "blue",
  7: "purple",
  8: "fuchsia",
};


function SlotCountInfo({ student, slotsCount, slotsByTier, assistsCount }: SlotCountInfoProps) {
  const slotsByTierMap = slotsByTier.reduce((acc, { tier, count }) => {
    acc[tier] = count;
    return acc;
  }, {} as { [tier: number]: number });

  return (
    <div className="my-4 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
      <div className="flex items-center grow">
        <div className="w-16 xl:mx-2">
          <StudentCard studentId={student.studentId} />
        </div>
        <div className="mx-4 grow">
          <p className="font-bold mb-1">{student.name}</p>
          <KeyValueTable keyPrefix={`${student.studentId}-slots-count`} items={[
            { key: "편성 횟수", value: `${slotsCount} 회 (${formatPercentage(slotsCount / 20000)})` },
            { key: "조력 횟수", value: `${assistsCount} 회 (${formatPercentage(assistsCount / 20000)})` },
          ]} />
        </div>
      </div>

      <div className="xl:mx-2 mt-4">
        {[8, 7, 6, 5, 4, 3].map((tier) => (
          <div key={tier} className="flex">
            <div className="w-fit shrink-0 flex items-center text-sm">
              {(tier <= 5) ?
                <span className="w-4 mr-1 inline-block text-yellow-500">★</span> :
                <img className="w-4 h-4 mr-1 inline-block" src="/icons/exclusive_weapon.png" alt="고유 장비" />
              }
              <span className="w-3 inline-block mr-1">{tier <= 5 ? tier : tier - 5}</span>
              <span className="w-18 inline-block">- {slotsByTierMap[tier] ?? 0}명</span>
            </div>
            <div className="grow">
              <Progress ratio={slotsByTierMap[tier] / 20000} color={colors[tier]} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatPercentage(ratio: number) {
  return (ratio * 100).toFixed(1) + "%";
}
