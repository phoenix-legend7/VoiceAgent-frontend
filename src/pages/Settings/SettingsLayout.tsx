import clsx from "clsx"
import { Link, useLocation } from "react-router-dom"
import Content from "../../Layout/Content"

interface SettingsLayoutProps {
  children: React.ReactNode
  isOverlayShown?: boolean
}

const TabLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
  const isActive = useLocation().pathname === to
  return (
    <Link
      to={to}
      className={clsx(
        "px-4 py-3 text-gray-600 dark:text-gray-400",
        isActive && "text-sky-600 border-b-2 border-sky-600"
      )}
    >
      {children}
    </Link>
  )
}

const SettingsLayout = ({ children, isOverlayShown }: SettingsLayoutProps) => {
  return (
    <Content isOverlayShown={isOverlayShown}>
      <div className="flex flex-col h-full">
        <div className="text-2xl font-bold">Settings</div>
        <div className="flex gap-4 mt-4 border-b border-gray-300 dark:border-gray-700">
          <TabLink to="/settings/account">Account</TabLink>
          <TabLink to="/settings/billing">Billing</TabLink>
          <TabLink to="/settings/transactions">Transactions</TabLink>
        </div>
        <div className="mt-8">
          {children}
        </div>
      </div>
    </Content>
  )
}

export default SettingsLayout
