export const PERMISSION_CODES = {
  // Permission given to Density superusers to impersonate other organizations. Used on the Internal Admin.
  impersonate: 'impersonate',
  // Permission to list organizations in the Accounts API.
  list_organizations: 'list_organizations',
  // Permissions given to users to allow them to write to the Core API.
  core_write: 'core_write',
  // Permissions given to users to allow them to read from the Core API.
  core_read: 'core_read',
  // Permission given to demo users: readonly, can interact with Dashboard.
  demo: 'demo',
  // Permission to allow a user to manage owner-level users
  owner_user_manage: 'owner_user_manage',
  // Permission to allow a user to manage admin-level users
  admin_user_manage: 'admin_user_manage',
  // Permission to allow a user to manage readonly-level users
  readonly_user_manage: 'readonly_user_manage',
  // Permission to allow a user to access developer tools
  developer_tool_manage: 'developer_tools_manage'
};

export default function can(user, permission) {
  if (user.loading || user.error || !user.data) { return false; }
  return user.data.permissions.indexOf(permission) > -1;
}
