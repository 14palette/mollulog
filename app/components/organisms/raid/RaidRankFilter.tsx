import { RaidRankFilters } from "./RaidRanks";
import { Toggle } from "~/components/atoms/form";
import { Label } from "~/components/atoms/form";
import { StudentSearch } from "~/components/molecules/student";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/16/solid";
import { sanitizeClassName } from "~/prophandlers";
import { useState } from "react";
import type { RaidType, DefenseType } from "~/models/content.d";
import { useSignIn } from "~/contexts/SignInProvider";

type RaidRankFilterProps = {
  raidType: RaidType;
  defenseTypes: { defenseType: DefenseType; }[];
  filters: RaidRankFilters;
  setRaidFilters: (filters: (prev: RaidRankFilters) => RaidRankFilters) => void;

  students: {
    studentId: string;
    name: string;
  }[];
  signedIn: boolean;
};


export default function RaidRankFilter({ filters, setRaidFilters, signedIn, students, raidType, defenseTypes }: RaidRankFilterProps) {
  const setRaidFilterAndResetPage = (setter: (prev: RaidRankFilters) => RaidRankFilters) => {
    setRaidFilters((prev) => {
      const newFilters = setter(prev);
      return { ...newFilters, rankAfter: null, rankBefore: null };
    });
  };

  const [show, setShow] = useState(false);
  const { showSignIn } = useSignIn();

  return (
    <div className="xl:mx-4 bg-white dark:bg-neutral-800 rounded-xl shadow-lg shadow-neutral-200 dark:shadow-neutral-900">
      <div
        className={sanitizeClassName(`
          p-4 flex justify-between items-center cursor-pointer bg-neutral-800 dark:bg-neutral-900 text-white
          dark:border border-neutral-700 hover:bg-neutral-800 transition rounded-t-xl ${show ? "" : "rounded-b-xl"}
        `)}
        onClick={() => setShow(!show)}
      >
        <div>
          <p className="text-lg font-bold">편성 찾기</p>
          {!show && <p className="text-sm text-neutral-500">특정 학생을 포함/제외한 편성을 찾을 수 있어요.</p>}
        </div>
        {show ? <ChevronUpIcon className="size-6" /> : <ChevronDownIcon className="size-6" />}
      </div>
      {show && (
        <div className="px-4 pt-2 border-l border-r border-b border-neutral-200 dark:border-neutral-700 rounded-b-xl">
          <Label text="포함할 학생" />
          <p className="text-sm text-neutral-500">선택한 학생을 모두 포함</p>

          <StudentFilter
            selectedStudents={filters.includeStudents}
            students={students}
            onSelect={(studentId) => {
              setRaidFilterAndResetPage((prev) => {
                if (prev.includeStudents.some(student => student.studentId === studentId)) {
                  return prev;
                }
                return { ...prev, includeStudents: [...prev.includeStudents, { studentId, tier: 3 }] };
              });
            }}
            onRemove={(studentId) => {
              setRaidFilterAndResetPage((prev) => ({
                ...prev,
                includeStudents: prev.includeStudents.filter(student => student.studentId !== studentId)
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
                excludeStudents: [...prev.excludeStudents, { studentId, tier: 8 }]
              }));
            }}
            onRemove={(studentId) => {
              setRaidFilterAndResetPage((prev) => ({
                ...prev,
                excludeStudents: prev.excludeStudents.filter((student) => student.studentId !== studentId)
              }));
            }}
          />
        </div>
      )}
    </div>
  );
}

type StudentFilterProps = {
  selectedStudents: {
    studentId: string;
    tier: number;
  }[];
  students: {
    studentId: string;
    name: string;
  }[];
  onSelect: (studentId: string) => void;
  onRemove: (studentId: string) => void;
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
        {selectedStudents.map(({ studentId }) => (
          <div
            key={`future-student-${studentId}`}
            className="flex items-center shrink-0 rounded-md bg-neutral-100 dark:bg-neutral-900 pl-2 pr-1 py-1"
          >
            <span>
              {students.find(student => student.studentId === studentId)?.name}
            </span>
            <XMarkIcon
              className="size-4 mx-0.5 inline-block cursor-pointer"
              onClick={() => onRemove(studentId)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
