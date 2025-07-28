import { XMarkIcon } from "@heroicons/react/16/solid";
import { sanitizeClassName } from "~/prophandlers";

type BottomSheetProps = {
  children: React.ReactNode | React.ReactNode[];

  Icon: React.ElementType;
  title: string;
  onClose: () => void;
};

export default function BottomSheet({ children, Icon, title, onClose }: BottomSheetProps) {
  return (
    <>
      <div className="w-screen h-dvh top-0 left-0 fixed bg-white/50 dark:bg-black/50 z-100" onClick={onClose} />
      <div className={sanitizeClassName(`
        w-screen xl:max-w-3xl h-dvh max-h-96 md:max-h-120 fixed bottom-0 left-0 right-0 mx-auto px-4 py-6 xl:p-8 pb-[var(--pb-safe-or-6)] flex flex-col
        bg-white/90 dark:bg-neutral-800/80 backdrop-blur-sm z-200 rounded-t-2xl shadow-t-xl
      `)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 xl:p-3 flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-lg">
              <Icon className="size-5 xl:size-6 text-neutral-600 dark:text-neutral-400" strokeWidth={2} />
            </div>
            <p className="font-bold text-xl xl:text-2xl">{title}</p>
          </div>
          <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer" onClick={onClose}>
            <XMarkIcon className="size-6 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </>
  );
}
