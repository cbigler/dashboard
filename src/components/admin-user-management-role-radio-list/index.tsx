import React, { Fragment } from 'react';
import can, { getManageableRoles, ROLE_INFO } from '../../helpers/permissions';

import { RadioButton, RadioButtonContext } from '@density/ui';

export default function AdminUserManagementRoleRadioList({ user, value, onChange }) {
  const manageableRoles = getManageableRoles(user);
  return (
    <Fragment>
      {manageableRoles.map(role => (
        <div key={role}>
          <RadioButtonContext.Provider value='USER_FORM'>
            <RadioButton
              name="admin-user-management-new-user-role"
              checked={value === role}
              onChange={e => onChange(role)}
              value={role}
              text={ROLE_INFO[role].label} />
          </RadioButtonContext.Provider>
          <div className="admin-user-management-new-user-role-description">
            {ROLE_INFO[role].description}
          </div>
        </div>
      ))}
    </Fragment>
  )
}
