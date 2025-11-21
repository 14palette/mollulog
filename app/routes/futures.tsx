import { useState } from "react";
import { LoaderFunctionArgs, Outlet, useLoaderData, useLocation } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { Title } from "~/components/atoms/typography";
import { ScreenSelector } from "~/components/navigation";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  const signedIn = currentUser !== null;
  return {
    signedIn,
  };
};

export default function Futures() {
  const { signedIn } = useLoaderData<typeof loader>();
  const location = useLocation();

  const [panel, setPanel] = useState<React.ReactNode | null>(null);

  return (
    <div className="flex flex-col xl:flex-row">
      <div className="w-full xl:h-screen xl:max-w-sm xl:mr-8 xl:sticky xl:top-6 xl:self-start xl:overflow-y-scroll">
        <Title
          text="미래시"
          description="컨텐츠 일정은 일본 서버를 바탕으로 추정된 것으로 실제 일정과 다를 수 있어요"
        />
        <div className="-mt-4">
          <ScreenSelector
            screens={[
              {
                text: "미래시 타임라인",
                description: "컨텐츠 예상 일정을 확인해보세요",
                active: location.pathname === "/futures",
                link: "/futures",
              },
              {
                text: "청휘석 플래너 (베타)",
                description: "관심 학생을 픽업하기 위해 필요한 청휘석을 계산해보세요",
                active: location.pathname === "/futures/pyroxene",
                link: "/futures/pyroxene",
                disabled: !signedIn,
              }
            ]}
          />
          {panel}
        </div>
      </div>

      <div className="grow mt-4 xl:mt-0 md:p-4 max-w-3xl">
        <Outlet context={{ setPanel }} />
      </div>
    </div>
  );
}
