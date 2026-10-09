import React from 'react';
import { ArrowLeft, Shield, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
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
        <div className="flex items-center gap-2 text-xs font-bold text-[#0095f6] uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          <span>Legal Agreement · Version 1.0</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Terms and Conditions</h1>
        <p className="text-xs text-neutral-400 mt-2">
          Effective Date: October 9, 2026 · Last Updated: October 9, 2026
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-8 text-neutral-300 text-sm leading-relaxed">
        
        {/* Section 1 */}
        <section className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-neutral-800 text-xs flex items-center justify-center text-white">1</span>
            Service Scope and Follower Limitations
          </h2>
          <p className="mb-3">
            Insta Followers Increase ("the Service", "we", "our") provides social media growth strategy consultation, profile auditing, and audience benchmarking tools.
          </p>
          <div className="p-3.5 bg-neutral-900 border border-neutral-700/60 rounded-xl text-neutral-200 space-y-2">
            <p className="font-semibold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Express Limitation of Results:
            </p>
            <p>
              The Service does <strong>not guarantee an increase in Instagram followers</strong>, a particular number of followers, engagement rates, reach, impressions, or any specific outcome. Follower quantity targets described in growth packages represent customer aspirational goals and strategic scoping, not factual promises of delivery.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-neutral-800 text-xs flex items-center justify-center text-white">2</span>
            No Guaranteed Delivery Time
          </h2>
          <p className="mb-2">
            Any delivery timeline, schedule, or timeframe mentioned across marketing materials, dashboard views, or customer communications is <strong>informational and advisory only</strong>.
          </p>
          <p>
            Delivery or completion within 24 hours is strictly <strong>not promised or guaranteed</strong>. Availability, algorithmic indexing, and audience interaction speed vary according to natural network conditions and Instagram platform policies.
          </p>
        </section>

        {/* Section 3 */}
        <section className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-neutral-800 text-xs flex items-center justify-center text-white">3</span>
            User Responsibilities & Platform Rules
          </h2>
          <p className="mb-2">
            You represent and warrant that:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-neutral-400 pl-2">
            <li>You own or are authorized to manage the Instagram handle submitted for growth consultation.</li>
            <li>Your use of this platform complies fully with all applicable laws and regulations.</li>
            <li>Your account activities adhere to Instagram's applicable Terms of Use and Community Guidelines.</li>
            <li>You will never attempt to submit third-party accounts without authorization or engage in fraudulent activities.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-neutral-800 text-xs flex items-center justify-center text-white">4</span>
            Data Handling & Zero-Password Standard
          </h2>
          <p className="mb-3">
            We are committed to user privacy and strict credential protection:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
              <span className="font-semibold text-white block mb-1">What We Collect:</span>
              <p className="text-neutral-400">
                Instagram username/handle, contact email, optional phone number for security alerts, package selection, and consent audit timestamps.
              </p>
            </div>
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
              <span className="font-semibold text-white block mb-1">What We NEVER Collect:</span>
              <p className="text-rose-400 font-medium">
                We never request, store, log, or transmit your Instagram account password or session authentication cookies.
              </p>
            </div>
          </div>
          <p className="text-xs text-neutral-400 mt-3">
            Data is stored securely in PostgreSQL hosted on Supabase infrastructure, protected by Row Level Security (RLS) policies. Records are retained only as long as necessary for order processing or as required by law.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-neutral-800 text-xs flex items-center justify-center text-white">5</span>
            Limitation of Liability
          </h2>
          <p className="mb-2">
            To the maximum extent permitted by applicable law, Insta Followers Increase and its operators shall not be liable for any indirect, incidental, consequential, special, or punitive damages, or loss of profits, data, or reputation arising out of your access to or use of the Service.
          </p>
          <p className="text-xs text-neutral-400">
            Nothing in these Terms excludes or limits liability for gross negligence, willful misconduct, intentional fraud, or any statutory obligation that cannot be lawfully excluded under consumer protection laws.
          </p>
        </section>

        {/* Section 6 */}
        <section className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-neutral-800 text-xs flex items-center justify-center text-white">6</span>
            Third-Party Services Disclaimer
          </h2>
          <p className="mb-2">
            Instagram is a registered trademark of Meta Platforms, Inc. Supabase is an open-source database infrastructure service provided by Supabase Inc.
          </p>
          <p className="text-neutral-400 text-xs">
            This website and service are independent entities and are <strong>not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with Meta Platforms, Inc., Instagram, or Supabase Inc.</strong>
          </p>
        </section>

        {/* Section 7 */}
        <section className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-neutral-800 text-xs flex items-center justify-center text-white">7</span>
            Contact Information & Policy Updates
          </h2>
          <p className="mb-2">
            We reserve the right to revise these Terms from time to time. Any material changes will be announced on this website alongside an updated effective date.
          </p>
          <div className="mt-3 p-3 bg-neutral-900 rounded-xl text-xs text-neutral-400 space-y-1">
            <p><strong className="text-neutral-200">Operator Inquiries:</strong> legal@instafollowersincrease.example</p>
            <p><strong className="text-neutral-200">Compliance & Privacy Desk:</strong> privacy@instafollowersincrease.example</p>
            <p><strong className="text-neutral-200">Physical Address:</strong> Legal Department, 100 Growth Way, Suite 400, San Francisco, CA 94107</p>
          </div>
        </section>

      </div>
    </div>
  );
};
