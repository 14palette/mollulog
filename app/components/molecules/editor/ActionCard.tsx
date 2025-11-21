import { Form, Link } from "react-router";
import { useState } from "react";

export type ActionCardAction = {
  text: string;
  color?: "red" | "default";
  link?: string;
  form?: {
    method: "post" | "patch" | "delete";
    hiddenInputs: { name: string; value: string }[];
  };
  popup?: ((close: () => void) => React.ReactNode);
  onClick?: () => void;
  danger?: boolean;
};

type ActionCardProps = {
  children: React.ReactNode | React.ReactNode[];
  actions: ActionCardAction[];
};

export default function ActionCard({ children, actions }: ActionCardProps) {
  const [remindDangerAction, setRemindDangerAction] = useState<ActionCardAction | null>(null);

  return (
    <div className="my-4 p-4 md:p-6 rounded-lg bg-neutral-100 dark:bg-neutral-900">
      <div>
        {children}
      </div>

      {actions.length > 0 && (
        <div className="mt-4 -mb-2 flex items-center justify-end">
          {remindDangerAction ? (
            <>
              <p className="mr-2">정말로 {remindDangerAction.text} 할까요?</p>
              <ActionButton action={{
                text: "취소",
                onClick: () => setRemindDangerAction(null),
              }} />
              <ActionButton action={remindDangerAction} />
            </>
          ) : actions.map((action, index) => {
            return <ActionButton key={index} action={action} setRemindDangerAction={setRemindDangerAction} />;
          })}
        </div>
      )}
    </div>
  );
};

type ActionButtonProps = {
  action: ActionCardAction;
  setRemindDangerAction?: (action: ActionCardAction | null) => void;
};

function ActionButton({ action, setRemindDangerAction }: ActionButtonProps) {
  let colorClass = "text-neutral-500 dark:text-neutral-200";
  if (action.color === "red") {
    colorClass = "text-red-500";
  }

  const [showPopup, setShowPopup] = useState(false);

  let buttonOnclick;
  if (action.onClick) {
    buttonOnclick = action.onClick;
  } else if (action.popup) {
    buttonOnclick = () => setShowPopup((prev) => !prev);
  } else if (action.danger && setRemindDangerAction) {
    buttonOnclick = () => setRemindDangerAction(action);
  }

  const button = (
    <button
      type={action.form ? "submit" : "button"}
      className={`-mx-1 px-4 py-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${colorClass} font-semibold text-sm transition rounded-lg cursor-pointer`}
      onClick={buttonOnclick}
    >
      {action.text}
    </button>
  );

  if (action.danger && setRemindDangerAction) {
    return button;
  } else if (action.link) {
    return <Link to={action.link} target={action.link.startsWith("http") ? "_blank" : undefined}>{button}</Link>;
  } else if (action.form) {
    return (
      <Form method={action.form.method}>
        {action.form.hiddenInputs.map((input) => (
          <input key={input.name} type="hidden" name={input.name} value={input.value} />
        ))}
        {button}
      </Form>
    );
  } else if (action.popup) {
    return (
      <div className="relative">
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
}
