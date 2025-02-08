import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";

type MemoEditorProps = {
  initialText?: string;
  placeholder?: string;
  onUpdate?: (text: string) => void;
};

export default function MemoEditor({ initialText, placeholder, onUpdate }: MemoEditorProps) {
  const [newText, setNewText] = useState<string>();
  useEffect(() => {
    if (!onUpdate || newText === undefined) {
      return;
    }

    const timer = setTimeout(() => { onUpdate(newText); }, 300);
    return () => clearTimeout(timer);
  }, [newText])

  return (
    <div className="flex p-2 my-2 text-sm items-center bg-neutral-100 dark:bg-neutral-900 rounded-lg ">
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
  );
}
