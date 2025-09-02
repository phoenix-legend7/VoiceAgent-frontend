import clsx from "clsx"
import { useEffect, useState } from "react"
import { FaBars } from "react-icons/fa"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { CreditCard, Laptop, LogOut, MoonStar, Sun, User, Zap } from "lucide-react"
import Navbar from "../components/Navbar"
import OnboardingTour from "../components/OnboardingTour"
import { useAuth } from "../core/authProvider"

type ThemeType = "light" | "dark" | "system"

const ThemeModeSwitch = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeType>(localStorage.getItem("theme") as ThemeType || "system");

  const handleThemeChange = (currentTheme: ThemeType) => {
    setTheme(currentTheme || "system");
    setIsOpen(false);
  };
  const renderIcon = () => {
    switch (theme) {
      case "light":
        return <Sun size={24} />;
      case "dark":
        return <MoonStar size={24} />;
      case "system":
        return <Laptop size={24} />;
      default:
        return <Sun size={24} />;
    }
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeType;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("system");
    }
  }, []);
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else if (theme === "dark") {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.body.classList.toggle("dark", isDarkMode);
    }
  }, [theme]);
  useEffect(() => {
    const closeDropdown = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest("#theme-mode-switch")) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("click", closeDropdown);
    }
    return () => {
      document.removeEventListener("click", closeDropdown);
    }
  }, [isOpen]);

  return (
    <div className="relative" id="theme-mode-switch">
      <button
        className="rounded cursor-pointer px-2 py-1.5 hover:bg-sky-600/10 transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        {renderIcon()}
      </button>
      {/* Show menu when clicked with animation */}
      <div className={clsx(
        "absolute top-full right-0 w-40 rounded-md overflow-hidden transition-all duration-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 z-50",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="flex flex-col p-1.5">
          <div className="flex flex-col items-center">
            <button
              className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-all duration-300"
              onClick={() => handleThemeChange("light")}
            >
              <Sun size={20} className="inline-block mr-2" />
              Light
            </button>
            <button
              className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-all duration-300"
              onClick={() => handleThemeChange("dark")}
            >
              <MoonStar size={20} className="inline-block mr-2" />
              Dark
            </button>
            <button
              className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-all duration-300"
              onClick={() => handleThemeChange("system")}
            >
              <Laptop size={20} className="inline-block mr-2" />
              System
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleChangeLocation = (location: string) => {
    setIsOpen(false)
    navigate(location)
  }
  useEffect(() => {
    const closeDropdown = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest("#user-menu")) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("click", closeDropdown);
    }
    return () => {
      document.removeEventListener("click", closeDropdown);
    }
  }, [isOpen]);

  return (
    <div className="relative" id="user-menu">
      <button
        className="rounded cursor-pointer px-2 py-1.5 hover:bg-sky-600/10 transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentUser?.avatar ? (
          <img
            src={currentUser.avatar}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white size-8 flex items-center justify-center font-bold">
            {currentUser?.first_name?.charAt(0) || "U"}
          </div>
        )}
      </button>
      {/* Show menu when clicked with animation */}
      <div className={clsx(
        "absolute top-full right-0 w-40 rounded-md overflow-hidden transition-all duration-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 z-50",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="flex flex-col p-1.5">
          <div>
            <div className="px-4 py-2 font-bold">
              {currentUser?.first_name} {currentUser?.last_name}
            </div>
            <hr className="w-full my-1 text-gray-200" />
            <button
              className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-all duration-300"
              onClick={() => handleChangeLocation("/settings/account")}
            >
              <User size={20} className="inline-block mr-2" />
              Account
            </button>
            <button
              className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-all duration-300"
              onClick={() => handleChangeLocation("/settings/billing")}
            >
              <CreditCard size={20} className="inline-block mr-2" />
              Billing
            </button>
            <hr className="w-full my-1 text-gray-200" />
            <button
              className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-all duration-300"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
            >
              <LogOut size={20} className="inline-block mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const MasterLayout = () => {
  const [isOpen, setIsOpen] = useState(true)
  const { currentUser } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-between min-h-16 pr-6 pl-3 md:pl-6 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-white">
        <div className="flex items-center">
          <div
            className="flex items-center px-3 hover:text-sky-600 transition-all duration-300 cursor-pointer md:hidden"
            onClick={() => setIsOpen(true)}
            id="sidebar-toggle"
          >
            <FaBars size={24} />
          </div>
          <Link to="/" className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">Spark</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeModeSwitch />
          {!!currentUser && (
            <UserMenu />
          )}
        </div>
      </div>
      <div className="flex h-full">
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
        <ToastContainer newestOnTop limit={3} />
        <div className="w-full mx-auto overflow-y-auto relative h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
        {/* Onboarding tour runs after first login */}
        <OnboardingTour userId={currentUser?.email} />
      </div>
    </div>
  )
}

export default MasterLayout
