import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import Intercom from 'react-intercom';


export function IntercomDensity({
  user,
}) {
  let intercomUser = {};
  if (user.data && user.data.hasOwnProperty("id")) {
    intercomUser = {
      user_id: user.data.id,
      email: user.data.email,
      name: user.data.fullName
    }
  }
  return (
    <Intercom appID="sr9uzcmq" { ...intercomUser } />
  );
}

export default connect((state: any) => {
  return { user: state.user };
}, (dispatch: any) => {
  return {};
})(IntercomDensity);
