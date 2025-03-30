import { Switch, Field, Label } from "@headlessui/react";
import { useState } from "react";
import { sanitizeClassName } from "~/prophandlers";

type ToggleProps = {
  name?: string;
  label?: string;
  initialState?: boolean;
  colorClass?: string;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
};

export default function Toggle({ name, label, colorClass, initialState, disabled, onChange }: ToggleProps) {
  const [enabled, setEnabled] = useState(initialState ?? false);

  return (
    <>
      <Field className="my-4 flex items-center">
        <Switch
          className={sanitizeClassName(`
            h-7 w-14 p-1 group relative flex rounded-full transition-colors duration-200 ease-in-out
            ${colorClass ?? "bg-neutral-200 data-checked:bg-blue-500 dark:bg-neutral-700"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `)}
          checked={enabled}
          onChange={(value) => {
            if (disabled) {
              return;
            }
            onChange?.(value);
            setEnabled(value);
          }}
        >
          <span
            aria-hidden="true"
            className="h-5 w-5 pointer-events-none inline-block translate-x-0 rounded-full bg-white ring-0 shadow-lg transition duration-200 ease-in-out group-data-checked:translate-x-7"
          />
        </Switch>
        <Label className="ml-2">{label}</Label>
      </Field>

      <input type="hidden" name={name} value={enabled ? "true" : "false"} />
    </>
  );
}
