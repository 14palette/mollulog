import { ResourceCard } from "~/components/atoms/item";
import { SubTitle } from "~/components/atoms/typography";
import { RELATIONSHIP_EXP_TABLE, RELATIONSHIP_ITEMS } from "~/models/constants";

type RequiredGiftsProps = {
  currentExp: number | null;
  currentLevel: number;
  targetLevel: number;
};

export default function RequiredGifts({ currentExp: currentExpProp, currentLevel, targetLevel }: RequiredGiftsProps) {
  const currentExp = currentExpProp ?? getAccumulatedExpForLevel(currentLevel);
  return (
    <>
      <SubTitle text="목표 랭크까지 필요한 선물 개수" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {RELATIONSHIP_ITEMS.map(({ type, name, exp, item }) => {
          const remainingExp = getAccumulatedExpForLevel(targetLevel) - currentExp;
          return (
            <div key={`${type}-${name}-${exp}`} className="p-3 flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              {item && <ResourceCard rarity={item.rarity} imageUrl={`https://assets.mollulog.net/assets/images/ui/gift-reaction-${item.favoriteLevel}.png`} />}
              {(type === "schedule") && <ResourceCard rarity={1} imageUrl="https://assets.mollulog.net/assets/images/ui/menu-schedule.webp" />}
              {(type === "cafe") && <ResourceCard rarity={1} imageUrl="https://assets.mollulog.net/assets/images/ui/menu-cafe.webp" />}
              <div className="w-full">
                <div className="text-sm md:text-base w-full flex items-center justify-between gap-1">
                  <span className="grow font-medium">{name}</span>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {Math.max(Math.ceil(remainingExp / exp), 0).toLocaleString()}{item ? "개" : "번"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function getAccumulatedExpForLevel(level: number): number {
  return RELATIONSHIP_EXP_TABLE.find((entry) => entry.level === level)?.accumulatedExp ?? 0;
}
