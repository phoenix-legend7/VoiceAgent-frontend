import clsx from "clsx"
import { FC } from "react"

interface Props {
  className?: string
  isOverlayShown?: boolean
  children?: React.ReactNode
}

const Content: FC<Props> = ({ className, isOverlayShown, children }) => {
  return (
    <div className={clsx(className, 'relative px-6 py-8')}>
      {isOverlayShown && (
        <div className="absolute inset-0 bg-gray-950/90 cursor-wait z-50">
          <div className="flex items-center justify-center h-full">
            <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-b-transparent border-r-transparent border-gray-400 animate-spin"></div>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

export default Content
