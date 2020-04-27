import styles from './styles.module.scss';

import React, { useState } from 'react';

import {
  AppFrame,
  AppPane,
  AppScrollView,
} from '@density/ui/src';

import ErrorBar from '../error-bar/index';

import useRxStore from '../../helpers/use-rx-store';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import UserStore, { UserState } from '../../rx-stores/user';
import SpacesLegacyStore, { SpacesLegacyState } from '../../rx-stores/spaces-legacy';


export class QueueSpaceDetail extends React.Component<{
  user: UserState,
  spaces: SpacesLegacyState,
  loading: boolean,
  onSubmitUserUpdate: (full_name: any, phone_number: any) => Promise<void>,
}, {error: any}> {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  setErrorText = text => {
    this.setState({error: text});
  }

  render() {
    const {
      user,
      spaces,
      onSubmitUserUpdate,
    } = this.props;


    return (
      <AppFrame>
        <AppPane>
          <AppScrollView>
            {/* Render any errors from the server */}
            <ErrorBar message={this.state.error} />
            <div className={styles.accountPage}>
            </div>
          </AppScrollView>
        </AppPane>
      </AppFrame>

    );
  }
}


const ConnectedQueueSpaceDetail: React.FC = () => {
  const dispatch = useRxDispatch();
  const user = useRxStore(UserStore);
  const spaces = useRxStore(SpacesLegacyStore);
  const loading = user.loading;

  // formerly from mapDispatchToPro

  const onSubmitUserUpdate = async (full_name, phone_number) => {
    // await userUpdate(dispatch, full_name, phone_number);
  }

  return (
    <QueueSpaceDetail
      user={user}
      spaces={spaces}
      loading={loading}

      onSubmitUserUpdate={onSubmitUserUpdate}
    />
  )
}

export default ConnectedQueueSpaceDetail;
