import type { ReactNode } from "react";
import type { AttackType, DefenseType, Role } from "~/models/content.d";
import { StudentCard } from "~/components/atoms/student";

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
  onSelect?: (uid: string) => void;
  onRef?: (uid: string, ref: HTMLDivElement | null) => void;
};

export default function StudentCards({ students, mobileGrid, pcGrid, onSelect, onRef }: StudentCardsProps) {
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
      {students && students.map((student) => {
        const { uid } = student;
        return (
          <div
            key={`student-card-${student.name ?? uid}`}
            ref={(ref) => uid && onRef?.(uid, ref)}
            className="scroll-mt-20 md:scroll-mt-4"
          >
            <StudentCard
              {...student}
              favorited={student.state?.favorited}
              favoritedCount={student.state?.favoritedCount}
              onSelect={onSelect}
            />
          </div>
        );
      })}
    </div>
  );
}
