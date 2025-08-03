import { useFetcher } from "react-router";
import { defenseTypeColor, defenseTypeLocale } from "~/locales/ko";
import { FilterButtons } from "~/components/molecules/content";
import { useEffect, useState } from "react";
import type { DefenseType, RaidType } from "~/models/content.d";
import { EmptyView } from "~/components/atoms/typography";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";
import { SlotCountInfo } from "~/components/organisms/raid";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { RaidStatisticsData } from "~/routes/raids.data.$id.statistics";
import { LoadingSkeleton } from "~/components/atoms/layout";


export type RaidStatisticsProps = {
  raid: {
    uid: string;
    type: RaidType;
    defenseTypes: { defenseType: DefenseType; difficulty: string | null }[];
    rankVisible: boolean;
  };
};

export default function RaidStatisticsPage({ raid }: RaidStatisticsProps) {
  const [defenseType, setDefenseType] = useState<DefenseType>(raid.defenseTypes[0].defenseType);

  const fetcher = useFetcher<RaidStatisticsData>();
  useEffect(() => {
    fetcher.load(`/raids/data/${raid.uid}/statistics?defenseType=${defenseType}`);
  }, [raid.uid, defenseType]);

  return (
    <div className="w-full max-w-3xl">
      {raid.rankVisible && raid.type === "elimination" && (
        <div className="my-4">
          <FilterButtons
            key={`filters-${raid.uid}`}
            Icon={ShieldCheckIcon}
            buttonProps={
              raid.defenseTypes.map((each) => ({
                text: defenseTypeLocale[each.defenseType],
                color: defenseTypeColor[each.defenseType],
                active: each.defenseType === defenseType,
                onToggle: () => setDefenseType(each.defenseType),
              }))
            }
            exclusive atLeastOne
          />
        </div>
      )}
      <div className="flex flex-col">
        {(!fetcher.data || fetcher.state !== "idle") && <LoadingSkeleton />}
        {fetcher.state === "idle" && fetcher.data?.statistics && (
          fetcher.data.statistics.length > 0 ? (
            <div className="xl:grid xl:grid-cols-2 xl:gap-4">
              <div>
                <p className="text-lg font-bold">스트라이커 편성 횟수</p>
                <SlotCountInfos statistics={fetcher.data.statistics!.filter(({ student }) => student.role === "striker")} />
              </div>
              <div>
                <p className="text-lg font-bold">스페셜 편성 횟수</p>
                <SlotCountInfos statistics={fetcher.data.statistics!.filter(({ student }) => student.role === "special")} />
              </div>
            </div>
          ) : (
            <EmptyView text="통계 정보를 준비중이에요" />
          )
        )}
      </div>
    </div>
  );
}

function SlotCountInfos({ statistics }: { statistics: Exclude<RaidStatisticsData["statistics"], undefined> }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {statistics.slice(0, showMore ? undefined : 5).map(({ student, slotsCount, slotsByTier, assistsCount, assistsByTier }) => (
        <SlotCountInfo
          key={student.uid}
          student={student}
          slotsCount={slotsCount}
          slotsByTier={slotsByTier}
          assistsCount={assistsCount}
          assistsByTier={assistsByTier}
        />
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
