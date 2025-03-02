import { ArrowsUpDownIcon, BarsArrowDownIcon, FireIcon, MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/outline';
import hangul from 'hangul-js';
import type { Dispatch, SetStateAction} from "react";
import { useEffect, useState } from "react";
import { Input } from "~/components/atoms/form";
import { FilterButtons } from "~/components/molecules/student";
import type { AttackType } from "~/models/content";
import type { Role } from "~/models/student";
import type { StudentState } from '~/models/student-state';

const { disassemble, search } = hangul;

type Filter = {
  minimumTier: number;
  role: Role | null;
  attackTypes: AttackType[];
}

type Sort = {
  by: "tier" | "name" | null;
}

const buttonColors = {
  "red": "bg-linear-to-r from-red-500 to-orange-400",
  "yellow": "bg-linear-to-r from-amber-500 to-yellow-400",
  "blue": "bg-linear-to-r from-blue-500 to-sky-400",
  "purple": "bg-linear-to-r from-purple-500 to-fuchsia-400",
};

export function useStateFilter(
  initStates: StudentState[],
  useFilter: boolean = true,
  useSort: boolean = true,
  useSearch: boolean = false,
): [JSX.Element, StudentState[], Dispatch<SetStateAction<StudentState[]>>] {
  const [allStates, setAllStates] = useState(initStates);
  const [filter, setFilter] = useState<Filter>({
    minimumTier: 1,
    role: null,
    attackTypes: [],
  });
  const [sort, setSort] = useState<Sort>({
    by: null,
  });
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
  }

  const filterAndSort = (): StudentState[] => {
    const results = allStates.filter(({ student }) => {
      // 학생 능력치로 필터
      if (student.initialTier < filter.minimumTier) {
        return false;
      }
      if (filter.attackTypes.length > 0 && !filter.attackTypes.includes(student.attackType)) {
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
      const defaultComparision = a.student.order - b.student.order;
      if (sort.by === "tier") {
        const tierA = a.tier ?? a.student.initialTier;
        const tierB = b.tier ?? b.student.initialTier;
        if (tierA === tierB) {
          return defaultComparision;
        }
        return tierB - tierA;
      } else if (sort.by === "name") {
        return a.student.name.localeCompare(b.student.name);
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
          <FilterButtons Icon={StarIcon} buttonProps={[
            {
              text: "3성 미만 감추기",
              onToggle: (activated) => { setFilter((prev) => ({ ...prev, minimumTier: activated ? 3 : 1 })) },
            },
          ]} />
          <FilterButtons Icon={FireIcon} buttonProps={[
            { text: "폭발", color: buttonColors["red"], onToggle: toggleAttackType("explosive") },
            { text: "관통", color: buttonColors["yellow"], onToggle: toggleAttackType("piercing") },
            { text: "신비", color: buttonColors["blue"], onToggle: toggleAttackType("mystic") },
            { text: "진동", color: buttonColors["purple"], onToggle: toggleAttackType("sonic") },
          ]} />
          <FilterButtons Icon={ArrowsUpDownIcon} exclusive={true} buttonProps={[
            {
              text: "스트라이커", color: buttonColors["red"],
              onToggle: (activated) => { setFilter((prev) => ({ ...prev, role: activated ? "striker" : null })) },
            },
            {
              text: "스페셜", color: buttonColors["blue"],
              onToggle: (activated) => { setFilter((prev) => ({ ...prev, role: activated ? "special" : null })) },
            },
          ]} />
        </>
      )}

      {useSort && (
        <FilterButtons Icon={BarsArrowDownIcon} exclusive={true} buttonProps={[
          { text: "★ 등급", onToggle: (activated) => { setSort({ by: activated ? "tier" : null }) } },
          { text: "이름", onToggle: (activated) => { setSort({ by: activated ? "name" : null }) } },
        ]} />
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
