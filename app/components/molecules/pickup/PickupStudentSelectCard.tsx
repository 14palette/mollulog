import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { StudentCard } from "~/components/atoms/student";
import { filterStudentByName } from "~/filters/student";
import { StudentCards } from "../student";
import { Input } from "~/components/atoms/form";
import { sanitizeClassName } from "~/prophandlers";

type PickupStudentSelectCardProps = {
  studentId: string | null;
  name?: string;
  tier3Students: {
    studentId: string;
    name: string;
  }[];
  onChange: (studentId: string) => void;
};

export default function PickupStudentSelectCard({ studentId, name, tier3Students, onChange }: PickupStudentSelectCardProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const searchResult = search.length > 0 ? filterStudentByName(search, tier3Students, 6) : [];

  return (
    <div className="w-16 mr-2 inline-block align-top md:relative">
      <div className="relative w-full group">
        <StudentCard studentId={studentId} name={name} />
        <div
          className={sanitizeClassName(`
            absolute w-full h-full rounded-lg top-0 left-0 flex justify-center bg-white dark:bg-neutral-800
            opacity-0 dark:opacity-0 group-hover:opacity-75 transition cursor-pointer
          `)}
          onClick={() => setOpen((prev) => !prev)}
        >
          <PencilSquareIcon className="mt-8 hidden group-hover:block size-4 text-neutral-900 dark:text-white" />
        </div>
      </div>
      {open && (
        <div className="absolute origin-top left-0 w-96 my-2 mx-2 md:mx-0 px-4 py-2 bg-white dark:bg-neutral-900 z-10 rounded-lg border dark:border-neutral-700">
          <div className="relative">
            <Input label="학생 찾기" placeholder="이름으로 찾기..." onChange={setSearch} />
            <XMarkIcon
              className="absolute right-0 top-0 p-1 size-6 cursor-pointer"
              onClick={() => setOpen(false)}
            />
          </div>
          {searchResult.length > 0 && (
            <div className="-mt-4 p-2 flex gap-x-2 rounded-lg">
              <StudentCards
                mobileGrid={6} pcGrid={6} students={searchResult}
                onSelect={(studentId) => {
                  onChange(studentId);
                  setOpen(false);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
