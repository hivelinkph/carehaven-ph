"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogIn, LogOut, LayoutDashboard, Building2, ShieldCheck, ChevronDown, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function FloatingNav() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const loginRef = useRef<HTMLDivElement>(null);
  const signupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setLoginOpen(false);
      }
      if (signupRef.current && !signupRef.current.contains(e.target as Node)) {
        setSignupOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/");
    router.refresh();
  };

  const dashboardLink = profile?.role === "admin"
    ? "/admin"
    : profile?.role === "provider"
      ? "/dashboard/provider"
      : "/dashboard";

  const dashboardLabel = profile?.role === "admin"
    ? "Admin"
    : profile?.role === "provider"
      ? "My Facility"
      : "Dashboard";

  const DashboardIcon = profile?.role === "admin"
    ? ShieldCheck
    : profile?.role === "provider"
      ? Building2
      : LayoutDashboard;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-6 lg:px-10 xl:px-16 pt-6">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="group">
          <span
            className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-lg"
            style={{ fontFamily: "var(--font-heading)", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
          >
            SeniorLiving
          </span>
          <span
            className="text-sm sm:text-base font-semibold text-[#2DD1AC] ml-1.5 drop-shadow-lg"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            PH
          </span>
        </Link>

        {/* Desktop Floating Buttons */}
        <div className="hidden md:flex items-center gap-3" style={{ fontFamily: "var(--font-ui)" }}>
          {session ? (
            <>
              <Link
                href={dashboardLink}
                className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full hover:bg-white/20 transition-all"
              >
                <DashboardIcon className="w-4 h-4" />
                {dashboardLabel}
              </Link>
              {profile?.role === "provider" && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full hover:bg-white/20 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Patient Hub
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm font-semibold text-white bg-red-500/80 backdrop-blur-md hover:bg-red-500 px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              {/* Login Dropdown */}
              <div className="relative" ref={loginRef}>
                <button
                  onClick={() => { setLoginOpen(!loginOpen); setSignupOpen(false); }}
                  className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-full hover:bg-white/20 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${loginOpen ? "rotate-180" : ""}`} />
                </button>
                {loginOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-[#e8e6dc] shadow-lg overflow-hidden animate-fade-in z-50">
                    <Link
                      href="/auth/login?role=client"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#2D3748] hover:bg-[#2DD1AC]/5 hover:text-[#2DD1AC] transition-all border-l-3 border-transparent hover:border-[#2DD1AC]"
                      onClick={() => setLoginOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Client Login
                    </Link>
                    <Link
                      href="/auth/login?role=provider"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#2D3748] hover:bg-[#2DD1AC]/5 hover:text-[#2DD1AC] transition-all border-l-3 border-transparent hover:border-[#2DD1AC]"
                      onClick={() => setLoginOpen(false)}
                    >
                      <Building2 className="w-4 h-4" />
                      Provider Login
                    </Link>
                    <Link
                      href="/auth/login?role=admin"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[#b0aea5] hover:bg-[#2DD1AC]/5 hover:text-[#2DD1AC] transition-all border-l-3 border-transparent hover:border-[#2DD1AC]"
                      onClick={() => setLoginOpen(false)}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Login
                    </Link>
                  </div>
                )}
              </div>
              {/* Sign Up Dropdown */}
              <div className="relative" ref={signupRef}>
                <button
                  onClick={() => { setSignupOpen(!signupOpen); setLoginOpen(false); }}
                  className="flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/80 hover:from-[#2DD1AC]/90 hover:to-[#2DD1AC]/70 px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl backdrop-blur-md transition-all"
                >
                  <User className="w-4 h-4" />
                  Sign Up
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${signupOpen ? "rotate-180" : ""}`} />
                </button>
                {signupOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-[#e8e6dc] shadow-lg overflow-hidden animate-fade-in z-50">
                    <Link
                      href="/auth/signup"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#2D3748] hover:bg-[#2DD1AC]/5 hover:text-[#2DD1AC] transition-all border-l-3 border-transparent hover:border-[#2DD1AC]"
                      onClick={() => setSignupOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Client Sign-up
                    </Link>
                    <Link
                      href="/auth/provider-signup"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#2D3748] hover:bg-[#2DD1AC]/5 hover:text-[#2DD1AC] transition-all border-l-3 border-transparent hover:border-[#2DD1AC]"
                      onClick={() => setSignupOpen(false)}
                    >
                      <Building2 className="w-4 h-4" />
                      Provider Sign-up
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden mt-4 bg-white/95 backdrop-blur-lg rounded-2xl border border-[#e8e6dc]/60 shadow-xl p-4 animate-fade-in"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <div className="flex flex-col gap-1">
            <Link
              href="/#facilities-map"
              className="text-sm font-medium text-[#2D3748]/70 hover:text-[#2DD1AC] py-3 px-3 rounded-lg hover:bg-[#e8e6dc]/30 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              Find Facilities
            </Link>
            <Link
              href="/#services"
              className="text-sm font-medium text-[#2D3748]/70 hover:text-[#2DD1AC] py-3 px-3 rounded-lg hover:bg-[#e8e6dc]/30 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/#about"
              className="text-sm font-medium text-[#2D3748]/70 hover:text-[#2DD1AC] py-3 px-3 rounded-lg hover:bg-[#e8e6dc]/30 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>
            <Link
              href="/facilities"
              className="text-sm font-medium text-[#2D3748]/70 hover:text-[#2DD1AC] py-3 px-3 rounded-lg hover:bg-[#e8e6dc]/30 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              All Facilities
            </Link>
            <div className="border-t border-[#e8e6dc] mt-2 pt-2">
              {session ? (
                <>
                  <Link
                    href={dashboardLink}
                    className="flex items-center gap-2 text-sm font-medium text-[#2D3748] py-3 px-3 rounded-lg hover:bg-[#e8e6dc]/30 transition-all"
                    onClick={() => setMobileOpen(false)}
                  >
                    <DashboardIcon className="w-4 h-4" />
                    {dashboardLabel}
                  </Link>
                  <button
                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-white bg-red-500 py-2.5 rounded-full hover:bg-red-600 transition-all mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-3 pt-1">Log In As</p>
                  <Link href="/auth/login?role=client" className="flex items-center gap-3 text-sm font-medium text-[#2D3748] py-2.5 px-3 rounded-lg hover:bg-[#e8e6dc]/30 transition-all" onClick={() => setMobileOpen(false)}>
                    <User className="w-4 h-4 text-[#2DD1AC]" /> Client Login
                  </Link>
                  <Link href="/auth/login?role=provider" className="flex items-center gap-3 text-sm font-medium text-[#2D3748] py-2.5 px-3 rounded-lg hover:bg-[#e8e6dc]/30 transition-all" onClick={() => setMobileOpen(false)}>
                    <Building2 className="w-4 h-4 text-[#2DD1AC]" /> Provider Login
                  </Link>
                  <p className="text-xs font-semibold text-[#b0aea5] uppercase tracking-wider px-3 pt-3">Sign Up As</p>
                  <Link href="/auth/signup" className="flex items-center gap-3 text-sm font-medium text-[#2D3748] py-2.5 px-3 rounded-lg hover:bg-[#e8e6dc]/30 transition-all" onClick={() => setMobileOpen(false)}>
                    <User className="w-4 h-4 text-[#2DD1AC]" /> Client Sign-up
                  </Link>
                  <Link href="/auth/provider-signup" className="flex items-center gap-3 text-sm font-medium text-[#2D3748] py-2.5 px-3 rounded-lg hover:bg-[#e8e6dc]/30 transition-all" onClick={() => setMobileOpen(false)}>
                    <Building2 className="w-4 h-4 text-[#2DD1AC]" /> Provider Sign-up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
