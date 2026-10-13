"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";

export default function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [invitationData, setInvitationData] = useState<{
    email: string;
    role: string;
    businessName: string;
    businessCity: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchInvitation() {
      try {
        const res = await fetch(`/api/invite?token=${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load invitation");
        setInvitationData(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Invalid invitation link");
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchInvitation();
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept invitation");

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error accepting invitation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Wrench className="h-8 w-8 text-teal-600 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-navy-600">Verifying invitation link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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
          Staff Workspace Invitation
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-navy-200/80 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-800 border border-red-200 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-3 py-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-navy-950">Invitation Accepted!</h3>
              <p className="text-xs text-navy-600">
                You are now a member of {invitationData?.businessName}. Redirecting to your workspace...
              </p>
            </div>
          ) : invitationData ? (
            <form onSubmit={handleAccept} className="space-y-4">
              <div className="rounded-xl bg-teal-50/70 border border-teal-200/80 p-4 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-teal-800">
                  Invited To Workspace
                </div>
                <div className="text-sm font-black text-navy-950">
                  {invitationData.businessName} ({invitationData.businessCity})
                </div>
                <div className="text-xs text-navy-600">
                  Role: <span className="font-bold text-teal-700">{invitationData.role}</span>
                </div>
                <div className="text-[11px] text-navy-500 font-mono">
                  Email: {invitationData.email}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. S. Murugan"
                  className="w-full rounded-lg border border-navy-300 px-3 py-2 text-xs text-navy-900 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1">
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-lg border border-navy-300 px-3 py-2 text-xs text-navy-900 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50 transition"
              >
                {submitting ? (
                  <span>Joining workspace...</span>
                ) : (
                  <>
                    <span>Accept & Enter Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <Link
                href="/login"
                className="text-xs font-bold text-teal-600 hover:text-teal-700"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
