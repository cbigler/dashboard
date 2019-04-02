export const PERMISSION_CODES = {
  // Permission given to Density superusers to impersonate other organizations. Used on the Internal Admin.
  impersonate: 'impersonate',
  // Permission to list organizations in the Accounts API.
  listOrganizations: 'list_organizations',
  // Permissions given to users to allow them to write to the Core API.
  coreWrite: 'core_write',
  // Permissions given to users to allow them to read from the Core API.
  coreRead: 'core_read',
  // Permission given to demo users: readonly, can interact with Dashboard.
  demo: 'demo',
  // Permission to allow a user to manage owner-level users
  ownerUserManage: 'owner_user_manage',
  // Permission to allow a user to manage admin-level users
  adminUserManage: 'admin_user_manage',
  // Permission to allow a user to manage readonly-level users
  readonlyUserManage: 'readonly_user_manage',
  // Permission to allow a user to access developer tools
  developerToolsManage: 'developer_tools_manage',
  // Permission to allow a user to list or view sensors
  sensorsList: 'sensors_list'
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
  'service': {
    label: 'Service',
    description: 'Service user.'
  },
};


export default function can(user, permission) {
  if (user.loading || user.error || !user.data) { return false; }
  return user.data.permissions.indexOf(permission) > -1;
}

export function getManageableRoles(user) {
  const roles: string[] = [];
  if (can(user, PERMISSION_CODES.ownerUserManage)) { roles.push('owner'); }
  if (can(user, PERMISSION_CODES.adminUserManage)) { roles.push('admin'); }
  if (can(user, PERMISSION_CODES.readonlyUserManage)) { roles.push('readonly'); }
  return roles;
}

