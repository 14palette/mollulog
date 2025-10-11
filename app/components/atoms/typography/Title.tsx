import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router";

type TitleProps = {
  text: string;
  description?: string;
  className?: string;
  parentPath?: string;
}

export default function Title({ text, description, className, parentPath }: TitleProps) {
  return (
    <div className="my-8">
      <div className={`flex items-center gap-x-2 ${className ?? ""}`}>
        {parentPath && (
          <Link to={parentPath}>
            <ChevronLeftIcon className="mx-1 size-8 hover:text-neutral-500 transition cursor-pointer" strokeWidth={2} />
          </Link>
        )}
        <h1 className="font-black text-3xl md:text-4xl drop-shadow-xl drop-shadow-neutral-300/50 dark:drop-shadow-neutral-700/50">
          {text}
        </h1>
      </div>
      {description && <p className="my-4">{description}</p>}
    </div>
  );
}
