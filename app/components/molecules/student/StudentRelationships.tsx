import { HeartIcon } from "@heroicons/react/16/solid";
import ProfileImage from "~/components/atoms/student/ProfileImage";
import { parseVisibleNames } from "~/models/student";

type StoryStudent = {
  uid: string;
  name: string;
  level: number | null; // relationship level
};

type StudentStoriesProps = {
  students: StoryStudent[];
  selectedStudent?: string | null;
  onSelect?: (studentUid: string) => void;
};

export default function StudentRelationships({ students, selectedStudent, onSelect }: StudentStoriesProps) {
  return (
    <div className="w-full">
      <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
        {students.map((student) => {
          const visibleNames = parseVisibleNames(student.name);
          return (
            <button
              key={student.uid}
              className={`relative shrink-0 flex flex-col border-2 items-center transition-all p-1 rounded-lg
                ${selectedStudent === student.uid
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-700 border-transparent"}
              `}
              onClick={() => onSelect?.(student.uid)}
            >
              <div className="relative">
                <ProfileImage studentUid={student.uid} imageSize={16} />

                {/* Heart badge at bottom-right */}
                {student.level && (
                  <div className="absolute -bottom-1 -right-1">
                    <div className="relative">
                      <HeartIcon className="size-8 text-rose-500 blur-[1px]" />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white leading-none">
                        {student.level}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 text-center text-neutral-700 dark:text-neutral-300">
                <p className="text-sm">{visibleNames[0]}</p>
                {visibleNames.length === 2 && <p className="text-xs">{visibleNames[1]}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


