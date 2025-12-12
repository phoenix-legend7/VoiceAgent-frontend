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
};
