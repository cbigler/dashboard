import styles from './styles.module.scss';

import React from 'react';

import {
  Button,
  ButtonContext,
  InputBox,
  AppBar,
  AppBarSection,
  AppBarContext,
  AppBarTitle,
  Modal,
} from '@density/ui';


export default class SpaceMappingsDestroyModal extends React.Component<any, any> {

  render() {
    const { visible, onDismiss, onDestroy } = this.props;
    
    return (
      <Modal
        visible={visible}
        width={480}
        onBlur={onDismiss}
        onEscape={onDismiss}
      >
        <div>
          <AppBar><AppBarSection><AppBarTitle>Destroy Space Mapping</AppBarTitle></AppBarSection></AppBar>

          <div className={styles.spaceMappingsDestroyContainer}>
            <h2 className={styles.spaceMappingsDestroyWarning}>Are you ABSOLUTELY sure?</h2>
            <p>
              The act of removing a space mapping is irreversible and could affect certain integrations
              on your dashboard. Please type DELETE below to remove.
            </p>
          </div>
          <AppBarContext.Provider value="BOTTOM_ACTIONS">
            <AppBar>
              <AppBarSection />
              <AppBarSection>
                <ButtonContext.Provider value="CANCEL_BUTTON">
                  <Button onClick={this.props.onDismiss}>Cancel</Button>
                </ButtonContext.Provider>
                <Button
                  type="primary"
                  width="100%"
                  onClick={() => this.props.onDestroy(this.props.spaceMappingId)}
                >I understand the consequences. Delete.</Button>
              </AppBarSection>
            </AppBar>
          </AppBarContext.Provider>
        </div>
      </Modal>
    );
  }
}
