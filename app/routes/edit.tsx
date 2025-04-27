import { Outlet, useMatches } from "react-router";
import { DocumentDuplicateIcon, KeyIcon, Squares2X2Icon, UserCircleIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { Navigation } from "~/components/organisms/navigation";
import { Title } from "~/components/atoms/typography";

const navigations = [
  { text: "프로필", to: "/edit/profile", icon: UserCircleIcon },
  { text: "학생 명부", to: "/edit/students", icon: UsersIcon },
  { text: "모집 이력", to: "/edit/pickups", icon: DocumentDuplicateIcon },
  { text: "편성/공략", to: "/edit/parties", icon: Squares2X2Icon },
  { text: "인증/보안", to: "/edit/security", icon: KeyIcon },
];

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
      <Outlet />
    </>
  );
}
