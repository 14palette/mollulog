type ChipProps = {
  text: string;
  color: "red" | "yellow" | "blue" | "purple" | "black";
};

const colorMap = {
  "red": "bg-linear-to-r from-red-500 to-orange-400",
  "yellow": "bg-linear-to-r from-amber-500 to-yellow-400",
  "blue": "bg-linear-to-r from-blue-500 to-sky-400",
  "purple": "bg-linear-to-r from-purple-500 to-fuchsia-400",
  "black": "bg-linear-to-r from-neutral-900 to-neutral-700",
};

export default function Chip({ text, color }: ChipProps) {
  return (
    <span className={`px-2 py-1 rounded-lg shadow-lg ${colorMap[color]}`}>
      {text}
    </span>
  )
}
