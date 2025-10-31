import { ArrowRightIcon } from "@heroicons/react/16/solid";

type EventInfoCardProps = {
  Icon: React.ElementType;
  title: string;
  description: string;

  onClick?: () => void;
  showArrow?: boolean;
};

export default function EventInfoCard({ Icon, title, description, onClick, showArrow = false }: EventInfoCardProps) {
  return (
    <div
      onClick={onClick}
      className={`my-2 flex items-center gap-3 px-4 py-3 md:py-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 ${onClick ? "cursor-pointer hover:opacity-50 transition-opacity" : ""}`}
    >
      <div className="flex-shrink-0 p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
        <Icon className="size-5 text-neutral-600 dark:text-neutral-300" />
      </div>
      <div className="grow">
        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{title}</h4>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{description}</p>
      </div>
      {showArrow && (
        <ArrowRightIcon className="size-4 text-neutral-600 dark:text-neutral-300" />
      )}
    </div>
  );
}
