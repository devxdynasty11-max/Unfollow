import React, { useState } from 'react';
import { ArrowLeft, Shield, Lock, Trash2, Download, CheckCircle, AlertCircle, FileCheck } from 'lucide-react';
import { DatabaseService } from '../lib/databaseService';
import { PrivacyRequestType } from '../types';

interface PrivacyPageProps {
  onBack: () => void;
  currentUserId?: string;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack, currentUserId }) => {
  const [requestType, setRequestType] = useState<PrivacyRequestType>('data_deletion');
  const [contactEmail, setContactEmail] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitPrivacyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim()) {
      setErrorMsg('Please enter your contact email so we can verify your request.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const fullDetails = `Contact: ${contactEmail.trim()} | Notes: ${details.trim() || 'No additional notes'}`;
      await DatabaseService.submitPrivacyRequest(currentUserId, requestType, fullDetails);
      setSuccessMsg('Your privacy request has been submitted and logged to our database. Our compliance officer will process it within 30 days.');
      setDetails('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit privacy request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-left">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Application</span>
      </button>

      {/* Header */}
      <div className="border-b border-[#262626] pb-6 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>Data Governance · Version 1.0</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-xs text-neutral-400 mt-2">
          Effective Date: October 9, 2026 · Compliant with GDPR, CCPA, and Meta Platform Policies
        </p>
      </div>

      {/* Main Policy Content */}
      <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
        
        {/* Section 1: Overview */}
        <section className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3">1. Information We Collect and Principles of Minimization</h2>
          <p className="mb-3">
            We adhere strictly to the principle of data minimization: we collect only data genuinely required for service delivery, transaction management, and legal accountability.
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
              <strong className="text-white block mb-0.5">Account Identifiers:</strong>
              <p className="text-neutral-400">Public Instagram username/handle and display name used to assess account health and growth targeting.</p>
            </div>
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
              <strong className="text-white block mb-0.5">Contact Information & Phone Number:</strong>
              <p className="text-neutral-400">Phone numbers are collected during security onboarding solely for critical transactional security alerts, fraudulent order prevention, and account recovery. Phone numbers are never sold or used for marketing robocalls.</p>
            </div>
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
              <strong className="text-white block mb-0.5">Growth Packages & Orders:</strong>
              <p className="text-neutral-400">Records of chosen follower growth goals, order references, creation timestamps, and fulfillment statuses.</p>
            </div>
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
              <strong className="text-white block mb-0.5">Consent Audit Trail:</strong>
              <p className="text-neutral-400">Exact timestamps and versions of the Terms and Conditions and Privacy Policy you actively agreed to during onboarding.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Zero-Password Mandate */}
        <section className="bg-[#141414] border border-rose-900/40 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-white mb-2">2. Strict Zero-Password Guarantee</h2>
              <p className="text-neutral-300">
                Under no circumstances does Insta Followers Increase request, record, store, decrypt, or transmit your Instagram password, two-factor authentication recovery codes, or session authorization tokens.
              </p>
              <p className="text-xs text-neutral-400 mt-2">
                All strategy consultation and audience discovery operate solely on publicly accessible Instagram metrics. If any entity claiming to represent this service asks for your password, notify security immediately.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Purpose of Processing */}
        <section className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3">3. Purpose and Legal Basis for Processing</h2>
          <ul className="list-disc list-inside space-y-1.5 text-neutral-400 text-xs pl-2">
            <li><strong>Service Delivery:</strong> Providing custom follower strategy recommendations and monitoring public profile metrics.</li>
            <li><strong>Contractual Performance:</strong> Creating and fulfilling your selected follower growth goal order.</li>
            <li><strong>Security and Fraud Prevention:</strong> Validating contact details and maintaining order audit references.</li>
            <li><strong>Compliance:</strong> Storing tamper-evident consent audit logs to prove regulatory agreement.</li>
          </ul>
        </section>

        {/* Section 4: Hosting & Supabase */}
        <section className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3">4. Infrastructure & Supabase Cloud Storage</h2>
          <p className="mb-2">
            Application data is hosted on enterprise cloud infrastructure using Supabase, an industry-standard PostgreSQL database service with encrypted storage at rest (AES-256) and in transit (TLS 1.3).
          </p>
          <p className="text-xs text-neutral-400">
            Database access is partitioned via Row Level Security (RLS) policies ensuring that users can only query their own records.
          </p>
        </section>

        {/* Section 5: Data Retention & Deletion */}
        <section className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3">5. Data Retention and Deletion Rights</h2>
          <p className="mb-2">
            We retain account data for the duration of your active profile. Order records are retained for 12 months for accounting compliance and dispute resolution, after which they are automatically anonymized or purged.
          </p>
          <p className="text-xs text-neutral-400">
            You may request complete erasure of your personal data at any time via the form below.
          </p>
        </section>

        {/* Section 6: Interactive Privacy Request Form */}
        <section className="bg-[#141414] border border-[#0095f6]/40 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <FileCheck className="w-5 h-5 text-[#0095f6]" />
            <h2 className="text-lg font-bold text-white">6. Exercise Your Privacy Rights (GDPR / CCPA)</h2>
          </div>
          <p className="text-xs text-neutral-400 mb-4">
            Submit a formal privacy request below. Your request will be directly persisted in our database and audited.
          </p>

          <form onSubmit={handleSubmitPrivacyRequest} className="space-y-4 bg-neutral-900 p-4 rounded-xl border border-neutral-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Request Type
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as PrivacyRequestType)}
                  className="w-full px-3 py-2 bg-[#1b1b1b] border border-[#333333] rounded-lg text-xs text-white focus:outline-none focus:border-[#0095f6]"
                >
                  <option value="data_deletion">Right to Erasure (Delete My Data)</option>
                  <option value="data_access">Right of Access (Export My Data)</option>
                  <option value="opt_out">Opt-Out of Non-Essential Notifications</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Your Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-[#1b1b1b] border border-[#333333] rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Specify specific order references or account usernames..."
                rows={2}
                className="w-full px-3 py-2 bg-[#1b1b1b] border border-[#333333] rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-950/40 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Logging Request...' : 'Submit Official Privacy Request'}
            </button>
          </form>
        </section>

        {/* Section 7: Third-Party Disclosures & Meta */}
        <section className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3">7. Third-Party Disclosures</h2>
          <p className="mb-2">
            We never sell, rent, or trade your personal information to data brokers or advertising exchanges. Information is shared only with essential infrastructure processors:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-neutral-400 pl-2">
            <li><strong>Supabase Inc.:</strong> Cloud database persistence provider (encrypted at rest).</li>
            <li><strong>Transactional Delivery Systems:</strong> For account verification notifications.</li>
          </ul>
        </section>

        {/* Section 8: Contact */}
        <section className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3">8. Data Protection Officer (DPO) Contact</h2>
          <p className="text-xs text-neutral-400">
            For questions about this policy or our data practices, reach our Data Protection Officer at:
            <br />
            <strong className="text-white">Email:</strong> dpo@instafollowersincrease.example
            <br />
            <strong className="text-white">Address:</strong> Data Privacy Team, 100 Growth Way, Suite 400, San Francisco, CA 94107
          </p>
        </section>

      </div>
    </div>
  );
};
