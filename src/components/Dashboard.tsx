import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, ArrowRight, Clock, Hash, Calendar, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { DatabaseService } from '../lib/databaseService';
import { Profile, GrowthPackage, Order } from '../types';

interface DashboardProps {
  currentUser: Profile;
  onOpenPrivacy: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onOpenPrivacy }) => {
  const [packages, setPackages] = useState<GrowthPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg_500');
  const [targetUsername, setTargetUsername] = useState<string>(currentUser.username_or_email);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load packages and user orders from Supabase
  const loadData = async () => {
    try {
      setLoading(true);
      const [pkgs, userOrders] = await Promise.all([
        DatabaseService.getGrowthPackages(),
        DatabaseService.getUserOrders(currentUser.id),
      ]);
      setPackages(pkgs);
      setOrders(userOrders);
      if (pkgs.length > 0 && !pkgs.find(p => p.id === selectedPackageId)) {
        setSelectedPackageId(pkgs[0].id);
      }
    } catch (err: any) {
      setErrorMessage('Failed to load dashboard data. Retrying...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const selectedPackage = packages.find((p) => p.id === selectedPackageId) || packages[0];

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    if (!targetUsername.trim()) {
      setErrorMessage('Please enter your target Instagram username.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const cleanUsername = targetUsername.trim().replace(/^@/, '');
      const newOrder = await DatabaseService.createOrder(
        currentUser.id,
        selectedPackage.id,
        cleanUsername
      );

      setOrders((prev) => [newOrder, ...prev]);
      setSuccessMessage(`Order ${newOrder.order_reference} created and submitted for review.`);
      // Scroll to orders section smoothly
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not save order. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#222222] mb-8 gap-4">
        <div>
          <span className="text-xs text-neutral-400">Account Dashboard</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2 mt-0.5">
            <span>Welcome, @{currentUser.display_name || currentUser.username_or_email}</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Registered: {new Date(currentUser.created_at).toLocaleDateString()} · Status: Active Member
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0095f6]' : ''}`} />
          </button>
          <button
            onClick={onOpenPrivacy}
            className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg transition-colors"
          >
            Privacy & Data Rights
          </button>
        </div>
      </div>

      {/* Main Section */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Choose Your Follower Growth Goal
        </h2>
        <p className="text-sm text-neutral-300 mt-1 max-w-2xl">
          Select the follower growth package that best matches your goals.
        </p>
      </div>

      {/* Grid of Selectable Follower Packages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {packages.map((pkg) => {
          const isSelected = selectedPackage?.id === pkg.id;
          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackageId(pkg.id)}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 text-left relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-neutral-900/90 border-[#0095f6] shadow-lg shadow-blue-500/10 ring-1 ring-[#0095f6]'
                  : 'bg-[#121212] border-[#242424] hover:border-[#383838] hover:bg-[#161616]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg ig-gradient-bg p-0.5 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">IG</span>
                    </div>
                    <span className="text-xs font-semibold text-neutral-300">{pkg.package_name}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[11px] font-bold text-[#0095f6] bg-blue-950/60 border border-blue-800/80 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>

                <div className="my-2">
                  <div className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
                    {pkg.follower_quantity.toLocaleString()}{' '}
                    <span className="text-sm font-medium text-neutral-400">followers</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">
                    ${pkg.price.toFixed(2)}
                  </div>
                </div>

                <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
                  {pkg.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#222222] flex items-center justify-between text-xs text-neutral-400">
                <span>Goal selection only</span>
                <span className={`font-semibold ${isSelected ? 'text-[#0095f6]' : 'text-neutral-500'}`}>
                  {isSelected ? '✓ Ready' : 'Click to select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mandatory Delivery Information Notice */}
      <div className="bg-[#151515] border border-amber-900/50 rounded-2xl p-5 mb-8 text-left">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Important Delivery Disclosure</h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
              "Follower delivery and results are not guaranteed. Availability, timing, and results may vary. No particular follower count or delivery within 24 hours is promised."
            </p>
            <p className="text-xs text-neutral-400 pt-1">
              Follower growth depends on public account content quality, algorithm dynamics, and organic reach. We do not operate synthetic bots or make unsubstantiated claims.
            </p>
          </div>
        </div>
      </div>

      {/* Order Summary & Submission Form */}
      {selectedPackage && (
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-8 mb-12 text-left">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold text-[#0095f6] uppercase tracking-wider">
              Step 2 · Order Summary & Goal Submission
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Review Selected Growth Goal
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Confirm your target account and place your goal order for processing.
            </p>

            <form onSubmit={handleCreateOrder} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#1a1a1a] p-4 rounded-xl border border-[#2d2d2d] text-xs">
                <div>
                  <span className="text-neutral-400 block mb-0.5">Selected Package:</span>
                  <span className="font-bold text-white text-sm">{selectedPackage.package_name}</span>
                  <span className="text-neutral-400 block text-[11px] mt-0.5">
                    Goal: {selectedPackage.follower_quantity.toLocaleString()} followers
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Applicable Price:</span>
                  <span className="font-bold text-emerald-400 text-sm tabular-nums">
                    ${selectedPackage.price.toFixed(2)} USD
                  </span>
                  <span className="text-neutral-400 block text-[11px] mt-0.5">
                    Consultation & Strategy Fee
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Order Creation Date:</span>
                  <span className="font-medium text-white">{new Date().toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Initial Order Status:</span>
                  <span className="font-medium text-amber-400">Pending Review / Configured</span>
                </div>
              </div>

              {/* Target Username */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Target Instagram Username (@handle)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500 text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    value={targetUsername}
                    onChange={(e) => setTargetUsername(e.target.value.replace(/^@/, ''))}
                    placeholder="your_instagram_handle"
                    className="w-full pl-8 pr-4 py-2.5 bg-[#1b1b1b] border border-[#333333] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
                    required
                  />
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Profile must be set to public for organic analysis and discovery.
                </span>
              </div>

              {/* Honest Notice about Payment */}
              <div className="p-3 bg-[#171717] rounded-xl border border-[#2b2b2b] text-[11px] text-neutral-400">
                <p>
                  <strong>Payment Notice:</strong> Payment gateway simulation is disabled in adherence with production transparency guidelines. Submitting creates a verified record in our Supabase database marked as <em>Pending Review</em>.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl text-xs text-red-300">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Writing to Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Follower Goal Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* User's Persisted Orders Section */}
      <div className="text-left">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Your Follower Goal Orders</h3>
            <p className="text-xs text-neutral-400">
              Live records persisted in database. Refresh or return anytime.
            </p>
          </div>
          <span className="text-xs text-neutral-400 tabular-nums">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} on record
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#121212] border border-[#242424] rounded-2xl p-8 text-center">
            <p className="text-neutral-400 text-sm">
              No orders submitted yet. Select a growth package above to create your first goal record.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-[#131313] border border-[#262626] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white bg-neutral-800 px-2 py-0.5 rounded">
                      {ord.order_reference}
                    </span>
                    <span className="text-xs font-semibold text-neutral-300">
                      @{ord.target_username}
                    </span>
                    <span className="text-xs text-neutral-400">·</span>
                    <span className="text-xs text-neutral-400">
                      {ord.package?.package_name || 'Follower Goal'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ord.created_at).toLocaleDateString()}
                    </span>
                    <span>·</span>
                    <span className="tabular-nums font-semibold text-emerald-400">
                      ${ord.package?.price ? ord.package.price.toFixed(2) : '4.99'} USD
                    </span>
                    <span>·</span>
                    <span>Goal: {ord.package?.follower_quantity ? ord.package.follower_quantity.toLocaleString() : '100'} followers</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      ord.status === 'completed'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : ord.status === 'in_progress'
                        ? 'bg-blue-950/60 text-blue-400 border-blue-800'
                        : ord.status === 'cancelled'
                        ? 'bg-red-950/60 text-red-400 border-red-800'
                        : 'bg-amber-950/60 text-amber-400 border-amber-800'
                    }`}
                  >
                    {ord.status === 'pending_review' && 'Pending Review'}
                    {ord.status === 'in_progress' && 'In Progress'}
                    {ord.status === 'completed' && 'Completed'}
                    {ord.status === 'cancelled' && 'Cancelled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
