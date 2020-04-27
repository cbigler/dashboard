import React from 'react';

import Intercom from 'react-intercom';
import useRxStore from '../../helpers/use-rx-store';
import UserStore from '../../rx-stores/user';
import ImpersonateStore from '../../rx-stores/impersonate';

import { ON_PREM } from '../../fields';

export function IntercomDensity() {
  const user = useRxStore(UserStore);
  const impersonate = useRxStore(ImpersonateStore);
  const notImpersonating = !impersonate || !impersonate.enabled || !impersonate.selectedUser;
  const notOnPrem = !ON_PREM;

  let intercomUser = {};
  if (user.data && user.data.hasOwnProperty("id")) {
    intercomUser = {
      user_id: user.data.id,
      email: user.data.email,
      name: user.data.full_name,
      organization_id: user.data.organization.id,
      organization_name: user.data.organization.name,
      marketing_consent: user.data.marketing_consent,
      core_consent: user.data.core_consent,
      role: user.data.role,
    }
  }

  if (process.env.REACT_APP_INTERCOM_APP_ID && notImpersonating && notOnPrem) {
    return (
      <Intercom appID={process.env.REACT_APP_INTERCOM_APP_ID} { ...intercomUser } />
    )
  } else {
    return null;
  }

}

export default IntercomDensity;
