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
  developer_tools_manage: 'developer_tools_manage',
  // Permission to allow a user to list or view sensors
  sensors_list: 'sensors_list'
};

export const ROLE_INFO = {
  'owner': {
    label: 'Owner',
    description: 'Full access and all permissions, including developer tools.'
  },
  'admin': {
    label: 'Admin',
    description: 'Edit spaces and users. Cannot access developer tools.'
  },
  'readonly': {
    label: 'Read-Only',
    description: 'Cannot make changes to spaces or users.'
  },
};


export default function can(user, permission) {
  if (user.loading || user.error || !user.data) { return false; }
  return user.data.permissions.indexOf(permission) > -1;
}

export function getManageableRoles(user) {
  const roles: string[] = [];
  if (can(user, PERMISSION_CODES.owner_user_manage)) { roles.push('owner'); }
  if (can(user, PERMISSION_CODES.admin_user_manage)) { roles.push('admin'); }
  if (can(user, PERMISSION_CODES.readonly_user_manage)) { roles.push('readonly'); }
  return roles;
}

