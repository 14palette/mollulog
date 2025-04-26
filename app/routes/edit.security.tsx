import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, redirect } from "react-router";
import { Form, Link, useLoaderData, useRevalidator } from "react-router";
import { startRegistration } from "@simplewebauthn/browser";
import { useState } from "react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { SubTitle } from "~/components/atoms/typography";
import { deletePasskey, getPasskeysBySensei, updatePasskeyMemo } from "~/models/passkey";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { KeyIcon, PlusIcon } from "@heroicons/react/24/outline";
import ActionCard from "~/components/molecules/editor/ActionCard";
import { Button, Input } from "~/components/atoms/form";

dayjs.extend(utc);
dayjs.extend(timezone);

export const meta: MetaFunction = () => [
  { title: "인증/보안 | 몰루로그" },
];

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }
  return { passkeys: await getPasskeysBySensei(env, sensei) };
}

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/unauthorized");
  }

  const body = new URLSearchParams(await request.text())
  const uid = body.get("uid")!;
  if (request.method === "PATCH") {
    const memo = body.get("memo")!;
    await updatePasskeyMemo(env, sensei, uid, memo);
  } else if (request.method === "DELETE") {
    await deletePasskey(env, sensei, uid);
  } else {
    return new Response(null, { status: 405 });
  }

  return redirect("/edit/security");
};

type PasskeyCardProps = {
  uid: string;
  memo: string;
  createdAt: string;
};

function PasskeyCard({ uid, memo, createdAt }: PasskeyCardProps) {
  return (
    <ActionCard
      actions={[
        { text: "이름 바꾸기", color: "default", popup: (close) => (
          <Form method="patch" onSubmit={close}>
            <input type="hidden" name="uid" value={uid} />
            <div>
              <Input name="memo" placeholder="이름" defaultValue={memo} />
            </div>
            <div className="flex gap-x-2">
              <Button type="submit" color="primary" className="grow">변경</Button>
              <Button onClick={close}>취소</Button>
            </div>
          </Form>
        ) },
        { text: "삭제", color: "red", form: { method: "delete", hiddenInputs: [{ name: "uid", value: uid }] } },
      ]}
    >
      <div className="flex items-center">
        <KeyIcon className="mr-3 size-6" strokeWidth={2} />
        <div>
          <p>{memo}</p>
          <p className="text-sm text-neutral-500">
            {dayjs.tz(createdAt, "utc").tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")}
          </p>
        </div>
      </div>
    </ActionCard>
  );
}

export default function EditSecurity() {
  const { passkeys } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const [error, setError] = useState<string | null>(null);

  const addPasskey = async () => {
    const creationOptions = await fetch("/auth/passkey/register");
    const creationResponse = await startRegistration({ optionsJSON: await creationOptions.json() });

    const creationResult = await fetch("/auth/passkey/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creationResponse),
    });

    if (!creationResult.ok) {
      setError("Passkey 추가에 실패했습니다.");
      return;
    }

    revalidator.revalidate();
  };

  return (
    <>
      <SubTitle text="Passkey 관리" />
      <Button onClick={addPasskey} Icon={PlusIcon} text="Passkey 추가" />

      {error && <p className="my-4 text-red-500">{error}</p>}
      <div className="max-w-4xl">
        {passkeys.map((passkey) => <PasskeyCard key={passkey.uid} {...passkey} />)}
      </div>

      <Link to="/signout">
        <Button color="red">로그아웃</Button>
      </Link>
    </>
  );
}
