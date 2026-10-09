import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#080808] border-t border-[#1a1a1a] text-neutral-400 text-xs py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Footer Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#181818]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl ig-gradient-bg p-0.5 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="M19 9l-5 5-4-4-3 3" />
                <path d="M19 5h-5" />
                <path d="M19 5v5" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              Insta Followers <span className="ig-gradient-text">Increase</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Growth Packages
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => onNavigate('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className="hover:text-neutral-200 transition-colors flex items-center gap-1 text-neutral-500 cursor-pointer"
              title="Site Owner Administration (Authentication Required)"
            >
              <Lock className="w-3 h-3 text-neutral-500" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

        {/* Security & Integrity Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#111111] border border-[#202020]">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-white text-[11px]">Zero-Password Guarantee</div>
              <div className="text-[10px] text-neutral-400">Instagram passwords are never requested or stored.</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#111111] border border-[#202020]">
            <ShieldCheck className="w-4 h-4 text-[#0095f6] shrink-0" />
            <div>
              <div className="font-semibold text-white text-[11px]">Transparent Strategy Scope</div>
              <div className="text-[10px] text-neutral-400">Honest disclosure: No fake follower guarantees.</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#111111] border border-[#202020]">
            <Lock className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="font-semibold text-white text-[11px]">Server-Authorized RBAC</div>
              <div className="text-[10px] text-neutral-400">Hardened Supabase Row Level Security.</div>
            </div>
          </div>
        </div>

        {/* Disclaimer Text */}
        <div className="pt-2 text-[11px] text-neutral-400 space-y-2 text-left leading-relaxed">
          <p>
            <strong>Disclaimer & Third-Party Trademark Notice:</strong> "Instagram" and the Instagram camera logo are trademarks of Meta Platforms, Inc. "Supabase" is a trademark of Supabase Inc. This website is an independent service and is not affiliated, sponsored, authorized, endorsed, or partnered with Meta Platforms, Inc., Instagram, or Supabase Inc.
          </p>
          <p>
            Follower delivery and results are not guaranteed. Availability, timing, and results may vary. No particular follower count or delivery within 24 hours is promised.
          </p>
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-[#181818] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-neutral-400 gap-2">
          <span>© 2026 Insta Followers Increase. All rights reserved.</span>
          <span>Version 1.1.0 · Hardened Security & Protected Backend</span>
        </div>

      </div>
    </footer>
  );
};
