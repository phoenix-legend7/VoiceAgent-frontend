import clsx from "clsx"
import { Link, useParams } from "react-router-dom"

interface Props {
  href: string
  icon: React.ReactNode
  label: string
  rightIcon?: React.ReactNode
  isExternal?: boolean
}

const NavLink = ({ href, icon, label, rightIcon, isExternal }: Props) => {
  const params = useParams()
  const isActive = (href: string) => {
    return params.pathname === href
  }
  return (
    <div className="relative">
      <Link
        to={href}
        target={isExternal ? "_blank" : undefined}
        className={clsx(
          "flex items-center gap-3 px-1.5 py-3 rounded active:bg-gray-800 transition-all duration-300 nav-link",
          isActive(href) ? "text-sky-600" : "text-gray-400"
        )}
      >
        {icon}
        <span className="text-white nav-link-label">{label}</span>
        {!!rightIcon && (
          <div className="ml-auto mr-0 nav-link-right-icon">
            {rightIcon}
          </div>
        )}
      </Link>
    </div>
  )
}

export default NavLink
