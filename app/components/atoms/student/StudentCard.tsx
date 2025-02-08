import { HeartIcon } from "@heroicons/react/16/solid";
import type { ReactNode } from "react";
import { studentImageUrl } from "~/models/assets";

type StudentCardProps = {
  studentId: string | null;
  name?: string;
  nameSize?: "small" | "normal";

  tier?: number | null;
  label?: ReactNode;

  favorited?: boolean;
  favoritedCount?: number;
  grayscale?: boolean;
}

function visibileTier(tier: number): [number, boolean] {
  if (tier <= 5) {
    return [tier, false];
  } else {
    return [tier - 5, true];
  }
}

export default function StudentCard(
  { studentId, name, nameSize, tier, label, favorited, favoritedCount, grayscale }: StudentCardProps,
) {
  const showInfo = tier !== undefined || label !== undefined;
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

  return (
    <div className="my-1">
      <div className="relative">
        <img
          className={`rounded-lg ${grayscale ? "grayscale opacity-75" : ""} transition`}
          src={studentImageUrl(studentId || "unlisted")}
          alt={name} loading="lazy"
        />
        {(favoritedCount || favorited) && (
          <div className={`px-1 absolute top-0.5 right-0.5 bg-opacity-90 text-white border rounded-lg flex items-center transition ${(favorited === undefined || favorited === true) ? "bg-red-500 " : "bg-neutral-500"}`}>
            <HeartIcon className="size-3.5" />
            {favoritedCount && <span className="text-xs font-bold">{favoritedCount}</span>}
          </div>
        )}
        {showInfo && (
          <div className="absolute bottom-0 right-0 flex flex-col items-center px-2 rounded-lg bg-black bg-opacity-75 text-center font-bold text-xs">
            {(tier) && (
              <p className={`flex items-center ${visibileTier(tier)[1] ? "text-teal-300" : "text-yellow-300"}`}>
                {(tier <= 5) ?
                  <span className="mr-0.5">★</span> :
                  <img className="w-4 h-4 mr-0.5 inline-block" src="/icons/exclusive_weapon.png" alt="고유 장비" />
                }
                <span>{visibileTier(tier)[0]}</span>
              </p>
            )}
            {(label !== undefined) && label}
          </div>
        )}
      </div>
      {name && (
        <div className="mt-1 text-center leading-tight tracking-tighter">
          <p className={nameSize === "small" ? "text-xs" : "text-sm"}>{visibleNames[0]}</p>
          {(visibleNames.length === 2) && <p className="text-xs">{visibleNames[1]}</p>}
        </div>
      )}
    </div>
  )
}
