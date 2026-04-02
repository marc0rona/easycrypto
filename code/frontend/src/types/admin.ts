export type AdminUserStatus = 'active' | 'disabled';

export interface AdminUser {
  email: string;
  id: string;
  status: AdminUserStatus;
  username: string;
}
