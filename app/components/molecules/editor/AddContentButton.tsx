import { PlusCircleIcon } from "@heroicons/react/16/solid";
import { Link } from "react-router";
import { sanitizeClassName } from "~/prophandlers";

type AddContentButtonProps = {
  text: string;
  link?: string;
  onClick?: () => void;
};

export default function AddContentButton({ text, link, onClick }: AddContentButtonProps) {
  const innerElement = (
    <div className={sanitizeClassName(`
        mt-8 mb-4 p-4 flex justify-center items-center border
        border-neutral-200 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600
        rounded-lg transition cursor-pointer
      `)}>
      <PlusCircleIcon className="size-4 mr-1" />
      <span>{text}</span>
    </div>
  );

  if (link) {
    return <Link to={link}>{innerElement}</Link>;
  }
  return <div onClick={onClick}>{innerElement}</div>;
}
