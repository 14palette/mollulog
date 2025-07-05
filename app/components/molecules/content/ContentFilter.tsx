import { FunnelIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import FilterButtons from "./FilterButtons";
import type { EventType, RaidType } from "~/models/content.d";
import { Toggle } from "~/components/atoms/form";

export type ContentFilter = {
  types: (EventType | RaidType)[];
  onlyPickups: boolean;
};

type ContentFilterProps = {
  onFilterChange: (filter: ContentFilter) => void;
};

export default function ContentFilter({ onFilterChange }: ContentFilterProps) {
  const [filter, setFilter] = useState<ContentFilter>({ types: [], onlyPickups: false });

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
    <div className="bg-white dark:bg-neutral-900 rounded-xl xl:shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <FunnelIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" strokeWidth={2} />
        </div>
        <div>
          <p className="font-bold text-lg text-neutral-900 dark:text-white">필터</p>
        </div>
      </div>

      {/* Story Section */}
      <div className="mb-4">
        <p className="mb-2 font-bold text-neutral-900 dark:text-white">이벤트</p>
        <FilterButtons
          buttonProps={[
            { text: "메인 이벤트", onToggle: (activated) => { onToggleType(activated, ["event", "immortal_event", "fes", "collab"]) } },
            { text: "미니 이벤트", onToggle: (activated) => { onToggleType(activated, ["mini_event"]) } },
            { text: "스토리", onToggle: (activated) => { onToggleType(activated, ["main_story"]) } },
            { text: "캠페인", onToggle: (activated) => { onToggleType(activated, ["campaign"]) } },
          ]}
        />
      </div>

      {/* Content Section */}
      <div className="mb-8">
        <p className="mb-2 font-bold text-neutral-900 dark:text-white">컨텐츠</p>
        <FilterButtons
          buttonProps={[
            { text: "총력전", onToggle: (activated) => { onToggleType(activated, ["total_assault"]) } },
            { text: "대결전", onToggle: (activated) => { onToggleType(activated, ["elimination"]) } },
            { text: "제약해제결전", onToggle: (activated) => { onToggleType(activated, ["unlimit"]) } },
          ]}
        />
      </div>

      {/* Pickup Filter */}
      <Toggle label="픽업 모집만 보기" initialState={filter.onlyPickups} onChange={onToggleOnlyPickups} />
    </div>
  );
}
