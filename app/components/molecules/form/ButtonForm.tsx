type ButtonFormProps = {
  type?: "button" | "submit" | "reset";
  label: string;
  color?: "default" | "blue" | "red";
  onClick?: () => void;
};

export default function ButtonForm({ type = "button", label, color = "default", onClick }: ButtonFormProps) {
  const colorClass = {
    default: "",
    blue: "text-blue-500",
    red: "text-red-500",
  }[color];

  return (
    <button type={type} className="w-full text-left p-4 cursor-pointer" onClick={onClick}>
      <label className={`${colorClass} cursor-pointer`}>{label}</label>
    </button>
  );
}
