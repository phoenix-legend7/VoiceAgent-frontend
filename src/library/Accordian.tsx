import clsx from "clsx"
import { FC, useState } from "react"
import { FaAngleDown } from "react-icons/fa"
import { FaAngleUp } from "react-icons/fa"

interface AccordianProps {
  className?: string
  icon?: React.ReactNode
  title: string
  children: React.ReactNode
}

const Accordian: FC<AccordianProps> = ({ className, icon, title, children }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={clsx(className, "rounded-md overflow-hidden bg-gray-900")}>
      <div className="flex items-center px-6 py-4 gap-4 text-sky-600 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {icon}
        <h3 className="text-lg font-medium">{title}</h3>
        <button className="ml-auto text-gray-400 hover:text-gray-600">
          {isOpen ? <FaAngleUp /> : <FaAngleDown />}
        </button>
      </div>
      <div className={clsx(isOpen ? "max-h-[1000px] border-t border-gray-700" : "max-h-0", "overflow-hidden transition-all duration-300")}>
        {children}
      </div>
    </div>
  )
}

export default Accordian
