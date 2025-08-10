export interface AuthModel {
  access_token: string;
  refresh_Token?: string;
}
export interface UserModel {
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
    total_credit: number;
    used_credit: number;
};
