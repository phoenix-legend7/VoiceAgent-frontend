export interface AuthModel {
  access_token: string;
  refresh_Token?: string;
}
export interface UserModel {
  id: string;
  email: string;
  is_verified: boolean;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  total_credit: number;
  used_credit: number;
  auto_refill: boolean;
  auto_refill_amount: number;
  auto_threshold: number;
  is_superuser: boolean;
  api_keys: Record<string, string> | null;
  // Subscription fields
  subscription_status?: string | null;  // active, inactive, canceled, past_due, trialing
  subscription_plan?: string | null;    // Stripe price ID
  subscription_start_date?: string | null;  // ISO date string
  subscription_end_date?: string | null;    // ISO date string
  stripe_subscription_id?: string | null;
};
