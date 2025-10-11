import { MoonIcon, EnvelopeIcon, MegaphoneIcon } from "@heroicons/react/16/solid";
import {
  HomeIcon as HomeIconOutline,
  CalendarIcon as CalendarIconOutline,
  UserCircleIcon as UserCircleIconOutline,
  IdentificationIcon as IdentificationIconOutline,
  FireIcon as FireIconOutline,
  Bars3Icon,
  HeartIcon as HeartIconOutline,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  CalendarIcon as CalendarIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  IdentificationIcon as IdentificationIconSolid,
  FireIcon as FireIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import { Transition } from "@headlessui/react";
import { Link, useMatches, useSubmit } from "react-router";
import { useState } from "react";
import { useSignIn } from "~/contexts/SignInProvider";
import { sanitizeClassName } from "~/prophandlers";
import { submitPreference } from "~/routes/api.preference";
import { Banner } from "~/components/atoms/notification";

interface MenuItemProps {
  to: string;
  name: string;
  OutlineIcon: React.ComponentType<React.ComponentProps<"svg">>;
  SolidIcon: React.ComponentType<React.ComponentProps<"svg">>;
  isActive: boolean;
  onItemClick?: () => void;
  showRedDot?: boolean;
}

function MenuItem({ to, name, OutlineIcon, SolidIcon, isActive, onItemClick, showRedDot }: MenuItemProps) {
  return (
    <Link
      to={to}
      className={sanitizeClassName(`my-2 px-2 py-1.5 xl:py-2 flex items-center hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition relative ${isActive ? "font-bold drop-shadow-lg" : ""}`)}
      onClick={() => onItemClick?.()}
    >
      {isActive ? <SolidIcon className="inline-block mr-3 size-6" /> : <OutlineIcon className="inline-block mr-3 size-6" />}
      <span className="text-lg relative">
        {name}
        {showRedDot && (
          <div className="absolute top-0 -right-3 size-1.5 bg-red-500 rounded-full animate-pulse" />
        )}
      </span>
    </Link>
  );
}

interface MenuContentProps {
  currentUsername: string | null;
  pathname: string;
  onMenuClose: () => void;
  onShowSignIn: () => void;
  onDarkModeToggle: (fn: (prev: boolean) => boolean) => void;
  hasRecentNews: boolean;
}

function MenuContent({ currentUsername, pathname, onMenuClose, onShowSignIn, onDarkModeToggle, hasRecentNews }: MenuContentProps) {
  const submit = useSubmit();

  return (
    <>
      <MenuItem
        to="/"
        name="홈"
        OutlineIcon={HomeIconOutline}
        SolidIcon={HomeIconSolid}
        isActive={pathname === "/"}
        onItemClick={onMenuClose}
      />
      <MenuItem
        to="/futures"
        name="미래시"
        OutlineIcon={CalendarIconOutline}
        SolidIcon={CalendarIconSolid}
        isActive={pathname.startsWith("/futures") || pathname.startsWith("/events")}
        onItemClick={onMenuClose}
      />
      <MenuItem
        to="/raids"
        name="총력전 / 대결전"
        OutlineIcon={FireIconOutline}
        SolidIcon={FireIconSolid}
        isActive={pathname.startsWith("/raids")}
        onItemClick={onMenuClose}
      />
      <MenuItem
        to="/students"
        name="학생부"
        OutlineIcon={IdentificationIconOutline}
        SolidIcon={IdentificationIconSolid}
        isActive={pathname.startsWith("/students")}
        onItemClick={onMenuClose}
      />
      <MenuItem
        to="/utils/relationship"
        name="인연 랭크 계산기"
        OutlineIcon={HeartIconOutline}
        SolidIcon={HeartIconSolid}
        isActive={pathname.startsWith("/utils/relationship")}
        onItemClick={onMenuClose}
        showRedDot
      />
      {currentUsername ? (
        <MenuItem
          to={`/@${currentUsername}`}
          name="내 정보"
          OutlineIcon={UserCircleIconOutline}
          SolidIcon={UserCircleIconSolid}
          isActive={pathname.startsWith("/@") || pathname.startsWith("/edit")}
          onItemClick={onMenuClose}
        />
      ) : (
        <div
          className="w-full my-4 py-3 bg-neutral-800 dark:bg-neutral-100 text-white dark:text-neutral-900 text-center rounded-full hover:opacity-50 transition-opacity cursor-pointer"
          onClick={() => {
            onShowSignIn();
            onMenuClose();
          }}
        >
          로그인 후 내 정보 관리
        </div>
      )}

      <div className="py-2" />

      <Link
        to="/news"
        className="w-fit my-1.5 py-1 px-2 flex items-center text-neutral-500 dark:text-neutral-400 cursor-pointer hover:underline relative"
        onClick={onMenuClose}
      >
        <MegaphoneIcon className="size-4" />
        <span className="ml-2">업데이트 소식</span>
        {hasRecentNews && (
          <div className="absolute top-1 -right-1 size-1.5 bg-red-500 rounded-full animate-pulse" />
        )}
      </Link>
      {currentUsername && (
        <Link
          to="/contact"
          className="w-fit my-1.5 py-1 px-2 flex items-center text-neutral-500 dark:text-neutral-400 cursor-pointer hover:underline"
          onClick={onMenuClose}
        >
          <EnvelopeIcon className="size-4" />
          <span className="ml-2">제안/문의</span>
        </Link>
      )}
      <div
        className="w-fit my-1.5 py-1 px-2 font-bold flex items-center text-yellow-600 dark:text-yellow-400 cursor-pointer hover:underline"
        onClick={() => {
          onDarkModeToggle((prev) => {
            submitPreference(submit, { darkMode: !prev });
            return !prev;
          });
        }}
      >
        <MoonIcon className="size-4" />
        <span className="ml-2">다크 모드</span>
      </div>
    </>
  );
}

type SidebarProps = {
  currentUsername: string | null;
  darkMode: boolean;
  setDarkMode: (fn: (prev: boolean) => boolean) => void;
  hasRecentNews: boolean;
  banner: {
    message: string;
    linkText: string;
    linkTo: string;
    storageKey: string;
  };
};

export default function Sidebar({ currentUsername, darkMode, setDarkMode, hasRecentNews, banner }: SidebarProps) {
  const matches = useMatches();
  const pathname = matches[matches.length - 1].pathname;

  const { showSignIn } = useSignIn();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <div>
      {/* Desktop Banner - Top */}
      <div className="hidden xl:block mb-4">
        <Banner message={banner.message} linkText={banner.linkText} linkTo={banner.linkTo} storageKey={banner.storageKey} />
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center">
          <Bars3Icon className="p-2 -m-2 block xl:hidden size-10" strokeWidth={2} onClick={() => setIsMenuOpen(!isMenuOpen)} />
          <img src={darkMode ? "/logo-dark.png" : "/logo-light.png"} alt="몰루로그 로고" className="ml-2 mr-1 xl:mr-2 object-cover h-8 xl:h-10 aspect-4/3" />
          <h1 className="text-2xl xl:text-3xl font-ingame">
            <span className="font-bold">몰루</span>로그
          </h1>
        </div>
        <div className="mt-6 hidden xl:block">
          <MenuContent
            currentUsername={currentUsername}
            pathname={pathname}
            onMenuClose={handleMenuClose}
            onShowSignIn={showSignIn}
            onDarkModeToggle={setDarkMode}
            hasRecentNews={hasRecentNews}
          />
        </div>
      </div>
      <div>
        {/* Mobile Banner - Bottom */}
        <div className="block xl:hidden">
          <Banner message={banner.message} linkText={banner.linkText} linkTo={banner.linkTo} storageKey={banner.storageKey} />
        </div>
        <Transition
          show={isMenuOpen}
          as="div"
          enter="transition duration-200 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition duration-100 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="p-4 block xl:hidden"
        >
          <MenuContent
            currentUsername={currentUsername}
            pathname={pathname}
            onMenuClose={handleMenuClose}
            onShowSignIn={showSignIn}
            onDarkModeToggle={setDarkMode}
            hasRecentNews={hasRecentNews}
          />
        </Transition>
      </div>
    </div>
  );
}
