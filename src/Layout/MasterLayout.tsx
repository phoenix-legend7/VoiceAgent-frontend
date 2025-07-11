import clsx from "clsx"
import { useState } from "react"
import { FaBars } from "react-icons/fa"
import { SlBell } from "react-icons/sl"
import { Link, Outlet } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import Navbar from "../components/Navbar"

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="relative">
      <button
        className="rounded cursor-pointer px-2 py-1.5 hover:bg-sky-600/10 transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <SlBell size={16} />
      </button>
      {/* Show menu when clicked with animation */}
      <div className={clsx(
        "absolute top-full right-0 w-60 md:w-80 rounded-md overflow-hidden transition-all duration-300 bg-gray-900",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">Notification</span>
          </div>
          <hr className="w-full h-px text-gray-800" />
        </div>
      </div>
    </div>
  )
}

const MasterLayout = () => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-between min-h-16 pr-6 pl-3 md:pl-6 bg-gray-900 text-white">
        <div className="flex items-center">
          <div
            className="flex items-center px-3 hover:text-sky-600 transition-all duration-300 cursor-pointer md:hidden"
            onClick={() => setIsOpen(true)}
            id="sidebar-toggle"
          >
            <FaBars size={24} />
          </div>
          <Link to="/" className="flex items-center">
            <img src="https://www.elysiapartners.com/wp-content/uploads/2025/03/fav.png" alt="logo" className="h-10" />
            <div className="font-bold text-xl">
              Elysia Partners
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Notification />
        </div>
      </div>
      <div className="flex h-full">
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
        <ToastContainer newestOnTop limit={3} />
        <div className="w-full mx-auto overflow-y-auto relative h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default MasterLayout
