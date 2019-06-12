import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import Intercom from 'react-intercom';

export function IntercomDensity({ user }) {
  let intercomUser = {};
  if (user.data && user.data.hasOwnProperty("id")) {
    intercomUser = {
      user_id: user.data.id,
      email: user.data.email,
      name: user.data.fullName
    }
  }
  if (process.env.REACT_APP_INTERCOM_APP_ID) {
    return (
      <Intercom appID={process.env.REACT_APP_INTERCOM_APP_ID} { ...intercomUser } />
    )
  } else {
    return (
      <Fragment />
    )
  }
  
}

export default connect((state: any) => {
  return { user: state.user };
}, (dispatch: any) => {
  return {};
})(IntercomDensity);
