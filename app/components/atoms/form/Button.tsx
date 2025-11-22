import type { ReactNode } from "react";

export type ButtonProps = {
  text?: string;
  Icon?: React.ForwardRefExoticComponent<Omit<React.SVGProps<SVGSVGElement>, "ref">>;

  className?: string;
  children?: ReactNode | ReactNode[];

  type?: "button" | "submit" | "reset";
  color?: "primary" | "red" | "black";
  onClick?: () => void;
  disabled?: boolean;
};

export default function Button({ text, Icon, className, children, type, color, onClick, disabled }: ButtonProps) {
  let colorClass = "";
  if (color === "primary") {
    colorClass = "bg-blue-500 enabled:hover:bg-blue-400 disabled:bg-blue-300 text-white border-transparent"
  } else if (color === "red") {
    colorClass = "bg-red-500 enabled:hover:bg-red-400 disabled:bg-red-300 text-white border-transparent"
  } else if (color === "black") {
    colorClass = "bg-neutral-900 enabled:hover:bg-neutral-700 disabled:bg-neutral-500 text-white border-transparent";
  } else {
    colorClass = "hover:bg-neutral-100 border-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700";
  }

  return (
    <button
      type={type || "button"}
      className={`inline-block my-1 mr-2 px-4 py-1.5 rounded-lg border shadow shadow-neutral-200 dark:shadow-neutral-900 transition cursor-pointer ${colorClass} ${className ?? ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children ?? (
        Icon ? (
          <div className="flex items-center">
            <Icon className="size-3.5" strokeWidth={2} />
            <span className="ml-2">{text}</span>
          </div>
        ) : (
          text
        )
      )}
    </button>
  );
}
