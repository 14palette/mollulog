import type { RaidRankFilters } from "./RaidRanks";
import { Toggle } from "~/components/atoms/form";
import { Label } from "~/components/atoms/form";
import { StudentSearch } from "~/components/molecules/student";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useSignIn } from "~/contexts/SignInProvider";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type RaidRankFilterProps = {
  filters: RaidRankFilters;
  setRaidFilters: (filters: (prev: RaidRankFilters) => RaidRankFilters) => void;

  students: {
    uid: string;
    name: string;
  }[];
  signedIn: boolean;
  onClose: () => void;
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
    <div className="h-full bg-white dark:bg-neutral-800 xl:opacity-100 border-t xl:border border-neutral-200 dark:border-neutral-700 rounded-t-xl xl:rounded-xl shadow-lg shadow-neutral-200 dark:shadow-neutral-900">
      <div className="p-4 rounded-t-xl flex items-center">
        <MagnifyingGlassIcon className="size-6 mr-2" strokeWidth={2} />
        <p className="text-xl font-bold grow">편성 찾기</p>
        <XMarkIcon className="xl:hidden size-6 ml-2" strokeWidth={2} onClick={onClose} />
      </div>
      <div className="px-4 pb-2">
        <Label text="포함할 학생" />
        <p className="text-sm text-neutral-500">선택한 학생을 모두 포함</p>

        <StudentFilter
          selectedStudents={filters.includeStudents}
          students={students}
          onSelect={(studentId) => {
            setRaidFilterAndResetPage((prev) => {
              if (prev.includeStudents.some(student => student.uid === studentId)) {
                return prev;
              }
              return { ...prev, includeStudents: [...prev.includeStudents, { uid: studentId, tier: 3 }] };
            });
          }}
          onRemove={(studentId) => {
            setRaidFilterAndResetPage((prev) => ({
              ...prev,
              includeStudents: prev.includeStudents.filter(student => student.uid !== studentId)
            }));
          }}
        />

        <Label text="제외할 학생" />
        <p className="text-sm text-neutral-500">선택한 학생이 한 명이라도 포함되면 제외</p>
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
          onSelect={(studentId) => {
            setRaidFilterAndResetPage((prev) => ({
              ...prev,
              excludeStudents: [...prev.excludeStudents, { uid: studentId, tier: 8 }]
            }));
          }}
          onRemove={(studentId) => {
            setRaidFilterAndResetPage((prev) => ({
              ...prev,
              excludeStudents: prev.excludeStudents.filter((student) => student.uid !== studentId)
            }));
          }}
        />
      </div>
    </div>
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
            className="flex items-center shrink-0 rounded-md bg-neutral-100 dark:bg-neutral-900 pl-2 pr-1 py-1"
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
