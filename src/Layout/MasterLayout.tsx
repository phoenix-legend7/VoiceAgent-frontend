import clsx from "clsx"
import { Link, Outlet } from "react-router-dom"
import { useState } from "react"
import { SlBell } from "react-icons/sl"
import Navbar from "../components/Navbar"
import { ToastContainer } from "react-toastify"

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
        "absolute top-full right-0 w-80 rounded-md overflow-hidden transition-all duration-300 bg-gray-900",
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
  return (
    <div className="flex flex-col min-h-screen">
      {/* rgb(16, 24, 40) */}
      <div className="flex justify-between min-h-16 px-6 bg-gray-900 text-white">
        <Link to="/" className="flex items-center">
          <img src="https://www.elysiapartners.com/wp-content/uploads/2025/03/fav.png" alt="logo" className="h-10" />
        </Link>
        <div className="flex items-center gap-4">
          <Notification />
        </div>
      </div>
      <div className="flex h-[calc(100vh-4rem)]">
        <Navbar />
        <ToastContainer newestOnTop limit={3} />
        <div className="container mx-auto overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default MasterLayout
