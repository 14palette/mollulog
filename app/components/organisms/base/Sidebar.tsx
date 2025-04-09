import { MoonIcon } from "@heroicons/react/16/solid";
import {
  HomeIcon as HomeIconOutline,
  CalendarIcon as CalendarIconOutline,
  UserCircleIcon as UserCircleIconOutline,
  PencilSquareIcon as PencilSquareIconOutline,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  CalendarIcon as CalendarIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  PencilSquareIcon as PencilSquareIconSolid,
} from "@heroicons/react/24/solid";
import { Link, useMatches, useSubmit } from "@remix-run/react";
import { useSignIn } from "~/contexts/SignInProvider";
import { sanitizeClassName } from "~/prophandlers";
import { submitPreference } from "~/routes/api.preference";

interface MenuItemProps {
  to: string;
  name: string;
  OutlineIcon: React.ComponentType<React.ComponentProps<"svg">>;
  SolidIcon: React.ComponentType<React.ComponentProps<"svg">>;
  isActive: boolean;
}

function MenuItem({ to, name, OutlineIcon, SolidIcon, isActive }: MenuItemProps) {
  return (
    <Link
      to={to}
      className={sanitizeClassName(`my-2 p-2 flex items-center hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition ${isActive ? "font-bold" : ""}`)}
    >
      {isActive ? <SolidIcon className="inline-block mr-3 size-6" /> : <OutlineIcon className="inline-block mr-3 size-6" />}
      <span className="text-lg">{name}</span>
    </Link>
  );
}

type SidebarProps = {
  currentUsername: string | null;
  setDarkMode: (fn: (prev: boolean) => boolean) => void;
};

export default function Sidebar({ currentUsername, setDarkMode }: SidebarProps) {
  const matches = useMatches();
  const pathname = matches[matches.length - 1].pathname;

  const submit = useSubmit();
  const { showSignIn } = useSignIn();

  return (
    <div>
      <Link to="/" className="hover:opacity-50 transition-opacity">
        <h1 className="mt-4 px-2 text-2xl md:text-3xl font-ingame">
          <span className="font-bold">몰루</span>로그
        </h1>
      </Link>
      <div className="mt-6">
        <MenuItem
          to="/"
          name="홈"
          OutlineIcon={HomeIconOutline}
          SolidIcon={HomeIconSolid}
          isActive={pathname === "/"}
        />
        <MenuItem
          to="/futures"
          name="미래시"
          OutlineIcon={CalendarIconOutline}
          SolidIcon={CalendarIconSolid}
          isActive={pathname.startsWith("/futures") || pathname.startsWith("/events") || pathname.startsWith("/raids")}
        />
        {currentUsername ? (
          <>
            <MenuItem
              to={`/@${currentUsername}`}
              name="내 정보"
              OutlineIcon={UserCircleIconOutline}
              SolidIcon={UserCircleIconSolid}
              isActive={pathname.startsWith("/@")}
            />
            <MenuItem
              to="/edit/profile"
              name="프로필 관리"
              OutlineIcon={PencilSquareIconOutline}
              SolidIcon={PencilSquareIconSolid}
              isActive={pathname.startsWith("/edit")}
            />
          </>
        ) : (
          <div
            className="w-full my-4 py-3 bg-neutral-800 dark:bg-neutral-200 text-white text-center rounded-full hover:opacity-50 transition-opacity cursor-pointer"
            onClick={() => showSignIn()}
          >
            로그인 후 내 정보 관리
          </div>
        )}

        <div
          className="w-fit my-6 py-1 px-2 flex items-center font-bold text-yellow-600 dark:text-yellow-400 cursor-pointer"
          onClick={() => {
            setDarkMode((prev) => {
              submitPreference(submit, { darkMode: !prev });
              return !prev;
            });
          }}
        >
          <MoonIcon className="size-4" />
          <span className="ml-2">다크 모드</span>
        </div>
      </div>
    </div>
  );
}
