import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { GradientButton } from "../library/Button";

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
  return (
    <a href={href} className="hover:text-[#a9fc81]" target="_blank">
      {children}
    </a>
  );
};

const navLinks: { href: string; children: React.ReactNode }[] = [
  // { href: "https://docs.millis.ai/pricing", children: "Pricing" },
  // { href: "https://docs.millis.ai", children: "Documentation" },
  // { href: "https://millis-ai.canny.io/changelog", children: "Changelog" },
  // { href: "https://www.millis.ai/affiliates", children: "Affiliate" },
  // { href: "https://www.millis.ai/contact", children: "Get In Touch" },
];

const HomeHeader: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[rgba(0,0,0,0.56)] text-white">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-12">
          <Link to="/" className="w-nav-brand">
            <img
              src="https://www.elysiapartners.com/wp-content/uploads/2025/03/fav.png"
              alt="Millis AI Logo"
              width={100}
              className="hover:scale-90 transition-all duration-300 h-10 w-auto"
            />
          </Link>
          <nav className="flex items-center gap-12">
            <a href="#Features" className="hover:text-[#a9fc81]">
              Features
            </a>
            {navLinks.map((link, index) => (
              <NavLink key={index} href={link.href}>
                {link.children}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {/* <TransparentButton onClick={() => window.open("https://demo.millis.ai/", "_blank")}>
            Demo
          </TransparentButton> */}
          <GradientButton onClick={() => navigate("/agents")}>Get Started</GradientButton>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
