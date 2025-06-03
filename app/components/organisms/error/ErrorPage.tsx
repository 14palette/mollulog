import { ExclamationCircleIcon } from "@heroicons/react/16/solid";
import { Link } from "react-router";

type ErrorPageProps = {
  Icon?: typeof ExclamationCircleIcon;
  message?: string;
};

export default function ErrorPage({ Icon, message }: ErrorPageProps) {
  const ShowingIcon = Icon ?? ExclamationCircleIcon;
  return (
    <div className="my-16 md:my-48 w-full flex flex-col items-center justify-center">
      <ShowingIcon className="my-2 w-16 h-16" strokeWidth={2} />
      <p className="my-2 text-2xl font-bold">{message ?? "알 수 없는 오류가 발생했어요"}</p>

      <div className="my-4 flex gap-2">
        <Link to="/" className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
          첫 화면으로
        </Link>
        <div className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors" onClick={() => window.location.reload()}>
          새로고침
        </div>
      </div>
    </div>
  )
}
