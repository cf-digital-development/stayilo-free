const admin = typeof window !== 'undefined' ? window.stayiloAdmin || {} : {};

/**
 * Must match the WordPress Free plugin mount nodes:
 *   admin  → #stayilo-react-root  (class-admin-menu.php)
 *   setup  → #stayilo-free-wizard-root (when setup page is added)
 * Override via stayiloAdmin.adminMountId / setupMountId if needed.
 */
export const ADMIN_MOUNT_ID = admin.adminMountId || 'stayilo-react-root';

export const SETUP_MOUNT_ID = admin.setupMountId || 'stayilo-free-wizard-root';
