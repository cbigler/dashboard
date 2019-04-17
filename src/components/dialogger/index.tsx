import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import styles from './styles.module.scss';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  AppBarTitle,
  Button,
  ButtonContext,
  Modal,
} from '@density/ui';

import hideModal from '../../actions/modal/hide';

export function Dialogger({
  activeModal,
  onCancel,
  onConfirm,
}) {
  return <Fragment>
    {activeModal.name === 'MODAL_CONFIRM' ? (
      <Modal
        visible={activeModal.visible}
        width={360}
        onBlur={onCancel}
        onEscape={onCancel}
      >
        <div className={styles.dashboardModalConfirm}>
          <AppBar>
            <AppBarTitle>{activeModal.data.title || 'Confirm'}</AppBarTitle>
          </AppBar>
          <div className={styles.dashboardModalConfirmContent}>
            {activeModal.data.prompt || 'Are you sure?'}
          </div>
          <AppBarContext.Provider value="BOTTOM_ACTIONS">
            <AppBar>
              <AppBarSection></AppBarSection>
              <AppBarSection>
                <ButtonContext.Provider value="CANCEL_BUTTON">
                  <Button onClick={onCancel}>Cancel</Button>
                </ButtonContext.Provider>
                <Button
                  type="primary"
                  onClick={() => onConfirm(activeModal.data.callback)}
                >
                  {activeModal.data.confirmText || 'Confirm'}
                </Button>
              </AppBarSection>
            </AppBar>
          </AppBarContext.Provider>
        </div>
      </Modal>
    ) : null}
  </Fragment>;
}

export default connect((state: any) => {
  return {
    activeModal: state.activeModal,
  };
}, dispatch => {
  return {
    onCancel() {
      (dispatch as any)(hideModal());
    },
    onConfirm(callback) {
      (dispatch as any)(hideModal());
      callback();
    }
  };
})(Dialogger);
