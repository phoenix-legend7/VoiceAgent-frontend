import clsx from "clsx"

interface CardProps {
  title: string
  children?: React.ReactNode
  className?: string
  headerClassName?: string
  toolbar?: React.ReactNode
}

const Card: React.FC<CardProps> = ({ title, children, className, headerClassName, toolbar }) => {
  return (
    <div className={clsx(className, "rounded-md mx-1 5 my-3 bg-gray-900")}>
      <div className={clsx(headerClassName, "px-5 py-4 border-b border-gray-700 flex items-center justify-between")}>
        {title}
        {toolbar}
      </div>
      {children}
    </div>
  )
}

export default Card
