import { useState } from "react";
import { Title } from "~/components/atoms/typography";
import { BottomSheet } from "~/components/atoms/layout";
import ScreenSelector, { type ScreenSelectorProps } from "./ScreenSelector";
import PagePanel, { type PagePanelProps } from "./PagePanel";
import PageLink, { type PageLinkProps } from "./PageLink";
import { sanitizeClassName } from "~/prophandlers";

type PageProps = {
  title: string;
  description?: string;
  screens?: ScreenSelectorProps["screens"];
  panels?: PagePanelProps[];
  links?: PageLinkProps[];

  children: React.ReactNode;
};

export default function Page({ title, description, screens, panels, links, children }: PageProps) {
  const [openPanelIndex, setOpenPanelIndex] = useState<number | null>(null);

  return (
    <>
      <div className="flex flex-col xl:flex-row">
        <div className="w-full xl:h-screen xl:max-w-sm xl:mr-8 xl:sticky xl:top-6 xl:self-start xl:overflow-y-scroll no-scrollbar">
          <Title text={title} description={description} />
          {screens && <ScreenSelector screens={screens} />}
          <div className="hidden xl:block">
            {panels?.map((panel) => (
              <PagePanel key={panel.title} {...panel} />
            ))}
          </div>
          {links && links.length > 0 && (
            <div className="-mt-4 mb-8 xl:mt-8">
              {links.map((link) => (
                <PageLink key={link.title} {...link} />
              ))}
            </div>
          )}
        </div>

        <div className="grow -mt-4 xl:mt-0 xl:p-4 max-w-3xl">
          {children}
        </div>
      </div>

      {/* Mobile floating navigation bar */}
      {panels && panels.length > 0 && (
        <div className="px-2 py-1 xl:hidden fixed bottom-4 right-4 z-40 bg-white/20 dark:bg-neutral-900/20 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-full shadow-lg">
          <div className="flex items-center">
            {panels.map((panel, index) => (
              <div
                key={panel.title}
                onClick={() => panel.disabled ? undefined : setOpenPanelIndex(index)}
                className={sanitizeClassName(`
                  w-20 flex flex-col justify-center items-center p-2 text-neutral-700 dark:text-neutral-300 rounded-full transition-colors cursor-pointer
                  ${panel.disabled ? "opacity-50 cursor-default" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}
                `)}
              >
                <panel.Icon className="mb-1 size-5 shrink-0" strokeWidth={2} />
                <span className="text-xs font-medium whitespace-nowrap">{panel.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile bottom sheet */}
      {openPanelIndex !== null && panels && panels[openPanelIndex] && (
        <BottomSheet
          Icon={panels[openPanelIndex].Icon}
          title={panels[openPanelIndex].title}
          description={panels[openPanelIndex].description}
          onClose={() => setOpenPanelIndex(null)}
        >
          {panels[openPanelIndex].children}
        </BottomSheet>
      )}
    </>
  );
}
