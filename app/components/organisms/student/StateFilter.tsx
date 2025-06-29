import { ArrowsUpDownIcon, BarsArrowDownIcon, FireIcon, MagnifyingGlassIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import hangul from "hangul-js";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { Input } from "~/components/atoms/form";
import { FilterButtons } from "~/components/molecules/content";
import type { AttackType, DefenseType } from "~/models/content.d";
import type { Role } from "~/models/student";

const { disassemble, search } = hangul;

type FilterableStudentState = {
  name: string;
  attackType: AttackType;
  defenseType: DefenseType;
  role: Role;
  order: number;
  initialTier: number;
  tier?: number;
};

type Filter = {
  role: Role | null;
  attackTypes: AttackType[];
  defenseTypes: DefenseType[];
};

type SortBy = "tier" | "name" | "recent";
type Sort = {
  by: SortBy | null;
};

const sortByText: Record<SortBy, string> = {
  tier: "★ 등급순",
  name: "이름순",
  recent: "최신순",
};

export function useStateFilter<T extends FilterableStudentState>(
  initStates: T[],
  options: {
    useFilter?: boolean;
    useSort?: boolean | { by: SortBy[] };
    useSearch?: boolean;
  } = {},
  initialOptions: {
    sort?: Sort;
  } = {},
): [React.JSX.Element, T[], Dispatch<SetStateAction<T[]>>] {
  const { useFilter = true, useSort = true, useSearch = false } = options;

  const [allStates, setAllStates] = useState(initStates);
  const [filter, setFilter] = useState<Filter>({
    role: null,
    attackTypes: [],
    defenseTypes: [],
  });
  const [sort, setSort] = useState<Sort>(initialOptions.sort ?? { by: null });
  const [keyword, setKeyword] = useState<string>("");

  const toggleAttackType = (attackType: AttackType): (activated: boolean) => void => {
    return (activated: boolean) => {
      setFilter((prev) => {
        if (activated && !prev.attackTypes.includes(attackType)) {
          return { ...prev, attackTypes: [...prev.attackTypes, attackType] };
        }
        if (!activated && prev.attackTypes.includes(attackType)) {
          return { ...prev, attackTypes: prev.attackTypes.filter((type) => type !== attackType) };
        }
        return prev;
      });
    };
  };

  const toggleDefenseType = (defenseType: DefenseType): (activated: boolean) => void => {
    return (activated: boolean) => {
      setFilter((prev) => {
        if (activated && !prev.defenseTypes.includes(defenseType)) {
          return { ...prev, defenseTypes: [...prev.defenseTypes, defenseType] };
        }
        if (!activated && prev.defenseTypes.includes(defenseType)) {
          return { ...prev, defenseTypes: prev.defenseTypes.filter((type) => type !== defenseType) };
        }
        return prev;
      });
    };
  };

  const filterAndSort = (): T[] => {
    const results = allStates.filter((student) => {
      // 학생 능력치로 필터
      if (filter.attackTypes.length > 0 && !filter.attackTypes.includes(student.attackType)) {
        return false;
      }
      if (filter.defenseTypes.length > 0 && !filter.defenseTypes.includes(student.defenseType)) {
        return false;
      }
      if (filter.role && student.role !== filter.role) {
        return false;
      }

      // 학생 이름으로 필터
      if (useSearch && disassemble(keyword).length > 1 && search(student.name, keyword) < 0) {
        return false;
      }

      return true;
    });

    results.sort((a, b) => {
      const defaultComparision = a.order - b.order;
      if (sort.by === "tier") {
        const tierA = a.tier ?? a.initialTier;
        const tierB = b.tier ?? b.initialTier;
        if (tierA === tierB) {
          return defaultComparision;
        }
        return tierB - tierA;
      } else if (sort.by === "name") {
        return a.name.localeCompare(b.name);
      } else if (sort.by === "recent") {
        return b.order - a.order;
      }
      return defaultComparision;
    });

    return results;
  };

  const [filteredStates, setFilteredStates] = useState(filterAndSort());
  useEffect(() => {
    setFilteredStates(filterAndSort());
  }, [allStates, filter, sort, keyword]);

  return [(
    <div className="my-8" key="state-filter">
      <p className="my-2 font-bold text-xl">
        {[
          (useFilter || useSearch) ? "필터" : null,
          useSort ? "정렬" : null,
        ].filter((text) => text).join(" 및 ")}
      </p>
      {useFilter && (
        <>
          <FilterButtons Icon={FireIcon} buttonProps={[
            { text: "폭발", color: "red", onToggle: toggleAttackType("explosive") },
            { text: "관통", color: "yellow", onToggle: toggleAttackType("piercing") },
            { text: "신비", color: "blue", onToggle: toggleAttackType("mystic") },
            { text: "진동", color: "purple", onToggle: toggleAttackType("sonic") },
          ]} />
          <FilterButtons Icon={ShieldCheckIcon} buttonProps={[
            { text: "경장갑", color: "red", onToggle: toggleDefenseType("light") },
            { text: "중장갑", color: "yellow", onToggle: toggleDefenseType("heavy") },
            { text: "특수", color: "blue", onToggle: toggleDefenseType("special") },
            { text: "탄력", color: "purple", onToggle: toggleDefenseType("elastic") },
          ]} />
          <FilterButtons Icon={ArrowsUpDownIcon} buttonProps={[
            {
              text: "스트라이커", color: "red",
              onToggle: (activated) => { setFilter((prev) => ({ ...prev, role: activated ? "striker" : null })) },
            },
            {
              text: "스페셜", color: "blue",
              onToggle: (activated) => { setFilter((prev) => ({ ...prev, role: activated ? "special" : null })) },
            },
          ]} />
        </>
      )}

      {useSort && (
        <FilterButtons Icon={BarsArrowDownIcon} exclusive buttonProps={
          (["recent", "name", "tier"] satisfies SortBy[]).map((by) => {
            if (useSort !== true && !useSort.by.includes(by)) {
              return null;
            }
            return {
              text: sortByText[by],
              onToggle: (activated: boolean) => { setSort({ by: activated ? by : null }) },
              active: sort.by === by,
            }
          }).filter((button) => button !== null)
        } />
      )}

      {useSearch && (
        <div className="flex items-center">
          <MagnifyingGlassIcon className="h-5 w-5 mr-2" strokeWidth={2} />
          <Input placeholder="이름으로 찾기" className="-my-4 text-sm" onChange={setKeyword} />
        </div>
      )}
    </div>
  ), filteredStates, setAllStates];
}
