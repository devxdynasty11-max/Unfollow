// Server-authorized Admin API Client
// All requests require authoritative server session verification via Bearer token

export interface AdminAuthResult {
  success: boolean;
  token?: string;
  role?: 'admin';
  email?: string;
  expiresAt?: number;
  error?: string;
}

export async function loginAdmin(email: string, passkey: string): Promise<AdminAuthResult> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, passkey }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Authentication failed' };
    }

    return {
      success: true,
      token: data.token,
      role: data.role,
      email: data.email,
      expiresAt: data.expiresAt,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error reaching authorization server.' };
  }
}

export async function verifyAdminSession(token: string): Promise<{ valid: boolean; email?: string; error?: string }> {
  if (!token) return { valid: false, error: 'No token provided' };

  try {
    const res = await fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { valid: false, error: data.error || 'Session invalid or expired' };
    }

    const data = await res.json();
    return { valid: true, email: data.email };
  } catch (err: any) {
    return { valid: false, error: 'Server unavailable' };
  }
}

export async function logoutAdmin(token: string): Promise<void> {
  if (!token) return;
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {}
}

export async function fetchAdminOrders(token: string) {
  const res = await fetch('/api/admin/orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unauthorized' }));
    throw new Error(err.error || 'Failed to fetch admin orders');
  }
  return res.json();
}

export async function updateAdminOrderStatus(token: string, orderId: string, status: string) {
  const res = await fetch(`/api/admin/orders/${orderId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unauthorized' }));
    throw new Error(err.error || 'Failed to update order status');
  }
  return res.json();
}

export async function fetchAdminUsers(token: string) {
  const res = await fetch('/api/admin/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unauthorized' }));
    throw new Error(err.error || 'Failed to fetch user records');
  }
  return res.json();
}

export async function fetchAdminConsents(token: string) {
  const res = await fetch('/api/admin/consents', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unauthorized' }));
    throw new Error(err.error || 'Failed to fetch consent records');
  }
  return res.json();
}

export async function fetchAdminPrivacyRequests(token: string) {
  const res = await fetch('/api/admin/privacy-requests', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unauthorized' }));
    throw new Error(err.error || 'Failed to fetch privacy requests');
  }
  return res.json();
}

export async function updateAdminPrivacyStatus(token: string, reqId: string, status: string) {
  const res = await fetch(`/api/admin/privacy-requests/${reqId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unauthorized' }));
    throw new Error(err.error || 'Failed to update privacy request');
  }
  return res.json();
}
