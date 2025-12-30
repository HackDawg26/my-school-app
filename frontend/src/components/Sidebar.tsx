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

// 1. Define the Shape of a Navigation Link
interface NavItem {
  name: string;
  to: string;
  Icon: LucideIcon;
  roles: Array<'ADMIN' | 'TEACHER' | 'STUDENT'>; // Which roles can see this?
}

// 2. Define the Props for the Sidebar
interface SideBarProps {
  isDesktop?: boolean;
  open?: boolean;
  onClose?: () => void;
}

// 3. Centralized Navigation Config
const navLinks: NavItem[] = [
  { name: "Dashboard", to: "/", Icon: LayoutDashboard, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { name: "Subjects", to: "/subject", Icon: BookCopy, roles: ['TEACHER', 'STUDENT'] },
  { name: "Analytics", to: "/analytics", Icon: BarChart3, roles: [ 'TEACHER'] },
  { name: "Submissions", to: "/submissions", Icon: CheckSquare, roles: ['TEACHER', 'STUDENT'] },
  { name: "Gradebook", to: "/gradebook", Icon: Book, roles: ['TEACHER', 'STUDENT'] },
  { name: "Advisory Class", to: "/teacher/advisory-class", Icon: Banknote, roles: ['TEACHER'] },
  { name: "Faculty", to: "/admin/faculty", Icon: Users, roles: ['ADMIN'] },
  { name: "Students", to: "/admin/students", Icon: Users, roles: ['ADMIN'] },
  { name: "Sections", to: "/admin/sections", Icon: Users, roles: ['ADMIN'] },
  { name: "Grade Logs", to: "/admin/gradelogs", Icon: Users, roles: ['ADMIN'] },

];

const SideBar: React.FC<SideBarProps> = ({ isDesktop = false, open = false, onClose = () => {} }) => {
  const { user } = useAuth();
  
  const linkBase = "group flex items-center px-3 py-2 text-sm font-medium m-2 gap-3 rounded-lg transition-colors";

    // 1. Helper to determine the path prefix based on role
    const getRolePrefix = (role: string) => `/${role.toLowerCase()}`;

    // 2. Map and Filter links
    const filteredLinks = navLinks
    .filter(link => user?.role && link.roles.includes(user.role as any))
    .map(link => {
        if (!user) return link;

        const rolePrefix = getRolePrefix(user.role);

        // If it's the Dashboard, use your existing specialized logic
        if (link.name === "Dashboard") {
        return { ...link, to: `${rolePrefix}/dashboard` };
        }

        // List of tabs that are "shared" but need separate URLs
        const sharedTabs = ["Subjects", "Analytics", "Submissions", "Gradebook"];
        
        if (sharedTabs.includes(link.name)) {
        return { ...link, to: `${rolePrefix}${link.to}` };
        }

        // Admin links already have "/admin/..." in their path, so we leave them as is
        return link;
    });

  // Reusable Nav Component to keep code DRY
  const NavContent = () => (
    <ul className="flex flex-col">
      {filteredLinks.map(({ name, to, Icon }) => (
        <li key={name}>
          <NavLink
            to={to}
            end={to === "/"}
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