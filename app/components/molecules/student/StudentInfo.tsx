import { ArrowTopRightOnSquareIcon, XMarkIcon, HeartIcon as EmptyHeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as FilledHeartIcon } from "@heroicons/react/24/solid";
import { attackTypeLocale, defenseTypeLocale, roleLocale } from "~/locales/ko";
import type { AttackType, DefenseType, Role } from "~/models/content";

type StudentInfoProps = {
  student: {
    name: string;
    attackType: AttackType;
    defenseType: DefenseType;
    role: Role;
    schaleDbId: string;
  };
  favorited: boolean;

  onRemoveFavorite?: () => void;
  onAddFavorite?: () => void;
  onClose: () => void;
};

const attackTypeColor = {
  explosive: "bg-red-400",
  piercing: "bg-yellow-500",
  mystic: "bg-blue-400",
  sonic: "bg-purple-400",
};

const defenseTypeColor = {
  light: "bg-red-400",
  heavy: "bg-yellow-500",
  special: "bg-blue-400",
  elastic: "bg-purple-400",
};

const roleColor = {
  striker: "bg-red-400",
  special: "bg-blue-400",
};

export default function StudentInfo({ student, favorited, onRemoveFavorite, onAddFavorite, onClose }: StudentInfoProps) {
  const { name, attackType, defenseType, role } = student;

  return (
    <div className="absolute origin-top left-0 my-2 bg-neutral-900 opacity-90 text-white rounded-lg z-10">
      <div className="p-4">
        <p className="pb-2 font-bold">{name}</p>
        <div className="flex text-sm gap-x-1">
          <span className={"px-2 text-neutral-900 rounded-full " + attackTypeColor[attackType]}>
            {attackTypeLocale[attackType]}
          </span>
          <span className={"px-2 text-neutral-900 rounded-full " + defenseTypeColor[defenseType]}>
            {defenseTypeLocale[defenseType]}
          </span>
          <span className={"px-2 text-neutral-900 rounded-full " + roleColor[role]}>
            {roleLocale[role]}
          </span>
        </div>
        <XMarkIcon className="absolute top-4 right-2 size-6 hover:text-neutral-700 transition cursor-pointer" strokeWidth={2} onClick={onClose} />
      </div>
      <div>
        {onAddFavorite && onRemoveFavorite && (
          <div className="px-4 py-2 flex items-center hover:bg-neutral-700 transition cursor-pointer border-t border-neutral-700" onClick={favorited ? onRemoveFavorite: onAddFavorite}>
            {favorited ? <EmptyHeartIcon className="size-4" /> : <FilledHeartIcon className="size-4" />}
            <span className="ml-1.5">관심 모집 학생에{favorited ? "서 해제" : " 등록"}</span>
          </div>
        )}

        <a href={`https://schaledb.com/student/${student.schaleDbId}`} target="_blank" rel="noreferrer">
          <div className="px-4 py-2 flex items-center hover:bg-neutral-700 transition cursor-pointer border-t border-neutral-700 rounded-b-lg">
            <ArrowTopRightOnSquareIcon className="size-4" />
            <span className="ml-1.5">SchaleDB에서 학생 정보 보기</span>
          </div>
        </a>
      </div>
    </div>
  );
}
