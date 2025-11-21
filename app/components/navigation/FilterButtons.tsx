import { useState, useEffect } from "react";
import { sanitizeClassName } from "~/prophandlers";

// === FilterButtons
type FilterButtonsProps = {
  Icon?: React.ElementType,
  buttonProps: FilterButtonProps[],
  exclusive?: boolean;
  atLeastOne?: boolean;
  inBlock?: boolean;
}

export default function FilterButtons({ Icon, buttonProps, exclusive, atLeastOne, inBlock }: FilterButtonsProps) {
  const [actives, setActives] = useState(() => buttonProps.map((prop) => prop.active ?? false));
  useEffect(() => {
    setActives(buttonProps.map((prop) => prop.active ?? false));
  }, [buttonProps]);

  return (
    <div className="my-2 flex flex-wrap items-center gap-x-1 md:gap-x-1.5 gap-y-1.5">
      {Icon && <Icon className="h-5 w-5 mr-1" strokeWidth={2} />}
      {buttonProps.map((prop, index) => (
        <FilterButton
          key={`${prop.text}-${index}`}
          text={prop.text}
          color={prop.color}
          active={actives[index]}
          onToggle={(activated) => {
            if (atLeastOne && !activated && actives.filter((active) => active).length <= 1) {
              return;
            } else if (exclusive) {
              const newActives = new Array(buttonProps.length).fill(false);
              newActives[index] = activated;
              setActives(newActives);
            } else {
              setActives((prev) => { const newActives = [...prev]; newActives[index] = activated; return newActives; })
            }
            prop.onToggle(activated);
          }}
          inBlock={inBlock}
        />
      ))}
    </div>
  );
}

// === FilterButton
type FilterButtonProps = {
  text: string;
  color?: "red" | "yellow" | "blue" | "purple";
  active?: boolean;
  onToggle: (activated: boolean) => void;
  inBlock?: boolean;
};

const buttonColors = {
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
};

function FilterButton({ text, color, active, onToggle, inBlock }: FilterButtonProps) {
  return (
    <div
      className={sanitizeClassName(`
        px-3 py-1 flex items-center rounded-full cursor-pointer transition-colors border border-neutral-200 dark:border-neutral-700
        ${active ?
          "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900" :
          `${inBlock ? "bg-neutral-200" : "bg-neutral-100"} dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200`
        }
      `)}
      onClick={() => { onToggle(!active); }}
    >
      {color && <div className={`size-2.5 rounded-full mr-1.5 ` + buttonColors[color]} />}
      <span className="text-sm md:text-base tracking-tighter shrink-0">{text}</span>
    </div>
  );
}
