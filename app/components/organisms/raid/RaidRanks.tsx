import { useFetcher } from "react-router";
import { useEffect, useMemo } from "react";
import { IdentificationIcon, MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { EmptyView } from "~/components/atoms/typography";
import { ActionCard } from "~/components/molecules/editor";
import { StudentCards } from "~/components/molecules/student";
import { Button } from "~/components/atoms/form";
import { LoadingSkeleton } from "~/components/atoms/layout";
import type { DefenseType } from "~/models/content.d";
import type { RaidRanksData } from "~/routes/raids.data.$id.ranks";

export type RaidRankFilters = {
  defenseType: DefenseType | null;
  filterNotOwned: boolean;
  includeStudents: { uid: string; tiers: number[] }[];
  excludeStudents: { uid: string; tiers: number[] }[];
  rankAfter: number | null;
  rankBefore: number | null;
};

type MergeFilters = {
  includeStudents?: { uid: string; tiers: number[] }[];
  excludeStudents?: { uid: string; tiers: number[] }[];
};

function mergeFilters(prev: RaidRankFilters, newFilters: MergeFilters): RaidRankFilters {
  const mergedFilters = { ...prev };
  if (newFilters.includeStudents) {
    for (const includeStudent of newFilters.includeStudents) {
      const found = mergedFilters.includeStudents.find((student) => student.uid === includeStudent.uid);
      if (found) {
        found.tiers = Array.from(new Set([...found.tiers, ...includeStudent.tiers]));
      } else {
        mergedFilters.includeStudents.push(includeStudent);
      }
    }
  }
  if (newFilters.excludeStudents) {
    for (const excludeStudent of newFilters.excludeStudents) {
      const found = mergedFilters.excludeStudents.find((student) => student.uid === excludeStudent.uid);
      if (found) {
        found.tiers = Array.from(new Set([...found.tiers, ...excludeStudent.tiers]));
      } else {
        mergedFilters.excludeStudents.push(excludeStudent);
      }
    }
  }
  return mergedFilters;
}

type RaidRanksProps = {
  raidUid: string;
  raidSince: Date;
  filters: RaidRankFilters;
  setFilters: (filters: (prev: RaidRankFilters) => RaidRankFilters) => void;
};

const maximumLevels: Record<string, number> = {
  "2021-11-09": 70,
  "2022-03-22": 73,
  "2022-05-17": 75,
  "2022-09-06": 78,
  "2022-12-20": 80,
  "2023-03-28": 83,
  "2023-07-25": 85,
  "2024-01-30": 88,
  "2024-07-23": 90,
};

function getMaxLevelAt(date: Date): number {
  const dates = Object.keys(maximumLevels).sort();
  for (let i = dates.length - 1; i >= 0; i--) {
    if (date >= new Date(dates[i])) {
      return maximumLevels[dates[i]];
    }
  }
  return 70;
}

export default function RaidRanks({ raidUid, raidSince, filters, setFilters }: RaidRanksProps) {
  const rankFetcher = useFetcher<RaidRanksData>();

  // Memoize the filters object to prevent infinite re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters.defenseType,
    filters.filterNotOwned,
    JSON.stringify(filters.includeStudents),
    JSON.stringify(filters.excludeStudents),
    filters.rankAfter,
    filters.rankBefore,
  ]);

  useEffect(() => {
    rankFetcher.submit(JSON.stringify(memoizedFilters), {
      method: "POST",
      action: `/raids/data/${raidUid}/ranks`,
      encType: "application/json",
    });
  }, [raidUid, memoizedFilters]);

  if (rankFetcher.data && !rankFetcher.data.rankVisible) {
    return null;
  }

  const showPrev = filters.rankAfter !== null || (filters.rankBefore !== null && (rankFetcher.data?.ranks[0]?.rank ?? 0) > 1 && rankFetcher.data?.hasMore);
  const showNext = filters.rankBefore !== null || rankFetcher.data?.hasMore;

  const maxLevel = getMaxLevelAt(raidSince);

  return (
    <>
      <div>
        {(!rankFetcher.data || rankFetcher.state !== "idle") ? <LoadingSkeleton /> : (
          <>
            {rankFetcher.data?.ranks.length === 0 && <EmptyView text="조건에 맞는 순위 정보가 없어요." />}
            {rankFetcher.data?.ranks.map(({ rank, score, parties, video }) => (
              <ActionCard
                key={`rank-${rank}`}
                actions={video ? [{
                  text: "공략 영상",
                  color: "red",
                  link: `https://www.youtube.com/watch?v=${video.youtubeId}`,
                }] : []}
              >
                <div>
                  <p className="text-lg mb-4">
                    <span className="font-bold">{rank}위</span> ({score.toLocaleString()}점)
                  </p>
                  {parties.map((party) => (
                    <StudentCards
                      key={`party-${party.partyIndex}`}
                      students={party.slots.map(({ student, tier, level, isAssist }) => ({
                        uid: student?.uid ?? null,
                        name: student?.name,
                        attackType: student?.attackType,
                        defenseType: student?.defenseType,
                        role: student?.role,
                        tier,
                        level: level && level < maxLevel ? level : undefined,
                        isAssist,
                        popups: student ? [
                          {
                            Icon: IdentificationIcon,
                            text: "학생부 보기 (평가/통계)",
                            link: `/students/${student.uid}`,
                          },
                          {
                            Icon: PlusCircleIcon,
                            text: "이 학생을 포함한 편성만 보기",
                            onClick: () => setFilters((prev) => mergeFilters(prev, { includeStudents: [{ uid: student.uid, tiers: tier ? [tier] : [] }] })),
                          },
                          {
                            Icon: MinusCircleIcon,
                            text: "이 학생을 제외한 편성만 보기",
                            onClick: () => setFilters((prev) => mergeFilters(prev, { excludeStudents: [{ uid: student.uid, tiers: tier ? [tier] : [] }] })),
                          },
                        ] : undefined,
                        popupId: student ? `${rank}-${party.partyIndex}-${student.uid}` : undefined,
                      }))}
                    />
                  ))}
                </div>
              </ActionCard>
            ))}
            {rankFetcher.data?.ranks && rankFetcher.data.ranks.length > 0 && (
              <div className="flex justify-center">
                {showPrev && (
                  <Button
                    className="cursor-pointer"
                    onClick={() => setFilters((prev) => ({ ...prev, rankAfter: null, rankBefore: rankFetcher.data!.ranks[0].rank ?? null }))}
                  >
                    &lt; 이전
                  </Button>
                )}
                {showNext && (
                  <Button
                    className="cursor-pointer"
                    onClick={() => setFilters((prev) => ({ ...prev, rankBefore: null, rankAfter: rankFetcher.data!.ranks[rankFetcher.data!.ranks.length - 1].rank ?? null }))}
                  >
                    다음 &gt;
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
