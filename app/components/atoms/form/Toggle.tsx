import { Switch, Field, Label } from "@headlessui/react";
import { useState } from "react";

type ToggleProps = {
  name?: string;
  label?: string;
  initialState?: boolean;
  colorClass?: string;
  onChange?: (value: boolean) => void;
};

export default function Toggle({ name, label, colorClass, initialState, onChange }: ToggleProps) {
  const [enabled, setEnabled] = useState(initialState ?? false);

  return (
    <>
      <Field className="flex items-center">
        <Switch
          className={`h-7 w-14 p-1 group relative flex cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${colorClass ?? "bg-neutral-200 data-checked:bg-blue-500 dark:bg-neutral-700"}`}
          checked={enabled}
          onChange={(value) => { onChange?.(value); setEnabled(value); }}
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
