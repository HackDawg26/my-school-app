import React from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { navigation } from "../../data/navigation";

import SidebarLogo from "./SidebarLogo";
import SidebarNavigation from "./SidebarNavigation";
import UserMenu from "./UserMenu";
import MobileHeader from "./MobileHeader";
import MobileDrawer from "./MobileDrawer";

interface SidebarProps {
  isDesktop?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isDesktop = false,
  open = false,
  onClose = () => {},
  onOpen = () => {},
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const activeLinks = user?.role
    ? navigation[user.role] ?? []
    : [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Header */}
      {!isDesktop && (
        <MobileHeader
          user={user}
          onOpen={onOpen}
          onLogout={handleLogout}
        />
      )}

      {/* Desktop Sidebar */}
      {isDesktop && (
        <aside className={`hidden h-screen w-67.5 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex`}>
          {/* Logo */}
          <div className="flex h-15 shrink-0 items-center border-b border-slate-100 px-6">
            <SidebarLogo />
          </div>

          {/* Navigation */}
          <div className="flex min-h-0 flex-1 flex-col">
            {/* <div className="px-5 pb-2 pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Main Menu
              </p>
            </div> */}

            <nav
              className="flex-1 overflow-y-auto px-3 pb-5">
              <SidebarNavigation links={activeLinks} />
            </nav>
          </div>

          {/* User */}
          <div
            className="shrink-0 border-t border-slate-100 bg-slate-50/50 p-3"
          >
            <UserMenu
              user={user}
              variant="desktop"
              onLogout={handleLogout}
            />
          </div>
        </aside>
      )}

      {/* Mobile Drawer */}
      {!isDesktop && open && (
        <MobileDrawer
          links={activeLinks}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;