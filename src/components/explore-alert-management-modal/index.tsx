import React from 'react';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  Button,
  ButtonGroup,
  Modal
} from '@density/ui';
import styles from './styles.module.scss';

export default function ExploreAlertManagementModal({
  visible,
  selectedSpace,
  alert,
  onCloseModal
}) {
  return <Modal
    visible={visible}
    width={720}
    height={480}
    onBlur={onCloseModal}
    onEscape={onCloseModal}
  >
    <div className={styles.exploreAlertManagementModalContainer}>
      <AppBar>
        <AppBarTitle>{alert ? 'Edit Alert' : 'New Alert'}</AppBarTitle>
      </AppBar>
      
      <div className={styles.exploreAlertManagementModalBody}>ASDF</div>

      <AppBarContext.Provider value="BOTTOM_ACTIONS">
        <AppBar>
          <AppBarSection />
          <AppBarSection>
            <ButtonGroup>
              <Button>Cancel</Button>
              <Button variant="filled">Save</Button>
            </ButtonGroup>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </div>
  </Modal>
}