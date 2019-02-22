import React from 'react';

export default function AdminUserManagement({
  name,
}) {
  return <div className="admin-user-management">
    {name ? `Hello ${name}` : 'Hello World!'}
  </div>;
}
