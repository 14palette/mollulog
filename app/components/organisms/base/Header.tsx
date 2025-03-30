import { MoonIcon } from "@heroicons/react/16/solid";
import { Link, useSubmit } from "@remix-run/react"
import { useEffect } from "react";
import { useSignIn } from "~/contexts/SignInProvider";
import { submitPreference } from "~/routes/api.preference";

type HeaderProps = {
  currentUsername: string | null;
  darkMode: boolean;
  onToggleDarkMode: (darkMode: boolean) => void;
};

export default function Header({ currentUsername, darkMode, onToggleDarkMode }: HeaderProps) {
  const { showSignIn, hideSignIn } = useSignIn();
  const submit = useSubmit();

  useEffect(() => {
    if (currentUsername) {
      hideSignIn();
    }
  }, [currentUsername, hideSignIn]);

  return (
    <div className="mt-4 mb-12 md:my-16 flex items-end">
      <div className="grow">
        <Link to="/" className="hover:opacity-50 transition-opacity">
          <h1 className="mt-4 text-4xl md:text-5xl font-ingame">
            <span className="font-bold">몰루</span>로그
          </h1>
        </Link>

        <div className="flex mt-4 gap-x-4 text-lg tracking-tight">
          {currentUsername && (
            <>
              <Link to="/" className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
                <span>홈</span>
              </Link>
              <Link to="/futures" className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
                <span>미래시</span>
              </Link>
              <Link to={`/@${currentUsername}`} className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
                <span>내 정보</span>
              </Link>
              <Link to={`/edit/profile`} className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
                <span>프로필 관리</span>
              </Link>
            </>
          )}

          {currentUsername === null && (
            <>
              <Link to="/futures" className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
                <span>미래시</span>
              </Link>
              <div className="cursor-pointer hover:opacity-50 hover:underline transition-opacity" onClick={() => showSignIn()}>
                <span>로그인 후 내 정보 관리 →</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className="py-1 flex font-bold text-yellow-600 dark:text-yellow-500 items-center hover:underline cursor-pointer"
        onClick={() => {
          onToggleDarkMode(!darkMode);
          submitPreference(submit, { darkMode: !darkMode });
        }}
      >
        <MoonIcon className="size-4 mr-1" />
        <span>다크 모드</span>
      </div>
    </div>
  );
}
