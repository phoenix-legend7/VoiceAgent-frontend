import clsx from "clsx";
import { FC } from "react";

interface TabButtonProps {
  label: string;
  onClick: () => void;
  isActive: boolean;
}

export const TabButton: FC<TabButtonProps> = ({ label, onClick, isActive }) => {
  return (
    <button
      className={clsx(
        "cursor-pointer w-full border-b-2 transition-all duration-300 px-2 py-1 md:px-4 md:py-2",
        isActive
          ? "border-sky-600 text-sky-600"
          : "text-gray-600 dark:text-gray-400 border-transparent"
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
