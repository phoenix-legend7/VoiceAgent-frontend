import clsx from "clsx";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaAngleDown,
  FaAngleLeft,
  FaAngleRight,
  FaBook,
  FaBullhorn,
  FaCalendarAlt,
  FaChartBar,
  FaCog,
  FaHistory,
  FaPhoneAlt,
  FaUsers,
} from "react-icons/fa";
// import { LiaExternalLinkAltSolid } from "react-icons/lia"
// import { PiSparkle } from "react-icons/pi"
import NavLink from "./NavLink";
import settingsItems from "../../consts/settings";
import axiosInstance from "../../core/axiosInstance";

const SettingsButtonGroup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const isActive = (href: string) => {
    return params.pathname === `/settings/${href}`;
  };
  return (
    <div className="relative">
      <button
        className="flex items-center gap-3 cursor-pointer w-full px-1.5 py-3 text-gray-400 rounded hover:bg-gray-900 active:bg-gray-800 transition-all duration-300 nav-link"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaCog size={20} />
        <span className="text-white nav-link-label">Settings</span>
        <div
          className="ml-auto mr-0 transition-transform duration-300 nav-link-right-icon"
          style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
        >
          <FaAngleDown size={18} />
        </div>
      </button>
      <div
        className={clsx(
          "rounded-md overflow-hidden transition-all duration-500 nav-link-dropdown",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        style={{ maxHeight: isOpen ? "24rem" : "0" }}
      >
        {settingsItems.map((item, index) => (
          <Link
            key={index}
            to={`/settings/${item.href}`}
            className={clsx(
              "flex items-center gap-3 cursor-pointer w-full pl-6 pr-1.5 py-3 rounded hover:bg-gray-900 active:bg-gray-800 transition-all duration-300",
              isActive(item.href) ? "text-sky-600" : "text-gray-400",
              isOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

// const NewsGroup = () => {
//   const [isOpen, setIsOpen] = useState(false)
//   return (
//     <div className="relative">
//       <button
//         className="flex items-center gap-3 cursor-pointer w-full px-1.5 py-3 text-gray-400 rounded hover:bg-gray-900 active:bg-gray-800 transition-all duration-300 nav-link"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <PiSparkle size={20} />
//         <div className="text-white nav-link-label">What's New</div>
//         <div className="absolute -right-1 -top-1 bg-red-500 rounded-full w-3 h-3 border border-white nav-link-badge" />
//       </button>
//       <div className={clsx(
//         "absolute bottom-0 left-full rounded-md overflow-hidden transition-all duration-500 z-[1000] nav-link-dropdown",
//         isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
//       )}>
//         {/* <div className="flex flex-col gap-2 p-4">
//           <div className="flex items-center gap-2">
//             <span className="text-lg font-medium">What's New</span>
//           </div>
//         </div> */}
//       </div>
//     </div>
//   )
// }

type UserDataType = {
  user_id: string;
  credit: number;
  used_credit: number;
  auto_refill: {
    enabled: boolean;
    threshold?: number;
    refill_amount?: number;
  };
};

const initialUserData: UserDataType = {
  user_id: "<string>",
  credit: 5,
  used_credit: 0,
  auto_refill: {
    enabled: true,
    threshold: 0,
    refill_amount: 0,
  },
};

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const Navbar: FC<Props> = ({ isOpen, setIsOpen }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState<UserDataType>(initialUserData);

  useEffect(() => {
    const checkIsMobile = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get("/user/info");
        const data = response.data;
        setUserData(data);
      } catch (error) {
        console.error(error);
        // toast.error(`Failed to fetch user data: ${error}`);
      }
    };
    fetchUserData();
    const timerId = setInterval(() => {
      fetchUserData();
    }, 10000);
    return () => {
      if (timerId !== undefined) {
        clearInterval(timerId);
      }
    };
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !(event.target as HTMLElement).closest("#navbar") &&
        !(event.target as HTMLElement).closest("#sidebar-toggle")
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen && isMobile) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, isMobile]);
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

  return (
    <div
      className={clsx(
        "fixed md:static flex flex-col justify-between items-center bg-gray-950 left-0 bottom-0 z-50 text-white border-r border-gray-800 transition-all duration-300",
        isOpen ? "min-w-72" : "navbar overflow-hidden",
        isMobile ? "top-0" : "top-16",
        isMobile && !isOpen ? "w-0 p-0" : "p-4"
      )}
      id="navbar"
    >
      <div className="w-full">
        <NavLink href="/" icon={<FaChartBar size={20} />} label="Dashboard" />
        <NavLink
          href="/agents"
          icon={<FaUsers size={20} />}
          label="Voice Agents"
        />
        <NavLink
          href="/phones"
          icon={<FaPhoneAlt size={20} />}
          label="Phone Number"
        />
        <NavLink
          href="/campaigns"
          icon={<FaBullhorn size={20} />}
          label="Campaigns"
        />
        <NavLink
          href="/campaign-schedule"
          icon={<FaCalendarAlt size={20} />}
          label="Campaign Scheduling"
        />
        <NavLink
          href="/knowledge"
          icon={<FaBook size={20} />}
          label="Agent Knowledge"
        />
        <NavLink
          href="/histories"
          icon={<FaHistory size={20} />}
          label="Call Logs"
        />
        <SettingsButtonGroup />
        {/* <NavLink
          href="https://millisai.mintlify.app/"
          icon={<FaFileAlt size={20} />}
          label="Documentation"
          rightIcon={<LiaExternalLinkAltSolid size={18} />}
          isExternal
        /> */}
        {/* <NewsGroup /> */}
      </div>
      <div className="w-full">
        <div className="rounded bg-gray-800/40 py-5 px-6 credit-usage">
          <div className="text-gray-500 text-sm font-semibold">
            Credit Usage
          </div>
          <div className="text-white font-semibold">
            ${(userData.used_credit / 100).toFixed(4)} / $
            {(userData.credit / 100).toFixed(4)}
          </div>
          <hr className="text-gray-400 mb-1.5" />
          <Link
            className="rounded cursor-pointer px-2 py-1.5 text-sky-600 hover:bg-sky-600/5 transition-all duration-300"
            to="/settings/billing"
          >
            Purchase Credits
          </Link>
        </div>
        <hr className="w-full h-px text-gray-800" />
        <div className="pt-2">
          <button
            className={clsx(
              "rounded p-2 cursor-pointer text-gray-400 hover:bg-gray-900 transition duration-300",
              { "opacity-0": isMobile }
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FaAngleLeft /> : <FaAngleRight />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
