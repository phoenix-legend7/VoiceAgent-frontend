import clsx from "clsx"
import { FC } from "react"
import { Link } from "react-router-dom"

interface Props {
  className?: string
  isOverlayShown?: boolean
  children?: React.ReactNode
  onScroll?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => Promise<void>
}

const Content: FC<Props> = ({ className, isOverlayShown, children, onScroll }) => {
  return (
    <>
      <div
        className={clsx(
          className,
          'container mx-auto flex flex-col justify-between min-h-full px-2 md:px-6 pt-8'
        )}
        onScroll={onScroll}
      >
        {children}
        <div className="flex py-6 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">© 2025 All rights reserved</span>
          </div>
          <Link to="/" className="ml-auto sm:mr-6 md:mr-10 text-sm text-gray-400">
            About Us
          </Link>
          <Link to="/terms" className="text-sm text-gray-400">
            Terms
          </Link>
        </div>
      </div>
      {isOverlayShown && (
        <div className="absolute inset-0 bg-gray-950 cursor-wait z-50">
          <div className="flex items-center justify-center h-full">
            <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-b-transparent border-r-transparent border-gray-400 animate-spin"></div>
          </div>
        </div>
      )}
    </>
  )
}

export default Content
