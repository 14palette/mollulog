import { MagnifyingGlassIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { FloatingButton } from "~/components/atoms/button";
import { Callout } from "~/components/atoms/typography";
import { FilterButtons } from "~/components/molecules/student";
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

  const [openFilter, setOpenFilter] = useState(false);

  return (
    <div className="flex flex-col-reverse xl:flex-row">
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
          <div className={`${openFilter ? "block" : "hidden"} -mx-4 xl:mx-4 xl:block w-full fixed bottom-0 xl:grow xl:sticky xl:top-4 xl:self-start`}>
            <RaidRankFilter
              filters={filters}
              setRaidFilters={setFilters}
              signedIn={signedIn}
              students={allStudents}
              onClose={() => setOpenFilter(false)}
            />
          </div>
          {!openFilter && (
            <div className="xl:hidden">
              <FloatingButton
                Icon={<MagnifyingGlassIcon className="size-4 mr-2" strokeWidth={2} />}
                text="편성 찾기"
                onClick={() => setOpenFilter(true)}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
