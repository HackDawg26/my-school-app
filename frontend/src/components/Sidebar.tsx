import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BarChart3,
  BookCopy,
  Book,
  Users,
  Banknote,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SchoolLogo } from "./SchoolLogo";
import {navigation} from "../data/navigation";

const APP_NAME = "ClaroEd";


interface SideBarProps {
  isDesktop?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

// ==============================
// Navigation Items
// ==============================



// ==============================
// Component
// ==============================

const SideBar: React.FC<SideBarProps> = ({
  isDesktop = false,
  open = false,
  onClose = () => {},
  onOpen = () => {},
}) => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown after route change
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

  const activeLinks = user?.role ? navigation[user.role] ?? [] : [];

  const linkBase =
    "group flex items-center px-3 py-2 text-sm font-medium m-2 gap-3 rounded-lg transition-colors";

  const NavContent = () => (
    <ul className="flex flex-col">
      {activeLinks.map(({ name, to, Icon }) => (
        <li key={name}>
          <NavLink
            to={to}
            end={name === "Dashboard"}
            onClick={!isDesktop ? onClose : undefined}
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "bg-[hsl(217,81%,37%)] text-white font-semibold shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />

            <span>{name}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );

  // ==============================
  // Profile Button
  // ==============================

  const ProfileButton = () => (
    <div className="relative">
      <button
        onClick={() => setProfileOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-full border bg-slate-100 font-bold text-slate-600"
      >
        {user?.email ? user.email.charAt(0).toUpperCase() : "?"}
      </button>

      {profileOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border bg-white p-2 shadow-xl">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ==============================
          Mobile Header
      ============================== */}

      {!isDesktop && (
        <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4">
          {/* Drawer Button */}
          <button
            onClick={onOpen}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
              C
            </div>

            <span className="text-xl font-bold">{APP_NAME}</span>
          </div>

          {/* Profile */}
          <div className="w-10">
            <ProfileButton />
          </div>
        </header>
      )}

      {/* ==============================
          Desktop Sidebar
      ============================== */}

      {isDesktop && (
        <aside className="hidden min-h-screen w-64 flex-col border-r border-gray-200 bg-white lg:flex">
          {/* Logo */}
          <div className="flex items-center p-4 gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
              C
            </div>

            <span className="text-xl font-bold">{APP_NAME}</span>
          </div>

          {/* Navigation */}
          <nav className="grow overflow-y-auto p-2">
            <NavContent />
          </nav>

          {/* Profile Bottom */}
          <div className="border-t border-gray-100 p-4">
            <ProfileButton />
          </div>
        </aside>
      )}

      {/* ==============================
          Mobile Drawer
      ============================== */}

      {open && !isDesktop && (
        <>
          {/* Overlay */}
          <div
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex h-16 items-center justify-between border-b border-gray-100 px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
                  C
                </div>

                <span className="text-xl font-bold">{APP_NAME}</span>
                
              </div>

              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-2">
              <NavContent />
            </nav>
          </aside>
        </>
      )}
    </>
  );
};

export default SideBar;
