import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideBar from "./Sidebar";
import Topbar from "./Header";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // 1. Properly type the isDesktop state
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : true
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(min-width: 1024px)");
    
    // 2. Type the event as MediaQueryListEvent
    const handler = (ev: MediaQueryListEvent) => {
      setIsDesktop(ev.matches);
      if (ev.matches) setSidebarOpen(false); // Close mobile menu if window is resized to desktop
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Close sidebar drawer on route changes (mobile UX)
  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [location.pathname, isDesktop]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* SIDEBAR 
          Passes down the states we calculated 
      */}
      <SideBar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isDesktop={isDesktop}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
          isDesktop={isDesktop}
        />

        {/* Main Scrolling Area 
            h-full and overflow-y-auto ensure only the content scrolls, 
            keeping the Sidebar and Topbar fixed.
        */}
        <main className="flex-1 overflow-y-auto relative focus:outline-none">
          <div className="p-2">
            <Outlet /> 
          </div>
        </main>
      </div>
    </div>
  );
}