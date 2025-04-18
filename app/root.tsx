import { json } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { cssBundleHref } from "@remix-run/css-bundle";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useLocation,
} from "@remix-run/react";
import styles from "./tailwind.css?url";
import { getAuthenticator } from "./auth/authenticator.server";
import { Footer, Sidebar } from "./components/organisms/base";
import { getPreference } from "./auth/preference.server";
import { useEffect, useRef, useState } from "react";
import { SignInProvider } from "./contexts/SignInProvider";
import { SignInBottomSheet } from "./components/molecules/auth";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";

export const links = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.8/static/pretendard.css" },
  { rel: "stylesheet", href: "https://cdn.jsdelivr.net/gh/Nyannnnnng/GyeonggiTitleWoff/stylesheet.css" },
  { rel: "stylesheet", href: styles },
];

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;

  const sensei = await getAuthenticator(env).isAuthenticated(request);
  const preference = await getPreference(env, request);
  return json({
    currentUsername: sensei?.username ?? null,
    darkMode: preference.darkMode ?? false,
  });
};

const wideLayout = ["/raids"];

export default function App() {
  const loaderData = useLoaderData<typeof loader>();
  const { currentUsername } = loaderData;

  const [darkMode, setDarkMode] = useState(loaderData.darkMode);
  const loadingBarRef = useRef<LoadingBarRef>(null);

  const navigate = useNavigation();
  useEffect(() => {
    if (navigate.state === "loading") {
      loadingBarRef.current?.continuousStart();
    } else {
      loadingBarRef.current?.complete();
    }
  }, [navigate.state]);

  const location = useLocation();

  return (
    <html lang="ko" className={darkMode ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0,viewport-fit=cover" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content={darkMode ? "#262626" : "#ffffff"} />
        <meta name="background-color" content={darkMode ? "#262626" : "#ffffff"} />
        <Meta />
        <Links />
      </head>
      <body className="text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200 transition">
        <LoadingBar
          ref={loadingBarRef}
          color="#0ea5e9"
          height={3}
          waitingTime={300}
        />
        <SignInProvider>
          <div className="flex flex-col xl:flex-row">
            <div className="fixed xl:relative w-full xl:w-96 xl:h-screen bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border-b xl:border-b-0 xl:border-r border-neutral-200 dark:border-neutral-700 shadow-xl shadow-neutral-200/30 dark:shadow-neutral-900/30 z-100">
              <Sidebar currentUsername={currentUsername} setDarkMode={setDarkMode} />
            </div>
            <div className="w-full pt-10 xl:pt-0 overflow-y-auto">
              <div className={`xl:h-screen mx-auto ${wideLayout.find((path) => location.pathname.startsWith(path)) ? "max-w-6xl" : "max-w-3xl"} px-4 md:px-8 py-6`}>
                <Outlet />
                <Footer />
              </div>
            </div>
          </div>
          <SignInBottomSheet />
        </SignInProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
