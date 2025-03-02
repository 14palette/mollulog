import { FunnelIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

// === FilterButton
type FilterButtonProps = {
  text: string;
  color?: string;
  active?: boolean;
  onToggle: (activated: boolean) => void;
};

const defaultButtonColor = "bg-linear-to-br bg-blue-500 to-sky-400 dark:from-blue-600 dark:to-sky-500";

function FilterButton({ text, color, active, onToggle }: FilterButtonProps) {
  return (
    <div
      className={`
        inline-block w-fit flex items-center mr-1 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-lg shadow cursor-pointer
        ${active ? `${color || defaultButtonColor} text-white` : ""}
      `}
      onClick={() => { onToggle(!active); }}
    >
      {text}
    </div>
  );
}

// === FilterButtons
type FilterButtonsProps = {
  Icon?: typeof FunnelIcon,
  buttonProps: FilterButtonProps[],
  exclusive?: boolean;
}

export default function FilterButtons({ Icon, buttonProps, exclusive }: FilterButtonsProps) {
  const [actives, setActives] = useState(buttonProps.map((prop) => prop.active ?? false));

  const IconElem = Icon || FunnelIcon;
  return (
    <div className="my-2 flex items-center">
      <IconElem className="h-5 w-5 mr-2" strokeWidth={2} />
      {buttonProps.map((prop, index) => (
        <FilterButton
          key={`filter-${prop.text}`}
          text={prop.text}
          color={prop.color}
          active={actives[index]}
          onToggle={(activated) => {
            if (exclusive) {
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
