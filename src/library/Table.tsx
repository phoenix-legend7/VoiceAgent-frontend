import clsx from "clsx"
import { FC } from "react"

interface TypeWithProps {
  children?: React.ReactNode
  className?: string
}

const Table: FC<TypeWithProps> = ({ children, className }) => {
  return (
    <table className={clsx(className, 'w-full')}>
      {children}
    </table>
  )
}

export const TableRow: FC<TypeWithProps> = ({ children, className }) => {
  return (
    <tr className={clsx(className, 'border-b border-gray-500 last:border-b-0 hover:bg-gray-800/50 transition-all duration-300')}>
      {children}
    </tr>
  )
}

export const TableCell: FC<TypeWithProps> = ({ children, className }) => {
  return (
    <td className={clsx(className, 'p-4')}>
      {children}
    </td>
  )
}

export default Table
