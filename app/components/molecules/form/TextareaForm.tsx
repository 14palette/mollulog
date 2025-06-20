import { useRef, useEffect } from "react";

type InputFormProps = {
  label: string;
  name?: string;
  defaultValue?: string;
  description?: string;
  placeholder?: string;
  error?: string;
  onChange?: (value: string) => void;
};

export default function TextareaForm({ label, name, defaultValue, description, placeholder, error, onChange }: InputFormProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [defaultValue]);

  return (
    <div className="p-4" onClick={() => inputRef.current?.focus()}>
      <label className="font-bold">{label}</label>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
      <div className="mt-2 text-neutral-700 dark:text-neutral-300">
        <textarea
          ref={inputRef}
          name={name}
          defaultValue={defaultValue}
          className="w-full resize-none"
          onInput={(e) => {
            adjustHeight();
            onChange?.(e.currentTarget.value);
          }}
          rows={1}
          placeholder={placeholder}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
