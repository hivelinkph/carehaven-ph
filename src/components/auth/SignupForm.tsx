"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";

export default function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("Please agree to the Terms of Service to continue.");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const fullName = `${firstName} ${lastName}`.trim();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <AuthLayout
        title={
          <>
            Check your{" "}
            <span style={{ fontFamily: "var(--font-accent)", fontStyle: "italic", color: "#1a8576" }}>
              inbox
            </span>
          </>
        }
        subtitle="We've sent a confirmation link to activate your account."
      >
        <div className="rounded-2xl border bg-[#f5fbf9] p-5 flex items-start gap-3" style={{ borderColor: "#cfe9e0" }}>
          <span className="w-9 h-9 rounded-full bg-[#1a8576]/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" style={{ color: "#1a8576" }} />
          </span>
          <div className="text-[14px] leading-relaxed" style={{ color: "#0c4039", fontFamily: "var(--font-body)" }}>
            Confirmation sent to <strong>{email}</strong>. Click the link in the
            email to activate your CareHaven account.
          </div>
        </div>
        <Link
          href="/auth/login"
          className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-white text-[14.5px] font-semibold shadow-md hover:opacity-95 transition-all"
          style={{ background: "#1a8576", fontFamily: "var(--font-ui)" }}
        >
          Back to sign in
          <ArrowRight className="w-4 h-4" />
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      wide
      topRight={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold" style={{ color: "#1a8576" }}>
            Sign in
          </Link>
        </>
      }
      title={
        <>
          Welcome to{" "}
          <span style={{ fontFamily: "var(--font-accent)", fontStyle: "italic", color: "#1a8576" }}>
            CareHaven
          </span>
        </>
      }
      subtitle="Create your account to get started"
    >
      <form onSubmit={handleSignup} className="space-y-4">
        {/* First / Last */}
        <div className="grid grid-cols-2 gap-3">
          <FieldWithIcon icon={User}>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              autoComplete="given-name"
              className="w-full bg-transparent outline-none text-[14.5px] placeholder:opacity-60"
              style={{ color: "#0c4039", fontFamily: "var(--font-body)" }}
            />
          </FieldWithIcon>
          <FieldWithIcon icon={User}>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              autoComplete="family-name"
              className="w-full bg-transparent outline-none text-[14.5px] placeholder:opacity-60"
              style={{ color: "#0c4039", fontFamily: "var(--font-body)" }}
            />
          </FieldWithIcon>
        </div>

        <FieldWithIcon icon={Mail}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            autoComplete="email"
            className="w-full bg-transparent outline-none text-[14.5px] placeholder:opacity-60"
            style={{ color: "#0c4039", fontFamily: "var(--font-body)" }}
          />
        </FieldWithIcon>

        <FieldWithIcon
          icon={Lock}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="opacity-60 hover:opacity-100"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        >
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="new-password"
            className="w-full bg-transparent outline-none text-[14.5px] placeholder:opacity-60"
            style={{ color: "#0c4039", fontFamily: "var(--font-body)" }}
          />
        </FieldWithIcon>

        <FieldWithIcon
          icon={Lock}
          trailing={
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="opacity-60 hover:opacity-100"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        >
          <input
            type={showConfirm ? "text" : "password"}
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm Password"
            autoComplete="new-password"
            className="w-full bg-transparent outline-none text-[14.5px] placeholder:opacity-60"
            style={{ color: "#0c4039", fontFamily: "var(--font-body)" }}
          />
        </FieldWithIcon>

        {/* T&S */}
        <label className="flex items-start gap-2.5 text-[13px] cursor-pointer select-none" style={{ fontFamily: "var(--font-ui)" }}>
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded accent-[#1a8576]"
          />
          <span style={{ color: "#5b6f6b" }}>
            I agree to the{" "}
            <Link href="#" className="font-semibold" style={{ color: "#1a8576" }}>Terms of Service</Link>
            {" "}and{" "}
            <Link href="#" className="font-semibold" style={{ color: "#1a8576" }}>Privacy Policy</Link>
          </span>
        </label>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-700" style={{ fontFamily: "var(--font-ui)" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-white text-[14.5px] font-semibold shadow-md hover:opacity-95 disabled:opacity-60 transition-all"
          style={{ background: "#1a8576", fontFamily: "var(--font-ui)" }}
        >
          {loading ? "Creating your account…" : "Create Account"}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      <div className="flex items-center gap-3 my-7" style={{ fontFamily: "var(--font-ui)" }}>
        <span className="flex-1 h-px bg-[#ece4d2]" />
        <span className="text-[12px]" style={{ color: "#8a9c97" }}>or sign up with</span>
        <span className="flex-1 h-px bg-[#ece4d2]" />
      </div>

      <div className="grid grid-cols-2 gap-3" style={{ fontFamily: "var(--font-ui)" }}>
        <SocialButton label="Google" icon={
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path fill="#EA4335" d="M12 11v3.6h5.1c-.2 1.4-1.6 4.1-5.1 4.1-3.1 0-5.6-2.5-5.6-5.7s2.5-5.7 5.6-5.7c1.7 0 2.9.7 3.6 1.4l2.5-2.4C16.6 4.6 14.5 3.7 12 3.7 6.9 3.7 2.8 7.8 2.8 12.9S6.9 22.1 12 22.1c6.9 0 9.5-4.8 9.5-7.3 0-.5 0-.9-.1-1.3H12z" />
          </svg>
        } />
        <SocialButton label="Facebook" icon={
          <svg viewBox="0 0 24 24" className="w-4 h-4">
            <path fill="#1877F2" d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7C18.3 21.1 22 17 22 12z" />
          </svg>
        } />
      </div>

      <p className="text-center mt-6 text-[13px]" style={{ fontFamily: "var(--font-ui)", color: "#5b6f6b" }}>
        Are you a facility owner?{" "}
        <Link href="/auth/provider-signup" className="font-semibold" style={{ color: "#1a8576" }}>
          Register your facility
        </Link>
      </p>
    </AuthLayout>
  );

  function FieldWithIcon({
    icon: Icon,
    children,
    trailing,
  }: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    children: React.ReactNode;
    trailing?: React.ReactNode;
  }) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-white transition-colors focus-within:border-[#1a8576]"
        style={{ borderColor: "#ece4d2" }}
      >
        <Icon className="w-4 h-4" style={{ color: "#1a8576" }} />
        <div className="flex-1">{children}</div>
        {trailing}
      </div>
    );
  }

  function SocialButton({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 py-2.5 rounded-full border bg-white text-[13.5px] font-medium hover:bg-[#fbf9f3] transition-all"
        style={{ borderColor: "#ece4d2", color: "#0c4039" }}
      >
        {icon}
        {label}
      </button>
    );
  }
}
