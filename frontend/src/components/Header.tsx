import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Menu } from "lucide-react/dist/lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import your Auth hook

// Import your avatar
// import userAvatar from "../../assets/dp.png";

// 1. Define the Props Interface
interface TopbarProps {
  isDesktop?: boolean;
  onOpenSidebar: () => void;
}

// 2. Define Theme Type
type Theme = "light" | "dark";

export default function Topbar({ isDesktop = false, onOpenSidebar }: TopbarProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const { logout, user } = useAuth(); // Get logout and user info from your context
  const navigate = useNavigate();
  
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("theme") as Theme) || "light";
  });

  // 3. Type the Ref (HTMLDivElement because it's a <div> container)
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // 4. Properly type the Event
    function onClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      // Use Node type for contains check
      if (!dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const toggleDropdown = () => setDropdownOpen((s) => !s);
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const handleLogout = () => {
    logout(); // This clears localStorage and AuthContext
    navigate("/login");
  };

  return (
    <header className="border-b border-gray-200 p-3 flex items-center justify-between bg-white shadow-sm h-16">
      <div className="flex items-center space-x-3 min-w-0">
        {!isDesktop && (
          <button
            onClick={onOpenSidebar}
            aria-label="Open menu"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-2"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        {/* User context info (Optional Senior Dev addition) */}
        <div className="hidden sm:block">
           <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
             {user?.role} PORTAL
           </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          className="rounded-full p-2 hover:bg-gray-100 transition-colors"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="relative z-50" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-all focus:ring-2 focus:ring-indigo-500"
          >
            <img
            //   src={userAvatar}
              alt="User Avatar"
              className="w-10 h-10 object-cover rounded-full border-2 border-white shadow-sm"
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
              
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                My Profile
              </Link>

              <button
                className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}