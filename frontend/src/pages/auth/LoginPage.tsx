import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

// Logo Component
const SchoolLogo = () => (
  <div className="flex items-center gap-3">
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsla(221,44%,40%)]">
      <svg
        className="h-7 w-7 text-white"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
    <div className="flex flex-col text-left">
      <h2 className="font-headline text-3xl font-semibold leading-none">ClaroEd</h2>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        Management System
      </span>
    </div>
  </div>
);

type Role = "STUDENT" | "TEACHER" | "ADMIN";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate input
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login with:", { email });
      
      // Call backend
      const res = await axios.post("http://127.0.0.1:8000/api/token/", {
        email,
        password,
      });

      console.log("Login response:", res.data);

      const { access, refresh, user } = res.data;

      if (!user?.role) throw new Error("User role not defined");

      const role = String(user.role).toUpperCase() as Role;

      // Store tokens (optional but common)
      localStorage.setItem("access", access);
      if (refresh) localStorage.setItem("refresh", refresh);

      const userData = {
        id: String(user.id),
        email: user.email,
        role,
        token: access,
      };

      localStorage.setItem("user", JSON.stringify(userData));

      // Update AuthContext
      login(userData);

      // Navigate by role
      const dashboardMap: Record<Role, string> = {
        ADMIN: "/admin/dashboard",
        TEACHER: "/teacher/dashboard",
        STUDENT: "/student/dashboard",
      };

      navigate(dashboardMap[role]);
    } catch (err: any) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);

      // Axios error handling
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Invalid email or password. Please try again.");
        } else if (err.response?.status === 400) {
          const errorMsg = err.response?.data?.email?.[0] || err.response?.data?.password?.[0] || "Invalid email or password.";
          setError(errorMsg);
        } else {
          setError("An error occurred during login. Please try again later.");
        }
      } else {
        setError(err?.message || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center flex flex-col items-center">
          <SchoolLogo />
          <h2 className="mt-8 text-2xl font-bold">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access your dashboard
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              required
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-xl disabled:opacity-70"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};
