import clsx from "clsx"
import { Link, useLocation } from "react-router-dom"

interface Props {
  href: string
  icon: React.ReactNode
  label: string
  rightIcon?: React.ReactNode
  isExternal?: boolean
}

const NavLink = ({ href, icon, label, rightIcon, isExternal }: Props) => {
  const location = useLocation()

  const normalize = (path: string) => path.replace(/\/+$/, "")

  const current = normalize(location.pathname)
  const base = normalize(href)
  const isActive =
    current === base || (!!base && current.startsWith(base + "/"))

  return (
    <div className="relative">
      <Link
        to={href}
        target={isExternal ? "_blank" : undefined}
        className={clsx(
          "flex items-center gap-3 px-1.5 py-3 rounded active:bg-gray-800 transition-all duration-300 nav-link",
          isActive ? "text-sky-400" : "text-gray-400"
        )}
      >
        {icon}
        <span
          className={clsx(
            "nav-link-label",
            isActive ? "text-sky-400 font-bold" : "text-white"
          )}
        >
          {label}
        </span>
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