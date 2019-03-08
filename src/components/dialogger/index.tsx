import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  AppBarTitle,
  Button,
} from '@density/ui';

import Modal from '../modal';
import hideModal from '../../actions/modal/hide';

export function CancelLink({
  onClick,
  text = 'Cancel'
}) {
  return <span
    role="button"
    className="dashboard-modal-cancel-link"
    onClick={onClick}
  >{text}</span>
}

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
        <div className="dashboard-modal-confirm">
          <AppBar>
            <AppBarTitle>{activeModal.data.title || 'Confirm'}</AppBarTitle>
          </AppBar>
          <div className="dashboard-modal-confirm-content">
            {activeModal.data.prompt || 'Are you sure?'}
          </div>
          <AppBarContext.Provider value="BOTTOM_ACTIONS">
            <AppBar>
              <AppBarSection></AppBarSection>
              <AppBarSection>
                <CancelLink onClick={onCancel} text={activeModal.data.cancelText} />
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
