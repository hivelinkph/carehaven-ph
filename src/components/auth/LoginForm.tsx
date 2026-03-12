"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Mail, Phone, Heart, Building2, ShieldCheck, User } from "lucide-react";

const ROLE_CONFIG = {
  client: {
    title: "Client Login",
    subtitle: "Sign in to check on your loved ones",
    icon: User,
    redirect: "/dashboard",
  },
  provider: {
    title: "Provider Login",
    subtitle: "Sign in to manage your facility",
    icon: Building2,
    redirect: "/dashboard/provider",
  },
  admin: {
    title: "Admin Login",
    subtitle: "Sign in to the admin dashboard",
    icon: ShieldCheck,
    redirect: "/admin",
  },
} as const;

export default function LoginForm() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") as keyof typeof ROLE_CONFIG | null;
  const roleConfig = roleParam && ROLE_CONFIG[roleParam] ? ROLE_CONFIG[roleParam] : ROLE_CONFIG.client;

  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    if (mode === "email") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
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

    // Redirect based on actual user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", (await supabase.auth.getUser()).data.user!.id)
      .single();

    const destination = profile?.role === "admin"
      ? "/admin"
      : profile?.role === "provider"
        ? "/dashboard/provider"
        : "/dashboard";
    router.push(destination);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f5] pt-20 pb-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2DD1AC] to-[#6a9bcc] flex items-center justify-center shadow-md">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
          </Link>
          <h1
            className="text-3xl font-bold text-[#2D3748] mt-6 mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {roleConfig.title}
          </h1>
          <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-body)" }}>
            {roleConfig.subtitle}
          </p>
        </div>

        {/* Mode Toggle */}
        <div
          className="flex rounded-xl bg-[#e8e6dc]/40 p-1 mb-8"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <button
            onClick={() => setMode("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "email"
                ? "bg-white text-[#2D3748] shadow-sm"
                : "text-[#b0aea5] hover:text-[#2D3748]"
              }`}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => setMode("phone")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "phone"
                ? "bg-white text-[#2D3748] shadow-sm"
                : "text-[#b0aea5] hover:text-[#2D3748]"
              }`}
          >
            <Phone className="w-4 h-4" />
            Phone
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {mode === "email" ? (
            <>
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          ) : (
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+63 9XX XXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600" style={{ fontFamily: "var(--font-ui)" }}>
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={loading}>
            {mode === "email" ? "Sign In" : "Send OTP"}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-[#2DD1AC] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
