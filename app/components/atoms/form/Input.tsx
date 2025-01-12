import { sanitizeClassName } from "~/prophandlers";

type InputProps = {
  className?: string;
  name?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  onChange?: (value: string) => void;
};

export default function Input({
  className, name, label, description, placeholder, required, defaultValue, error, onChange,
}: InputProps) {
  return (
    <div className="mt-2 mb-8 last:mb-2">
      {label && <p className="font-bold my-2">{label}</p>}
      {description && <p className="my-2 text-sm text-neutral-500">{description}</p>}
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        className={`w-48 md:w-64 max-w-full p-2 border border-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 rounded-lg shadow transition ${error ? "border-red-300 shadow-red-300 dark:border-red-700 dark:shadow-red-700" : ""} ${className ?? ""}`}
        required={required}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
