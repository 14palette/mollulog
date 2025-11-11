import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { SubTitle } from "~/components/atoms/typography";

type SectionHeaderProps = {
  title: string;
  description?: string;
  folded?: boolean;
  setFolded?: (folded: boolean) => void;
};

export function SectionHeader({ title, description, folded, setFolded }: SectionHeaderProps) {
  return (
    <div
      className={`mt-4 -mx-4 md:mx-0 px-4 md:px-2 flex gap-2 items-center group ${folded ? "border-b border-neutral-200 dark:border-neutral-700" : ""} ${folded !== undefined ? "cursor-pointer" : ""}`}
      onClick={() => setFolded?.(!folded)}
    >
      <div className="grow">
        <SubTitle text={title} description={description} />
      </div>
      {folded !== undefined && (
        <div className="size-8 shrink-0 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
          <ChevronDownIcon className={`size-5 transition-transform duration-200 ease-in-out text-neutral-600 dark:text-neutral-400 ${folded ? "" : "rotate-180"}`} />
        </div>
      )}
    </div>
  );
}
