import { LockClosedIcon, LockOpenIcon, CheckIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { Memo } from "~/components/atoms/content";

type ContentMemoEditorProps = {
  allMemos: {
    uid: string;
    body: string;
    visibility: "private" | "public";
    sensei: {
      username: string;
      profileStudentId: string | null;
    };
  }[];
  myMemo?: {
    body: string;
    visibility: "private" | "public";
  };

  placeholder?: string;
  onUpdate: ({ body, visibility }: { body: string, visibility: "private" | "public" }) => void;
};

export default function ContentMemoEditor({ allMemos, myMemo, placeholder, onUpdate }: ContentMemoEditorProps) {
  const [body, setBody] = useState<string | undefined>(myMemo?.body || undefined);
  const [visibility, setVisibility] = useState(myMemo?.visibility || "private");

  return (
    <>
      <div className="flex-1 py-2 overflow-y-auto no-scrollbar">
        <div className="space-y-4 mb-4">
          {allMemos.length > 0 ?
            allMemos.map((memo) => <Memo key={memo.uid} body={memo.body} visibility={memo.visibility} sensei={memo.sensei} />) :
            <p className="my-16 text-center text-neutral-500 dark:text-neutral-400">공개된 메모가 없어요</p>
          }
        </div>
      </div>
      <div className="shrink-0">
        <div className="flex gap-x-2">
          <div
            className="flex items-center px-3 py-2 shrink-0 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-neutral-500 dark:text-neutral-400 cursor-pointer transition hover:bg-neutral-200 dark:hover:bg-neutral-800"
            onClick={() => {
              setVisibility((prev) => {
                const newVisibility = prev === "private" ? "public" : "private";
                body && onUpdate({ body, visibility: newVisibility });
                return newVisibility;
              });
            }}
          >
            {visibility === "private" ? <LockClosedIcon className="size-4" /> : <LockOpenIcon className="size-4" />}
            <span className="ml-1 text-sm">
              {visibility === "private" ? "나만 보기" : "전체 공개"}
            </span>
          </div>
          <input
            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg"
            placeholder={placeholder ?? "메모를 남겨보세요"}
            value={body}
            onChange={(e) => setBody(e.target.value || undefined)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onUpdate({ body: body ?? "", visibility: visibility ?? "private" });
              }
            }}
            autoFocus
          />
          <div
            className="px-3 flex items-center shrink-0 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition text-white rounded-lg cursor-pointer"
            onClick={() => onUpdate({ body: body ?? "", visibility: visibility ?? "private" })}
          >
            <CheckIcon className="size-4" />
          </div>
        </div>
      </div>
    </>
  );
}
