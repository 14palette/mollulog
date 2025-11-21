import dayjs from "dayjs";
import "dayjs/locale/ko";
import { KeyValueTable, SubTitle } from "~/components/atoms/typography";
import { ActionCard } from "~/components/molecules/editor";
import { StudentCards } from "~/components/molecules/student";
import { PickupType, RaidType } from "~/models/content.d";
import { PyroxenePlannerOptions } from "./PyroxenePlannerCalcPanel";
import { useMemo, useState } from "react";
import { ResourceCard } from "../atoms/item";
import { ResourceTypeEnum } from "~/graphql/graphql";
import ResourcesInput from "./planner-input/ResourcesInput";
import { Transition } from "@headlessui/react";
import type { ActionCardAction } from "../molecules/editor/ActionCard";

dayjs.locale("ko");

export type PickupResources = {
  pyroxene: number;
  oneTimeTicket: number;
  tenTimeTicket: number;
};

export type PyroxeneScheduleItem = ({
  event?: {
    uid: string;
    name: string;
    since: Date;
    until: Date;
    pickups: {
      type: PickupType;
      rerun: boolean;
      student: { uid: string, initialTier: number } | null;
      favorited: boolean;
    }[];
  };
  raid?: {
    uid: string;
    type: RaidType;
    name: string;
    since: Date;
    until: Date;
  };
  buy?: {
    uid: string;
    date: Date;
    quantity: number;
  };

  packageOnetime?: {
    uid: string;
    date: Date;
    description: string;
    quantity: number;
  };
  packageDaily?: {
    uid: string;
    date: Date;
    description: string;
    quantity: number;
    repeatIntervalDays: number;
    repeatCount: number;
  };
  attendance?: {
    uid: string;
    date: Date;
    description: string;
    quantity: number;
    repeatIntervalDays: number;
  };
});

type PyroxeneScheduleProps = {
  initialDate: Date | null;
  initialResources: PickupResources;
  initialResourcesUid: string | null;
  latestEventUid: string | null;
  scheduleItems: PyroxeneScheduleItem[];
  options: PyroxenePlannerOptions;

  onPickupComplete: (eventUid: string, resources: PickupResources) => void;
  onDeletePickupComplete: (eventUid: string) => void;
  onDeleteItem: (itemUid: string) => void;
  onDeleteOwnedResource: (ownedResourceUid: string) => void;
};

export default function PyroxeneSchedule({ initialDate, initialResources, initialResourcesUid, latestEventUid, scheduleItems, options, onPickupComplete, onDeletePickupComplete, onDeleteItem, onDeleteOwnedResource }: PyroxeneScheduleProps) {
  const timeline = useMemo(() => {
    return buildTimeline(initialResources, initialDate ?? new Date(), latestEventUid, scheduleItems, options);
  }, [initialDate, initialResources, latestEventUid, scheduleItems, options]);

  return (
    <>
      <SubTitle text="청휘석 계획" description="각 픽업 일정에 예상되는 청휘석 보유량을 확인해보세요" />

      {initialDate && (
        <TimelineResources
          date={dayjs(initialDate)}
          description="보유 재화"
          resources={initialResources}
          itemUid={initialResourcesUid ?? undefined}
          onDeleteItem={onDeleteOwnedResource}
        />
      )}

      {timeline.map(({ date, accumulatedResources, resourceDelta, source }) => {
        if (source.type !== "event" && !options.timeline.display.includes(source.type)) {
          return null;
        }

        if (source.event) {
          const { event } = source;
          return (
            <TimelineEvent
              key={`event-${event.uid}`}
              event={event}
              completed={latestEventUid === event.uid}
              accumulatedResources={accumulatedResources}
              resourceDelta={resourceDelta}
              onDeletePickupComplete={onDeletePickupComplete}
              onPickupComplete={onPickupComplete}
            />
          );
        } else if (source.description) {
          return (
            <TimelineResources
              key={`${source.description}-${date.toISOString()}`}
              date={date}
              description={source.description}
              resources={resourceDelta}
              itemUid={source.uid}
              onDeleteItem={onDeleteItem}
            />
          );
        }
        return null;
      })}
    </>
  );
}

type TimelineEventProps = {
  event: PyroxeneScheduleItem["event"] | undefined;
  accumulatedResources: PickupResources;
  resourceDelta: PickupResources;
  completed: boolean;

  onDeletePickupComplete: (eventUid: string) => void;
  onPickupComplete: (eventUid: string, resources: PickupResources) => void;
};

function TimelineEvent({ event, accumulatedResources, resourceDelta, completed, onDeletePickupComplete, onPickupComplete }: TimelineEventProps) {
  const [showCompleteAction, setShowCompleteAction] = useState(false);
  if (!event) {
    return null;
  }

  const actions: ActionCardAction[] = [];
  if (completed) {
    actions.push({
      text: "모집 기록 삭제",
      color: "red",
      onClick: () => onDeletePickupComplete(event.uid),
      danger: true,
    });
  } else if (dayjs(event.since).isBefore(dayjs())) {
    actions.push({
      text: showCompleteAction ? "취소" : "모집 완료",
      onClick: () => setShowCompleteAction((prev) => !prev),
    });
  }

  return (
    <div className="relative">
      <ActionCard actions={actions}>
        <p className="font-semibold">{event.name}</p>
        <p className="mb-2 text-xs text-neutral-500">
          {dayjs(event.since).format("YYYY-MM-DD")} ~ {dayjs(event.until).format("YYYY-MM-DD")}
        </p>
        <StudentCards
          students={event.pickups.filter(({ favorited }) => favorited).map(({ student }) => ({ uid: student!.uid, tier: student!.initialTier }))}
          pcGrid={12}
        />
        <div className="mt-2">
          {completed ? (
            <>
              <p className="text-center text-neutral-500 text-sm">모집 완료</p>
            </>
          ) : (
            <KeyValueTable
              items={[
                { key: "남은 청휘석", value: remainingResourceValue(accumulatedResources.pyroxene, resourceDelta.pyroxene) },
                { key: "남은 1회 모집 티켓", value: remainingResourceValue(accumulatedResources.oneTimeTicket, resourceDelta.oneTimeTicket) },
                { key: "남은 10회 모집 티켓", value: remainingResourceValue(accumulatedResources.tenTimeTicket, resourceDelta.tenTimeTicket) },
              ]}
              keyPrefix={`pyroxene-planner-${event.uid}`}
            />
          )}
        </div>
      </ActionCard>

      <Transition
        show={showCompleteAction}
        as="div"
        enter="transition duration-200 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
        className="absolute top-full left-0 w-full mt-2 z-10"
      >
        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-4">
          <ResourcesInput
            description="모집 완료 시점의 재화 수량을 입력해주세요."
            onSaveResources={(resources) => {
              onPickupComplete(event.uid, resources);
              setShowCompleteAction(false);
            }}
          />
        </div>
      </Transition>
    </div>
  );
}

function TimelineResources({ date, description, resources, itemUid, onDeleteItem }: { date: dayjs.Dayjs, description: string, resources: PickupResources, itemUid?: string, onDeleteItem?: (itemUid: string) => void }) {
  return (
    <div className="my-4 px-3 md:px-4 py-2 flex items-center justify-between border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <div className="flex items-center flex-1">
        <div className="pr-3 mr-3 border-r border-neutral-200 dark:border-neutral-700">
          <p className="font-semibold text-sm">
            {date.format("YYYY-MM-DD")}({date.format("ddd")})
          </p>
          <p className="text-neutral-500 text-xs">{description}</p>
        </div>
        <div className="flex items-center gap-1">
          {resources.pyroxene > 0 && <ResourceCard resourceType={ResourceTypeEnum.Currency} itemUid="2" label={resources.pyroxene.toLocaleString()} />}
          {resources.oneTimeTicket > 0 && <ResourceCard resourceType={ResourceTypeEnum.Item} itemUid="6998" label={resources.oneTimeTicket.toLocaleString()} />}
          {resources.tenTimeTicket > 0 && <ResourceCard resourceType={ResourceTypeEnum.Item} itemUid="6999" label={resources.tenTimeTicket.toLocaleString()} />}
        </div>
      </div>
      {itemUid && onDeleteItem && (
        <button
          onClick={() => onDeleteItem(itemUid)}
          className="ml-2 px-2 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
        >
          삭제
        </button>
      )}
    </div>
  )
}

function remainingResourceValue(count: number, diff: number): React.ReactNode {
  return (
    <p>
      <span className={count > 0 ? "text-green-500" : count === 0 ? undefined : "text-red-500"}>
        {count.toLocaleString()}
      </span>
      {diff !== 0 && (
        <span className="text-neutral-500">
          &nbsp;({diff.toLocaleString()})
        </span>
      )}
    </p>
  )
}

export type TimelineSourceType = "event" | "raid" | "daily_mission" | "weekly_mission" | "buy" | "package_onetime" | "package_daily" | "attendance" | "tactical";

type TimelineSource = {
  type: TimelineSourceType;
  event?: PyroxeneScheduleItem["event"];
  description?: string;
  uid?: string;
};

type TimelineDelta = {
  date: dayjs.Dayjs;
  source: TimelineSource;

  pickupTrial?: number;
  resourceDelta?: PickupResources;
};

type Timeline = {
  date: dayjs.Dayjs;
  source: TimelineSource;
  accumulatedResources: PickupResources;
  resourceDelta: PickupResources;
}[];

function buildTimeline(
  initialResources: PickupResources,
  initialDate: Date,
  latestEventUid: string | null,
  scheduleItems: PyroxeneScheduleItem[],
  options: PyroxenePlannerOptions,
): Timeline {
  const maxDate = scheduleItems.filter((item) => item.event).reduce((max, item) => max.isAfter(dayjs(item.event!.until)) ? max : dayjs(item.event!.until), dayjs(initialDate));

  const timelineDeltas: TimelineDelta[] = [];
  scheduleItems.forEach((scheduleItem) => {
    if (scheduleItem.event) {
      // 픽업 일정
      const { event } = scheduleItem;
      if (latestEventUid === event.uid) {
        // 이미 픽업을 완료한 일정은 계산하지 않음
        timelineDeltas.push({
          date: dayjs(event.since),
          source: { type: "event", event },
          resourceDelta: { pyroxene: 0, oneTimeTicket: 0, tenTimeTicket: 0 },
        });
        return;
      }

      const pickupCount = event.pickups.filter(({ student, favorited }) => favorited && student?.initialTier === 3).length;
      if (pickupCount === 0) {
        return;
      }

      const pickupTrial = pickupCount * (options.event.pickupChance === "ceil" ? 200 : 140);
      timelineDeltas.push({
        date: dayjs(event.since),
        source: { type: "event", event },
        pickupTrial,
      });
    } else if (scheduleItem.raid) {
      const { raid } = scheduleItem;
      if (raid.type === "total_assault") {
        // 총력전 종료일 기준으로 650 + 등급 보상 청휘석 획득
        let tierReward = 600;
        const tier = options.raid.tier;
        if (tier === "platinum") {
          tierReward = 1200;
        } else if (tier === "gold") {
          tierReward = 1000;
        } else if (tier === "silver") {
          tierReward = 800;
        }

        timelineDeltas.push({
          date: dayjs(raid.until),
          source: { type: "raid", description: `총력전 ${raid.name}` },
          resourceDelta: { pyroxene: 650 + tierReward, oneTimeTicket: 0, tenTimeTicket: 0 },
        });
      } else if (raid.type === "elimination") {
        // 대결전 종료일 익일 기준으로 650 청휘석, 10연차 티켓 1장 획득
        timelineDeltas.push({
          date: dayjs(raid.until).add(1, "day"),
          source: { type: "raid", description: `대결전 ${raid.name}` },
          resourceDelta: { pyroxene: 650, oneTimeTicket: 0, tenTimeTicket: 1 },
        });
      }
    } else if (scheduleItem.buy) {
      const buy = scheduleItem.buy;
      timelineDeltas.push({
        date: dayjs(buy.date),
        source: { type: "buy", uid: buy.uid, description: "청휘석 구매" },
        resourceDelta: { pyroxene: buy.quantity, oneTimeTicket: 0, tenTimeTicket: 0 },
      });
    } else if (scheduleItem.packageOnetime) {
      const pkg = scheduleItem.packageOnetime;
      timelineDeltas.push({
        date: dayjs(pkg.date),
        source: { type: "package_onetime", uid: pkg.uid, description: pkg.description },
        resourceDelta: { pyroxene: pkg.quantity, oneTimeTicket: 0, tenTimeTicket: 0 },
      });
    } else if (scheduleItem.packageDaily) {
      const pkg = scheduleItem.packageDaily;
      for (let i = 0; i < pkg.repeatCount; i++) {
        timelineDeltas.push({
          date: dayjs(pkg.date).add(i * pkg.repeatIntervalDays, "day"),
          source: { type: "package_daily", description: pkg.description },
          resourceDelta: { pyroxene: pkg.quantity, oneTimeTicket: 0, tenTimeTicket: 0 },
        });
      }
    } else if (scheduleItem.attendance) {
      const attendance = scheduleItem.attendance;
      const dateFrom = dayjs(attendance.date);
      for (let date = dateFrom; date.isBefore(maxDate); date = date.add(attendance.repeatIntervalDays, "day")) {
        timelineDeltas.push({
          date,
          source: { type: "attendance", description: attendance.description },
          resourceDelta: { pyroxene: attendance.quantity, oneTimeTicket: 0, tenTimeTicket: 0 },
        });
      }
    }
  });

  // 일별/주간 임무
  const dateFrom = dayjs(initialDate);
  for (let date = dateFrom; date.isBefore(maxDate); date = date.add(1, "day")) {
    timelineDeltas.push({
      date,
      source: { type: "daily_mission", description: "일일 임무" },
      resourceDelta: { pyroxene: 20, oneTimeTicket: 0, tenTimeTicket: 0 },
    });

    // 매주 일요일
    if (date.day() === 0) {
      timelineDeltas.push({
        date,
        source: { type: "weekly_mission", description: "주간 임무" },
        resourceDelta: { pyroxene: 120, oneTimeTicket: 0, tenTimeTicket: 0 },
      });
    }
  }

  // 전술대회
  for (let date = dateFrom; date.isBefore(maxDate); date = date.add(1, "day")) {
    let pyroxene = 20;
    if (options.tactical.level === "in200") {
      pyroxene = 25;
    } else if (options.tactical.level === "in100") {
      pyroxene = 30;
    } else if (options.tactical.level === "in10") {
      pyroxene = 35;
    }
    timelineDeltas.push({
      date,
      source: { type: "tactical", description: "전술대회" },
      resourceDelta: { pyroxene, oneTimeTicket: 0, tenTimeTicket: 0 },
    });
  }

  const timeline: Timeline = [];
  let currentResources: PickupResources = initialResources;
  timelineDeltas.sort((a, b) => a.date.diff(b.date)).forEach((delta) => {
    let resourceDelta = delta.resourceDelta;
    if (!resourceDelta && delta.pickupTrial && delta.pickupTrial > 0) {
      resourceDelta = { pyroxene: 0, oneTimeTicket: 0, tenTimeTicket: 0 };
      let remainingTrial = delta.pickupTrial;
      if (remainingTrial > 10) {
        resourceDelta.tenTimeTicket = -1 * Math.min(Math.floor(remainingTrial / 10), currentResources.tenTimeTicket);
        remainingTrial += resourceDelta.tenTimeTicket * 10;
      }
      if (remainingTrial > 1) {
        resourceDelta.oneTimeTicket = -1 * Math.min(remainingTrial, currentResources.oneTimeTicket);
        remainingTrial += resourceDelta.oneTimeTicket;
      }
      resourceDelta.pyroxene = -1 * remainingTrial * 120;
    }

    if (!resourceDelta) {
      return;
    }

    currentResources = {
      pyroxene: currentResources.pyroxene + resourceDelta.pyroxene,
      oneTimeTicket: currentResources.oneTimeTicket + resourceDelta.oneTimeTicket,
      tenTimeTicket: currentResources.tenTimeTicket + resourceDelta.tenTimeTicket,
    };

    timeline.push({
      date: delta.date,
      source: delta.source,
      resourceDelta,
      accumulatedResources: { ...currentResources },
    });
  });
  return timeline;
}
