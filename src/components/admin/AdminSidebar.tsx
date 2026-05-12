"use client";

import Image from "next/image";
import Link from "next/link";
import { Building2, ClipboardList, MessageSquareQuote, BarChart3, Images, Menu, X, LogOut } from "lucide-react";

export type AdminTab = "facilities" | "questionnaire" | "testimonials" | "gallery" | "reports";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  isOpen: boolean;
  onToggle: () => void;
  onSignOut: () => void;
}

const TABS: { key: AdminTab; label: string; icon: typeof Building2 }[] = [
  { key: "facilities", label: "Facilities", icon: Building2 },
  { key: "questionnaire", label: "Questionnaire", icon: ClipboardList },
  { key: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { key: "gallery", label: "Gallery", icon: Images },
  { key: "reports", label: "Reports", icon: BarChart3 },
];

export default function AdminSidebar({ activeTab, onTabChange, isOpen, onToggle, onSignOut }: AdminSidebarProps) {
  return (
    <>
      {/* Toggle Button - always visible */}
      <button
        onClick={onToggle}
        className="fixed top-6 left-4 z-50 p-2.5 rounded-xl bg-white border-2 border-[#e8e6dc] shadow-md hover:shadow-lg hover:border-[#2DD1AC]/40 transition-all"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-[#2D3748]" />
        ) : (
          <Menu className="w-5 h-5 text-[#2D3748]" />
        )}
      </button>

      {/* Backdrop - mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 bg-white border-r border-[#e8e6dc] shadow-xl transition-transform duration-300 ease-in-out w-64 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-20 pb-6 px-4">
          {/* Brand Logo */}
          <div className="px-3 mb-8">
            <Link href="/">
              <Image
                src="/logo2.png"
                alt="SeniorLiving PH"
                width={160}
                height={64}
                className="h-[47px] w-auto cursor-pointer"
                priority
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    onTabChange(tab.key);
                    // Close on mobile
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#2DD1AC]/10 text-[#2DD1AC] border border-[#2DD1AC]/20"
                      : "text-[#2D3748]/70 hover:bg-[#faf9f5] hover:text-[#2D3748]"
                  }`}
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  <tab.icon className={`w-5 h-5 ${isActive ? "text-[#2DD1AC]" : "text-[#b0aea5]"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Sign Out */}
          <button
            onClick={onSignOut}
            className="cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
