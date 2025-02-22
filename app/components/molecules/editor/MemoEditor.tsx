import { ChatBubbleOvalLeftEllipsisIcon, LockClosedIcon, LockOpenIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";

type MemoEditorProps = {
  initialText?: string;
  placeholder?: string;
  onUpdate?: (text: string) => void;

  initialVisibility?: "private" | "public";
  onVisibilityChange?: (visibility: "private" | "public") => void;
};

export default function MemoEditor({ initialText, placeholder, onUpdate, initialVisibility, onVisibilityChange }: MemoEditorProps) {
  const [newText, setNewText] = useState<string>();
  useEffect(() => {
    if (!onUpdate || newText === undefined) {
      return;
    }

    const timer = setTimeout(() => { onUpdate(newText); }, 300);
    return () => clearTimeout(timer);
  }, [newText])

  const [visibility, setVisibility] = useState(initialVisibility);

  return (
    <div className="flex my-2">
      <div className="flex grow p-2 text-sm items-center bg-neutral-100 dark:bg-neutral-900 rounded-lg ">
        <div className="text-neutral-500">
          <ChatBubbleOvalLeftEllipsisIcon className="mr-2 w-4 h-4" />
        </div>
        <input
          className="flex-grow bg-neutral-100 dark:bg-neutral-900"
          placeholder={placeholder ?? "메모를 남겨보세요"}
          defaultValue={initialText}
          disabled={!onUpdate}
          onKeyUp={onUpdate ? (e) => setNewText(e.currentTarget.value) : undefined}
        />
      </div>

      {onVisibilityChange && (
        <div
          className="ml-2 flex px-2 items-center text-neutral-500 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-700 cursor-pointer transition rounded-lg"
          onClick={() => {
            const newVisibility = visibility === "private" ? "public" : "private";
            setVisibility(newVisibility);
            onVisibilityChange(newVisibility);
          }}
        >
          {visibility === "private" ? 
            <div className="flex items-center">
              <LockClosedIcon className="size-4" />
              <span className="ml-1 text-sm">비공개</span>
            </div> :
            <div className="flex items-center">
              <LockOpenIcon className="size-4" />
              <span className="ml-1 text-sm">공개</span>
            </div>
          }
        </div>
      )}
    </div>
  );
}
