import clsx from "clsx"

interface CardProps {
  title: string
  icon?: React.ReactNode
  children?: React.ReactNode
  className?: string
  headerClassName?: string
  toolbar?: React.ReactNode
}

const Card: React.FC<CardProps> = ({ title, icon, children, className, headerClassName, toolbar }) => {
  return (
    <div className={clsx(className, "rounded-md mx-1 5 my-3 bg-white border dark:border-0 border-gray-300 dark:bg-gray-900")}>
      <div className={clsx(headerClassName, "px-5 py-4 border-b border-gray-300 dark:border-gray-700 flex flex-col min-[375px]:flex-row items-center justify-between gap-2")}>
        <div className="font-semibold text-center min-[375px]:text-left flex items-center gap-3">
          {icon}
          {title}
        </div>
        {toolbar}
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  )
}

export default Card
