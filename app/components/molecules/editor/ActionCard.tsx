import { Form, Link } from "react-router";
import { useState } from "react";

export type ActionCardAction = {
  text: string;
  color: "red" | "default";
  link?: string;
  form?: {
    method: "post" | "patch" | "delete";
    hiddenInputs: { name: string; value: string }[];
  };
  popup?: ((close: () => void) => React.ReactNode);
  onClick?: () => void;
};

type ActionCardProps = {
  children: React.ReactNode | React.ReactNode[];
  actions: ActionCardAction[];
};

export default function ActionCard({ children, actions }: ActionCardProps) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="my-4 p-4 md:p-6 rounded-lg bg-neutral-100 dark:bg-neutral-900">
      <div>
        {children}
      </div>

      <div className="mt-4 -mb-2 flex items-center justify-end">
        {actions.map((action) => {
          let colorClass = "text-neutral-500 dark:text-neutral-200";
          if (action.color === "red") {
            colorClass = "text-red-500";
          }

          const button = (
            <button
              key={action.text}
              type={action.form ? "submit" : "button"}
              className={`-mx-1 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${colorClass} font-bold transition rounded-lg`}
              onClick={action.onClick || (action.popup ? () => setShowPopup((prev) => !prev) : undefined)}
            >
              {action.text}
            </button>
          );

          if (action.link) {
            return <Link key={action.text} to={action.link}>{button}</Link>;
          } else if (action.form) {
            return (
              <Form key={action.text} method={action.form.method}>
                {action.form.hiddenInputs.map((input) => (
                  <input key={input.name} type="hidden" name={input.name} value={input.value} />
                ))}
                {button}
              </Form>
            );
          } else if (action.popup) {
            return (
              <div key={action.text} className="relative">
                {button}
                {showPopup && (
                  <div className="absolute right-0 top-0 mt-12 p-4 w-64 bg-white shadow-lg rounded-lg z-10">
                    {action.popup(() => setShowPopup(false))}
                  </div>
                )}
              </div>
            );
          }
          return button;
        })}
      </div>
    </div>
  );
};
