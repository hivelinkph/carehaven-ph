"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Mail, Phone, Heart, UserPlus } from "lucide-react";

export default function SignupForm() {
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    if (mode === "email") {
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
    } else {
      const { error } = await supabase.auth.signUp({
        phone: phone.startsWith("+63") ? phone : `+63${phone}`,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    }

    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5] pt-20 pb-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#2DD1AC]/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-[#2DD1AC]" />
          </div>
          <h2
            className="text-2xl font-bold text-[#2D3748] mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Check Your Email
          </h2>
          <p className="text-[#b0aea5] mb-6" style={{ fontFamily: "var(--font-body)" }}>
            We&apos;ve sent a confirmation link to <strong className="text-[#2D3748]">{email}</strong>.
            Click the link to activate your account.
          </p>
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-[#2DD1AC] hover:underline"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            Back to login
          </Link>
        </div>
      </div>
    );
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
            Create Your Account
          </h1>
          <p className="text-[#b0aea5]" style={{ fontFamily: "var(--font-body)" }}>
            Start caring for your loved ones today
          </p>
        </div>

        {/* Mode Toggle */}
        <div
          className="flex rounded-xl bg-[#e8e6dc]/40 p-1 mb-8"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <button
            onClick={() => setMode("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === "email"
                ? "bg-white text-[#2D3748] shadow-sm"
                : "text-[#b0aea5] hover:text-[#2D3748]"
            }`}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => setMode("phone")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === "phone"
                ? "bg-white text-[#2D3748] shadow-sm"
                : "text-[#b0aea5] hover:text-[#2D3748]"
            }`}
          >
            <Phone className="w-4 h-4" />
            Phone
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            placeholder="Juan dela Cruz"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          {mode === "email" ? (
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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

          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600" style={{ fontFamily: "var(--font-ui)" }}>
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={loading}>
            <UserPlus className="w-5 h-5" />
            Create Account
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-[#b0aea5]" style={{ fontFamily: "var(--font-ui)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[#2DD1AC] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
