import { FunnelIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { sanitizeClassName } from "~/prophandlers";

// === FilterButton
type FilterButtonProps = {
  text: string;
  color?: "red" | "yellow" | "blue" | "purple";
  active?: boolean;
  onToggle: (activated: boolean) => void;
};

const buttonColors = {
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
};

function FilterButton({ text, color, active, onToggle }: FilterButtonProps) {
  return (
    <div
      className={sanitizeClassName(`
        px-3 py-1 flex items-center rounded-full cursor-pointer
        ${active ?
          "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-md dark:shadow-neutral-700" :
          "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
        }
      `)}
      onClick={() => { onToggle(!active); }}
    >
      {color && <div className={`size-2.5 rounded-full mr-1.5 ` + buttonColors[color]} />}
      <span className="tracking-tighter shrink-0">{text}</span>
    </div>
  );
}

// === FilterButtons
type FilterButtonsProps = {
  Icon?: typeof FunnelIcon,
  buttonProps: FilterButtonProps[],
  exclusive?: boolean;
  atLeastOne?: boolean;
}

export default function FilterButtons({ Icon, buttonProps, exclusive, atLeastOne }: FilterButtonsProps) {
  const [actives, setActives] = useState(buttonProps.map((prop) => prop.active ?? false));

  const IconElem = Icon || FunnelIcon;
  return (
    <div className="my-2 flex flex-wrap items-center gap-1">
      <IconElem className="h-5 w-5 mr-1" strokeWidth={2} />
      {buttonProps.map((prop, index) => (
        <FilterButton
          key={`filter-${prop.text}`}
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
              setActives((prev) => { prev[index] = activated; return prev; })
            }
            prop.onToggle(activated);
          }}
        />
      ))}
    </div>
  );
}
