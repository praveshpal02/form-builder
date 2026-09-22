"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useFormValidation } from "@/hooks/useFormValidation";
import { Alert } from "@/components/ui/Alert";

const validationRules = {
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" },
  password: { required: true, message: "Password is required" },
};

export default function LoginPage() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { values, errors, handleChange, handleBlur, validateAll, reset } = useFormValidation(
    { email: "", password: "" },
    validationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    if (!validateAll()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setGeneralError(data.error || "Invalid email or password");
        return;
      }
      router.push("/forms");
      router.refresh();
    } catch {
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-lg font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Sign in to your account</p>
        </div>

        <div className="card p-5">
          {generalError && (
            <Alert variant="error" className="mb-4" title="Error">
              {generalError}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              error={errors.email}
              placeholder="you@example.com"
              disabled={isLoading}
              autoComplete="email"
            />
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              value={values.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              error={errors.password}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="current-password"
            />
            <Button type="submit" fullWidth loading={isLoading} size="lg">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account? <Link href="/signup" className="font-medium text-foreground hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}