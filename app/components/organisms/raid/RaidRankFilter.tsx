import type { RaidRankFilters } from "./RaidRanks";
import { Toggle } from "~/components/atoms/form";
import { StudentSearch } from "~/components/molecules/student";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSignIn } from "~/contexts/SignInProvider";

type RaidRankFilterProps = {
  filters: RaidRankFilters;
  setRaidFilters: (filters: (prev: RaidRankFilters) => RaidRankFilters) => void;

  students: {
    uid: string;
    name: string;
  }[];
  signedIn: boolean;
  onClose?: () => void;
};

export default function RaidRankFilter({ filters, setRaidFilters, signedIn, students, onClose }: RaidRankFilterProps) {
  const setRaidFilterAndResetPage = (setter: (prev: RaidRankFilters) => RaidRankFilters) => {
    setRaidFilters((prev) => {
      const newFilters = setter(prev);
      return { ...newFilters, rankAfter: null, rankBefore: null };
    });
  };

  const { showSignIn } = useSignIn();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <MagnifyingGlassIcon className="size-5 text-neutral-600 dark:text-neutral-400" strokeWidth={2} />
          </div>
          <p className="font-bold text-lg text-neutral-900 dark:text-white">편성 찾기</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="size-6 text-neutral-600 dark:text-neutral-400" />
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="mb-2 font-bold text-neutral-900 dark:text-white">포함할 학생</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">선택한 학생을 모두 포함</p>

        <StudentFilter
          selectedStudents={filters.includeStudents}
          students={students}
          onSelect={(studentUid) => {
            setRaidFilterAndResetPage((prev) => {
              if (prev.includeStudents.some(student => student.uid === studentUid)) {
                return prev;
              }
              return { ...prev, includeStudents: [...prev.includeStudents, { uid: studentUid, tier: 3 }] };
            });
          }}
          onRemove={(studentUid) => {
            setRaidFilterAndResetPage((prev) => ({
              ...prev,
              includeStudents: prev.includeStudents.filter(student => student.uid !== studentUid)
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
          onSelect={(studentUid) => {
            setRaidFilterAndResetPage((prev) => ({
              ...prev,
              excludeStudents: [...prev.excludeStudents, { uid: studentUid, tier: 8 }]
            }));
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
    tier: number;
  }[];
  students: {
    uid: string;
    name: string;
  }[];
  onSelect: (studentUid: string) => void;
  onRemove: (studentUid: string) => void;
};

function StudentFilter({ selectedStudents, students, onSelect, onRemove }: StudentFilterProps) {
  return (
    <>
      <StudentSearch
        students={students}
        onSelect={onSelect}
        grid={4}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {selectedStudents.map(({ uid }) => (
          <div
            key={`future-student-${uid}`}
            className="flex items-center shrink-0 rounded-md bg-neutral-100 dark:bg-black pl-2 pr-1 py-1"
          >
            <span>
              {students.find(student => student.uid === uid)?.name}
            </span>
            <XMarkIcon
              className="size-4 mx-0.5 inline-block cursor-pointer"
              onClick={() => onRemove(uid)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
