import { Outlet, useMatches, useRouteError, isRouteErrorResponse, Link } from "react-router";
import { DocumentDuplicateIcon, KeyIcon, Squares2X2Icon, UserCircleIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { Navigation } from "~/components/organisms/navigation";
import { Callout, Title } from "~/components/atoms/typography";
import { ErrorPage } from "~/components/organisms/error";
import { Button } from "~/components/atoms/form";

const navigations = [
  { text: "프로필", to: "/edit/profile", icon: UserCircleIcon },
  { text: "인증/보안", to: "/edit/security", icon: KeyIcon },
];

export const ErrorBoundary = () => {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorPage message={error.data.error.message} />;
  } else {
    return <ErrorPage />;
  }
};

export default function Edit() {
  const matches = useMatches();
  const pathname = matches[matches.length - 1].pathname;

  useEffect(() => {
    const content = document?.getElementById("edit-page-contents");
    content?.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <>
      <Title text="프로필 관리" />
      <Navigation links={navigations} />
      <Callout emoji="🚚" className="mb-8">
        <p>
          이제 학생 명부, 모집 이력, 편성/공략 정보는 내 정보 페이지에서 수정할 수 있어요.<br/>
          <Link to="/my?path=students" className="text-blue-500 underline">
            내 정보 페이지로 →
          </Link>
        </p>
      </Callout>
      <Outlet />
    </>
  );
}
