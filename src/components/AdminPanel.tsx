import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, CheckCircle, AlertTriangle, Key, Users, ShoppingBag, FileText, ShieldCheck, LogOut, RefreshCw, Copy, Check } from 'lucide-react';
import {
  loginAdmin,
  verifyAdminSession,
  logoutAdmin,
  fetchAdminOrders,
  updateAdminOrderStatus,
  fetchAdminUsers,
  fetchAdminConsents,
  fetchAdminPrivacyRequests,
  updateAdminPrivacyStatus,
} from '../lib/adminApi';
import { Profile } from '../types';

interface AdminPanelProps {
  onBack: () => void;
  currentUser: Profile | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, currentUser }) => {
  // Authentication & Session State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('auth_admin_session_token');
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);

  // Login form state
  const [adminEmail, setAdminEmail] = useState('devxdynasty11@gmail.com');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'consents' | 'privacy' | 'rls'>('orders');

  // Loaded administrative data
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [consents, setConsents] = useState<any[]>([]);
  const [privacyReqs, setPrivacyReqs] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  // 1. Verify existing server token on mount
  useEffect(() => {
    const checkToken = async () => {
      if (!adminToken) {
        setVerifyingSession(false);
        setIsAdminAuthenticated(false);
        return;
      }

      const res = await verifyAdminSession(adminToken);
      if (res.valid) {
        setIsAdminAuthenticated(true);
        loadProtectedData(adminToken);
      } else {
        sessionStorage.removeItem('auth_admin_session_token');
        setAdminToken(null);
        setIsAdminAuthenticated(false);
      }
      setVerifyingSession(false);
    };

    checkToken();
  }, [adminToken]);

  // Load all protected records via server authorization
  const loadProtectedData = async (token: string) => {
    setLoadingData(true);
    try {
      const [ordersRes, usersRes, consentsRes, privacyRes] = await Promise.all([
        fetchAdminOrders(token),
        fetchAdminUsers(token),
        fetchAdminConsents(token),
        fetchAdminPrivacyRequests(token),
      ]);
      setOrders(ordersRes.orders || []);
      setUsers(usersRes.users || []);
      setConsents(consentsRes.consents || []);
      setPrivacyReqs(privacyRes.privacyRequests || []);
    } catch (err: any) {
      if (err.message.includes('Unauthorized') || err.message.includes('Access Denied')) {
        handleLogout();
      }
    } finally {
      setLoadingData(false);
    }
  };

  // 2. Submit server-side login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPasskey.trim()) {
      setLoginError('Both admin email and passkey are required.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    const res = await loginAdmin(adminEmail.trim(), adminPasskey.trim());
    if (res.success && res.token) {
      sessionStorage.setItem('auth_admin_session_token', res.token);
      setAdminToken(res.token);
      setIsAdminAuthenticated(true);
      setAdminPasskey('');
      loadProtectedData(res.token);
    } else {
      setLoginError(res.error || 'Access denied: Invalid administrator credentials.');
    }
    setLoginLoading(false);
  };

  // 3. Admin Logout
  const handleLogout = async () => {
    if (adminToken) {
      await logoutAdmin(adminToken);
      sessionStorage.removeItem('auth_admin_session_token');
      setAdminToken(null);
    }
    setIsAdminAuthenticated(false);
    setOrders([]);
    setUsers([]);
  };

  // Status updates
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    if (!adminToken) return;
    try {
      await updateAdminOrderStatus(adminToken, orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setStatusMessage(`Order ${orderId} status updated to ${newStatus}.`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      alert(`Error updating order: ${err.message}`);
    }
  };

  const handlePrivacyStatusChange = async (reqId: string, newStatus: string) => {
    if (!adminToken) return;
    try {
      await updateAdminPrivacyStatus(adminToken, reqId, newStatus);
      setPrivacyReqs((prev) =>
        prev.map((pr) => (pr.id === reqId ? { ...pr, status: newStatus } : pr))
      );
      setStatusMessage(`Privacy request ${reqId} updated to ${newStatus}.`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      alert(`Error updating request: ${err.message}`);
    }
  };

  // ============================================================================
  // UNVERIFIED / UNAUTHENTICATED STATE: DISPLAY SECURE ACCESS GATEWAY
  // ============================================================================
  if (verifyingSession) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-600 border-t-[#0095f6] rounded-full animate-spin" />
          <span className="text-xs text-neutral-400">Verifying administrative credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-black">
        <div className="w-full max-w-md bg-[#121212] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
          
          {/* Security Alert Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#222222] mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Restricted Administrator Area</h2>
              <p className="text-xs text-neutral-400">Server-Side Authorization Required</p>
            </div>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed mb-6">
            This administrative console is strictly restricted to authorized platform owners. All operations and customer records are protected by server-side verification and Supabase Row Level Security.
          </p>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Authorized Administrator Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-[#333333] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Admin Authorization Passkey
              </label>
              <input
                type="password"
                value={adminPasskey}
                onChange={(e) => setAdminPasskey(e.target.value)}
                placeholder="Enter server admin passkey"
                className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-[#333333] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0095f6]"
                required
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate as Site Owner</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#222222] flex items-center justify-between text-xs text-neutral-400">
            <span>Unauthorized access attempts are audited.</span>
            <button
              onClick={onBack}
              className="text-[#0095f6] hover:underline"
            >
              Return to Website
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ============================================================================
  // AUTHORIZED ADMINISTRATOR VIEW
  // ============================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-left">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#262626] mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized Administrator Session Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Administration</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Signed in as <strong>{adminEmail}</strong> · Server-side authenticated session
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadProtectedData(adminToken!)}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-[#0095f6]' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs text-rose-300 hover:text-rose-200 bg-rose-950/60 border border-rose-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out Admin</span>
          </button>
          <button
            onClick={onBack}
            className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            Return to App
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#262626] pb-3 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders' ? 'bg-[#0095f6] text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'users' ? 'bg-[#0095f6] text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Registered Profiles & Phone ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('consents')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'consents' ? 'bg-[#0095f6] text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Consent Audit Logs ({consents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'privacy' ? 'bg-[#0095f6] text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Privacy Requests ({privacyReqs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rls')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'rls' ? 'bg-[#0095f6] text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Supabase RLS Architecture</span>
        </button>
      </div>

      {/* 1. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Order Management</h3>
            <span className="text-xs text-neutral-400">{orders.length} total orders</span>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">No orders currently on record.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#282828] text-neutral-400">
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Target Handle</th>
                    <th className="py-2.5 px-3">Package / Goal</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Current Status</th>
                    <th className="py-2.5 px-3">Change Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202020]">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-neutral-900/50">
                      <td className="py-3 px-3 font-mono font-bold text-white">{ord.order_reference}</td>
                      <td className="py-3 px-3 font-semibold text-neutral-200">@{ord.target_username}</td>
                      <td className="py-3 px-3 text-neutral-300">{ord.package_name || 'Follower Goal'}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-400 tabular-nums">${ord.price}</td>
                      <td className="py-3 px-3 text-neutral-400">{new Date(ord.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${
                            ord.status === 'completed'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                              : ord.status === 'in_progress'
                              ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                              : ord.status === 'cancelled'
                              ? 'bg-red-950/80 text-red-300 border-red-800'
                              : 'bg-amber-950/80 text-amber-300 border-amber-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={ord.status}
                          onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                          className="px-2 py-1 bg-[#1a1a1a] border border-[#333333] rounded text-[11px] text-white focus:outline-none"
                        >
                          <option value="pending_review">Pending Review</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Registered Users & Security Phone Records</h3>
            <span className="text-xs text-neutral-400">{users.length} users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#282828] text-neutral-400">
                  <th className="py-2.5 px-3">User ID</th>
                  <th className="py-2.5 px-3">Handle / Email</th>
                  <th className="py-2.5 px-3">Security Phone Record</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202020]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-900/50">
                    <td className="py-3 px-3 font-mono text-neutral-500">{u.id}</td>
                    <td className="py-3 px-3 font-semibold text-white">@{u.username_or_email}</td>
                    <td className="py-3 px-3 font-mono text-neutral-300">
                      {u.phone_number || <span className="text-neutral-500 italic">None</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          u.role === 'admin'
                            ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                            : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CONSENT TAB */}
      {activeTab === 'consents' && (
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Terms & Privacy Consent Audit Trail</h3>
            <span className="text-xs text-neutral-400">{consents.length} logged agreements</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#282828] text-neutral-400">
                  <th className="py-2.5 px-3">Record ID</th>
                  <th className="py-2.5 px-3">User ID</th>
                  <th className="py-2.5 px-3">Terms Version</th>
                  <th className="py-2.5 px-3">Privacy Version</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202020]">
                {consents.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-900/50">
                    <td className="py-3 px-3 font-mono text-neutral-500">{c.id}</td>
                    <td className="py-3 px-3 font-mono text-neutral-400">{c.user_id}</td>
                    <td className="py-3 px-3 text-white font-mono">{c.terms_version}</td>
                    <td className="py-3 px-3 text-white font-mono">{c.privacy_policy_version}</td>
                    <td className="py-3 px-3 text-emerald-400">{new Date(c.consented_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PRIVACY TAB */}
      {activeTab === 'privacy' && (
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">User Data Erasure & Access Requests</h3>
            <span className="text-xs text-neutral-400">{privacyReqs.length} requests</span>
          </div>

          {privacyReqs.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">No privacy erasure requests submitted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#282828] text-neutral-400">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Details</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202020]">
                  {privacyReqs.map((pr) => (
                    <tr key={pr.id} className="hover:bg-neutral-900/50">
                      <td className="py-3 px-3 font-mono text-neutral-500">{pr.id}</td>
                      <td className="py-3 px-3 font-semibold text-white">{pr.request_type}</td>
                      <td className="py-3 px-3 text-neutral-300 max-w-xs truncate">{pr.details}</td>
                      <td className="py-3 px-3 text-neutral-400">{new Date(pr.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            pr.status === 'fulfilled'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                              : pr.status === 'rejected'
                              ? 'bg-red-950/80 text-red-300 border-red-800'
                              : 'bg-amber-950/80 text-amber-300 border-amber-800'
                          }`}
                        >
                          {pr.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={pr.status}
                          onChange={(e) => handlePrivacyStatusChange(pr.id, e.target.value)}
                          className="px-2 py-1 bg-[#1a1a1a] border border-[#333333] rounded text-[11px] text-white focus:outline-none"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="fulfilled">Fulfilled</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. RLS SECURITY TAB */}
      {activeTab === 'rls' && (
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#242424] mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Hardened Supabase Row Level Security (RLS)</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Authoritative RBAC policies preventing any unauthorized read or write access across all tables.
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`-- View /supabase/schema.sql for the complete migration`);
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 2000);
              }}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied' : 'Copy SQL Path'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-300">
            <div className="p-4 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-2">
              <span className="font-bold text-white block">1. Profiles Table Protection</span>
              <p className="text-neutral-400">
                Normal users can <strong>only SELECT and UPDATE their own record</strong> (`auth.uid() = id`). Public access to other users' phone numbers or details is strictly blocked.
              </p>
            </div>

            <div className="p-4 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-2">
              <span className="font-bold text-white block">2. Orders Table Protection</span>
              <p className="text-neutral-400">
                Normal users can only view orders associated with their own `user_id`. Modifying order status is exclusively reserved for administrators through the `is_admin()` security definer function.
              </p>
            </div>

            <div className="p-4 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-2">
              <span className="font-bold text-white block">3. Server-Side Token Authorization</span>
              <p className="text-neutral-400">
                All administrative endpoints require a cryptographic Bearer token issued only upon verifying the site owner's passkey.
              </p>
            </div>

            <div className="p-4 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-2">
              <span className="font-bold text-white block">4. Zero Client Trust</span>
              <p className="text-neutral-400">
                Roles stored in localStorage or URL query parameters are discarded. The server strictly verifies permissions against the authoritative database.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
