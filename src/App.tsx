/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Dashboard } from './components/Dashboard';
import { TermsPage } from './components/TermsPage';
import { PrivacyPage } from './components/PrivacyPage';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { Profile } from './types';
import { DatabaseService } from './lib/databaseService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'dashboard' | 'terms' | 'privacy' | 'admin'>('home');
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingIdentifier, setOnboardingIdentifier] = useState('creator_demo');

  // Check persisted user session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('app_active_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user && user.id) {
          setCurrentUser(user);
        }
      }
    } catch {}
  }, []);

  const handleStartOnboarding = (identifier: string) => {
    setOnboardingIdentifier(identifier || 'creator_user');
    setShowOnboarding(true);
  };

  const handleQuickLogin = async (identifier: string) => {
    try {
      const profile = await DatabaseService.createOrGetProfile(identifier);
      setCurrentUser(profile);
      try {
        localStorage.setItem('app_active_user', JSON.stringify(profile));
      } catch {}
      setCurrentTab('dashboard');
    } catch {
      handleStartOnboarding(identifier);
    }
  };

  const handleOnboardingCompleted = (profile: Profile) => {
    setCurrentUser(profile);
    try {
      localStorage.setItem('app_active_user', JSON.stringify(profile));
    } catch {}
    setShowOnboarding(false);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('app_active_user');
    } catch {}
    setCurrentTab('home');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-pink-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => setCurrentTab(tab as any)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => handleStartOnboarding('new_creator')}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <LandingHero
            onStartOnboarding={handleStartOnboarding}
            onQuickLogin={handleQuickLogin}
            onExplorePackages={() => {
              if (currentUser) {
                setCurrentTab('dashboard');
              } else {
                // If not logged in, open onboarding or go to dashboard
                handleStartOnboarding('explore_packages');
              }
            }}
          />
        )}

        {currentTab === 'dashboard' && (
          currentUser ? (
            <Dashboard
              currentUser={currentUser}
              onOpenPrivacy={() => setCurrentTab('privacy')}
            />
          ) : (
            <div className="max-w-xl mx-auto px-4 py-20 text-center">
              <div className="w-16 h-16 rounded-2xl ig-gradient-bg p-1 mx-auto mb-6">
                <div className="w-full h-full bg-black/40 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold">IG</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Access Follower Growth Dashboard</h2>
              <p className="text-neutral-400 text-sm mb-6">
                Please enter your account details or complete the quick verified onboarding to view and manage growth packages.
              </p>
              <button
                onClick={() => handleStartOnboarding('new_creator')}
                className="px-6 py-3 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20"
              >
                Get Started with Verification
              </button>
            </div>
          )
        )}

        {currentTab === 'terms' && (
          <TermsPage onBack={() => setCurrentTab(currentUser ? 'dashboard' : 'home')} />
        )}

        {currentTab === 'privacy' && (
          <PrivacyPage
            onBack={() => setCurrentTab(currentUser ? 'dashboard' : 'home')}
            currentUserId={currentUser?.id}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel
            onBack={() => setCurrentTab(currentUser ? 'dashboard' : 'home')}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Onboarding & Confirmation Modal */}
      {showOnboarding && (
        <OnboardingFlow
          initialIdentifier={onboardingIdentifier}
          onCompleted={handleOnboardingCompleted}
          onCancel={() => setShowOnboarding(false)}
          onOpenTerms={() => {
            setShowOnboarding(false);
            setCurrentTab('terms');
          }}
          onOpenPrivacy={() => {
            setShowOnboarding(false);
            setCurrentTab('privacy');
          }}
        />
      )}

      {/* Footer with Legal & Meta Trademark Disclaimers */}
      <Footer onNavigate={(tab) => setCurrentTab(tab as any)} />
    </div>
  );
}
