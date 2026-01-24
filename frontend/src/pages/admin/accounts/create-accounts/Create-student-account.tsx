import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  UserPlus,
  ShieldCheck,
  Mail,
  Fingerprint,
  User,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react";

const CreateStudentAccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.state?.activeTab || "student";

  const [loading, setLoading] = useState(false);

  // NEW: show/hide toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // NEW: inline errors
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    school_id: "",
    role: "STUDENT",
    grade_level: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // clear inline error as user types
    if (name === "password" || name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // NEW: strength rules (customize if you want)
  const passwordRules = useMemo(() => {
    const pwd = formData.password;

    return {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };
  }, [formData.password]);

  const isPasswordStrong = useMemo(() => {
    return (
      passwordRules.length &&
      passwordRules.upper &&
      passwordRules.lower &&
      passwordRules.number &&
      passwordRules.special
    );
  }, [passwordRules]);

  const doPasswordsMatch = useMemo(() => {
    return formData.password.length > 0 && formData.password === formData.confirmPassword;
  }, [formData.password, formData.confirmPassword]);

  // NEW: validate before submit
  const validatePasswords = () => {
    const nextErrors: { password?: string; confirmPassword?: string } = {};

    if (!isPasswordStrongEnough) {
      errors.password =
        "Password is too weak. Use at least 8 characters with uppercase, lowercase, number, and a symbol.";
    }


    if (formData.confirmPassword.length === 0) {
      nextErrors.confirmPassword = "Please re-enter the password.";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

    // Strength: 0..4
  const getPasswordScore = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++; // optional
    // cap at 4 if you want 4-level meter
    return Math.min(score, 4);
  };

  // Map score -> label
  const getStrengthLabel = (score: number) => {
    if (score <= 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Good";
    return "Strong";
  };

  // Map score -> tailwind class for bar color
  const getStrengthClass = (score: number) => {
    if (score <= 1) return "bg-red-500";
    if (score === 2) return "bg-yellow-500";
    if (score === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const passwordScore = useMemo(() => getPasswordScore(formData.password), [formData.password]);
  const passwordStrengthLabel = useMemo(() => getStrengthLabel(passwordScore), [passwordScore]);

  // decide what "strong enough" means (recommend 4 if special char required)
  const isPasswordStrongEnough = passwordScore >= 3;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ stops account creation if invalid
    if (!validatePasswords()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("access");

      const response = await fetch("http://127.0.0.1:8000/api/user/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          school_id: formData.school_id,
          student_profile: {
            grade_level: `GRADE_${formData.grade_level}`,
          },
          role: "STUDENT",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to create user");
      }

      alert("Account created successfully!");
      navigate("/admin/accounts", { state: { activeTab } });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // NEW: disable submit if invalid
  const canSubmit = isPasswordStrongEnough && doPasswordsMatch && !loading;


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="text-indigo-600" size={24} />
                Create Student Account
              </h2>
              <p className="text-sm text-gray-500">
                Fill in the details to register a new student.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Role Display */}
            <div className="flex items-center gap-3 px-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Account Role
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                {formData.role}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User size={14} /> First Name
                </label>
                <input
                  required
                  type="text"
                  name="firstName"
                  placeholder="e.g. Juan"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <input
                  required
                  type="text"
                  name="lastName"
                  placeholder="e.g. Dela Cruz"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail size={14} /> Email Address
              </label>
              <input
                required
                type="email"
                name="email"
                placeholder="juan.student@claroed.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID Number */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Fingerprint size={14} /> Student ID
                </label>
                <input
                  required
                  type="text"
                  name="school_id"
                  placeholder="2024-XXXX"
                  value={formData.school_id}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <GraduationCap size={14} /> Grade Level
                </label>
                <select
                  required
                  name="grade_level"
                  value={formData.grade_level}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer transition-all"
                >
                  <option value="">Select Grade</option>
                  {[7, 8, 9, 10].map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ShieldCheck size={14} /> Initial Password
              </label>

              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Inline password strength error */}
              {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}

              {/* Strength checklist */}
              {formData.password.length > 0 && (
                <div className="text-xs text-gray-600 space-y-1 mt-1">
                  {formData.password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Strength</span>
                        <span
                          className={`text-xs font-medium ${
                            passwordScore <= 1
                              ? "text-red-600"
                              : passwordScore === 2
                              ? "text-yellow-600"
                              : passwordScore === 3
                              ? "text-blue-600"
                              : "text-green-600"
                          }`}
                        >
                          {passwordStrengthLabel}
                        </span>
                      </div>

                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getStrengthClass(passwordScore)}`}
                          style={{ width: `${(passwordScore / 4) * 100}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-gray-500">
                        Use 8+ chars with upper/lowercase, a number, and a symbol.
                      </p>
                    </div>
                  )}
                </div>
              )}
              

              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mt-3">
                <ShieldCheck size={14} /> Repeat Password
              </label>

              <div className="relative">
                <input
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Inline match error */}
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}

              {/* Optional inline success indicator */}
              {formData.confirmPassword.length > 0 && !errors.confirmPassword && (
                <p className={`text-sm ${doPasswordsMatch ? "text-green-600" : "text-red-600"}`}>
                  {doPasswordsMatch ? "Passwords match." : "Passwords do not match."}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(
                  '/admin/accounts', 
                  {state: {activeTab}, }
                )}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-md disabled:bg-indigo-300"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>

            {/* Small helper note */}
            {!isPasswordStrong && formData.password.length > 0 && (
              <p className="text-xs text-gray-500">
                Tip: Use a mix of uppercase, lowercase, numbers, and symbols.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStudentAccountPage;
