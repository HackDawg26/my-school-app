import React from "react";
import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BarChart3,
  BookCopy,
  CheckSquare,
  Book,
  Users,
  Banknote,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const APP_NAME = "ClaroEd";

interface NavItem {
  name: string;
  to: string;
  Icon: LucideIcon;
}

interface SideBarProps {
  isDesktop?: boolean;
  open?: boolean;
  onClose?: () => void;
}

// 1. Separate Nav Definitions (Paths are already role-specific)
const adminLinks: NavItem[] = [
  { name: "Dashboard", to: "/admin/dashboard", Icon: LayoutDashboard },
  {name: "Accounts", to: "/admin/accounts", Icon: Users },
  { name: "Faculty", to: "/admin/faculty", Icon: Users },
  { name: "Students", to: "/admin/students", Icon: Users },
  { name: "Sections", to: "/admin/sections", Icon: Users },
  { name: "Grade Logs", to: "/admin/gradelogs", Icon: Users },
];

const teacherLinks: NavItem[] = [
  { name: "Dashboard", to: "/teacher/dashboard", Icon: LayoutDashboard },
  { name: "Subjects", to: "/teacher/subject", Icon: BookCopy },
  { name: "Analytics", to: "/teacher/analytics", Icon: BarChart3 },
  { name: "Submissions", to: "/teacher/submissions", Icon: CheckSquare },
  { name: "Gradebook", to: "/teacher/gradebook", Icon: Book },
  { name: "Advisory Class", to: "/teacher/advisory-class", Icon: Banknote },
];

const studentLinks: NavItem[] = [
  { name: "Dashboard", to: "/student/dashboard", Icon: LayoutDashboard },
  { name: "Subjects", to: "/student/subject", Icon: BookCopy },
  { name: "Submissions", to: "/student/submissions", Icon: CheckSquare },
  { name: "Gradebook", to: "/student/gradebook", Icon: Book },
];

const SideBar: React.FC<SideBarProps> = ({ isDesktop = false, open = false, onClose = () => {} }) => {
  const { user } = useAuth();
  
  const linkBase = "group flex items-center px-3 py-2 text-sm font-medium m-2 gap-3 rounded-lg transition-colors";

  // 2. Determine which array to use based on the user's role
  const getLinksByRole = () => {
    switch (user?.role) {
      case 'ADMIN': return adminLinks;
      case 'TEACHER': return teacherLinks;
      case 'STUDENT': return studentLinks;
      default: return [];
    }
  };

  const activeLinks = getLinksByRole();

  const NavContent = () => (
    <ul className="flex flex-col">
      {activeLinks.map(({ name, to, Icon }) => (
        <li key={name}>
          <NavLink
            to={to}
            // Logic for active styling: Dashboard is usually 'end' to avoid matching all sub-routes
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
            <span className="truncate">{name}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {isDesktop && (
        <aside className="hidden lg:flex flex-col w-64 min-h-dvh bg-white border-r border-gray-200">
          <div className="flex h-16 items-center gap-4 px-4 border-b border-gray-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg">
              <span className="text-xl font-bold italic">C</span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-gray-900">
              {APP_NAME}
            </div>
          </div>
          <nav className="grow overflow-y-auto p-2">
            <NavContent />
          </nav>
        </aside>
      )}

      {/* Mobile Drawer */}
      {open && !isDesktop && (
        <>
          <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300">
            <div className="flex h-16 items-center justify-between px-6 border-b">
              <span className="font-bold text-xl text-indigo-600">{APP_NAME}</span>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                ✕
              </button>
            </div>
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