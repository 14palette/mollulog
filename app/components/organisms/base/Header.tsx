import { MoonIcon } from "@heroicons/react/16/solid";
import { Link, useLocation, useSearchParams, useSubmit } from "@remix-run/react"
import { useEffect, useState } from "react";
import { SignIn } from "~/components/molecules/auth";
import { submitPreference } from "~/routes/api.preference";

type HeaderProps = {
  currentUsername: string | null;
  darkMode: boolean;
  onToggleDarkMode: (darkMode: boolean) => void;
};

export default function Header({ currentUsername, darkMode, onToggleDarkMode }: HeaderProps) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSignIn, setShowSignIn] = useState(searchParams.get("signin") === "true");
  useEffect(() => {
    if (searchParams.get("signin") === "true") {
      setShowSignIn(true);
    } else {
      setShowSignIn(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (showSignIn === false && searchParams.get("signin") === "true") {
      setSearchParams((prev) => {
        prev.delete("signin");
        return prev;
      }, { preventScrollReset: true });
    }
  }, [showSignIn]);

  const submit = useSubmit();

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

          {currentUsername === null && location.pathname !== "/signin" && (
            <>
              <Link to="/futures" className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
                <span>미래시</span>
              </Link>
              <div className="cursor-pointer hover:opacity-50 hover:underline transition-opacity" onClick={() => setShowSignIn((prev) => !prev)}>
                <span>로그인 후 내 정보 관리 →</span>
              </div>

              {showSignIn && (
                <>
                  <div className="w-screen h-full min-h-screen top-0 left-0 fixed bg-black opacity-50 z-40" onClick={() => setShowSignIn(false)} />
                  <div className="fixed bottom-0 w-full md:max-w-3xl -mx-4 p-4 md:p-8 bg-white dark:bg-neutral-800 z-50 rounded-t-2xl text-base tracking-normal">
                    <SignIn />
                  </div>
                </>
              )}
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
