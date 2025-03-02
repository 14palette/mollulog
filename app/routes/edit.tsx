import { Link, Outlet, useMatches } from "@remix-run/react";
import { DocumentDuplicateIcon, KeyIcon, Squares2X2Icon, UserCircleIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";

const navigations = [
  { title: "프로필", to: "/edit/profile", icon: UserCircleIcon },
  { title: "학생 명부", to: "/edit/students", icon: UsersIcon },
  { title: "모집 이력", to: "/edit/pickups", icon: DocumentDuplicateIcon },
  { title: "편성/공략", to: "/edit/parties", icon: Squares2X2Icon },
  { title: "인증/보안", to: "/edit/security", icon: KeyIcon },
];

export default function Edit() {
  const matches = useMatches();
  const pathname = matches[matches.length - 1].pathname;

  useEffect(() => {
    const content = document?.getElementById("edit-page-contents");
    content?.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="w-screen flex flex-col sm:flex-row">
      {/* Sidebar */}
      <div className="sm:h-screen w-full sm:w-48 md:w-64 shrink-0 bg-linear-to-br from-blue-500 to-violet-500 text-white shadow-inner sticky top-0 z-10">
        <div className="m-4 md:m-6 flex items-center">
          <Link to="/">
            <h1 className="hover:opacity-50 transition-opacity text-xl sm:text-2xl font-ingame">
              <span className="font-bold">몰루</span>로그
            </h1>
          </Link>
        </div>

        <div className="w-full my-2 px-4 grid grid-cols-5 sm:grid-cols-1">
          {navigations.map(({ title, to, icon: Icon }) => (
            <Link to={to} key={to}>
              <div className={pathname.startsWith(to) ?
                "flex flex-col sm:flex-row justify-center sm:justify-start items-center sm:my-1 sm:-mr-6 sm:px-4 py-2 bg-white dark:bg-neutral-800 rounded-lg sm:rounded-r-none sm:rounded-l-lg text-blue-700 dark:text-neutral-200 font-bold" :
                "flex flex-col sm:flex-row justify-center sm:justify-start items-center sm:my-1 sm:px-4 py-2 hover:bg-blue-400 rounded-lg transition"
              }>
                <Icon className="size-5 sm:mr-2" strokeWidth={2} />
                <p className="mt-1 sm:mt-0 text-xs md:text-base">{title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Contents */}
      <div className="md:h-screen grow px-4 md:px-8 py-4 overflow-scroll" id="edit-page-contents">
        <Outlet />
      </div>
    </div>
  );
}
