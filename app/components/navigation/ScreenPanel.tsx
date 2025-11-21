import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";

export type ScreenPanelProps = {
  Icon: React.ElementType;
  title: string;
  description?: string;
  foldable?: boolean;

  children: React.ReactNode;
};

export default function ScreenPanel({ Icon, title, description, foldable, children }: ScreenPanelProps) {
  const [folded, setFolded] = useState(foldable ?? false);

  return (
    <div className="my-4 rounded-xl py-3 px-4 md:px-5 border border-neutral-200 dark:border-neutral-700">
      <div
        className="flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg px-2 -mx-2 cursor-pointer transition-colors"
        onClick={() => setFolded((prev) => !prev)}
      >
        <div className="shrink-0 my-2 p-2 flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-lg">
          <Icon className="size-5 text-neutral-600 dark:text-neutral-400" strokeWidth={2} />
        </div>
        <div className="grow">
          <p className="font-bold">{title}</p>
          {description && <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}
        </div>
        <ChevronDownIcon
          className={`size-5 text-neutral-600 dark:text-neutral-400 transition-transform duration-200 ease-in-out ${folded ? "" : "rotate-180"}`}
          strokeWidth={2}
        />
      </div>

      {!folded && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}