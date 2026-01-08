import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      <h2 className="font-headline text-3xl font-semibold leading-none">
        ClaroEd
      </h2>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        Management System
      </span>
    </div>
  </div>
);

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

    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();

      if (!data.user || !data.user.role) {
        throw new Error("User role not defined");
      }

      // Normalize role to uppercase
      const role = data.user.role.toUpperCase();

      // Create User object for AuthContext
      const user = {
        id: data.user.id,
        email: data.user.email,
        role: role as "STUDENT" | "TEACHER" | "ADMIN",
        token: data.access,
      };

      // Update AuthContext
      login(user);

      // Persist user and tokens in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      // Redirect to dashboard based on role
      const dashboardMap: Record<string, string> = {
        ADMIN: "/admin/dashboard",
        TEACHER: "/teacher/dashboard",
        STUDENT: "/student/dashboard",
      };

      navigate(dashboardMap[role] || "/login");
    } catch (err: any) {
      setError(err.message || "Login failed");
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
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
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
