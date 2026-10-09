import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import {
  Profile,
  OnboardingSession,
  ConsentRecord,
  GrowthPackage,
  Order,
  OrderStatus,
  PrivacyRequest,
  PrivacyRequestType,
  PrivacyRequestStatus,
} from '../types';

export const DEFAULT_PACKAGES: GrowthPackage[] = [
  {
    id: 'pkg_100',
    package_name: 'Starter Growth Goal',
    follower_quantity: 100,
    price: 4.99,
    active: true,
    description: 'Introductory audience engagement strategy with profile audit.',
  },
  {
    id: 'pkg_250',
    package_name: 'Essential Growth Goal',
    follower_quantity: 250,
    price: 9.99,
    active: true,
    description: 'Targeted niche hashtag evaluation and bio visibility assessment.',
  },
  {
    id: 'pkg_500',
    package_name: 'Popular Growth Goal',
    follower_quantity: 500,
    price: 17.99,
    active: true,
    description: 'Balanced growth pacing consultation for aspiring creators.',
  },
  {
    id: 'pkg_1000',
    package_name: 'Creator Growth Goal',
    follower_quantity: 1000,
    price: 29.99,
    active: true,
    description: 'Comprehensive content scheduling recommendations and target audience mapping.',
  },
  {
    id: 'pkg_2500',
    package_name: 'Pro Growth Goal',
    follower_quantity: 2500,
    price: 59.99,
    active: true,
    description: 'Multi-week strategic review with competitor benchmarking and engagement tactics.',
  },
  {
    id: 'pkg_5000',
    package_name: 'Enterprise Growth Goal',
    follower_quantity: 5000,
    price: 99.99,
    active: true,
    description: 'Full-spectrum organic audience development blueprint with custom reporting.',
  },
];

// Local persistence cache keys
const STORAGE_KEYS = {
  PROFILES: 'app_db_profiles',
  SESSIONS: 'app_db_onboarding_sessions',
  CONSENT: 'app_db_consent_records',
  PACKAGES: 'app_db_growth_packages',
  ORDERS: 'app_db_orders',
  PRIVACY: 'app_db_privacy_requests',
};

// Helper to access local persistence
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const DatabaseService = {
  // Check if live Supabase is active
  isLiveSupabase(): boolean {
    return isSupabaseConfigured();
  },

  // ==========================================
  // PACKAGES
  // ==========================================
  async getGrowthPackages(): Promise<GrowthPackage[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('growth_packages')
          .select('*')
          .order('follower_quantity', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as GrowthPackage[];
        }
      } catch (e) {
        console.warn('Supabase getGrowthPackages fallback:', e);
      }
    }

    let local = getLocalItem<GrowthPackage[]>(STORAGE_KEYS.PACKAGES, []);
    if (!local || local.length === 0) {
      local = DEFAULT_PACKAGES;
      setLocalItem(STORAGE_KEYS.PACKAGES, local);
    }
    return local;
  },

  // ==========================================
  // PROFILES
  // ==========================================
  async createOrGetProfile(
    usernameOrEmail: string,
    displayName?: string,
    phoneNumber?: string
  ): Promise<Profile> {
    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();
    const client = getSupabaseClient();

    if (client) {
      try {
        // Check existing
        const { data: existing, error: findError } = await client
          .from('profiles')
          .select('*')
          .eq('username_or_email', cleanIdentifier)
          .maybeSingle();

        if (existing && !findError) {
          // Update phone if provided
          if (phoneNumber && !existing.phone_number) {
            const { data: updated } = await client
              .from('profiles')
              .update({ phone_number: phoneNumber, updated_at: new Date().toISOString() })
              .eq('id', existing.id)
              .select()
              .single();
            if (updated) return updated as Profile;
          }
          return existing as Profile;
        }

        // Create new
        const newRecord = {
          username_or_email: cleanIdentifier,
          display_name: displayName || cleanIdentifier.replace('@', ''),
          phone_number: phoneNumber || null,
          is_admin: cleanIdentifier.includes('admin'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: created, error: insertError } = await client
          .from('profiles')
          .insert(newRecord)
          .select()
          .single();

        if (created && !insertError) {
          return created as Profile;
        }
      } catch (e) {
        console.warn('Supabase createOrGetProfile fallback:', e);
      }
    }

    // Local fallback
    const profiles = getLocalItem<Profile[]>(STORAGE_KEYS.PROFILES, []);
    let profile = profiles.find((p) => p.username_or_email === cleanIdentifier);

    if (profile) {
      if (phoneNumber && !profile.phone_number) {
        profile.phone_number = phoneNumber;
        profile.updated_at = new Date().toISOString();
        setLocalItem(STORAGE_KEYS.PROFILES, profiles);
      }
      return profile;
    }

    profile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 11),
      username_or_email: cleanIdentifier,
      display_name: displayName || cleanIdentifier.replace('@', ''),
      phone_number: phoneNumber,
      is_admin: cleanIdentifier.includes('admin'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    profiles.push(profile);
    setLocalItem(STORAGE_KEYS.PROFILES, profiles);
    return profile;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('profiles').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as Profile[];
      } catch (e) {
        console.warn('Supabase getAllProfiles fallback:', e);
      }
    }
    return getLocalItem<Profile[]>(STORAGE_KEYS.PROFILES, []);
  },

  // ==========================================
  // ONBOARDING SESSIONS
  // ==========================================
  async createOnboardingSession(
    userId: string,
    initialStep: OnboardingSession['current_step'] = 'confirmation_1'
  ): Promise<OnboardingSession> {
    const newSession: OnboardingSession = {
      id: 'sess_' + Math.random().toString(36).substring(2, 11),
      user_id: userId,
      current_step: initialStep,
      completion_status: 'in_progress',
      created_at: new Date().toISOString(),
      completed_at: null,
    };

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('onboarding_sessions')
          .insert({
            user_id: userId,
            current_step: initialStep,
            completion_status: 'in_progress',
          })
          .select()
          .single();
        if (!error && data) return data as OnboardingSession;
      } catch (e) {
        console.warn('Supabase createOnboardingSession fallback:', e);
      }
    }

    const sessions = getLocalItem<OnboardingSession[]>(STORAGE_KEYS.SESSIONS, []);
    sessions.push(newSession);
    setLocalItem(STORAGE_KEYS.SESSIONS, sessions);
    return newSession;
  },

  async updateOnboardingSession(
    sessionId: string,
    currentStep: OnboardingSession['current_step'],
    completionStatus: OnboardingSession['completion_status'] = 'in_progress'
  ): Promise<void> {
    const client = getSupabaseClient();
    const updatePayload: any = {
      current_step: currentStep,
      completion_status: completionStatus,
    };
    if (completionStatus === 'completed') {
      updatePayload.completed_at = new Date().toISOString();
    }

    if (client) {
      try {
        await client.from('onboarding_sessions').update(updatePayload).eq('id', sessionId);
        return;
      } catch (e) {
        console.warn('Supabase updateOnboardingSession fallback:', e);
      }
    }

    const sessions = getLocalItem<OnboardingSession[]>(STORAGE_KEYS.SESSIONS, []);
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx !== -1) {
      sessions[idx] = {
        ...sessions[idx],
        ...updatePayload,
      };
      setLocalItem(STORAGE_KEYS.SESSIONS, sessions);
    }
  },

  // ==========================================
  // CONSENT RECORDS
  // ==========================================
  async recordConsent(
    userId: string,
    termsVersion: string = 'v1.0-2026',
    privacyVersion: string = 'v1.0-2026'
  ): Promise<ConsentRecord> {
    const record: ConsentRecord = {
      id: 'cns_' + Math.random().toString(36).substring(2, 11),
      user_id: userId,
      terms_version: termsVersion,
      privacy_policy_version: privacyVersion,
      consented_at: new Date().toISOString(),
    };

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('consent_records')
          .insert({
            user_id: userId,
            terms_version: termsVersion,
            privacy_policy_version: privacyVersion,
            consented_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (!error && data) return data as ConsentRecord;
      } catch (e) {
        console.warn('Supabase recordConsent fallback:', e);
      }
    }

    const records = getLocalItem<ConsentRecord[]>(STORAGE_KEYS.CONSENT, []);
    records.push(record);
    setLocalItem(STORAGE_KEYS.CONSENT, records);
    return record;
  },

  async getConsentRecords(): Promise<ConsentRecord[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('consent_records').select('*').order('consented_at', { ascending: false });
        if (!error && data) return data as ConsentRecord[];
      } catch (e) {
        console.warn('Supabase getConsentRecords fallback:', e);
      }
    }
    return getLocalItem<ConsentRecord[]>(STORAGE_KEYS.CONSENT, []);
  },

  // ==========================================
  // ORDERS
  // ==========================================
  async createOrder(
    userId: string,
    packageId: string,
    targetUsername: string
  ): Promise<Order> {
    const refCode = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date().toISOString();

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('orders')
          .insert({
            user_id: userId,
            package_id: packageId,
            order_reference: refCode,
            status: 'pending_review',
            target_username: targetUsername,
            created_at: now,
            updated_at: now,
          })
          .select('*, package:growth_packages(*)')
          .single();

        if (!error && data) {
          return data as Order;
        }
      } catch (e) {
        console.warn('Supabase createOrder fallback:', e);
      }
    }

    const packages = await this.getGrowthPackages();
    const pkg = packages.find((p) => p.id === packageId) || packages[0];

    const newOrder: Order = {
      id: 'ord_' + Math.random().toString(36).substring(2, 11),
      user_id: userId,
      package_id: packageId,
      order_reference: refCode,
      status: 'pending_review',
      target_username: targetUsername,
      created_at: now,
      updated_at: now,
      package: pkg,
    };

    const orders = getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, []);
    orders.unshift(newOrder);
    setLocalItem(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('orders')
          .select('*, package:growth_packages(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) return data as Order[];
      } catch (e) {
        console.warn('Supabase getUserOrders fallback:', e);
      }
    }

    const orders = getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, []);
    return orders.filter((o) => o.user_id === userId);
  },

  async getAllOrders(): Promise<Order[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('orders')
          .select('*, package:growth_packages(*), profile:profiles(*)')
          .order('created_at', { ascending: false });

        if (!error && data) return data as Order[];
      } catch (e) {
        console.warn('Supabase getAllOrders fallback:', e);
      }
    }

    return getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, []);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const client = getSupabaseClient();
    const now = new Date().toISOString();

    if (client) {
      try {
        await client
          .from('orders')
          .update({ status, updated_at: now })
          .eq('id', orderId);
        return;
      } catch (e) {
        console.warn('Supabase updateOrderStatus fallback:', e);
      }
    }

    const orders = getLocalItem<Order[]>(STORAGE_KEYS.ORDERS, []);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      orders[idx].updated_at = now;
      setLocalItem(STORAGE_KEYS.ORDERS, orders);
    }
  },

  // ==========================================
  // PRIVACY REQUESTS
  // ==========================================
  async submitPrivacyRequest(
    userId: string | undefined,
    requestType: PrivacyRequestType,
    details?: string
  ): Promise<PrivacyRequest> {
    const now = new Date().toISOString();
    const req: PrivacyRequest = {
      id: 'prv_' + Math.random().toString(36).substring(2, 11),
      user_id: userId,
      request_type: requestType,
      status: 'submitted',
      details,
      created_at: now,
      completed_at: null,
    };

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('privacy_requests')
          .insert({
            user_id: userId || null,
            request_type: requestType,
            status: 'submitted',
            details,
            created_at: now,
          })
          .select()
          .single();

        if (!error && data) return data as PrivacyRequest;
      } catch (e) {
        console.warn('Supabase submitPrivacyRequest fallback:', e);
      }
    }

    const requests = getLocalItem<PrivacyRequest[]>(STORAGE_KEYS.PRIVACY, []);
    requests.unshift(req);
    setLocalItem(STORAGE_KEYS.PRIVACY, requests);
    return req;
  },

  async getPrivacyRequests(): Promise<PrivacyRequest[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('privacy_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) return data as PrivacyRequest[];
      } catch (e) {
        console.warn('Supabase getPrivacyRequests fallback:', e);
      }
    }

    return getLocalItem<PrivacyRequest[]>(STORAGE_KEYS.PRIVACY, []);
  },

  async updatePrivacyRequestStatus(
    requestId: string,
    status: PrivacyRequestStatus
  ): Promise<void> {
    const client = getSupabaseClient();
    const completedAt = status === 'fulfilled' || status === 'rejected' ? new Date().toISOString() : null;

    if (client) {
      try {
        await client
          .from('privacy_requests')
          .update({ status, completed_at: completedAt })
          .eq('id', requestId);
        return;
      } catch (e) {
        console.warn('Supabase updatePrivacyRequestStatus fallback:', e);
      }
    }

    const requests = getLocalItem<PrivacyRequest[]>(STORAGE_KEYS.PRIVACY, []);
    const idx = requests.findIndex((r) => r.id === requestId);
    if (idx !== -1) {
      requests[idx].status = status;
      requests[idx].completed_at = completedAt;
      setLocalItem(STORAGE_KEYS.PRIVACY, requests);
    }
  },
};
