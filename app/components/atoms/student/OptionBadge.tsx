type OptionBadgeProps = {
  text: string;
  color?: "red" | "yellow" | "blue" | "purple";
  dark?: boolean;
};

const colorClass = {
  white: "bg-white",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
};

export default function OptionBadge({ text, color, dark }: OptionBadgeProps) {
  return (
    <div className={`flex-shrink-0 px-2 py-0.5 flex items-center ${dark ? "bg-neutral-800 text-white" : "bg-neutral-200"} dark:bg-neutral-800 rounded-full`}>
      {color && <div className={`size-2.5 rounded-full mr-1 ` + colorClass[color]} />}
      <span className="text-sm">{text}</span>
    </div>
  );
}
