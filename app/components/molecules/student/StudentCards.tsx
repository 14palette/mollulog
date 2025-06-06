import { StudentCard } from "~/components/atoms/student"
import StudentInfo from "./StudentInfo";
import type { ReactNode} from "react";
import { useState } from "react";
import type { AttackType, DefenseType, Role } from "~/models/content.d";

type StudentCardsProps = {
  students?: {
    uid: string | null;
    name?: string | null;
    attackType?: AttackType;
    defenseType?: DefenseType;
    role?: Role;
    schaleDbId?: string;

    tier?: number | null;
    level?: number | null;
    label?: ReactNode;
    grayscale?: boolean;

    state?: {
      favorited?: boolean;
      favoritedCount?: number;
    };
  }[];
  mobileGrid?: 4 | 5 | 6 | 8;
  pcGrid?: 4 | 6 | 8 | 10 | 12;
  onSelect?: (id: string) => void;
  onFavorite?: (id: string, favorited: boolean) => void;
};

export default function StudentCards({ students, mobileGrid, pcGrid, onSelect, onFavorite }: StudentCardsProps) {
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
  if (pcGrid === 4) {
    pcGridClass = "md:grid-cols-4";
  } else if (pcGrid === 6) {
    pcGridClass = "md:grid-cols-6";
  } else if (pcGrid === 10) {
    pcGridClass = "md:grid-cols-10";
  } else if (pcGrid === 12) {
    pcGridClass = "md:grid-cols-12";
  }

  return (
    <div className={`relative grid ${gridClass} ${pcGridClass} gap-1 sm:gap-2`}>
      {students && students.map((student, index) => {
        const { uid, name } = student;
        const showInfo = uid && name && student.attackType && student.defenseType && student.role && student.schaleDbId;

        return (
          <div key={`student-card-${name ?? uid}-${index}`}>
            <div
              className={((onSelect || onFavorite) && uid) ? "hover:scale-105 cursor-pointer transition" : ""}
              onClick={uid ? () => {
                onSelect?.(uid);
                setSelectedStudentId(uid);
              } : undefined}
            >
              <StudentCard
                {...student}
                favorited={student.state?.favorited}
                favoritedCount={student.state?.favoritedCount}
              />
            </div>

            {(showInfo && selectedStudentId === uid) && (
              <StudentInfo
                student={{
                  uid,
                  name,
                  attackType: student.attackType!,
                  defenseType: student.defenseType!,
                  role: student.role!,
                  schaleDbId: student.schaleDbId!,
                }}
                favorited={student?.state?.favorited ?? false}
                onRemoveFavorite={() => { onFavorite?.(uid, false); }}
                onAddFavorite={() => { onFavorite?.(uid, true); }}
                onClose={() => { setSelectedStudentId(null); }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
