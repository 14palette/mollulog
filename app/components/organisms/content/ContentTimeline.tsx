import dayjs from "dayjs";
import { useState } from "react";
import type { ContentTimelineItemProps } from "~/components/molecules/content";
import { ContentTimelineItem } from "~/components/molecules/content";
import { FilterButtons } from "~/components/molecules/student";
import type { EventType, RaidType } from "~/models/content.d";

export type ContentTimelineProps = {
  contents: {
    name: string;
    since: Date;
    until: Date;
    rerun: boolean;
    contentId: string;
    link: string | null;
    contentType: EventType | RaidType;
    pickups?: ContentTimelineItemProps["pickups"];
    raidInfo?: ContentTimelineItemProps["raidInfo"];
  }[];

  favoritedStudents?: { contentId: string, studentId: string }[];
  favoritedCounts: { contentId: string, studentId: string, count: number }[];
  memos: { contentId: string, body: string }[];

  onMemoUpdate?: (eventId: string, memo: string) => void;
  onFavorite?: (eventId: string, studentId: string, favorited: boolean) => void;
};

type ContentGroup = {
  groupDate: Date;
  contents: ContentTimelineProps["contents"];
};

export const contentOrders: (EventType | RaidType)[] = [
  "fes",
  "main_story",
  "event",
  "immortal_event",
  "pickup",
  "campaign",
  "exercise",
  "mini_event",
  "guide_mission",
  "collab",
  "total_assault",
  "elimination",
  "unlimit",
];

type ContentFilter = Partial<Record<EventType | RaidType, boolean>> | null;

function groupContents(contents: ContentTimelineProps["contents"]): ContentGroup[] {
  const groups: { groupDate: dayjs.Dayjs, contents: ContentTimelineProps["contents"] }[] = [];

  const now = dayjs();
  contents.sort((a, b) => a.since.getTime() - b.since.getTime()).forEach((content) => {
    const since = dayjs(content.since);
    const groupDate = (since.isBefore(now) ? now : since).startOf("day");
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.groupDate.isSame(groupDate)) {
      lastGroup.contents.push(content);
    } else {
      groups.push({ groupDate, contents: [content] });
    }
  });

  return groups.map(({ groupDate, contents }) => ({
    groupDate: groupDate.toDate(),
    contents: contents.sort((a, b) => contentOrders.indexOf(a.contentType) - contentOrders.indexOf(b.contentType)),
  }));
}

export default function ContentTimeline({ contents, favoritedStudents, favoritedCounts, memos, onMemoUpdate, onFavorite }: ContentTimelineProps) {
  const [contentGroups, setContentGroups] = useState<ContentGroup[]>(groupContents(contents));

  const [_, setFilter] = useState<ContentFilter>(null);
  const onToggleFilter = (activated: boolean, types: (EventType | RaidType)[]) => {
    setFilter((prev) => {
      const newFilter = { ...prev };
      types.forEach((type) => { newFilter[type] = activated; });
      if (Object.values(newFilter).every((value) => !value)) {
        setContentGroups(groupContents(contents));
        return null;
      }

      setContentGroups(groupContents(contents.filter((content) => newFilter[content.contentType])));
      return newFilter;
    });
  };

  const favoriteStudentIdsByContents: Record<string, Record<string, number>> = {};
  favoritedCounts.forEach(({ contentId, studentId, count }) => {
    if (!favoriteStudentIdsByContents[contentId]) {
      favoriteStudentIdsByContents[contentId] = {};
    }
    favoriteStudentIdsByContents[contentId][studentId] = count;
  });

  const today = dayjs();
  return (
    <>
      <div className="my-6">
        <FilterButtons buttonProps={[
          { text: "스토리", onToggle: (activated) => { onToggleFilter(activated, ["main_story"]) } },
          { text: "이벤트", onToggle: (activated) => { onToggleFilter(activated, ["event", "immortal_event", "fes", "collab", "mini_event"]) } },
          { text: "캠페인", onToggle: (activated) => { onToggleFilter(activated, ["campaign"]) } },
          { text: "총력전/대결전", onToggle: (activated) => { onToggleFilter(activated, ["total_assault", "elimination", "unlimit"]) } },
        ]} />
      </div>

      {contentGroups.map((group) => {
        const groupDate = dayjs(group.groupDate);
        const isToday = groupDate.isSame(today, "day");
        return (
          <div key={groupDate.format("YYYY-MM-DD")}>
            {/* 날짜 구분자 영역 */}
            {isToday ? (
              <div className="flex items-center">
                <div className="inline-block size-3 bg-red-600 rounded-full animate-pulse" />
                <span className="mx-2 md:mx-4 font-bold text-red-600">
                  진행중인 컨텐츠
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="inline-block size-3 bg-neutral-500 dark:bg-neutral-400 rounded-full" />
                <span className="mx-2 md:mx-4 font-bold text-neutral-500 dark:text-neutral-400 text-sm ">
                  {groupDate.format("YYYY-MM-DD")}
                </span>
              </div>
            )}

            {/* 컨텐츠 목록 영역 */}
            <div className="flex">
              <div className="w-3 h-parent flex justify-center shrink-0">
                <div className="w-px h-full bg-neutral-200 dark:bg-neutral-700" />
              </div>
              <div className="pl-3 md:pl-5 pb-4 md:pb-8">
                {group.contents.map((content) => {
                  const memo = memos.find(({ contentId }) => contentId === content.contentId)?.body;
                  const showMemo = !!onMemoUpdate && !!content.pickups && content.pickups.length > 0;
                  return (
                    <ContentTimelineItem
                      key={content.contentId}
                      {...content}
                      until={isToday ? content.until : null}

                      showMemo={showMemo}
                      initialMemo={showMemo ? memo : undefined}
                      onUpdateMemo={showMemo ? (newMemo) => onMemoUpdate(content.contentId, newMemo) : undefined}

                      favoritedStudents={favoritedStudents?.filter(({ contentId }) => contentId === content.contentId).map(({ studentId }) => studentId)}
                      favoritedCounts={favoriteStudentIdsByContents[content.contentId]}
                      onFavorite={(studentId, favorited) => onFavorite?.(content.contentId, studentId, favorited)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex items-center">
        <div className="inline-block size-3 bg-neutral-500 dark:bg-neutral-400 rounded-full" />
        <span className="mx-2 md:mx-4 font-bold text-neutral-500 dark:text-neutral-400 text-sm ">
          {`남은 미래시까지 D-${dayjs(contents[contents.length - 1].until).diff(today, "day")}`}
        </span>
      </div>
    </>
  );
}
