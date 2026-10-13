"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Wrench, ArrowRight, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process request");

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

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
          Reset your account password
        </h2>
        <p className="mt-1 text-xs text-navy-500">
          Enter your registered work email to receive password recovery instructions.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-navy-200/80 rounded-2xl sm:px-10">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-navy-900">Instructions Dispatched</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                If an account exists for <span className="font-semibold text-navy-900">{email}</span>, you will receive an email containing a secure link to reset your password.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 hover:text-teal-700"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-semibold text-rose-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-navy-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-navy-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.com"
                    className="block w-full pl-9 pr-3 py-2 border border-navy-200 rounded-xl text-xs placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-navy-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition"
              >
                {loading ? "Verifying..." : "Send Reset Instructions"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-navy-500 hover:text-navy-900 transition"
                >
                  Remembered your password? Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
