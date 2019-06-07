import React, { useRef, useEffect, Fragment } from 'react';
import { connect } from 'react-redux';

import styles from './styles.module.scss';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  AppBarTitle,
  Button,
  ButtonGroup,
  Modal,
  InputBox,
} from '@density/ui';

import hideModal from '../../actions/modal/hide';
import updateModal from '../../actions/modal/update';

export function Dialogger({
  activeModal,
  onCancel,
  onConfirm,
  onSubmit,
  onUpdateModal,
}) {
  const textBoxRef = useRef(null);

  // When a prompt is shown, auto focus its text box.
  useEffect(() => {
    if (textBoxRef && textBoxRef.current) {
      (textBoxRef as any).current.focus();
    }
  }, [activeModal.name, textBoxRef]);

  return (
    <Fragment>
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
                  <ButtonGroup>
                    <Button variant="underline" onClick={onCancel}>Cancel</Button>
                    <Button
                      variant="filled"
                      type="primary"
                      onClick={() => onConfirm(activeModal.data.callback)}
                    >
                      {activeModal.data.confirmText || 'Confirm'}
                    </Button>
                  </ButtonGroup>
                </AppBarSection>
              </AppBar>
            </AppBarContext.Provider>
          </div>
        </Modal>
      ) : null}
      {activeModal.name === 'MODAL_PROMPT' ? (
        <Modal
          visible={activeModal.visible}
          width={480}
          onBlur={onCancel}
          onEscape={onCancel}
        >
          <div className={styles.dashboardModalPrompt}>
            <AppBar>
              <AppBarTitle>{activeModal.data.title || 'Prompt'}</AppBarTitle>
            </AppBar>
            <div className={styles.dashboardModalPromptContent}>
              <div className={styles.dashboardModalPromptLabel}>
                {activeModal.data.prompt || 'Enter data:'}
              </div>
              <InputBox
                type="text"
                value={activeModal.data.text || ''}
                onChange={e => onUpdateModal({text: e.target.value})}
                placeholder={activeModal.data.placeholder}
                width="100%"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    onSubmit(activeModal.data.callback, activeModal.data.text);
                  }
                }}
                ref={textBoxRef}
              />
            </div>
            <AppBarContext.Provider value="BOTTOM_ACTIONS">
              <AppBar>
                <AppBarSection></AppBarSection>
                <AppBarSection>
                  <ButtonGroup>
                    <Button variant="underline" onClick={onCancel}>Cancel</Button>
                    <Button
                      variant="filled"
                      type="primary"
                      onClick={() => onSubmit(activeModal.data.callback, activeModal.data.text)}
                    >
                      {activeModal.data.confirmText || 'Submit'}
                    </Button>
                  </ButtonGroup>
                </AppBarSection>
              </AppBar>
            </AppBarContext.Provider>
          </div>
        </Modal>
      ) : null}
    </Fragment>
  );
}

function Prompt({activeModal, onCancel, onSubmit}) {
}

export default connect((state: any) => {
  return {
    activeModal: state.activeModal,
  };
}, dispatch => {
  return {
    onUpdateModal(newModalData) {
      dispatch(updateModal(newModalData));
    },
    onCancel() {
      (dispatch as any)(hideModal());
    },
    onConfirm(callback) {
      (dispatch as any)(hideModal());
      callback();
    },
    onSubmit(callback, data) {
      (dispatch as any)(hideModal());
      callback(data);
    },
  };
})(Dialogger);
