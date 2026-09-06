import React from "react";
import { NavLink } from "react-router-dom";

interface NavigationItem {
  name: string;
  to: string;
  Icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
}

interface SidebarNavigationProps {
  links: NavigationItem[];
  onNavigate?: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  links,
  onNavigate,
}) => {
  return (
    <ul>
      {links.map(({ name, to, Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={name === "Dashboard"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative flex w-full items-center gap-4 rounded-xl px-4 py-5 text-left text-sm font-semibold transition ${
                isActive
                  ? "bg-[#f1efff] text-[#5545ef]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -left-2 h-7 w-1 rounded-r-full bg-[#6c5cf6]" />
                )}

                <Icon
                  className="size-5"
                  strokeWidth={2.1}
                />

                <span>{name}</span>
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default SidebarNavigation;