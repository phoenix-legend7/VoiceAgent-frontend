import clsx from "clsx"
import { FC } from "react"

interface TypeWithProps {
  children?: React.ReactNode
  className?: string
  onClick?: () => void
}

const Table: FC<TypeWithProps> = ({ children, className, onClick }) => {
  return (
    <table className={clsx(className, 'w-full')} onClick={onClick}>
      {children}
    </table>
  )
}

export const TableRow: FC<TypeWithProps> = ({ children, className, onClick }) => {
  return (
    <tr
      className={clsx(className, 'border-b border-gray-800 last:border-b-0 hover:bg-gray-800/50 transition-all duration-300')}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export const TableCell: FC<TypeWithProps> = ({ children, className, onClick }) => {
  return (
    <td className={clsx(className, 'p-4')} onClick={onClick}>
      {children}
    </td>
  )
}

export default Table
