import { FunnelIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import type { EventType, RaidType } from "~/models/content.d";
import { Toggle } from "~/components/atoms/form";
import { BottomSheet } from "~/components/atoms/layout";
import { FilterButtons } from "~/components/navigation";

export type ContentFilterState = {
  types: (EventType | RaidType)[];
  onlyPickups: boolean;
};

type ContentFilterProps = {
  initialFilter: ContentFilterState;
  onFilterChange: (filter: ContentFilterState) => void;
};

export default function ContentFilter({ initialFilter, onFilterChange }: ContentFilterProps) {
  const [filter, setFilter] = useState<ContentFilterState>(initialFilter);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const onToggleType = (activated: boolean, types: (EventType | RaidType)[]) => {
    const newFilters = { ...filter };
    const newTypes = activated ? [...filter.types, ...types] : filter.types.filter((type) => !types.includes(type));
    newFilters.types = newTypes;
    setFilter(newFilters);
    onFilterChange(newFilters);
  };

  const onToggleOnlyPickups = (activated: boolean) => {
    const newFilters = { ...filter, onlyPickups: activated };
    setFilter(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <>
      {/* PC 화면 */}
      <div className="my-8 hidden xl:block">
        <div className="rounded-xl p-5 pb-2 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-lg">
              <FunnelIcon className="size-5 text-neutral-600 dark:text-neutral-400" strokeWidth={2} />
            </div>
            <p className="font-bold text-lg">필터</p>
          </div>
          <ContentFilterContent
            filter={filter}
            onToggleType={onToggleType}
            onToggleOnlyPickups={onToggleOnlyPickups}
          />
        </div>
      </div>

      {/* 모바일 화면 필터 표시 버튼 */}
      <div className="xl:hidden fixed bottom-6 right-4 z-40 flex gap-1">
        <button
          onClick={() => setIsMobileSheetOpen(true)}
          className="flex items-center gap-2 p-3 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-full shadow-lg transition-colors"
        >
          <FunnelIcon className="size-5" strokeWidth={2} />
          <span>필터</span>
        </button>
      </div>

      {/* 모바일 화면 바텀 시트 */}
      {isMobileSheetOpen && (
        <BottomSheet Icon={FunnelIcon} title="필터" onClose={() => setIsMobileSheetOpen(false)}>
          <ContentFilterContent
            filter={filter}
            onToggleType={onToggleType}
            onToggleOnlyPickups={onToggleOnlyPickups}
          />
        </BottomSheet>
      )}
    </>
  );
}


type ContentFilterContentProps = {
  filter: ContentFilterState;
  onToggleType: (activated: boolean, types: (EventType | RaidType)[]) => void;
  onToggleOnlyPickups: (activated: boolean) => void;
};

function ContentFilterContent({ filter, onToggleType, onToggleOnlyPickups }: ContentFilterContentProps) {
  const eventFilterProps = [
    { text: "메인 이벤트", active: filter.types.some(type => ["event", "immortal_event", "fes", "collab"].includes(type)), onToggle: (activated: boolean) => onToggleType(activated, ["event", "immortal_event", "fes", "collab"]) },
    { text: "미니 이벤트", active: filter.types.includes("mini_event"), onToggle: (activated: boolean) => onToggleType(activated, ["mini_event"]) },
    { text: "스토리", active: filter.types.includes("main_story"), onToggle: (activated: boolean) => onToggleType(activated, ["main_story"]) },
    { text: "캠페인", active: filter.types.includes("campaign"), onToggle: (activated: boolean) => onToggleType(activated, ["campaign"]) },
    { text: "종합전술시험", active: filter.types.includes("exercise"), onToggle: (activated: boolean) => onToggleType(activated, ["exercise"]) },
    { text: "픽업 모집", active: filter.types.includes("pickup"), onToggle: (activated: boolean) => onToggleType(activated, ["pickup", "archive_pickup"]) },
  ];

  const contentFilterProps = [
    { text: "총력전", active: filter.types.includes("total_assault"), onToggle: (activated: boolean) => onToggleType(activated, ["total_assault"]) },
    { text: "대결전", active: filter.types.includes("elimination"), onToggle: (activated: boolean) => onToggleType(activated, ["elimination"]) },
    { text: "제약해제결전", active: filter.types.includes("unlimit"), onToggle: (activated: boolean) => onToggleType(activated, ["unlimit"]) },
  ];

  return (
    <>
      <div className="mb-4">
        <p className="mb-2 font-bold">이벤트</p>
        <FilterButtons buttonProps={eventFilterProps} />
      </div>
      <div className="mb-2 xl:mb-8">
        <p className="mb-2 font-bold">레이드</p>
        <FilterButtons buttonProps={contentFilterProps} />
      </div>
      <Toggle label="픽업 진행 컨텐츠만 보기" initialState={filter.onlyPickups} onChange={onToggleOnlyPickups} />
    </>
  );
}
