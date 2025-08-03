import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { Callout } from "~/components/atoms/typography";
import { FilterButtons } from "~/components/molecules/content";
import RaidRanks, { type RaidRankFilters } from "~/components/organisms/raid/RaidRanks";
import { defenseTypeColor, defenseTypeLocale } from "~/locales/ko";
import { useSignIn } from "~/contexts/SignInProvider";
import type { RaidType, DefenseType } from "~/models/content.d";

export type RaidRanksProps = {
  raid: {
    uid: string;
    type: RaidType;
    defenseTypes: { defenseType: DefenseType; difficulty: string | null }[];
    rankVisible: boolean;
    since: Date;
  };
  signedIn: boolean;
  allStudents: {
    uid: string;
    name: string;
  }[];

  filters: RaidRankFilters;
  setFilters: (filters: (prev: RaidRankFilters) => RaidRankFilters) => void;
};

export default function RaidRanksPage({ filters, setFilters, raid, signedIn }: RaidRanksProps) {
  const { showSignIn } = useSignIn();

  return (
    <div className="w-full max-w-2xl">
      {raid.rankVisible && raid.type === "elimination" && (
        <div className="my-4">
          <FilterButtons
            key={`filters-${raid.uid}`}
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
  )
}
