import { MoonIcon } from "@heroicons/react/16/solid";
import { KeyIcon } from "@heroicons/react/24/solid";
import { Link, useLocation, useNavigation, useSearchParams, useSubmit } from "@remix-run/react"
import { startAuthentication } from "@simplewebauthn/browser";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/server/script/deps";
import { useEffect, useState } from "react";
import { Button } from "~/components/atoms/form";
import { toggleDarkMode } from "~/lib/device/index.client";

type HeaderProps = {
  currentUsername: string | null;
};

function SignIn({ close }: { close: () => void }) {
  const navigation = useNavigation();
  const buttonDisabled = (navigation.formAction !== undefined);

  const [error, setError] = useState<string | null>(null);
  const submit = useSubmit();

  const signInWithGoogle = () => {
    submit({ service: "google" }, { action: "/signin", method: "post" });
  };

  const signInWithPasskey = async () => {
    if (!navigator.credentials) {
      setError("Passkey 조회에 실패했어요. 다른 방법으로 로그인해주세요.");
      return;
    }

    const authenticationOptions = await (await fetch("/auth/passkey/signin")).json<PublicKeyCredentialRequestOptionsJSON>();
    let authenticationResponse;
    try {
      authenticationResponse = await startAuthentication({ optionsJSON: authenticationOptions });
    } catch (e) {
      console.error(e);
      setError("Passkey 조회에 실패했어요. 다른 방법으로 로그인해주세요.");
      return;
    }

    submit(JSON.stringify(authenticationResponse), { action: "/auth/passkey/signin", method: "post", encType: "application/json" });
  };

  return (
    <>
      <div className="w-screen h-full min-h-screen top-0 left-0 absolute bg-black bg-opacity-50 z-10" onClick={close} />
      <div className="fixed bottom-0 w-full md:max-w-3xl -mx-4 p-4 md:p-8 bg-white dark:bg-neutral-800 z-20 rounded-t-2xl text-base tracking-normal">
        <div className="mt-4 mb-4 md:mb-8 flex items-center">
          <KeyIcon className="size-6 mr-2" />
          <p className="text-2xl md:text-4xl font-black">로그인</p>
        </div>
        {error && <p className="my-4 text-sm md:text-base text-red-500">{error}</p>}
        <Button className="w-full py-2" type="submit" color="primary" onClick={signInWithGoogle} disabled={buttonDisabled}>
          <p>Google 계정으로 로그인</p>
        </Button>
        <Button className="w-full py-2" type="button" color="black" onClick={signInWithPasskey} disabled={buttonDisabled}>
          <p>Passkey로 로그인</p>
        </Button>
        <p className="my-4 text-sm text-neutral-500 text-center">
          로그인 후 학생 정보, 미래시 계획을 관리해보세요.
        </p>
      </div>
    </>
  );
}

export default function Header({ currentUsername }: HeaderProps) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSignIn, setShowSignIn] = useState(location.pathname === "/signin" || searchParams.get("signin") === "true");
  useEffect(() => {
    if (location.pathname === "/signin" || searchParams.get("signin") === "true") {
      setShowSignIn(true);
    } else {
      setShowSignIn(false);
    }
  }, [location.pathname, searchParams]);

  useEffect(() => {
    if (showSignIn === false && searchParams.get("signin") === "true") {
      setSearchParams((prev) => {
        prev.delete("signin");
        return prev;
      });
    }
  }, [showSignIn]);

  return (
    <div className="mt-8 mb-12 md:my-16">
      <Link to="/" className="hover:opacity-50 transition-opacity">
        <h1 className="my-4 text-4xl md:text-5xl font-ingame">
          <span className="font-bold">몰루</span>로그
        </h1>
      </Link>

      <div
        className="-mt-2 md:mt-0 mb-4 flex font-bold text-yellow-600 dark:text-yellow-500 items-center hover:underline cursor-pointer"
        onClick={() => toggleDarkMode()}
      >
        <MoonIcon className="size-4 mr-1" />
        <p>다크 모드 지원!</p>
      </div>

      <div className="flex gap-x-4 text-lg tracking-tight">
        {currentUsername && (
          <>
            <Link to="/futures" className="cursor-pointer hover:opacity-50 hover:underline transition-opacity">
              <span>미래시</span>
            </Link>
            <Link to="/festivals" className="cursor-pointer hover:opacity-50 hover:underline transition-opacity relative">
              <span>행사</span>
              {/* <div className="absolute -right-2 top-0 size-1.5 rounded-full bg-red-500 animate-pulse" /> */}
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
            <Link to="/festivals" className="cursor-pointer hover:opacity-50 hover:underline transition-opacity relative">
              <span>행사</span>
              {/* <div className="absolute -right-2 top-0 size-1.5 rounded-full bg-red-500 animate-pulse" /> */}
            </Link>
            <div className="cursor-pointer hover:opacity-50 hover:underline transition-opacity" onClick={() => setShowSignIn((prev) => !prev)}>
              <span>로그인 후 내 정보 관리 →</span>
            </div>

            {showSignIn && <SignIn close={() => setShowSignIn(false)} />}
          </>
        )}
      </div>
    </div>
  );
}
