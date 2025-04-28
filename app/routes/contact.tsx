import dayjs from "dayjs";
import { useLoaderData, useFetcher, useRouteError, isRouteErrorResponse } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useState, useEffect } from "react";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/20/solid";
import { Title } from "~/components/atoms/typography";
import { sanitizeClassName } from "~/prophandlers";
import { useSignIn } from "~/contexts/SignInProvider";
import { getAuthenticator } from "~/auth/authenticator.server";
import { ErrorPage } from "~/components/organisms/error";
import { Env } from "~/env.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const sensei = await getAuthenticator(context.cloudflare.env).isAuthenticated(request);
  return {
    signedIn: sensei !== null,
  }
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const sensei = await getAuthenticator(context.cloudflare.env).isAuthenticated(request);
  if (sensei === null) {
    throw new Response(
      JSON.stringify({ error: { message: "로그인이 필요해요." } }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Check if we have a valid email route in KV storage
  const env = context.cloudflare.env as Env;
  const userEmailRouteKey = `email-route:user:${sensei.id}`;
  const storedRoute = await env.KV_USERDATA.get<{ address: string, expireAt: number }>(userEmailRouteKey, "json");
  const now = Math.floor(Date.now());
  if (storedRoute && storedRoute.expireAt > now) {
    return storedRoute;
  }

  // Generate a new email route
  const routeResponse = await fetch(`${env.EMAIL_ROUTE_HOST}/generate`, {
    method: "POST",
    body: JSON.stringify({ domain: "mollulog.net", destination: env.EMAIL_ROUTE_DESTINATION }),
    headers: {
      "X-Api-Key": env.EMAIL_ROUTE_API_KEY,
      "Content-Type": "application/json",
    }
  });

  if (!routeResponse.ok) {
    console.error("Error generating email address:", await routeResponse.text());
    throw new Response(
      JSON.stringify({ error: { message: "이메일 주소 생성 중 오류가 발생했어요. 잠시 후 다시 시도해주세요." } }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const route = await routeResponse.json<{ address: string, expireAt: number }>();
  const expirationTtl = Math.max(0, route.expireAt - now) / 1000;
  await env.KV_USERDATA.put(userEmailRouteKey, JSON.stringify(route), { expirationTtl });
  return route;
};

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorPage message={error.data.error.message} />;
  } else {
    return <ErrorPage />;
  }
}

type ContactInfo = {
  address: string;
  expireAt: number;
};

export default function Contact() {
  const { signedIn } = useLoaderData<typeof loader>();
  const { showSignIn } = useSignIn();
  const [copied, setCopied] = useState(false);

  const fetcher = useFetcher<ContactInfo>();
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <>
      <Title text="제안/문의" />
      <p className="text-neutral-500 dark:text-neutral-400 -mt-2 mb-4">
        컨텐츠 제안, 오류 신고, 기타 문의 사항이 있다면 아래 이메일 주소로 연락해주세요.
      </p>

      {fetcher.data ? (
        <>
          <div className="my-4 p-4 flex bg-neutral-100 dark:bg-neutral-900 rounded-lg">
            <div className="grow">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">이메일 주소</p>
              <p className="text-lg xl:text-xl">{fetcher.data.address}</p>
            </div>
            <div
              className={sanitizeClassName(`
                px-2 -mr-2 xl:mr-0 flex items-center justify-center rounded-md cursor-pointer transition-all duration-300
                ${copied ? "bg-green-600 text-white" : "text-neutral-500 dark:text-neutral-400"}
              `)}
              onClick={() => {
                if (fetcher.data) {
                  navigator.clipboard.writeText(fetcher.data.address);
                  setCopied(true);
                }
              }}
            >
              {copied ? <CheckCircleIcon className="size-6" /> : <ClipboardDocumentIcon className="size-6" />}
              <span className="ml-1">복사</span>
            </div>
          </div>
          <p>위 주소는 {dayjs(fetcher.data.expireAt).format("YYYY-MM-DD HH:mm:ss")} 까지 유효합니다.</p>
        </>
      ) : (
        <div
          className="my-4 p-4 flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-all"
          onClick={() => {
            if (!signedIn) {
              showSignIn();
            } else if (fetcher.state === "idle") {
              fetcher.submit(null, { method: "POST" });
            }
          }}
        >
          <div className="grow">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">이메일 주소</p>
            <p className="text-lg xl:text-xl">눌러서 확인하기</p>
          </div>
          {fetcher.state === "submitting" && <ArrowPathIcon className="size-6 animate-spin" />}
        </div>
      )}
    </>
  );
}
