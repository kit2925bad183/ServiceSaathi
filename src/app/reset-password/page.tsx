"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Wrench, ArrowRight, Lock, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed");

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-navy-900">Password Reset Complete</h3>
        <p className="text-xs text-navy-600 leading-relaxed">
          Your account password has been updated successfully. Redirecting you to sign in...
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 hover:text-teal-700"
          >
            <span>Sign In Immediately</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-semibold text-rose-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!tokenFromUrl && (
        <div>
          <label htmlFor="token" className="block text-xs font-semibold text-navy-700 mb-1">
            Reset Token
          </label>
          <input
            id="token"
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your reset token here"
            className="block w-full px-3 py-2 border border-navy-200 rounded-xl text-xs placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-navy-900 font-mono"
          />
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-xs font-semibold text-navy-700 mb-1">
          New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-navy-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="block w-full pl-9 pr-3 py-2 border border-navy-200 rounded-xl text-xs placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-navy-900"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-semibold text-navy-700 mb-1">
          Confirm New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-navy-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            className="block w-full pl-9 pr-3 py-2 border border-navy-200 rounded-xl text-xs placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-navy-900"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition"
      >
        {loading ? "Updating..." : "Update Password"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-navy-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
            <Wrench className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-navy-950">
            ServiceSaathi
          </span>
        </Link>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-navy-900">
          Create new password
        </h2>
        <p className="mt-1 text-xs text-navy-500">
          Choose a secure, strong password for your ServiceSaathi account.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-navy-200/80 rounded-2xl sm:px-10">
          <Suspense fallback={<div className="text-center py-4 text-xs text-navy-500">Loading form...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
