import { useCallback } from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { FilterButtons, ScreenPanel } from "~/components/navigation";
import type { TimelineSourceType } from "./PyroxeneSchedule";

export type PyroxenePlannerCalcOptions = {
  event: {
    pickupChance: "ceil" | "average";
  };
  raid: {
    tier: "platinum" | "gold" | "silver" | "bronze";
  };
  tactical: {
    level: "in10" | "in100" | "in200" | "over200";
  };
  timeline: {
    display: TimelineSourceType[];
  };
};

type PyroxenePlannerCalcPanelProps = {
  options: PyroxenePlannerCalcOptions;
  onOptionsChange: (options: PyroxenePlannerCalcOptions) => void;
};

export default function PyroxenePlannerCalcPanel({ options, onOptionsChange }: PyroxenePlannerCalcPanelProps) {
  const onToggleRaidTier = useCallback((tier: "platinum" | "gold" | "silver" | "bronze") => {
    onOptionsChange({ ...options, raid: { ...options.raid, tier } });
  }, [options, onOptionsChange]);

  const onToggleTimelineDisplay = useCallback((type: TimelineSourceType) => {
    onOptionsChange({
      ...options,
      timeline: {
        ...options.timeline,
        display: options.timeline.display.includes(type) ? options.timeline.display.filter((t) => t !== type) : [...options.timeline.display, type],
      },
    });
  }, [options, onOptionsChange]);

  const onToggleTacticalLevel = useCallback((level: "in10" | "in100" | "in200" | "over200") => {
    onOptionsChange({ ...options, tactical: { ...options.tactical, level } });
  }, [options, onOptionsChange]);

  return (
    <ScreenPanel Icon={ChartBarIcon} title="재화 계산" description="획득/소비 계산 조건을 선택해주세요" foldable>
      <PanelLabel title="★3 학생 모집 횟수" />
      <FilterButtons
        exclusive atLeastOne
        buttonProps={[
          {
            text: "천장 (200회)",
            active: options.event.pickupChance === "ceil",
            onToggle: (activated) => onOptionsChange({ ...options, event: { ...options.event, pickupChance: activated ? "ceil" : "average" } }),
          },
          {
            text: "평균 (140회)",
            active: options.event.pickupChance === "average",
            onToggle: (activated) => onOptionsChange({ ...options, event: { ...options.event, pickupChance: activated ? "average" : "ceil" } }),
          },
        ]}
      />

      <PanelLabel title="총력전 등급" />
      <FilterButtons
        exclusive atLeastOne
        buttonProps={[
          {
            text: "플래티넘",
            active: options.raid.tier === "platinum",
            onToggle: () => onToggleRaidTier("platinum"),
          },
          {
            text: "골드",
            active: options.raid.tier === "gold",
            onToggle: () => onToggleRaidTier("gold"),
          },
          {
            text: "실버",
            active: options.raid.tier === "silver",
            onToggle: () => onToggleRaidTier("silver"),
          },
          {
            text: "브론즈",
            active: options.raid.tier === "bronze",
            onToggle: () => onToggleRaidTier("bronze"),
          },
        ]}
      />

      <PanelLabel title="전술대회 순위" />
      <FilterButtons
        exclusive atLeastOne
        buttonProps={[
          {
            text: "10위권",
            active: options.tactical.level === "in10",
            onToggle: () => onToggleTacticalLevel("in10"),
          },
          {
            text: "100위권",
            active: options.tactical.level === "in100",
            onToggle: () => onToggleTacticalLevel("in100"),
          },
          {
            text: "200위권",
            active: options.tactical.level === "in200",
            onToggle: () => onToggleTacticalLevel("in200"),
          },
          {
            text: "200위 이하",
            active: options.tactical.level === "over200",
            onToggle: () => onToggleTacticalLevel("over200"),
          },
        ]}
      />

      <PanelLabel title="재화 수급처 표시" description="표시하지 않은 수급처도 계산에 반영돼요" />
      <FilterButtons
        buttonProps={[
          {
            text: "총력전/대결전",
            active: options.timeline.display.includes("raid"),
            onToggle: () => onToggleTimelineDisplay("raid"),
          },
          {
            text: "청휘석 구매",
            active: options.timeline.display.includes("buy"),
            onToggle: () => onToggleTimelineDisplay("buy"),
          },
          {
            text: "패키지 (초회)",
            active: options.timeline.display.includes("package_onetime"),
            onToggle: () => onToggleTimelineDisplay("package_onetime"),
          },
          {
            text: "패키지 (일간)",
            active: options.timeline.display.includes("package_daily"),
            onToggle: () => onToggleTimelineDisplay("package_daily"),
          },
          {
            text: "일일 임무",
            active: options.timeline.display.includes("daily_mission"),
            onToggle: () => onToggleTimelineDisplay("daily_mission"),
          },
          {
            text: "주간 임무",
            active: options.timeline.display.includes("weekly_mission"),
            onToggle: () => onToggleTimelineDisplay("weekly_mission"),
          },
          {
            text: "전술대회",
            active: options.timeline.display.includes("tactical"),
            onToggle: () => onToggleTimelineDisplay("tactical"),
          },
          {
            text: "출석",
            active: options.timeline.display.includes("attendance"),
            onToggle: () => onToggleTimelineDisplay("attendance"),
          },
        ]}
      />
    </ScreenPanel>
  )
}

function PanelLabel({ title, description }: { title: string, description?: string }) {
  return (
    <>
      <p className="mt-4 font-bold">{title}</p>
      {description && <p className="mb-2 text-sm text-neutral-500">{description}</p>}
    </>
  );
}
