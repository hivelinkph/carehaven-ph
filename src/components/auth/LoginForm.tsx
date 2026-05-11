"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone } from "lucide-react";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    if (mode === "email") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith("+63") ? phone : `+63${phone}`,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", (await supabase.auth.getUser()).data.user!.id)
      .single();

    const explicitRedirect = searchParams.get("redirect");
    const destination = explicitRedirect
      ? explicitRedirect
      : profile?.role === "admin"
        ? "/admin"
        : profile?.role === "provider"
          ? "/dashboard/provider"
          : "/dashboard";
    router.push(destination);
    router.refresh();
  }

  return (
    <AuthLayout
      topRight={
        <>
          <Link href="/" className="font-semibold" style={{ color: "#1a8576" }}>
            ← Back to Home
          </Link>
          <span className="mx-3" style={{ color: "#cfd8d5" }}>|</span>
          New here?{" "}
          <Link href="/auth/signup" className="font-semibold" style={{ color: "#1a8576" }}>
            Create an account
          </Link>
        </>
      }
      title={
        <>
          Welcome back to{" "}
          <span style={{ color: "#1a8576" }}>
            SeniorLiving PH
          </span>
        </>
      }
      subtitle="Sign in to keep up with the people who matter."
    >
      {/* Mode toggle (email / phone) */}
      <div
        className="flex rounded-full bg-[#f3eee3] p-1 mb-5"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        <button
          type="button"
          onClick={() => setMode("email")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[13px] font-medium transition-all ${
            mode === "email" ? "bg-white shadow-sm" : "opacity-60"
          }`}
          style={{ color: "#0c4039" }}
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </button>
        <button
          type="button"
          onClick={() => setMode("phone")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[13px] font-medium transition-all ${
            mode === "phone" ? "bg-white shadow-sm" : "opacity-60"
          }`}
          style={{ color: "#0c4039" }}
        >
          <Phone className="w-3.5 h-3.5" />
          Phone
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {mode === "email" ? (
          <FieldWithIcon icon={Mail}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              className="w-full bg-transparent outline-none text-[14.5px] placeholder:opacity-60"
              style={{ color: "#0c4039", fontFamily: "var(--font-body)" }}
            />
          </FieldWithIcon>
        ) : (
          <FieldWithIcon icon={Phone}>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+63 9XX XXX XXXX"
              autoComplete="tel"
              className="w-full bg-transparent outline-none text-[14.5px] placeholder:opacity-60"
              style={{ color: "#0c4039", fontFamily: "var(--font-body)" }}
            />
          </FieldWithIcon>
        )}

        {mode === "email" && (
          <FieldWithIcon icon={Lock} trailing={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="opacity-60 hover:opacity-100"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full bg-transparent outline-none text-[14.5px] placeholder:opacity-60"
              style={{ color: "#0c4039", fontFamily: "var(--font-body)" }}
            />
          </FieldWithIcon>
        )}

        <div className="flex items-center justify-between text-[13px]" style={{ fontFamily: "var(--font-ui)" }}>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded accent-[#1a8576]"
            />
            <span style={{ color: "#5b6f6b" }}>Remember me</span>
          </label>
          <Link href="#" className="font-medium" style={{ color: "#1a8576" }}>
            Forgot password?
          </Link>
        </div>

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
          {loading ? "Signing in…" : (mode === "email" ? "Sign in" : "Send OTP")}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-7" style={{ fontFamily: "var(--font-ui)" }}>
        <span className="flex-1 h-px bg-[#ece4d2]" />
        <span className="text-[12px]" style={{ color: "#8a9c97" }}>or sign in with</span>
        <span className="flex-1 h-px bg-[#ece4d2]" />
      </div>

      {/* Social */}
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
    </AuthLayout>
  );
}

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
