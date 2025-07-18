import { MagnifyingGlassIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Callout } from "~/components/atoms/typography";
import { FilterButtons } from "~/components/molecules/content";
import { RaidRankFilter } from "~/components/organisms/raid";
import RaidRanks, { type RaidRankFilters } from "~/components/organisms/raid/RaidRanks";
import { defenseTypeColor, defenseTypeLocale } from "~/locales/ko";
import { useSignIn } from "~/contexts/SignInProvider";
import { RaidDetailQuery } from "~/graphql/graphql";

export type RaidRanksProps = {
  raid: NonNullable<RaidDetailQuery["raid"]>;
  signedIn: boolean;
  allStudents: {
    uid: string;
    name: string;
  }[];
};

export default function RaidRanksPage({ raid, signedIn, allStudents }: RaidRanksProps) {
  const { showSignIn } = useSignIn();

  const [filters, setFilters] = useState<RaidRankFilters>({
    defenseType: raid.type === "elimination" ? raid.defenseTypes[0].defenseType : null,
    filterNotOwned: false,
    includeStudents: [],
    excludeStudents: [],
    rankAfter: null,
    rankBefore: null,
  });

  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  return (
    <div className="flex flex-col-reverse xl:flex-row xl:gap-8">
      <div className="xl:w-3/5 shrink-0">
        {raid.rankVisible && raid.type === "elimination" && (
          <div className="mb-6">
            <FilterButtons
              Icon={ShieldCheckIcon}
              buttonProps={
                raid.defenseTypes.map(({ defenseType }, index) => ({
                  text: defenseTypeLocale[defenseType],
                  color: defenseTypeColor[defenseType],
                  active: index === 0,
                  onToggle: () => setFilters((prev) => ({ ...prev, defenseType, rankAfter: null, rankBefore: null })),
                }))
              }
              exclusive atLeastOne
            />
          </div>
        )}
        {!signedIn && (
          <Callout className="my-4" emoji="✨">
            <p>
              <span className="cursor-pointer underline" onClick={() => showSignIn()}>로그인</span> 후 모집한 학생 정보를 등록하면 나에게 맞는 편성을 찾을 수 있어요.
            </p>
          </Callout>
        )}
        <RaidRanks
          raidUid={raid.uid}
          raidSince={raid.since}
          filters={filters}
          setFilters={setFilters}
        />
      </div>

      {raid.rankVisible && (
        <>
          {/* PC 화면 */}
          <div className="hidden xl:block xl:grow xl:sticky xl:top-4 xl:self-start">
            <div className="bg-white dark:bg-neutral-900 rounded-xl xl:shadow-lg p-6">
              <RaidRankFilter
                filters={filters}
                setRaidFilters={setFilters}
                signedIn={signedIn}
                students={allStudents}
                onClose={() => {}}
              />
            </div>
          </div>

          {/* 모바일 화면 필터 표시 버튼 */}
          <div className="xl:hidden fixed bottom-6 right-4 z-40">
            <button
              onClick={() => setIsMobileSheetOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-full shadow-lg transition-colors"
            >
              <MagnifyingGlassIcon className="size-5" strokeWidth={2} />
              <span>편성 찾기</span>
            </button>
          </div>

          {/* 모바일 화면 바텀 시트 */}
          {isMobileSheetOpen && (
            <>
              <div className="xl:hidden fixed inset-0 bg-transparent z-50" onClick={() => setIsMobileSheetOpen(false)} />
              <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-sm rounded-t-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto border-t border-neutral-200 dark:border-neutral-700">
                <div className="px-4 py-6">
                  <RaidRankFilter
                    filters={filters}
                    setRaidFilters={setFilters}
                    signedIn={signedIn}
                    students={allStudents}
                    onClose={() => setIsMobileSheetOpen(false)}
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
