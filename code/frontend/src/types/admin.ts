export type AdminUserStatus = 'active' | 'disabled';
export type AdminUserRole = 'user' | 'admin';

export interface AdminUser {
  createdAt: string;
  email: string;
  id: string;
  name: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  username: string;
}
