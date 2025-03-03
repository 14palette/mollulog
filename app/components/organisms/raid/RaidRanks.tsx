import { StudentCards } from "~/components/molecules/student";
import { useFetcher, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { Label, Toggle } from "~/components/atoms/form";
import { Callout, EmptyView } from "~/components/atoms/typography";
import { StudentSearch } from "~/components/molecules/student";
import { RaidRanksData } from "~/routes/raids.$id.ranks";
import { TimelinePlaceholder } from "../useractivity";
import { ActionCard } from "~/components/molecules/editor";
import { XMarkIcon } from "@heroicons/react/16/solid";

export type RaidRankFilters = {
  byStates: boolean;
  byTier: boolean;
  byFutures: boolean;
  futureStudentIds: string[];
};

type RaidRanksProps = {
  raidId: string;
  students: {
    studentId: string;
    name: string;
  }[];
  signedIn: boolean;
  filters: RaidRankFilters;
  onFilterChange: (newFilters: RaidRankFilters) => void;
};

export default function RaidRanks({ raidId, students, signedIn, filters, onFilterChange }: RaidRanksProps) {
  const [_, setSearchParams] = useSearchParams();

  const rankFetcher = useFetcher<RaidRanksData>();
  useEffect(() => {
    const query = new URLSearchParams();
    query.set("filterByStates", filters.byStates.toString());
    query.set("filterByTier", filters.byTier.toString());
    if (filters.byFutures && filters.futureStudentIds.length > 0) {
      query.set("futureStudentIds", filters.futureStudentIds.join(","));
    }
    rankFetcher.load(`/raids/${raidId}/ranks?${query.toString()}`);
  }, [raidId, filters]);

  const updateFilters = (updates: Partial<RaidRankFilters>) => {
    onFilterChange({ ...filters, ...updates });
  };

  if (rankFetcher.data && !rankFetcher.data.rankVisible) {
    return <EmptyView text="순위 정보를 준비중이에요" />;
  }

  return (
    <>
      <div className="mb-8">
        <Label text="필터" />
        <Toggle
          label="모집한 학생만 포함"
          disabled={!signedIn}
          onChange={(value) => updateFilters({ byStates: value })}
        />
        {!signedIn && (
          <Callout className="my-4" emoji="✨">
            <span>
              <span className="underline cursor-pointer" onClick={() => setSearchParams({ signin: "true" }, { preventScrollReset: true })}>로그인</span>
              &nbsp;후 모집한 학생 정보를 등록하면 나에게 맞는 정보를 확인할 수 있어요.
            </span>
          </Callout>
        )}

        {filters.byStates && (
          <>
            <Toggle
              label="모집한 학생의 ★ 등급을 반영"
              initialState={filters.byTier}
              onChange={(value) => updateFilters({ byTier: value })}
            />
            <Toggle
              label="조력자 / 앞으로 모집할 학생을 추가"
              onChange={(value) => updateFilters({ byFutures: value })}
            />
          </>
        )}
        {filters.byStates && filters.byFutures && (
          <>
            <StudentSearch
              students={students}
              onSelect={(studentId) => {
                if (!filters.futureStudentIds.includes(studentId)) {
                  updateFilters({
                    futureStudentIds: [...filters.futureStudentIds, studentId]
                  });
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              {filters.futureStudentIds.map((studentId) => (
                <div key={`future-student-${studentId}`} className="bg-neutral-100 dark:bg-neutral-900 rounded-md pl-2 pr-1 py-1 flex items-center shrink-0">
                  <span>{students.find((student) => student.studentId === studentId)!.name}</span>
                  <XMarkIcon
                    className="inline-block mx-0.5 size-4 cursor-pointer"
                    onClick={() => updateFilters({
                      futureStudentIds: filters.futureStudentIds.filter((id) => id !== studentId)
                    })}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div>
        {(!rankFetcher.data || rankFetcher.state !== "idle") ? <TimelinePlaceholder /> : (
          <>
            <Label text="순위 정보" />
            {rankFetcher.data?.ranks.length === 0 && <EmptyView text="조건에 맞는 순위 정보가 없어요." />}
            {rankFetcher.data?.ranks.map(({ rank, score, parties }) => (
              <ActionCard key={`rank-${rank}`} actions={[]}>
                <div>
                  <p className="text-lg mb-4">
                    <span className="font-bold">{rank}위</span> ({score.toLocaleString()}점)
                  </p>
                  {parties.map((party) => (
                    <StudentCards
                      pcGrid={10}
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
          </>
        )}
      </div>
    </>
  );
}
