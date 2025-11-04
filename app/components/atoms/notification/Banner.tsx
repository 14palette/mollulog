import { XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router";
import { useState, useEffect } from "react";

interface BannerProps {
  message: string;
  linkText: string;
  linkTo: string;
  storageKey: string;
  className?: string;
}

export default function Banner({ message, linkText, linkTo, storageKey, className = "" }: BannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const isDismissed = localStorage.getItem(storageKey) === "true";
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, "true");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`min-h-10 bg-blue-600 dark:bg-blue-700 relative ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 xl:py-4">
        <div className="flex-1 flex flex-row xl:flex-col gap-x-1.5 text-white text-sm font-bold">
          <span>{message}</span>
          <Link to={linkTo} className="text-white hover:text-blue-100 font-bold underline">
            {linkText}
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 -mr-2 text-white hover:text-blue-100 transition-colors"
          aria-label="배너 닫기"
        >
          <XMarkIcon className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
