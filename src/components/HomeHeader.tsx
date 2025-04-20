import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { GradientButton } from "../library/Button";

const navLinks: { href: string; children: React.ReactNode }[] = [
  // { href: "https://docs.millis.ai/pricing", children: "Pricing" },
  // { href: "https://docs.millis.ai", children: "Documentation" },
  // { href: "https://millis-ai.canny.io/changelog", children: "Changelog" },
  // { href: "https://www.millis.ai/affiliates", children: "Affiliate" },
  // { href: "https://www.millis.ai/contact", children: "Get In Touch" },
];

const Navbar = () => {
  return (
    <nav className="flex items-center gap-12">
      <a href="#Features" className="hover:text-[#6961fc] transition-all duration-300">
        Features
      </a>
      {navLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="hover:text-[#6961fc] transition-all duration-300" target="_blank"
        >
          {link.children}
        </a>
      ))}
    </nav>
  );
};

const NavbarMobile = () => {
  return (
    <nav className="flex flex-col bg-gray-900 pb-4">
      <a href="#Features" className="hover:bg-gray-600 transition-all duration-300 px-5 py-2">
        Features
      </a>
      {navLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="hover:bg-gray-600 px-5 py-2 transition-all duration-300"
          target="_blank"
        >
          {link.children}
        </a>
      ))}
      <a href="/agents" className="hover:bg-gray-600 transition-all duration-300 px-5 py-2">
        Get Started
      </a>
    </nav>
  );
};

const HomeHeader: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const checkIsMobile = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true)
      } else {
        setIsMobile(false)
      }
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  const handleClickOutside = (event: MouseEvent) => {
    if (!(event.target as HTMLElement).closest('.navbar-mobile')) {
      setIsOpen(false)
      document.body.removeEventListener('click', handleClickOutside)
    }
  }
  const handleClick = () => {
    if (isOpen) {
      document.body.removeEventListener('click', handleClickOutside)
    } else {
      document.body.addEventListener('click', handleClickOutside)
      setIsOpen(true)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[rgba(0,0,0,0.56)] text-white">
      <div className="container mx-auto">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-12">
            <Link to="/" className="w-nav-brand">
              <img
                src="https://www.elysiapartners.com/wp-content/uploads/2025/03/fav.png"
                alt="Millis AI Logo"
                width={100}
                className="hover:scale-90 transition-all duration-300 h-10 w-auto"
              />
            </Link>
            {!isMobile && <Navbar />}
          </div>
          {!isMobile && (
            <div className="flex items-center gap-4">
              <GradientButton onClick={() => navigate("/agents")}>Get Started</GradientButton>
            </div>
          )}
          {isMobile && (
            <div className="flex items-center justify-center">
              <button
                className="cursor-pointer hover:text-sky-400 text-2xl transition-all duration-300 navbar-mobile"
                onClick={handleClick}
              >
                <FaBars />
              </button>
            </div>
          )}
        </div>
        {isMobile && (
          <div className={clsx(
            "transition-all duration-300 overflow-hidden",
            isOpen ? 'max-h-[300px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'
          )}>
            <NavbarMobile />
          </div>
        )}
      </div>
    </header>
  );
};

export default HomeHeader;

{/* <TransparentButton onClick={() => window.open("https://demo.millis.ai/", "_blank")}>
Demo
</TransparentButton> */}