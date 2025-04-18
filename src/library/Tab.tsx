import clsx from "clsx"
import { FC } from "react"

interface TabButtonProps {
  label: string
  onClick: () => void
  isActive: boolean
}

export const TabButton: FC<TabButtonProps> = ({ label, onClick, isActive }) => {
  return (
    <button
      className={clsx(
        'cursor-pointer w-full border-b-2 transition-all duration-300',
        isActive ? "border-green-600 text-green-600" : "text-gray-400 border-transparent", "px-4 py-2"
      )}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
