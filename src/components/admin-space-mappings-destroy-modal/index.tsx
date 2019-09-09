import styles from './styles.module.scss';

import React from 'react';

import {
  AppBar,
  AppBarSection,
  AppBarContext,
  AppBarTitle,
  Button,
  ButtonGroup,
  Modal,
} from '@density/ui';


export default class SpaceMappingsDestroyModal extends React.Component<any, any> {

  render() {
    const { visible, onDismiss } = this.props;
    
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
                <ButtonGroup>
                  <Button variant="underline" onClick={this.props.onDismiss}>Cancel</Button>
                  <Button
                    variant="filled"
                    type="primary"
                    onClick={() => this.props.onDestroy(this.props.spaceMappingId)}
                  >I understand the consequences. Delete.</Button>
                </ButtonGroup>
              </AppBarSection>
            </AppBar>
          </AppBarContext.Provider>
        </div>
      </Modal>
    );
  }
}
