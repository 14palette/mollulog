import type { StudentCardProps } from "~/components/atoms/student";
import { StudentCard } from "~/components/atoms/student"
import StudentInfo from "./StudentInfo";
import type { ReactNode} from "react";
import { useState } from "react";
import type { AttackType, DefenseType, Role } from "~/models/content";

type StudentCardsProps = {
  // @deprecated - use `students` instead
  cardProps?: StudentCardProps[];

  students?: {
    studentId: string | null;
    name?: string;
    attackType?: AttackType;
    defenseType?: DefenseType;
    role?: Role;
    schaleDbId?: string;

    tier?: number | null;
    label?: ReactNode;
    grayscale?: boolean;

    state?: {
      favorited?: boolean;
    };
  }[];
  mobileGrid?: 4 | 5 | 6 | 8;
  pcGrid?: 6 | 8 | 10 | 12;
  onSelect?: (id: string) => void;
  onFavorite?: (id: string, favorited: boolean) => void;
};

export default function StudentCards({ cardProps, students, mobileGrid, pcGrid, onSelect, onFavorite }: StudentCardsProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  let gridClass = "grid-cols-6";
  if (mobileGrid === 8) {
    gridClass = "grid-cols-8";
  } else if (mobileGrid === 5) {
    gridClass = "grid-cols-5";
  } else if (mobileGrid === 4) {
    gridClass = "grid-cols-4";
  }

  let pcGridClass = "md:grid-cols-8"
  if (pcGrid === 6) {
    pcGridClass = "md:grid-cols-6";
  } else if (pcGrid === 10) {
    pcGridClass = "md:grid-cols-10";
  } else if (pcGrid === 12) {
    pcGridClass = "md:grid-cols-12";
  }

  return (
    <div className={`relative grid ${gridClass} ${pcGridClass} gap-1 sm:gap-2`}>
      {students && students.map((student, index) => {
        const { studentId, name } = student;
        const showInfo = studentId && name && student.attackType && student.defenseType && student.role && student.schaleDbId;

        return (
          <div key={`student-card-${name ?? studentId ?? index}`}>
            <div
              className={((onSelect || onFavorite) && studentId) ? "hover:scale-105 cursor-pointer transition" : ""}
              onClick={studentId ? () => {
                onSelect?.(studentId);
                setSelectedStudentId(studentId);
              } : undefined}
            >
              <StudentCard {...student} favorited={student?.state?.favorited} />
            </div>

            {(showInfo && selectedStudentId === studentId) && (
              <StudentInfo
                student={{
                  name,
                  attackType: student.attackType!,
                  defenseType: student.defenseType!,
                  role: student.role!,
                  schaleDbId: student.schaleDbId!,
                }}
                favorited={student?.state?.favorited ?? false}
                onRemoveFavorite={() => { onFavorite?.(studentId!, false); }}
                onAddFavorite={() => { onFavorite?.(studentId!, true); }}
                onClose={() => { setSelectedStudentId(null); }}
              />
            )}
          </div>
        );
      })}

      {/* DEPRECATED */}
      {(!students || students.length === 0) && cardProps?.map((prop) => (
        <div
          key={`student-card-${prop.studentId}${prop.name ? `-${prop.name}` : ""}`}
          className={(onSelect && prop.studentId) ? "hover:scale-105 cursor-pointer transition" : ""}
          onClick={() => prop.studentId && onSelect?.(prop.studentId)}
        >
          <StudentCard key={`list-students-${prop.studentId}`} {...prop} />
        </div>
      ))}
    </div>
  );
}
