import { KeyIcon } from "@heroicons/react/24/outline";
import { useNavigation, useSubmit } from "@remix-run/react";
import { startAuthentication } from "@simplewebauthn/browser";
import { useState } from "react";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/server/script/deps";
import { Button } from "~/components/atoms/form";

export default function SignIn() {
  const navigation = useNavigation();
  const buttonDisabled = (navigation.formAction !== undefined);

  const [error, setError] = useState<string | null>(null);
  const submit = useSubmit();

  const signInWithGoogle = () => {
    submit({}, { action: "/signin", method: "post", encType: "application/json" });
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
    </>
  );
}
