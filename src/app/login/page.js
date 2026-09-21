"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case "email": if (!value.trim()) return "Email is required"; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format"; return "";
      case "password": if (!value) return "Password is required"; return "";
      default: return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    if (generalError) setGeneralError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    const newErrors = {};
    Object.keys(formData).forEach((key) => { const error = validateField(key, formData[key]); if (error) newErrors[key] = error; });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) { setGeneralError(data.error || "Invalid email or password"); return; }
      router.push("/forms"); router.refresh();
    } catch { setGeneralError("An unexpected error occurred. Please try again."); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-white text-xs font-bold">F</div>
            <span className="text-sm font-semibold tracking-tight">FormCraft</span>
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Welcome back</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Sign in to your account</p>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          {generalError && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-700">{generalError}</div>}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium mb-1">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                className={`w-full rounded-md border px-3 py-2 text-[13px] transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/20 ${errors.email ? "border-destructive focus:border-destructive" : "border-border bg-background focus:border-foreground/30"}`}
                placeholder="you@example.com" disabled={isLoading} autoComplete="email" />
              {errors.email && <p className="mt-1 text-[12px] text-destructive">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-[13px] font-medium mb-1">Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange}
                className={`w-full rounded-md border px-3 py-2 text-[13px] transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/20 ${errors.password ? "border-destructive focus:border-destructive" : "border-border bg-background focus:border-foreground/30"}`}
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" disabled={isLoading} autoComplete="current-password" />
              {errors.password && <p className="mt-1 text-[12px] text-destructive">{errors.password}</p>}
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full rounded-md bg-foreground px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed mt-1">
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>
          <p className="mt-4 text-center text-[13px] text-muted-foreground">
            Don&apos;t have an account? <Link href="/signup" className="font-medium text-foreground hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
