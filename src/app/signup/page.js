"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useFormValidation } from "@/hooks/useFormValidation";
import { Alert } from "@/components/ui/Alert";

const validationRules = {
  name: { required: true, message: "Name is required" },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" },
  password: { required: true, minLength: 8, message: "Password must be at least 8 characters" },
  confirmPassword: { required: true, custom: (value, values) => value !== values.password ? "Passwords do not match" : "" },
};

export default function SignupPage() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { values, errors, handleChange, handleBlur, validateAll, reset } = useFormValidation(
    { name: "", email: "", password: "", confirmPassword: "" },
    validationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    if (!validateAll()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.field && data.error) {
          // Handle field-specific errors if needed
        } else {
          setGeneralError(data.error || "Failed to create account");
        }
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
          <h1 className="text-lg font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Start building forms in minutes</p>
        </div>

        <div className="card p-5">
          {generalError && (
            <Alert variant="error" className="mb-4" title="Error">
              {generalError}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              id="name"
              name="name"
              value={values.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              error={errors.name}
              placeholder="John Doe"
              disabled={isLoading}
              autoComplete="name"
            />
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
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              error={errors.confirmPassword}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="new-password"
            />
            <Button type="submit" fullWidth loading={isLoading} size="lg">
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}