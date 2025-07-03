import type { ReactNode } from "react";
import { HeartIcon, StarIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { Transition } from "@headlessui/react";
import { studentImageUrl } from "~/models/assets";
import type { AttackType, DefenseType, Role } from "~/models/content.d";
import { attackTypeColor, attackTypeLocale, defenseTypeColor, defenseTypeLocale, roleColor, roleLocale } from "~/locales/ko";
import OptionBadge from "./OptionBadge";
import { Link } from "react-router";
import { sanitizeClassName } from "~/prophandlers";
import { useStudentCardPopup } from "~/contexts/StudentCardPopupProvider";

type StudentCardProps = {
  uid: string | null;
  name?: string | null;
  nameSize?: "small" | "normal";

  tier?: number | null;
  level?: number | null;
  label?: ReactNode;
  isAssist?: boolean;
  attackType?: AttackType;
  defenseType?: DefenseType;
  role?: Role;

  favorited?: boolean;
  favoritedCount?: number;
  grayscale?: boolean;
  border?: "gray" | "blue";

  onSelect?: (id: string) => void;
  popups?: StudentCardPopupProps["popups"];
}

function visibileTier(tier: number): [number, boolean] {
  if (tier <= 5) {
    return [tier, false];
  } else {
    return [tier - 5, true];
  }
}

export default function StudentCard({
  uid, name, nameSize, tier, level, label, isAssist, attackType, defenseType, role,
  favorited, favoritedCount, grayscale, border, onSelect, popups,
}: StudentCardProps) {
  const { activePopupId, setActivePopupId } = useStudentCardPopup();
  const showPopup = uid === activePopupId;

  const visibleNames = [];
  if (name === "하츠네 미쿠") {
    visibleNames.push("미쿠");
  } else if (name === "미사카 미코토") {
    visibleNames.push("미사카");
  } else if (name === "쇼쿠호 미사키") {
    visibleNames.push("쇼쿠호");
  } else if (name === "사텐 루이코") {
    visibleNames.push("사텐");
  } else if (name === "시로코*테러") {
    visibleNames.push("시로코", "테러");
  } else if (name?.includes("(")) {
    const splits = name.split("(");
    visibleNames.push(splits[0], splits[1].replace(")", ""));
  } else if (name) {
    visibleNames.push(name);
  }

  let borderClass = "";
  if (border === "gray") {
    borderClass = "border-4 border-gray-400 dark:border-gray-500";
  } else if (border === "blue") {
    borderClass = "border-4 border-blue-500";
  }

  return (
    <div className="relative">
      <div
        className={((onSelect || popups) && uid) ? "hover:scale-105 cursor-pointer transition" : ""}
        onClick={uid ? () => {
          if (onSelect) {
            onSelect(uid);
          } else {
            setActivePopupId(uid === activePopupId ? null : uid);
          }
        } : undefined}
      >
        <div className="my-1">
          <div className="relative">
            <div className={`relative rounded-lg overflow-hidden ${borderClass}`}>
              <img
                className={`w-full h-full ${grayscale ? "grayscale opacity-75" : ""} transition`}
                src={studentImageUrl(uid ?? "unlisted")}
                alt={name ?? undefined} loading="lazy"
              />
              {/* 우측 상단 */}
              <div className="absolute top-0 right-0 text-xs font-bold">
                {level && <span className="px-1.5 bg-black/90 rounded-lg text-neutral-100">Lv. {level}</span>}
              </div>

              {(favoritedCount || favorited) && (
                <div className={`px-1 absolute top-0.5 right-0.5 text-white border rounded-lg flex items-center transition ${(favorited === undefined || favorited === true) ? "bg-red-500/90" : "bg-neutral-500/90"}`}>
                  <HeartIcon className="size-3.5" />
                  {favoritedCount && <span className="text-xs font-bold">{favoritedCount}</span>}
                </div>
              )}

              {/* 하단 */}
              <div className="absolute bottom-0 w-full flex justify-center text-xs font-bold bg-black/90 rounded-b-sm">
                {isAssist && (
                  <div className="px-1 md:px-1.5 text-xs font-bold bg-linear-to-br from-cyan-300 to-sky-500 dark:from-cyan-400 dark:to-sky-600 text-white rounded-bl-lg text-center">A</div>
                )}
                {label}
                {!label && tier && (
                  <div className={`flex-grow flex justify-center items-center ${visibileTier(tier)[1] ? "text-teal-300" : "text-yellow-300"}`}>
                    {(tier <= 5) ?
                      <StarIcon className="size-3.5 mr-0.5 inline-block" /> :
                      <img className="w-4 h-4 mr-0.5 inline-block" src="/icons/exclusive_weapon.png" alt="고유 장비" />
                    }
                    <span>{visibileTier(tier)[0]}</span>
                  </div>
                )}
              </div>
            </div>
            {name && (
              <div className="mt-1 text-center leading-tight tracking-tighter">
                <p className={nameSize === "small" ? "text-xs" : "text-sm"}>{visibleNames[0]}</p>
                {(visibleNames.length === 2) && <p className="text-xs">{visibleNames[1]}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {uid && name && popups && popups.length > 0 && (
        <Transition
          show={showPopup}
          as="div"
          enter="transition duration-200 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="scale-100"
          leave="transition duration-100 ease-in"
          leaveFrom="scale-100"
          leaveTo="opacity-0 scale-95"
          className="fixed md:absolute left-0 bottom-4 md:top-full md:bottom-auto w-full md:w-auto min-w-72 md:mt-2 z-10 whitespace-nowrap"
        >
          <StudentCardPopup
            student={{ uid, name, attackType, defenseType, role }}
            popups={popups}
            onClose={() => setActivePopupId(null)}
          />
        </Transition>
      )}
    </div>
  )
}

type StudentCardPopupProps = {
  student: {
    uid: string;
    name: string;
    attackType?: AttackType;
    defenseType?: DefenseType;
    role?: Role;
  };
  popups: {
    Icon?: React.ElementType;
    text?: string;
    children?: ReactNode;
    link?: string;
    onClick?: () => void;
  }[];
  onClose: () => void;
};

export function StudentCardPopup({ student, popups, onClose }: StudentCardPopupProps) {
  const { name, attackType, defenseType, role } = student;

  return (
    <div className="m-4 md:m-0 bg-neutral-100/75 dark:bg-black/75 backdrop-blur-sm text-black dark:text-white rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-lg">
      <div className="px-4 pt-4 pb-2">
        <p className="text-lg font-bold">{name}</p>
        {attackType && defenseType && role && (
          <div className="py-2 flex text-sm gap-x-1">
            <OptionBadge text={attackTypeLocale[attackType]} color={attackTypeColor[attackType]} />
            <OptionBadge text={defenseTypeLocale[defenseType]} color={defenseTypeColor[defenseType]} />
            <OptionBadge text={roleLocale[role]} color={roleColor[role]} />
          </div>
        )}
        <XMarkIcon className="absolute top-4 right-2 size-5 hover:text-neutral-700 transition cursor-pointer" strokeWidth={2} onClick={onClose} />
      </div>
      <div>
        {popups.map((popup, index) => {
          const content = (
            <div
              onClick={() => {
                popup.onClick?.();
                onClose();
              }}
              className={sanitizeClassName(`
                px-4 py-3 flex items-center hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 transition cursor-pointer gap-x-2 border-t border-neutral-200 dark:border-neutral-800
                ${index === popups.length - 1 ? "rounded-b-lg" : ""}
              `)}
            >
              {popup.Icon && <popup.Icon className="size-5" />}
              {popup.text && <span>{popup.text}</span>}
              {popup.children}
            </div>
          );

          const key = `${popup.text ?? popup.link ?? `popup-${index}`}`;
          if (popup.link && popup.link.startsWith("/")) {
            return (
              <Link key={key} to={popup.link}>{content}</Link>
            );
          } else if (popup.link) {
            return (
              <a key={key} href={popup.link} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            );
          }
          return <div key={key}>{content}</div>;
        })}
      </div>
    </div>
  );
}
