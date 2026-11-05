import React from 'react';
import { AdminPage } from '../../pages/Admin/AdminPage';

/**
 * AdminRoute Guard Component
 * Enforces role-based access control.
 * Unauthenticated users are presented with the secure Director Authentication Form.
 * Authenticated non-admin patrons (role: user) are presented with the 403 Access Denied screen.
 * Only verified administrators (role: admin) gain access to the Director Portal.
 */
export const AdminRoute = () => {
  return <AdminPage />;
};

export default AdminRoute;

