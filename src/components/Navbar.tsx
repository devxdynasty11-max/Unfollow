import React from 'react';
import { User, LogOut } from 'lucide-react';
import { Profile } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: Profile | null;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-black/95 backdrop-blur-md border-b border-[#1f1f1f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark with Instagram Gradient Upward Logo */}
        <button
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl ig-gradient-bg p-0.5 shadow-md group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-black/30 rounded-[10px] flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white"
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
          </div>
          <div className="flex items-baseline">
            <span className="text-lg font-bold tracking-tight text-white">Insta Followers</span>
            <span className="text-lg font-bold ml-1.5 ig-gradient-text">Increase</span>
          </div>
        </button>

        {/* Public Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => setCurrentTab('home')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'home' ? 'text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'dashboard' ? 'text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Growth Packages
          </button>
          <button
            onClick={() => setCurrentTab('terms')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'terms' ? 'text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Terms & Conditions
          </button>
          <button
            onClick={() => setCurrentTab('privacy')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'privacy' ? 'text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Privacy Policy
          </button>
        </nav>

        {/* User Account Controls */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161616] border border-[#2b2b2b] text-xs text-neutral-200 hover:border-neutral-600 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-pink-500" />
                <span className="font-medium truncate max-w-[130px]">
                  @{currentUser.display_name || currentUser.username_or_email}
                </span>
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0095f6] hover:bg-[#1877f2] rounded-lg transition-all shadow-md shadow-blue-500/20 whitespace-nowrap cursor-pointer"
            >
              Get Started / Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
