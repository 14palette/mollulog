import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/16/solid";

type ContentMemoViewProps = {
  allMemos?: {
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

  onClick?: () => void;
}

export default function ContentMemoView({ allMemos, myMemo, onClick }: ContentMemoViewProps) {
  return (
    <div
      className="w-full p-2 flex items-center gap-x-1 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-sm cursor-pointer transition"
      onClick={onClick}
    >
      <ChatBubbleOvalLeftEllipsisIcon className="shrink-0 size-4 text-neutral-500 dark:text-neutral-400" />
      {allMemos?.length !== undefined && <span className="text-neutral-500 dark:text-neutral-400">{allMemos.length}</span>}
      <p className={`ml-1 pl-2 border-l border-neutral-200 dark:border-neutral-700 grow ${myMemo?.body ? "" : "text-neutral-400 dark:text-neutral-600"}`}>
        {myMemo?.body || "메모를 남겨보세요"}
      </p>
    </div>
  );
}
