export interface Profile {
  id: string;
  username_or_email: string;
  display_name?: string;
  phone_number?: string;
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingSession {
  id: string;
  user_id: string;
  current_step: 'confirmation_1' | 'confirmation_2' | 'confirmation_3' | 'phone_security' | 'legal_consent' | 'completed';
  completion_status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  completed_at?: string | null;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  terms_version: string;
  privacy_policy_version: string;
  consented_at: string;
}

export interface GrowthPackage {
  id: string;
  package_name: string;
  follower_quantity: number;
  price: number;
  active: boolean;
  description: string;
  created_at?: string;
}

export type OrderStatus = 'pending_review' | 'in_progress' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  package_id: string;
  order_reference: string;
  status: OrderStatus;
  target_username: string;
  created_at: string;
  updated_at: string;
  // Joined package info
  package?: GrowthPackage;
}

export type PrivacyRequestType = 'data_access' | 'data_deletion' | 'opt_out';
export type PrivacyRequestStatus = 'submitted' | 'reviewing' | 'fulfilled' | 'rejected';

export interface PrivacyRequest {
  id: string;
  user_id?: string;
  request_type: PrivacyRequestType;
  status: PrivacyRequestStatus;
  details?: string;
  created_at: string;
  completed_at?: string | null;
}

export interface SupabaseConfigState {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastChecked?: string;
  errorMessage?: string;
}
