import React from 'react';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';

import { AppBar, AppBarSection, Button, Icons, InputBox, InputBoxContext } from '@density/ui';


const MOCK_DATA = [
  {
    "id": "usr_123",
    "email": "garrett@density.io",
    "full_name": "Garrett Bastable",
    "role": "readonly",
    "last_login": "2019-02-01T00:00:00Z",
    "invitation_status": "pending"
  },
  {
    "id": "usr_456",
    "email": "lukasz+rounded@density.io",
    "full_name": "Lukasz Zagaja",
    "role": "readonly",
    "last_login": "2019-02-01T00:00:00Z",
    "invitation_status": "pending"
  },
  {
    "id": "usr_789",
    "email": "ben@density.io",
    "full_name": "Ben Redfield",
    "role": "admin",
    "last_login": "2019-02-01T00:00:00Z",
    "invitation_status": "pending"
  },
  {
    "id": "usr_234",
    "email": "merati@density.io",
    "full_name": "Matt Merati",
    "role": "readonly",
    "last_login": "2019-02-01T00:00:00Z",
    "invitation_status": "pending"
  },
  {
    "id": "usr_567",
    "email": "bw@roundedco.com",
    "full_name": "Brian Weinreich",
    "role": "admin",
    "last_login": "2019-02-01T00:00:00Z",
    "invitation_status": "pending"
  },
  {
    "id": "usr_890",
    "email": "andrew@density.io",
    "full_name": "",
    "role": "owner",
    "last_login": "2019-02-01T00:00:00Z",
    "invitation_status": "pending"
  },
  {
    "id": "usr_345",
    "email": "gus@density.io",
    "full_name": "Gus Cost",
    "role": "admin",
    "last_login": "2019-02-01T00:00:00Z",
    "invitation_status": "pending"
  },
  {
    "id": "usr_678",
    "email": "robb.nesmith+3@density.io",
    "full_name": "Robb Nesmith",
    "role": "readonly",
    "last_login": "2019-02-01T00:00:00Z",
    "invitation_status": "pending"
  },
  {
    "id": "usr_901",
    "email": "rg@roundedco.com",
    "full_name": "Robert Grazioli",
    "role": "admin",
    "last_login": "2019-02-01T00:00:00Z",
    "invitation_status": "pending"
  }
]

export default function AdminUserManagement({}) {
  const data = MOCK_DATA.map(objectSnakeToCamel);
  return <div className="admin-user-management">
    <AppBar>
      <AppBarSection>
        <InputBox type="text" placeholder="ex. Bobby Graz" />
      </AppBarSection>
      <AppBarSection>
        <Button>Add User</Button>
      </AppBarSection>
    </AppBar>
    <div className="admin-user-management-list">
      <div>
        <div className="admin-user-management-header">Email</div>
        {data.map(u => <div className="admin-user-management-cell">{u.email}</div>)}
      </div>
      <div>
        <div className="admin-user-management-header">Name</div>
        {data.map(u => <div className="admin-user-management-cell">{u.fullName}</div>)}
      </div>
      <div>
        <div className="admin-user-management-header" style={{paddingLeft: 39}}>Role</div>
        {data.map(u => <div className="admin-user-management-cell">{
          <InputBoxContext.Provider value="LIST_VIEW">
            <InputBox
              type="select"
              width="160px"
              value={u.role}
              choices={[{
                id: 'readonly',
                label: 'Read-only'
              }, {
                id: 'admin',
                label: 'Admin'
              }, {
                id: 'owner',
                label: 'Owner'
              }]} />
          </InputBoxContext.Provider>
        }</div>)}
      </div>
      <div style={{flexGrow: 1}}>
        <div className="admin-user-management-header"></div>
        {data.map(u => <div className="admin-user-management-cell"></div>)}
      </div>
      <div>
        <div className="admin-user-management-header">Activity</div>
        {data.map(u => <div className="admin-user-management-cell">Active</div>)}
      </div>
      <div>
        <div className="admin-user-management-header">Invitation</div>
        {data.map(u => <div className="admin-user-management-cell">{u.invitationStatus}</div>)}
      </div>
      <div>
        <div className="admin-user-management-header"></div>
        {data.map(u => <div className="admin-user-management-cell">{u.invitationStatus === 'pending' ? 'Resend' : ''}</div>)}
      </div>
      <div>
        <div className="admin-user-management-header"></div>
        {data.map(u => <div className="admin-user-management-cell"><Icons.Trash /></div>)}
      </div>
    </div>
  </div>;
}
