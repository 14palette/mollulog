import { UserIcon, UserMinusIcon, UserPlusIcon, UsersIcon } from "@heroicons/react/20/solid";
import { Link } from "@remix-run/react";
import { sanitizeClassName } from "~/prophandlers";

type ProfileUsernameProps = {
  imageUrl: string | null;
  username: string;
  friendCode: string | null;
  loading?: boolean;
  followability?: "followable" | "following" | "unable";
  following?: number;
  followers?: number;
  onFollow?: () => void;
  onUnfollow?: () => void;
};

export default function ProfileUsername({
  imageUrl, username, friendCode, loading, followability, followers, following, onFollow, onUnfollow,
}: ProfileUsernameProps) {
  return (
    <div className="m-4 md:m-6 flex items-center">
      {imageUrl ?
        <img className="size-12 md:w-16 md:h-16 rounded-full object-cover" src={imageUrl ?? ""} alt={`${username}의 프로필`} /> :
        (
          <div className="size-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
            <UserIcon className="size-8" />
          </div>
        )
      }
      <div className="ml-2 md:ml-4 grow">
        <p className="font-bold text-lg md:text-xl">@{username}</p>
        {followers !== undefined && following !== undefined && (
          <p className="text-sm">
            <Link to={`/@${username}/friends?tab=following`} className="hover:underline mr-2">
              {following} <span className="text-neutral-500 dark:text-neutral-400">팔로잉</span>
            </Link>
            <Link to={`/@${username}/friends?tab=following`} className="hover:underline mr-2">
              {followers} <span className="text-neutral-500 dark:text-neutral-400">팔로워</span>
            </Link>
          </p>
        )}
        {friendCode && (
          <p className="text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">친구 코드 </span>
            <span>{friendCode}</span>
          </p>
        )}
      </div>
      {(followability === "followable" && onFollow) && (
        <button
          type="button"
          className={sanitizeClassName(`
            px-4 py-2 flex items-center text-white border border-neutral-900 bg-neutral-900 rounded-full transition
            disabled:opacity-50 hover:bg-neutral-700
          `)}
          onClick={onFollow}
          disabled={loading}
        >
          <UserPlusIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">팔로우</span>
        </button>
      )}
      {(followability === "following" && onUnfollow) && (
        <button
          type="button"
          className={sanitizeClassName(`
            px-4 py-2 flex items-center border border-neutral-900 dark:border-neutral-700 rounded-full transition group
            disabled:opacity-50 dark:bg-neutral-900 hover:border-red-500 hover:bg-red-500 hover:text-white
          `)}
          onClick={onUnfollow}
          disabled={loading}
        >
          <UsersIcon className="h-4 w-4 mr-1 block group-hover:hidden" />
          <span className="text-sm block group-hover:hidden">팔로우 중</span>
          <UserMinusIcon className="h-4 w-4 mr-1 hidden group-hover:block" />
          <span className="text-sm hidden group-hover:block">팔로우 해제</span>
        </button>
      )}
    </div>
  );
}
