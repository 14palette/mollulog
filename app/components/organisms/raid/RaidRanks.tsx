import { StudentCards } from "~/components/molecules/student";
import { useFetcher } from "react-router";
import { useEffect } from "react";
import { EmptyView } from "~/components/atoms/typography";
import { TimelinePlaceholder } from "~/components/organisms/useractivity";
import { ActionCard } from "~/components/molecules/editor";
import { RaidRanksData } from "~/routes/raids.data.$id.ranks";
import { Button } from "~/components/atoms/form";
import { type DefenseType } from "~/models/content.d";

export type RaidRankFilters = {
  defenseType: DefenseType | null;
  filterNotOwned: boolean;
  includeStudents: { studentId: string; tier: number }[];
  excludeStudents: { studentId: string; tier: number }[];
  rankAfter: number | null;
  rankBefore: number | null;
};

type RaidRanksProps = {
  raidId: string;
  filters: RaidRankFilters;
  setFilters: (filters: (prev: RaidRankFilters) => RaidRankFilters) => void;
};

export default function RaidRanks({ raidId, filters, setFilters }: RaidRanksProps) {
  const rankFetcher = useFetcher<RaidRanksData>();
  useEffect(() => {
    const query = new URLSearchParams();
    query.set("filterNotOwned", filters.filterNotOwned.toString());
    if (filters.includeStudents.length > 0) {
      query.set("includeStudentIds", filters.includeStudents.map(({ studentId }) => studentId).join(","));
    }
    if (filters.excludeStudents.length > 0) {
      query.set("excludeStudentIds", filters.excludeStudents.map(({ studentId }) => studentId).join(","));
    }
    if (filters.rankAfter) {
      query.set("rankAfter", filters.rankAfter.toString());
    }
    if (filters.rankBefore) {
      query.set("rankBefore", filters.rankBefore.toString());
    }
    if (filters.defenseType) {
      query.set("defenseType", filters.defenseType);
    }
    rankFetcher.load(`/raids/data/${raidId}/ranks?${query.toString()}`);
  }, [raidId, filters]);

  if (rankFetcher.data && !rankFetcher.data.rankVisible) {
    return null;
  }

  const showPrev = filters.rankAfter !== null || (filters.rankBefore !== null && (rankFetcher.data?.ranks[0]?.rank ?? 0) > 1 && rankFetcher.data?.hasMore);
  const showNext = filters.rankBefore !== null || rankFetcher.data?.hasMore;

  return (
    <>
      <div>
        {(!rankFetcher.data || rankFetcher.state !== "idle") ? <TimelinePlaceholder /> : (
          <>
            {rankFetcher.data?.ranks.length === 0 && <EmptyView text="조건에 맞는 순위 정보가 없어요." />}
            {rankFetcher.data?.ranks.map(({ rank, score, parties }) => (
              <ActionCard key={`rank-${rank}`} actions={[]}>
                <div>
                  <p className="text-lg mb-4">
                    <span className="font-bold">{rank}위</span> ({score.toLocaleString()}점)
                  </p>
                  {parties.map((party) => (
                    <StudentCards
                      key={`party-${party.partyIndex}`}
                      students={party.slots.map((slot) => ({
                        studentId: slot.student?.studentId ?? null,
                        name: slot.student?.name,
                        tier: slot.tier,
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
