import type { RaidRankFilters } from "./RaidRanks";
import { Toggle } from "~/components/atoms/form";
import { StudentSearch } from "~/components/molecules/student";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { XMarkIcon, StarIcon } from "@heroicons/react/16/solid";
import { useSignIn } from "~/contexts/SignInProvider";
import { StudentCard } from "~/components/atoms/student";
import { sanitizeClassName } from "~/prophandlers";

type RaidRankFilterProps = {
  filters: RaidRankFilters;
  setRaidFilters: (filters: (prev: RaidRankFilters) => RaidRankFilters) => void;

  students: {
    uid: string;
    name: string;
    tiers: number[];
  }[];
  signedIn: boolean;
  showTitle?: boolean;
};

export default function RaidRankFilter({ filters, setRaidFilters, signedIn, students, showTitle }: RaidRankFilterProps) {
  const setRaidFilterAndResetPage = (setter: (prev: RaidRankFilters) => RaidRankFilters) => {
    setRaidFilters((prev) => {
      const newFilters = setter(prev);
      return { ...newFilters, rankAfter: null, rankBefore: null };
    });
  };

  const { showSignIn } = useSignIn();

  return (
    <>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-lg">
              <MagnifyingGlassIcon className="size-5 text-neutral-600 dark:text-neutral-400" strokeWidth={2} />
            </div>
            <p className="font-bold text-xl">편성 찾기</p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <p className="mb-2 font-bold text-neutral-900 dark:text-white">포함할 학생</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">선택한 학생을 모두 포함</p>

        <StudentFilter
          selectedStudents={filters.includeStudents}
          students={students}
          onSelect={({ uid, tiers }) => {
            setRaidFilterAndResetPage((prev) => {
              let found = false;
              const newIncludeStudents = prev.includeStudents.map((student) => {
                if (student.uid === uid) {
                  found = true;
                  return { ...student, tiers };
                }
                return student;
              });
              if (!found) {
                newIncludeStudents.push({ uid, tiers });
              }

              return { ...prev, includeStudents: newIncludeStudents };
            });
          }}
          onRemove={(uid) => {
            setRaidFilterAndResetPage((prev) => ({
              ...prev,
              includeStudents: prev.includeStudents.filter((student) => student.uid !== uid),
            }));
          }}
        />
      </div>

      <div>
        <p className="mb-2 font-bold text-neutral-900 dark:text-white">제외할 학생</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">선택한 학생이 한 명이라도 포함되면 제외</p>

        <div onClick={() => { !signedIn && showSignIn() }}>
          <Toggle
            label="내가 모집하지 않은 학생"
            disabled={!signedIn}
            onChange={(value) => setRaidFilters((prev) => ({ ...prev, filterNotOwned: value }))}
          />
        </div>

        <StudentFilter
          selectedStudents={filters.excludeStudents}
          students={students}
          onSelect={({ uid, tiers }) => {
            setRaidFilterAndResetPage((prev) => {
              let found = false;
              const newExcludeStudents = prev.excludeStudents.map((student) => {
                if (student.uid === uid) {
                  found = true;
                  return { ...student, tiers };
                }
                return student;
              });
              if (!found) {
                newExcludeStudents.push({ uid, tiers });
              }

              return { ...prev, excludeStudents: newExcludeStudents };
            });
          }}
          onRemove={(studentUid) => {
            setRaidFilterAndResetPage((prev) => ({
              ...prev,
              excludeStudents: prev.excludeStudents.filter((student) => student.uid !== studentUid)
            }));
          }}
        />
      </div>
    </>
  );
}

type StudentFilterProps = {
  selectedStudents: {
    uid: string;
    tiers: number[];
  }[];
  students: {
    uid: string;
    name: string;
    tiers: number[];
  }[];
  onSelect: ({ uid, tiers }: { uid: string; tiers: number[] }) => void;
  onRemove: (uid: string) => void;
};

function StudentFilter({ selectedStudents, students, onSelect, onRemove }: StudentFilterProps) {
  return (
    <>
      <StudentSearch
        students={students}
        onSelect={(uid) => onSelect({ uid, tiers: [] })}
        grid={4}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {selectedStudents.map(({ uid, tiers }) => {
          const availableTiers = students.find((student) => student.uid === uid)?.tiers ?? [];
          return (
            <div key={`future-student-${uid}`} className="flex items-center gap-3 px-3 py-2 w-full rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="w-16 shrink-0">
                <StudentCard uid={uid} />
              </div>
              <div className="grow flex flex-wrap gap-x-1 gap-y-2">
                <div
                  className={`
                    px-3 py-0.5 rounded-full border transition-all duration-200 justify-center cursor-pointer shadow-sm
                    ${tiers.length === 0
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-blue-300 dark:hover:border-blue-600"
                    }
                  `}
                  onClick={() => onSelect({ uid, tiers: [] })}
                >
                  <span className="text-sm font-semibold">전체</span>
                </div>
                {availableTiers.map((tier) => {
                  const isSelected = tiers.includes(tier);
                  return (
                    <div
                      key={`tier-${tier}`}
                      onClick={() => onSelect({ uid, tiers: isSelected ? tiers.filter((t) => t !== tier) : [...tiers, tier] })}
                      className={sanitizeClassName(`
                        flex items-center gap-0.5 px-2.5 py-0.5 rounded-full border transition-all duration-200 justify-center cursor-pointer shadow-sm
                        ${isSelected
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-blue-300 dark:hover:border-blue-600"
                        }
                      `)}
                    >
                      {tier <= 5 ?
                        <StarIcon className={`size-4 ${isSelected ? "text-white" : "text-amber-500"}`} /> :
                        <img className="size-4 my-1 mr-0.5" src="/icons/exclusive_weapon.png" alt="고유 장비" />
                      }
                      <span className="text-sm font-semibold">
                        {tier > 5 ? tier - 5 : tier}
                      </span>
                    </div>
                  );
                })}
              </div>
              <button className="-mr-2 p-1 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 shrink-0 transition cursor-pointer" onClick={() => onRemove(uid)}>
                <XMarkIcon className="size-4" strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
