import { useFetcher, useOutletContext } from "react-router";
import type { RaidStatisticsData } from "./raids.data.$id.statistics";
import { buttonColors, type OutletContext } from "./raids.$id";
import { defenseTypeLocale } from "~/locales/ko";
import { FilterButtons } from "~/components/molecules/student";
import { useEffect, useState } from "react";
import type { DefenseType } from "~/models/content.d";
import { EmptyView } from "~/components/atoms/typography";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/16/solid";
import { TimelinePlaceholder } from "~/components/organisms/useractivity";
import { SlotCountInfo } from "~/components/organisms/raid";

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
  );
}

function SlotCountInfos({ statistics }: { statistics: Exclude<RaidStatisticsData["statistics"], undefined> }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {statistics.slice(0, showMore ? undefined : 5).map(({ student, slotsCount, slotsByTier, assistsCount, assistsByTier }) => (
        <SlotCountInfo
          key={student.studentId}
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
