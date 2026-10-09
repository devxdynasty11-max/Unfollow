import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// ============================================================================
// ADMIN SECURITY & ROLE-BASED ACCESS CONTROL (SERVER-AUTHORITATIVE)
// ============================================================================

// Authorized admin accounts and master secret
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'devxdynasty11@gmail.com';
const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || 'admin-growth-2026';

// Server-side active admin sessions: token -> { role: 'admin', email: string, expiresAt: number }
interface AdminSession {
  role: 'admin';
  email: string;
  expiresAt: number;
}
const activeAdminSessions = new Map<string, AdminSession>();

// In-memory server-authoritative store (synced with Supabase or serving as protected backend)
interface ServerOrder {
  id: string;
  user_id: string;
  order_reference: string;
  status: 'pending_review' | 'in_progress' | 'completed' | 'cancelled';
  target_username: string;
  package_name: string;
  follower_quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

interface ServerUser {
  id: string;
  username_or_email: string;
  display_name?: string;
  phone_number?: string;
  role: 'user' | 'admin';
  created_at: string;
}

interface ServerConsent {
  id: string;
  user_id: string;
  terms_version: string;
  privacy_policy_version: string;
  consented_at: string;
}

interface ServerPrivacyReq {
  id: string;
  user_id?: string;
  request_type: 'data_access' | 'data_deletion' | 'opt_out';
  status: 'submitted' | 'reviewing' | 'fulfilled' | 'rejected';
  details?: string;
  created_at: string;
  completed_at?: string | null;
}

// Initial seed data
const serverDatabase = {
  orders: [] as ServerOrder[],
  users: [
    {
      id: 'usr_admin_1',
      username_or_email: ADMIN_EMAIL,
      display_name: 'Site Owner',
      phone_number: '+1 555-0100',
      role: 'admin' as const,
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr_demo_creator',
      username_or_email: 'sarah_lifestyle',
      display_name: 'Sarah Art',
      phone_number: '+1 555-0199',
      role: 'user' as const,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ] as ServerUser[],
  consents: [
    {
      id: 'cns_demo_1',
      user_id: 'usr_demo_creator',
      terms_version: 'v1.0-2026',
      privacy_policy_version: 'v1.0-2026',
      consented_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ] as ServerConsent[],
  privacyRequests: [] as ServerPrivacyReq[],
};

// Seed sample orders
serverDatabase.orders.push({
  id: 'ord_sample_1',
  user_id: 'usr_demo_creator',
  order_reference: 'ORD-849201',
  status: 'pending_review',
  target_username: 'sarah_lifestyle',
  package_name: 'Popular Growth Goal',
  follower_quantity: 500,
  price: 17.99,
  created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
});

// Admin Authorization Middleware
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication required. Admin token missing.',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.substring(7).trim();
  const session = activeAdminSessions.get(token);

  if (!session) {
    return res.status(403).json({
      error: 'Access Denied: Invalid or expired admin credentials.',
      code: 'FORBIDDEN_INVALID_TOKEN',
    });
  }

  if (Date.now() > session.expiresAt) {
    activeAdminSessions.delete(token);
    return res.status(403).json({
      error: 'Access Denied: Admin session has expired. Please log in again.',
      code: 'SESSION_EXPIRED',
    });
  }

  // Authorization passed
  (req as any).adminSession = session;
  next();
}

// ============================================================================
// API ROUTES
// ============================================================================

// 1. Admin Authentication Login
app.post('/api/admin/login', (req, res) => {
  const { email, passkey } = req.body;

  if (!email || !passkey) {
    return res.status(400).json({ error: 'Email and admin passkey are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPasskey = String(passkey).trim();

  // Validate credentials strictly against authoritative server backend identity
  const isEmailMatch = cleanEmail === ADMIN_EMAIL.toLowerCase();
  const isPasskeyMatch = cleanPasskey === ADMIN_PASSKEY;

  if (!isEmailMatch || !isPasskeyMatch) {
    // Add artificial delay to mitigate brute force
    setTimeout(() => {
      return res.status(401).json({ error: 'Invalid administrator email or passkey.' });
    }, 400);
    return;
  }

  // Generate cryptographically random token
  const token = crypto.randomBytes(32).toString('hex');
  const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
  const expiresAt = Date.now() + sessionDuration;

  activeAdminSessions.set(token, {
    role: 'admin',
    email: cleanEmail,
    expiresAt,
  });

  return res.json({
    success: true,
    token,
    role: 'admin',
    email: cleanEmail,
    expiresAt,
    message: 'Administrator session established successfully.',
  });
});

// 2. Admin Session Verification
app.get('/api/admin/verify', requireAdminAuth, (req, res) => {
  const session = (req as any).adminSession;
  res.json({
    authenticated: true,
    role: session.role,
    email: session.email,
    expiresAt: session.expiresAt,
  });
});

// 3. Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    activeAdminSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 4. Admin Orders Endpoint (PROTECTED)
app.get('/api/admin/orders', requireAdminAuth, (req, res) => {
  res.json({ orders: serverDatabase.orders });
});

// 5. Admin Update Order Status (PROTECTED)
app.post('/api/admin/orders/:id/status', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending_review', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid order status value.' });
  }

  const order = serverDatabase.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  order.status = status;
  order.updated_at = new Date().toISOString();

  res.json({ success: true, order });
});

// 6. Admin Users Endpoint (PROTECTED)
app.get('/api/admin/users', requireAdminAuth, (req, res) => {
  res.json({ users: serverDatabase.users });
});

// 7. Admin Consents Endpoint (PROTECTED)
app.get('/api/admin/consents', requireAdminAuth, (req, res) => {
  res.json({ consents: serverDatabase.consents });
});

// 8. Admin Privacy Requests Endpoint (PROTECTED)
app.get('/api/admin/privacy-requests', requireAdminAuth, (req, res) => {
  res.json({ privacyRequests: serverDatabase.privacyRequests });
});

// 9. Admin Update Privacy Request (PROTECTED)
app.post('/api/admin/privacy-requests/:id/status', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['submitted', 'reviewing', 'fulfilled', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid privacy status.' });
  }

  const pr = serverDatabase.privacyRequests.find((p) => p.id === id);
  if (!pr) {
    return res.status(404).json({ error: 'Privacy request not found.' });
  }

  pr.status = status;
  if (status === 'fulfilled' || status === 'rejected') {
    pr.completed_at = new Date().toISOString();
  }

  res.json({ success: true, privacyRequest: pr });
});

// 10. Public Endpoint: Sync User/Order from client to server store
app.post('/api/public/orders', (req, res) => {
  const { user_id, order_reference, target_username, package_name, follower_quantity, price } = req.body;
  if (!order_reference || !target_username) {
    return res.status(400).json({ error: 'Missing required order fields.' });
  }

  const newOrder: ServerOrder = {
    id: 'ord_' + Math.random().toString(36).substring(2, 11),
    user_id: user_id || 'usr_guest',
    order_reference,
    status: 'pending_review',
    target_username: String(target_username).replace(/^@/, ''),
    package_name: package_name || 'Standard Follower Goal',
    follower_quantity: Number(follower_quantity) || 100,
    price: Number(price) || 4.99,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  serverDatabase.orders.unshift(newOrder);
  res.json({ success: true, order: newOrder });
});

app.post('/api/public/privacy-requests', (req, res) => {
  const { user_id, request_type, details } = req.body;
  const newReq: ServerPrivacyReq = {
    id: 'prv_' + Math.random().toString(36).substring(2, 11),
    user_id,
    request_type: request_type || 'data_deletion',
    status: 'submitted',
    details,
    created_at: new Date().toISOString(),
  };

  serverDatabase.privacyRequests.unshift(newReq);
  res.json({ success: true, privacyRequest: newReq });
});

// ============================================================================
// VITE OR STATIC FILE SERVING
// ============================================================================
async function startServer() {
  if (!isProduction) {
    // Mount Vite dev server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Insta Followers Increase Server running at http://localhost:${PORT}`);
    console.log(`🔒 Admin Auth initialized for: ${ADMIN_EMAIL}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
