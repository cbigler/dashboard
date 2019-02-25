import React from 'react';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

const MOCK_DATA = [
  {
    "id": "usr_123",
    "email": "garrett@density.io",
    "full_name": "Garrett Bastable",
    "role": "readonly"
  },
  {
    "id": "usr_456",
    "email": "lukasz+rounded@density.io",
    "full_name": "Lukasz Zagaja",
    "role": "readonly"
  },
  {
    "id": "usr_789",
    "email": "ben@density.io",
    "full_name": "Ben Redfield",
    "role": "admin"
  },
  {
    "id": "usr_234",
    "email": "merati@density.io",
    "full_name": "Matt Merati",
    "role": "readonly"
  },
  {
    "id": "usr_567",
    "email": "bw@roundedco.com",
    "full_name": "Brian Weinreich",
    "role": "admin"
  },
  {
    "id": "usr_890",
    "email": "andrew@density.io",
    "full_name": "",
    "role": "owner"
  },
  {
    "id": "usr_345",
    "email": "gus@density.io",
    "full_name": "Gus Cost",
    "role": "admin"
  },
  {
    "id": "usr_678",
    "email": "robb.nesmith+3@density.io",
    "full_name": "Robb Nesmith",
    "role": "readonly"
  },
  {
    "id": "usr_901",
    "email": "rg@roundedco.com",
    "full_name": "Robert Grazioli",
    "role": "admin"
  }
]

export default function AdminUserManagement({}) {
  return <table>
    <thead>
      <th>Email</th>
      <th>Name</th>
      <th>Role</th>
      <th>Activity</th>
      <th>Invitation</th>
    </thead>
    <tbody>
      {MOCK_DATA.map(objectSnakeToCamel).map(u => (<tr>
        <td>{u.email}</td>
        <td>{u.fullName}</td>
        <td>{u.role}</td>
        <td>{}</td>
        <td>{"asdf"}</td>
      </tr>))}
    </tbody>
  </table>;
}
