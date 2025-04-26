import { useNavigation, useSubmit, useLocation } from "react-router";
import { startAuthentication } from "@simplewebauthn/browser";
import { useEffect, useState } from "react";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/server/script/deps";
import { Button } from "~/components/atoms/form";
import { useSignIn } from "~/contexts/SignInProvider";

export default function SignInBottomSheet() {
  const navigation = useNavigation();
  const location = useLocation();
  const buttonDisabled = (navigation.formAction !== undefined);

  const [error, setError] = useState<string | null>(null);
  const submit = useSubmit();

  const { isSignInVisible, hideSignIn } = useSignIn();
  const redirectToCookie = `redirectTo=${encodeURIComponent(location.pathname + location.search)}; path=/; max-age=300;`;
  useEffect(() => {
    if (navigation.state === "idle") {
      hideSignIn();
    }
  }, [navigation.state]);

  if (!isSignInVisible) {
    return null;
  }

  const signInWithGoogle = () => {
    document.cookie = redirectToCookie;
    submit({}, { action: "/auth/google/signin", method: "post", encType: "application/json" });
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

    document.cookie = redirectToCookie;
    submit(JSON.stringify(authenticationResponse), { action: "/auth/passkey/signin", method: "post", encType: "application/json" });
  };

  return (
    <>
      <div
        className="w-screen h-full min-h-screen top-0 left-0 fixed bg-black opacity-50 z-40"
        onClick={hideSignIn}
      />
      <div className="fixed bottom-0 w-full md:max-w-3xl mx-auto left-1/2 -translate-x-1/2 p-4 md:p-8 bg-white dark:bg-neutral-800 z-50 rounded-t-2xl">
        <p className="mt-4 mb-4 md:mb-8 text-2xl md:text-4xl font-black">로그인</p>
        {error && <p className="my-4 text-sm md:text-base text-red-500">{error}</p>}
        <Button className="w-full py-2 cursor-pointer" type="submit" color="primary" onClick={signInWithGoogle} disabled={buttonDisabled}>
          <p>Google 계정으로 로그인</p>
        </Button>
        <Button className="w-full py-2 cursor-pointer" type="button" color="black" onClick={signInWithPasskey} disabled={buttonDisabled}>
          <p>Passkey로 로그인</p>
        </Button>
        <p className="my-4 text-sm text-neutral-500 text-center">
          로그인 후 학생 정보, 미래시 계획을 관리해보세요.
        </p>
      </div>
    </>
  );
}
