import { Link } from "react-router";
import { ProfileImage } from "../student";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/16/solid";

type MemoProps = {
  body: string;
  visibility: "private" | "public";
  sensei: {
    username: string;
    profileStudentId: string | null;
  };
};

export default function Memo({ body, visibility, sensei }: MemoProps) {
  return (
    <div className="mb-2 flex gap-x-2 items-center">
      <Link to={`/@${sensei.username}`} className="shrink-0">
        <ProfileImage studentUid={sensei.profileStudentId} imageSize={8} />
      </Link>
      <div className="flex-1">
        <div className="flex items-center gap-x-1">
          <Link to={`/@${sensei.username}`} className="hover:underline">
            <span className="text-sm font-bold">@{sensei.username}</span>
          </Link>
          {visibility === "private" && <LockClosedIcon className="size-4 mb-0.5" />}
        </div>
        <p className="mt-0.5 text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
          {body}
        </p>
      </div>
    </div>
  );
}
