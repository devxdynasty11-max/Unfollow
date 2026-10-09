import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ChevronDown, ArrowLeft, Heart } from 'lucide-react';
import storyPhoto from '../assets/images/instagram_story_mockup_1791542497875.jpg';

interface LandingHeroProps {
  onStartOnboarding: (identifier: string) => void;
  onQuickLogin: (identifier: string) => void;
  onExplorePackages: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartOnboarding,
  onQuickLogin,
  onExplorePackages,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English (India)');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your mobile number, username, or email.');
      return;
    }
    setError('');
    onStartOnboarding(identifier.trim());
  };

  const handleCreateNewAccount = () => {
    const handle = identifier.trim() || 'creator_account';
    onStartOnboarding(handle);
  };

  const handleGoogleLogin = () => {
    onStartOnboarding('google_user@gmail.com');
  };

  return (
    <div className="w-full bg-black min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      
      {/* ==================================================================== */}
      {/* 1. DESKTOP VIEWPORT (Matches Reference Image 1)                      */}
      {/* ==================================================================== */}
      <div className="hidden lg:grid lg:grid-cols-2 w-full min-h-[calc(100vh-4rem)]">
        
        {/* DESKTOP LEFT COLUMN: Black Background, Brand Logo, Title, Subtitle, Story Cards Stack */}
        <div className="bg-black flex flex-col justify-center items-start px-12 xl:px-20 py-12 border-r border-[#1a1a1a]">
          {/* Top Left Brand Logo (Rounded square, IG gradient, white upward chart arrow) */}
          <div className="w-14 h-14 rounded-2xl ig-gradient-bg p-0.5 shadow-xl mb-6">
            <div className="w-full h-full bg-black/25 rounded-[14px] flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-white filter drop-shadow"
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

          {/* Heading */}
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white mb-2">
            Insta Followers <span className="ig-gradient-text">Increase</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg xl:text-xl text-white mb-8">
            Grow your profile.{' '}
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500">
              Get real followers.
            </span>
          </p>

          {/* Realistic Story Cards Stack Composition (Matches Reference Image 1) */}
          <div className="relative w-full max-w-[380px] h-[380px] flex items-center justify-center mt-2 select-none">
            {/* Background Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/15 via-purple-600/10 to-amber-500/5 blur-3xl -z-10 rounded-full" />

            {/* Left Angled Card */}
            <div className="absolute left-2 top-8 w-[160px] h-[250px] bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl transform -rotate-12 transition-transform duration-300">
              <div className="w-full h-full bg-gradient-to-b from-neutral-800 to-neutral-950 p-2.5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full ig-gradient-bg p-0.5">
                    <div className="w-full h-full bg-black rounded-full" />
                  </div>
                  <span className="text-[10px] font-medium text-neutral-300">@sarah_art</span>
                </div>
                <div className="p-2 bg-black/60 rounded-xl backdrop-blur-sm border border-white/5">
                  <div className="text-[10px] text-pink-400 font-semibold">+1,240 profile visits</div>
                  <div className="w-full bg-neutral-800 h-1 rounded-full mt-1 overflow-hidden">
                    <div className="bg-gradient-to-r from-pink-500 to-amber-400 h-full w-4/5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Angled Card */}
            <div className="absolute right-2 top-6 w-[160px] h-[250px] bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl transform rotate-12 transition-transform duration-300">
              <div className="w-full h-full bg-gradient-to-b from-neutral-800 to-neutral-950 p-2.5 flex flex-col justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full ig-gradient-bg p-0.5">
                    <div className="w-full h-full bg-black rounded-full" />
                  </div>
                  <span className="text-[10px] font-medium text-neutral-300">@creators_hub</span>
                </div>
                <div className="p-2 bg-black/60 rounded-xl backdrop-blur-sm border border-white/5">
                  <div className="text-[10px] text-emerald-400 font-semibold">98.4% reach</div>
                  <div className="w-full bg-neutral-800 h-1 rounded-full mt-1 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-9/12" />
                  </div>
                </div>
              </div>
            </div>

            {/* Center Story Card with friends photo */}
            <div className="relative z-10 w-[200px] h-[310px] rounded-2xl bg-neutral-900 border-2 border-neutral-700/60 overflow-hidden shadow-2xl flex flex-col justify-between p-3 group">
              <img
                src={storyPhoto}
                alt="Friends on Instagram"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Story Top Header */}
              <div className="relative z-20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                  <div className="w-4 h-4 rounded-full ig-gradient-bg p-[1px]">
                    <div className="w-full h-full bg-black rounded-full" />
                  </div>
                  <span className="text-[10px] font-medium text-white">Your Story</span>
                </div>
                <span className="bg-emerald-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  ★ Active
                </span>
              </div>

              {/* Story Bottom Reaction Emojis Pill & Heart */}
              <div className="relative z-20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/15">
                    <span className="text-xs">🔮</span>
                    <span className="text-xs">👀</span>
                    <span className="text-xs">😍</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/15">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  </div>
                </div>
                <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-3/4 rounded-full" />
                </div>
              </div>
            </div>

            {/* Floating Heart Sticker (Left) */}
            <div className="absolute left-2 bottom-16 z-20 w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-lg transform -rotate-12 animate-pulse">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>

            {/* Floating Story Ring Bubble (Right) */}
            <div className="absolute right-3 bottom-12 z-20 w-11 h-11 rounded-full ig-gradient-bg p-0.5 shadow-xl transform rotate-12">
              <div className="w-full h-full bg-neutral-900 rounded-full p-0.5 overflow-hidden">
                <img
                  src={storyPhoto}
                  alt="Story creator"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={onExplorePackages}
              className="text-xs text-neutral-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
            >
              Explore follower growth packages & pricing →
            </button>
          </div>
        </div>

        {/* DESKTOP RIGHT COLUMN: Dark Container with Login Form (Matches Reference Image 1) */}
        <div className="bg-[#121212] flex flex-col justify-center items-center px-8 xl:px-16 py-12">
          <div className="w-full max-w-sm space-y-5 text-left">
            {/* Title: Login to Insta Followers Increase */}
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Login to <span className="ig-gradient-text font-extrabold">Insta Followers Increase</span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Field 1: Mobile number, username or email */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Mobile number, username or email"
                  className="w-full pl-10 pr-4 py-3 bg-[#1e1e1e] border border-[#333333] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6] focus:ring-1 focus:ring-[#0095f6] transition-all"
                />
              </div>

              {/* Field 2: Password with Eye Toggle */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-3 bg-[#1e1e1e] border border-[#333333] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6] focus:ring-1 focus:ring-[#0095f6] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 focus:outline-none cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs">
                  {error}
                </div>
              )}

              {/* Blue "Log in" Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#0095f6] hover:bg-[#1877f2] active:bg-[#0074cc] text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Log in
              </button>

              {/* Forgot password */}
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => alert('Password reset verification instructions will be sent to your email.')}
                  className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* OR Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-[#262626] w-full" />
                <span className="bg-[#121212] px-3 text-xs text-neutral-500 font-semibold tracking-wider">
                  OR
                </span>
                <div className="border-t border-[#262626] w-full" />
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 bg-transparent hover:bg-[#1a1a1a] border border-[#333333] text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Bottom: Don't have an account? Create new account */}
              <div className="pt-4 text-center">
                <p className="text-xs text-neutral-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={handleCreateNewAccount}
                    className="text-[#0095f6] hover:text-[#3897f0] font-semibold transition-colors cursor-pointer"
                  >
                    Create new account
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 2. MOBILE VIEWPORT (Matches Reference Image 2)                       */}
      {/* ==================================================================== */}
      <div className="lg:hidden flex flex-col justify-between min-h-[calc(100vh-4rem)] px-5 py-4 bg-black">
        
        {/* Mobile Top Bar (Arrow Left + Language Dropdown) */}
        <div className="flex items-center justify-between py-1 relative">
          <button
            onClick={() => {}}
            className="p-1 text-white hover:text-neutral-300"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-1 text-xs text-neutral-300 font-medium"
            >
              <span>{selectedLanguage}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 w-36 bg-[#161616] border border-[#2a2a2a] rounded-lg shadow-2xl py-1 z-50">
                {['English (India)', 'English (US)', 'English (UK)', 'Español', 'Français'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setShowLanguageDropdown(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-[#222222]"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="w-5" /> {/* Spacer balance */}
        </div>

        {/* Mobile Main Content: Centered Logo, Centered Title, Inputs, Login */}
        <div className="my-auto py-6 flex flex-col items-center text-center">
          {/* Centered Large IG Gradient Logo with Upward Arrow */}
          <div className="w-20 h-20 rounded-2xl ig-gradient-bg p-0.5 shadow-2xl mb-6 flex items-center justify-center">
            <div className="w-full h-full bg-black/20 rounded-[14px] flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-11 h-11 text-white filter drop-shadow"
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

          {/* Centered Title */}
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
            Insta Followers
          </h1>
          <h2 className="text-3xl font-extrabold ig-gradient-text tracking-tight mb-8">
            Increase
          </h2>

          {/* Mobile Inputs Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3.5">
            {/* Input 1: User icon */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Mobile number, username or email"
                className="w-full pl-10 pr-4 py-3 bg-[#181818] border border-[#2d2d2d] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
              />
            </div>

            {/* Input 2: Password with Eye Toggle */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 bg-[#181818] border border-[#2d2d2d] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs text-left">
                {error}
              </div>
            )}

            {/* Blue Log In Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              Log in
            </button>

            {/* Centered Forgot Password */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => alert('Password reset verification instructions will be sent to your email.')}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Forgot password?
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Bottom: Outlined Pill Button "Create new account" (Matches Reference Image 2) */}
        <div className="w-full max-w-sm mx-auto pb-4">
          <button
            type="button"
            onClick={handleCreateNewAccount}
            className="w-full py-3 border border-[#262626] rounded-full text-sm font-semibold text-[#0095f6] hover:bg-[#161616] transition-colors"
          >
            Create new account
          </button>
        </div>

      </div>

    </div>
  );
};
