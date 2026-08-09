import React, { useEffect, useState } from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ChevronDown, ChevronUp, LogOutIcon, Menu, School, X } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { navigation } from "../data/navigation";

const APP_NAME = "ClaroEd";

interface SideBarProps {
  isDesktop?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

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

  // logo
  const Schoolname = () => (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
        C
      </div>

      <span className="text-xl font-bold font-lora tracking-wide">
        {APP_NAME}
      </span>
    </div>
  )


  // ==============================
  // Close Profile Dropdown
  // ==============================

  useEffect(() => {
    function handleOutsideClick() {
      setProfileOpen(false);
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Close profile dropdown after route change
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  // ==============================
  // Profile Functions
  // ==============================

  const toggleDropdown = () => {
    setProfileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ==============================
  // Navigation
  // ==============================

  const activeLinks = user?.role
    ? navigation[user.role] ?? []
    : [];

  const linkBase =
    "group flex items-center px-3 py-2 text-sm font-medium m-2 gap-3 rounded-lg transition-colors";

  const NavContent = () => (
    <ul>
      {activeLinks.map(({ name, to, Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={name === "Dashboard"}
            onClick={!isDesktop ? onClose : undefined}
            className={({ isActive }) =>
              `group relative flex w-full items-center gap-4 rounded-xl px-4 py-5 text-left text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#f1efff] text-[#5545ef]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute -left-6 h-7 w-1 rounded-r-full bg-[#6c5cf6]" />}
                <Icon className="size-5" strokeWidth={2.1} />

                <span>{name}</span>
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  // ==============================
  // Profile Button
  // ==============================

  const ProfileButton = () => {
    return (
      <div
        className="relative"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={toggleDropdown}
          className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-all duration-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 ring-2 ring-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "?"}
          </div>

          <div className={`hidden flex-1 ${isDesktop ? 'min-w-35' : 'min-w-0' } text-left sm:block`}>
            <p className=" truncate text-sm font-semibold text-slate-800">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.role}
            </p>
          </div>

          { !isDesktop ? (
            <ChevronDown
            size={16}
            className="hidden text-slate-400 transition-transform duration-200 group-hover:text-slate-600 sm:block"
          />
          ):(
            <ChevronUp
            size={16}
            className="hidden text-slate-400 transition-transform duration-200 group-hover:text-slate-600 sm:block"
          />
          )

          }
          
        </button>

        {profileOpen && (
          <div
            className={`fixed z-999  overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-2xl ${
              isDesktop
                ? "bottom-20 left-2 w-60"
                : "right-4 top-16 w-40 "
            }`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* <div className="border-b border-gray-100 px-4 py-3">
              <p className="truncate text-sm font-medium text-gray-900">
                {user?.email}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Online
              </p>
            </div> */}

            <button
              type="button"
              onClick={handleLogout}
              className="flex flex-1  w-full items-center justify-between px-4 py-2.5 text-left text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 focus:outline-none focus:bg-red-50 active:bg-red-100"
            >
              <span>Logout</span>
              <LogOutIcon size={17} strokeWidth={2} />
              
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* ==============================
          Mobile Header
      ============================== */}

      {!isDesktop && (
        <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4">
          {/* Drawer Button */}
          <button
            type="button"
            onClick={onOpen}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Schoolname />

          {/* Profile */}
          
          <ProfileButton />
          
        </header>
      )}

      {/* ==============================
          Desktop Sidebar
      ============================== */}

      {isDesktop && (
        <aside className="hidden  min-h-screen w-64 flex-col border-r border-gray-200 bg-white lg:flex">
          {/* Logo */}
          <div className="flex items-center justify-center pt-2 ">
            <Schoolname />
          </div>
         

          {/* Navigation */}
          <nav className="grow overflow-y-auto p-2">
            <NavContent />
          </nav>

          {/* Profile Bottom */}
          <div className="p-4">
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
              <Schoolname />

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Only */}
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