import { ArrowPathIcon, CheckIcon } from "@heroicons/react/24/outline";
import { sanitizeClassName } from "~/prophandlers";

export default function FloatingButton({ state }: { state: "idle" | "submitting" | "loading" }) {
  let icon;
  if (state === "idle") {
    icon = <CheckIcon className="size-4 mr-2" strokeWidth={2} />;
  } else {
    icon = <ArrowPathIcon className="size-4 mr-2 animate-spin" strokeWidth={2} />;
  }

  return (
    <button
      className={sanitizeClassName(`
        m-4 md:m-8 px-4 py-2 fixed bottom-0 right-0 flex items-center
        bg-linear-to-br from-sky-500 to-fuchsia-500 hover:opacity-75 disabled:bg-neutral-300
        text-white shadow-xl rounded-full transition cursor-pointer disabled:cursor-default
      `)}
      disabled={state !== "idle"}
    >
      {icon}
      <span>{state === "idle" ? "저장하기" : "저장중..."}</span>
    </button>
  );
}
