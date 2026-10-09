import React, { useState } from 'react';
import { ShieldCheck, Check, AlertCircle, Phone, FileText, ArrowRight, ArrowLeft, Lock, Info } from 'lucide-react';
import { DatabaseService } from '../lib/databaseService';
import { Profile } from '../types';

interface OnboardingFlowProps {
  initialIdentifier: string;
  onCompleted: (user: Profile) => void;
  onCancel: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialIdentifier,
  onCompleted,
  onCancel,
  onOpenTerms,
  onOpenPrivacy,
}) => {
  // Step tracker: 'conf_1', 'conf_2', 'conf_3', 'phone', 'consent'
  const [step, setStep] = useState<'conf_1' | 'conf_2' | 'conf_3' | 'phone' | 'consent'>('conf_1');

  // Step A: Responses & No Warning state
  const [noWarningMessage, setNoWarningMessage] = useState<string | null>(null);

  // Profile data
  const [username, setUsername] = useState(
    initialIdentifier.includes('@') && !initialIdentifier.startsWith('@')
      ? initialIdentifier.split('@')[0]
      : initialIdentifier.replace('@', '') || 'creator_account'
  );

  // Step B: Phone number fields
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPhoneNumber, setConfirmPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Step C: Legal consent
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handler for Step A confirmation questions
  const handleConfirmationAnswer = (screen: 1 | 2 | 3, answer: 'yes' | 'no') => {
    if (answer === 'no') {
      if (screen === 1) {
        setNoWarningMessage(
          'You answered No. Please review your account handle and ensure your profile is public, then click Yes to continue.'
        );
      } else if (screen === 2) {
        setNoWarningMessage(
          'You answered No. Our policy requires gradual organic distribution to protect accounts. Please review the strategy and click Yes.'
        );
      } else {
        setNoWarningMessage(
          'You answered No. Please acknowledge that we never request passwords and only operate through secure consultation.'
        );
      }
      return;
    }

    // Answered YES
    setNoWarningMessage(null);
    if (screen === 1) {
      setStep('conf_2');
    } else if (screen === 2) {
      setStep('conf_3');
    } else if (screen === 3) {
      setStep('phone');
    }
  };

  // Handler for Step B phone validation
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone1 = phoneNumber.trim().replace(/\D/g, '');
    const cleanPhone2 = confirmPhoneNumber.trim().replace(/\D/g, '');

    if (!cleanPhone1 || cleanPhone1.length < 7) {
      setPhoneError('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    if (cleanPhone1 !== cleanPhone2) {
      setPhoneError('Phone numbers do not match. Please verify and re-enter both fields.');
      return;
    }

    setPhoneError('');
    setStep('consent');
  };

  // Handler for Step C consent submission
  const handleFinalSubmit = async () => {
    if (!acceptedTerms) {
      setSubmitError('You must review and agree to the Terms and Conditions and Privacy Policy to continue.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const fullPhone = `${countryCode} ${phoneNumber.trim()}`;
      // Persist profile in Supabase
      const profile = await DatabaseService.createOrGetProfile(
        username,
        username,
        fullPhone
      );

      // Create onboarding session in Supabase
      const session = await DatabaseService.createOnboardingSession(profile.id, 'legal_consent');
      await DatabaseService.updateOnboardingSession(session.id, 'completed', 'completed');

      // Record legal consent in Supabase
      await DatabaseService.recordConsent(profile.id, 'v1.0-2026', 'v1.0-2026');

      onCompleted(profile);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to save onboarding session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#141414] border border-[#2b2b2b] rounded-2xl shadow-2xl p-6 sm:p-8 my-8 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Progress & Cancel */}
        <div className="flex items-center justify-between pb-4 border-b border-[#242424] mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg ig-gradient-bg p-0.5 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Account Setup & Security Verification</h3>
              <p className="text-[11px] text-neutral-400">Step-by-step verified onboarding</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full ${['conf_1', 'conf_2', 'conf_3', 'phone', 'consent'].includes(step) ? 'bg-[#0095f6]' : 'bg-neutral-800'}`} />
          <div className={`flex-1 h-1 rounded-full ${['conf_2', 'conf_3', 'phone', 'consent'].includes(step) ? 'bg-[#0095f6]' : 'bg-neutral-800'}`} />
          <div className={`flex-1 h-1 rounded-full ${['conf_3', 'phone', 'consent'].includes(step) ? 'bg-[#0095f6]' : 'bg-neutral-800'}`} />
          <div className={`flex-1 h-1 rounded-full ${['phone', 'consent'].includes(step) ? 'bg-[#0095f6]' : 'bg-neutral-800'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'consent' ? 'bg-[#0095f6]' : 'bg-neutral-800'}`} />
        </div>

        {/* ==================================================================== */}
        {/* STEP A: CONFIRMATION SCREEN 1 OF 3 */}
        {/* ==================================================================== */}
        {step === 'conf_1' && (
          <div className="space-y-6">
            <div className="text-left">
              <span className="text-[11px] font-semibold text-[#0095f6] uppercase tracking-wider">
                Verification 1 of 3
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Is this information correct?</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Please verify that your Instagram account handle and visibility settings match your target profile.
              </p>
            </div>

            <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-4 space-y-3 text-left">
              <div className="flex items-center justify-between text-xs py-1 border-b border-[#282828]">
                <span className="text-neutral-400">Target Profile Handle:</span>
                <span className="font-semibold text-white">@{username}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-[#282828]">
                <span className="text-neutral-400">Profile Accessibility:</span>
                <span className="text-emerald-400 font-medium">Public (Required for Audience Discovery)</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-neutral-400">Growth Optimization Scope:</span>
                <span className="text-neutral-200 font-medium">Audience Benchmarking & Organic Reach</span>
              </div>
            </div>

            {noWarningMessage && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-200 text-left">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{noWarningMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmationAnswer(1, 'no')}
                className="py-2.5 px-4 bg-[#222222] hover:bg-[#2c2c2c] text-neutral-300 font-semibold text-sm rounded-xl transition-colors border border-[#333333]"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => handleConfirmationAnswer(1, 'yes')}
                className="py-2.5 px-4 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-sm rounded-xl transition-colors shadow-md shadow-blue-500/20"
              >
                Yes
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP A: CONFIRMATION SCREEN 2 OF 3 */}
        {/* ==================================================================== */}
        {step === 'conf_2' && (
          <div className="space-y-6">
            <div className="text-left">
              <span className="text-[11px] font-semibold text-[#0095f6] uppercase tracking-wider">
                Verification 2 of 3
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Is this information correct?</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Confirm your preferred delivery speed parameters and organic distribution thresholds.
              </p>
            </div>

            <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-4 space-y-3 text-left">
              <div className="flex items-center justify-between text-xs py-1 border-b border-[#282828]">
                <span className="text-neutral-400">Pacing Distribution:</span>
                <span className="text-emerald-400 font-medium">Gradual Organic Pacing (100% Policy-Safe)</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-[#282828]">
                <span className="text-neutral-400">Artificial Bots or Automation:</span>
                <span className="text-neutral-300 font-medium">Strictly Prohibited</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-neutral-400">Notification Preference:</span>
                <span className="text-neutral-200 font-medium">Transactional Order Alerts Only</span>
              </div>
            </div>

            {noWarningMessage && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-200 text-left">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{noWarningMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmationAnswer(2, 'no')}
                className="py-2.5 px-4 bg-[#222222] hover:bg-[#2c2c2c] text-neutral-300 font-semibold text-sm rounded-xl transition-colors border border-[#333333]"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => handleConfirmationAnswer(2, 'yes')}
                className="py-2.5 px-4 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-sm rounded-xl transition-colors shadow-md shadow-blue-500/20"
              >
                Yes
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP A: CONFIRMATION SCREEN 3 OF 3 */}
        {/* ==================================================================== */}
        {step === 'conf_3' && (
          <div className="space-y-6">
            <div className="text-left">
              <span className="text-[11px] font-semibold text-[#0095f6] uppercase tracking-wider">
                Verification 3 of 3
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Is this information correct?</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Confirm your acknowledgment of our strict zero-password and anti-credential theft policy.
              </p>
            </div>

            <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-4 space-y-3 text-left">
              <div className="flex items-center justify-between text-xs py-1 border-b border-[#282828]">
                <span className="text-neutral-400">Password Policy:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Never Requested, Stored, or Sent
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-[#282828]">
                <span className="text-neutral-400">Data Persistence Backend:</span>
                <span className="text-neutral-200 font-medium">Supabase Cloud PostgreSQL</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-neutral-400">Compliance Standard:</span>
                <span className="text-neutral-200 font-medium">Safe Audience Strategy Consultation</span>
              </div>
            </div>

            {noWarningMessage && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-200 text-left">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{noWarningMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmationAnswer(3, 'no')}
                className="py-2.5 px-4 bg-[#222222] hover:bg-[#2c2c2c] text-neutral-300 font-semibold text-sm rounded-xl transition-colors border border-[#333333]"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => handleConfirmationAnswer(3, 'yes')}
                className="py-2.5 px-4 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-sm rounded-xl transition-colors shadow-md shadow-blue-500/20"
              >
                Yes
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP B: PHONE NUMBER SECURITY */}
        {/* ==================================================================== */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-5 text-left">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                <Phone className="w-3.5 h-3.5 text-[#0095f6]" />
                <span>Account Security Verification</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                For account security, enter your phone number.
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Only requested for critical account security alerts and transactional order confirmation.
              </p>
            </div>

            <div className="space-y-4">
              {/* Field 1: Enter phone number */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  1. Enter phone number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-24 px-2 py-2.5 bg-[#1e1e1e] border border-[#333333] rounded-xl text-xs text-white focus:outline-none focus:border-[#0095f6]"
                  >
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+91">+91 (IN)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+49">+49 (DE)</option>
                    <option value="+33">+33 (FR)</option>
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    placeholder="e.g. 555-0199"
                    className="flex-1 px-3.5 py-2.5 bg-[#1e1e1e] border border-[#333333] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
                  />
                </div>
              </div>

              {/* Field 2: Confirm phone number */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  2. Confirm phone number
                </label>
                <input
                  type="tel"
                  value={confirmPhoneNumber}
                  onChange={(e) => {
                    setConfirmPhoneNumber(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  placeholder="Re-enter your phone number"
                  className="w-full px-3.5 py-2.5 bg-[#1e1e1e] border border-[#333333] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
                />
              </div>

              {phoneError && (
                <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl flex items-start gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{phoneError}</span>
                </div>
              )}

              {/* Security and OTP disclosure */}
              <div className="p-3 bg-[#191919] border border-[#2b2b2b] rounded-xl text-[11px] text-neutral-400 space-y-1">
                <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                  <Info className="w-3.5 h-3.5 text-[#0095f6]" />
                  <span>Security Disclosure:</span>
                </div>
                <p>
                  Phone number will be saved to your profile record for identity recovery. Phone numbers are not marked as OTP-verified until a live verification code flow has executed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('conf_3')}
                className="py-2.5 px-4 bg-[#222222] hover:bg-[#2c2c2c] text-neutral-300 font-medium text-sm rounded-xl transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-sm rounded-xl transition-colors shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <span>Continue to Legal Consent</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ==================================================================== */}
        {/* STEP C: LEGAL CONSENT */}
        {/* ==================================================================== */}
        {step === 'consent' && (
          <div className="space-y-5 text-left">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                <FileText className="w-3.5 h-3.5 text-[#0095f6]" />
                <span>Final Requirement</span>
              </div>
              <h2 className="text-xl font-bold text-white">Review Legal Terms & Conditions</h2>
              <p className="text-xs text-neutral-400 mt-1">
                To continue, you must actively accept our service terms and privacy practices.
              </p>
            </div>

            {/* Terms Summary Box */}
            <div className="bg-[#1b1b1b] border border-[#2e2e2e] rounded-xl p-4 text-xs text-neutral-300 space-y-2 max-h-48 overflow-y-auto">
              <p className="font-semibold text-white">Key Service Terms Summary:</p>
              <ul className="list-disc list-inside space-y-1.5 text-neutral-400">
                <li>
                  <strong className="text-neutral-200">No Outcome Guarantee:</strong> Follower increase, specific counts, reach, and engagement are not guaranteed.
                </li>
                <li>
                  <strong className="text-neutral-200">No 24-Hour Guarantee:</strong> Delivery speed estimates are informational only; no 24-hour delivery is promised.
                </li>
                <li>
                  <strong className="text-neutral-200">Zero Password Policy:</strong> We never request or store your Instagram password.
                </li>
                <li>
                  <strong className="text-neutral-200">Third-Party Notice:</strong> This website is independent and not affiliated with or endorsed by Instagram or Meta.
                </li>
              </ul>
            </div>

            {/* Checkbox (Not preselected!) */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (submitError) setSubmitError('');
                  }}
                  className="w-4 h-4 mt-0.5 rounded border-[#444444] text-[#0095f6] focus:ring-[#0095f6] bg-[#1e1e1e] cursor-pointer"
                />
                <span className="text-xs text-neutral-300 leading-relaxed">
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={onOpenTerms}
                    className="text-[#0095f6] hover:underline font-medium inline"
                  >
                    Terms and Conditions
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={onOpenPrivacy}
                    className="text-[#0095f6] hover:underline font-medium inline"
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>
            </div>

            {submitError && (
              <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl flex items-start gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="py-2.5 px-4 bg-[#222222] hover:bg-[#2c2c2c] text-neutral-300 font-medium text-sm rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!acceptedTerms || isSubmitting}
                className={`flex-1 py-3 px-4 font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                  acceptedTerms && !isSubmitting
                    ? 'bg-[#0095f6] hover:bg-[#1877f2] text-white shadow-blue-500/25 cursor-pointer'
                    : 'bg-[#222222] text-neutral-500 cursor-not-allowed border border-[#333333]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Connecting & Storing Record...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Complete Onboarding & Enter Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
