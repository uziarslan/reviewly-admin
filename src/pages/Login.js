import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import logo from "../Assets/logo.png";

export default function Login() {
  const { admin, loading, login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* Already logged in → go to dashboard */
  React.useEffect(() => {
    if (!loading && admin) navigate("/dashboard", { replace: true });
  }, [admin, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter email and password");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4FF]">
        <div className="w-8 h-8 border-4 border-[#6E43B9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F4FF] px-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_2px_12px_0_rgba(20,20,43,0.08)] p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Reviewly" className="h-10 w-auto object-contain" />
        </div>

        <h1 className="text-center font-inter font-semibold text-[22px] text-[#111927] mb-1">
          Admin Login
        </h1>
        <p className="text-center font-inter text-[14px] text-[#6C737F] mb-6">
          Sign in to manage Reviewly
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-inter text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <label htmlFor="email" className="block font-inter font-medium text-[13px] text-[#45464E] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full h-12 rounded-lg border border-[#D2D6DB] bg-white px-3 font-inter text-sm text-[#111927] outline-none focus:border-[#6E43B9] focus:ring-2 focus:ring-[#6E43B9]/30 transition-colors"
              placeholder="admin@reviewly.com"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block font-inter font-medium text-[13px] text-[#45464E] mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full h-12 rounded-lg border border-[#D2D6DB] bg-white px-3 font-inter text-sm text-[#111927] outline-none focus:border-[#6E43B9] focus:ring-2 focus:ring-[#6E43B9]/30 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-lg bg-[#6E43B9] text-white font-inter font-semibold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
