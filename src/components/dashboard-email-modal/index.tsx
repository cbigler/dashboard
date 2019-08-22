import styles from './styles.module.scss';

import React, { useState, useEffect } from 'react';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  AppBarTitle,
  Button,
  ButtonGroup,
  InputBox,
  Modal,
} from '@density/ui';

import core from '../../client/core';
import collectionUsersRead from '../../rx-actions/users/read';
import hideModal from '../../actions/modal/hide';

import { DensityDashboard } from '../../types';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import showToast from '../../actions/toasts';
import { DispatchType } from '../../types/rx-actions';

type DashboardEmailModalProps = {
  visible: boolean,
  selectedDashboard: DensityDashboard,
  onCloseModal: () => void,
};

type DashboardEmailModalState = { recipient: string };

async function onCreateEmail(dispatch: DispatchType, email: {
  dashboardId: string,
  recipient: string
}) {
  dispatch(hideModal() as Any<FixInRefactor>);
  try {
    await core().post(`/dashboards/${email.dashboardId}/email`, {
      recipient_email: email.recipient
    });
    dispatch(showToast({ text: 'Email sent' }) as Any<FixInRefactor>);
  } catch (error) {
    console.error(error);
    dispatch(showToast({ text: 'Error sending email' }) as Any<FixInRefactor>);
  }
}

export default function DashboardEmailModal({
  selectedDashboard,
  visible,
  onCloseModal,
}: DashboardEmailModalProps) {
  const dispatch = useRxDispatch();

  const [state, setState] = useState({
    recipient: '',
  } as DashboardEmailModalState);

  useEffect(() => { collectionUsersRead(dispatch); }, [dispatch]);

  return (
    <Modal
      visible={visible}
      width={460}
      height={320}
      onBlur={onCloseModal}
      onEscape={onCloseModal}
    >
      <div className={styles.dashboardEmailModal}>
        <AppBar>
          <AppBarTitle>Email Dashboard</AppBarTitle>
        </AppBar>
        <div className={styles.dashboardEmailModalContainer}>
          <p className={styles.dashboardEmailModalPrompt}>
            Send someone a snapshot of this dashboard.
          </p>
          <InputBox
            type="email"
            placeholder="Recipient email address"
            value={state.recipient}
            onChange={e => setState({...state, recipient: e.target.value})}
            width="100%"
          />
        </div>
        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <ButtonGroup>
                <Button variant="underline" onClick={onCloseModal}>Cancel</Button>
                <Button
                  disabled={state.recipient.indexOf('@') === -1}
                  variant="filled"
                  onClick={() => {
                    let email = {
                      recipient: state.recipient,
                      dashboardId: selectedDashboard.id,
                    };
                    onCreateEmail(dispatch, email);
                  }}
                >Send email</Button>
              </ButtonGroup>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </div>
    </Modal>
  )
}
