import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";

type EventShopSectionProps = {
  title: string;
  description?: string;
  foldable: boolean;
  foldStateKey?: string;
  children: React.ReactNode;
};

export function EventShopSection({ title, description, foldable, foldStateKey, children }: EventShopSectionProps) {
  const [visible, setVisible] = useState(() => {
    if (foldStateKey && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`event-shop-section::${foldStateKey}`);
        if (saved !== null) {
          return JSON.parse(saved);
        }
      } catch (error) {
        // Ignore localStorage errors
      }
    }
    return true;
  });

  useEffect(() => {
    if (foldStateKey && typeof window !== "undefined") {
      try {
        localStorage.setItem(`event-shop-section::${foldStateKey}`, JSON.stringify(visible));
      } catch (error) {
        // Ignore localStorage errors
      }
    }
  }, [visible, foldStateKey]);

  return (
    <div className={`pb-4 ${foldable && !visible ? "border-b border-neutral-200 dark:border-neutral-700" : ""} ${visible ? "mb-4 md:mb-12" : "mb-4"}`}>
      <div
        className={`flex items-center gap-3 ${foldable ? "cursor-pointer" : ""}`}
        onClick={() => foldable ? setVisible((prev: boolean) => !prev) : undefined}
      >
        <div className="grow min-w-0">
          <h2 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
          )}
        </div>
        {foldable && (
          <ChevronDownIcon
            className={`size-5 shrink-0 mt-0.5 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ease-in-out ${visible ? "rotate-180" : ""}`}
          />
        )}
      </div>
      {visible && <div className="mt-4">{children}</div>}
    </div>
  );
}

