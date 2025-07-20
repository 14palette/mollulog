type BottomSheetProps = {
  children: React.ReactNode | React.ReactNode[];

  Icon?: React.ElementType;
  title?: string;

  onClose: () => void;
};

export default function BottomSheet({ children, Icon, title, onClose }: BottomSheetProps) {
  return (
    <>
      <div className="w-screen h-dvh top-0 left-0 fixed bg-black/25 z-100" onClick={onClose} />
      <div className="w-screen xl:max-w-3xl h-dvh max-h-80 md:max-h-120 fixed bottom-0 left-0 right-0 mx-auto p-4 md:p-8 bg-white dark:bg-neutral-800 z-200 rounded-t-2xl flex flex-col">
        <div className="flex items-center gap-x-2 shrink-0 mt-2 xl:mt-0 mb-4">
          {Icon && <Icon className="size-8" />}
          {title && <p className="font-black text-2xl md:text-3xl">{title}</p>}
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </>
  );
}
