"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Heart, User, LogIn, LogOut, LayoutDashboard, Building2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
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
    ? "/provider/dashboard"
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e8e6dc]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DD1AC] to-[#6a9bcc] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <span
                className="text-xl font-bold text-[#2D3748] tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                CareHaven
              </span>
              <span className="text-xs font-semibold text-[#2DD1AC] ml-1" style={{ fontFamily: "var(--font-ui)" }}>
                PH
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8" style={{ fontFamily: "var(--font-ui)" }}>
            <Link
              href="/#facilities-map"
              className="text-sm font-medium text-[#2D3748]/70 hover:text-[#2DD1AC] transition-colors"
            >
              Find Facilities
            </Link>
            <Link
              href="/#services"
              className="text-sm font-medium text-[#2D3748]/70 hover:text-[#2DD1AC] transition-colors"
            >
              Services
            </Link>
            <Link
              href="/#about"
              className="text-sm font-medium text-[#2D3748]/70 hover:text-[#2DD1AC] transition-colors"
            >
              About
            </Link>
            <Link
              href="/facilities"
              className="text-sm font-medium text-[#2D3748]/70 hover:text-[#2DD1AC] transition-colors"
            >
              All Facilities
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3" style={{ fontFamily: "var(--font-ui)" }}>
            {session ? (
              <>
                <Link
                  href={dashboardLink}
                  className="flex items-center gap-2 text-sm font-medium text-[#2D3748] hover:text-[#2DD1AC] transition-colors px-4 py-2"
                >
                  <DashboardIcon className="w-4 h-4" />
                  {dashboardLabel}
                </Link>
                {profile?.role === "provider" && (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-medium text-[#2D3748]/60 hover:text-[#2DD1AC] transition-colors px-3 py-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Patient Hub
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 text-sm font-medium text-[#2D3748] hover:text-[#2DD1AC] transition-colors px-4 py-2"
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/80 hover:from-[#2DD1AC]/90 hover:to-[#2DD1AC]/70 px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <User className="w-4 h-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#e8e6dc]/50 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6 text-[#2D3748]" /> : <Menu className="w-6 h-6 text-[#2D3748]" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-6 animate-fade-in" style={{ fontFamily: "var(--font-ui)" }}>
            <div className="flex flex-col gap-2 pt-2 border-t border-[#e8e6dc]">
              <Link
                href="/#facilities-map"
                className="text-sm font-medium text-[#2D3748]/70 hover:text-[#2DD1AC] py-3 px-2 rounded-lg hover:bg-[#e8e6dc]/30 transition-all"
                onClick={() => setIsOpen(false)}
              >
                Find Facilities
              </Link>
              <Link
                href="/#services"
                className="text-sm font-medium text-[#2D3748]/70 hover:text-[#2DD1AC] py-3 px-2 rounded-lg hover:bg-[#e8e6dc]/30 transition-all"
                onClick={() => setIsOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/#about"
                className="text-sm font-medium text-[#2D3748]/70 hover:text-[#2DD1AC] py-3 px-2 rounded-lg hover:bg-[#e8e6dc]/30 transition-all"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/facilities"
                className="text-sm font-medium text-[#2D3748]/70 hover:text-[#2DD1AC] py-3 px-2 rounded-lg hover:bg-[#e8e6dc]/30 transition-all"
                onClick={() => setIsOpen(false)}
              >
                All Facilities
              </Link>
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[#e8e6dc]">
                {session ? (
                  <>
                    <Link
                      href={dashboardLink}
                      className="flex items-center gap-2 text-sm font-medium text-[#2D3748] py-3 px-2 rounded-lg hover:bg-[#e8e6dc]/30 transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <DashboardIcon className="w-4 h-4" />
                      {dashboardLabel}
                    </Link>
                    {profile?.role === "provider" && (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm font-medium text-[#2D3748]/60 py-3 px-2 rounded-lg hover:bg-[#e8e6dc]/30 transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Patient Hub
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-red-500 py-2.5 rounded-full hover:bg-red-600 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      href="/auth/login"
                      className="flex-1 text-center text-sm font-medium text-[#2D3748] border border-[#e8e6dc] py-2.5 rounded-full hover:bg-[#e8e6dc]/30 transition-all"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="flex-1 text-center text-sm font-semibold text-white bg-[#2DD1AC] py-2.5 rounded-full hover:bg-[#2DD1AC]/90 transition-all"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
