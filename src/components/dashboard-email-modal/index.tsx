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
import hideModal from '../../rx-actions/modal/hide';

import { DensityDashboard } from '../../types';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import { showToast } from '../../rx-actions/toasts';
import { DispatchType } from '../../types/rx-actions';

type DashboardEmailModalProps = {
  visible: boolean,
  selectedDashboard: DensityDashboard,
  onCloseModal: () => void,
};

type DashboardEmailModalState = { recipient: string };
const initialState: DashboardEmailModalState = { recipient: '' };

async function onCreateEmail(dispatch: DispatchType, email: {
  dashboardId: string,
  recipient: string
}) {
  hideModal(dispatch);
  try {
    await core().post(`/dashboards/${email.dashboardId}/email`, {
      recipient_email: email.recipient
    });
    showToast(dispatch, { text: 'Email sent' });
  } catch (error) {
    console.error(error);
    showToast(dispatch, { text: 'Error sending email' });
  }
}

export default function DashboardEmailModal({
  selectedDashboard,
  visible,
  onCloseModal,
}: DashboardEmailModalProps) {
  const [state, setState] = useState(initialState);
  const dispatch = useRxDispatch();

  useEffect(() => { setState(initialState); }, [visible]);

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
