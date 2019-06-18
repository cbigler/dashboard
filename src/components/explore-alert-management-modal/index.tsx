import React, { Fragment } from 'react';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  Button,
  ButtonGroup,
  InputBox,
  Modal,
  PhoneInputBox,
} from '@density/ui';
import styles from './styles.module.scss';
import FormLabel from '../form-label';

export default function ExploreAlertManagementModal({
  visible,
  selectedSpace,
  alert,
  onCloseModal
}) {
  return <Modal
    visible={visible}
    width={480}
    height={480}
    onBlur={onCloseModal}
    onEscape={onCloseModal}
  >
    <div className={styles.exploreAlertManagementModalContainer}>
      <AppBar>
        <AppBarTitle>{alert ? 'Edit Alert' : 'New Alert'}</AppBarTitle>
      </AppBar>
      
      <div className={styles.exploreAlertManagementModalBody}>
        <div className={styles.exploreAlertManagementModalFormRow}>
          <FormLabel
            label="Phone number"
            htmlFor="update-alert-phone-number"
            input={<PhoneInputBox
              id="update-alert-phone-number"
              width="100%"
              value={'123'}
              onChange={e => undefined //onUpdate({...token, name: e.target.value})
                        }
            />}
          />
          <div style={{ paddingTop: 12 }}>
            <Button
              id="update-alert-phone-number-link"
              variant="underline"
              value={'123'}
            >Use my number</Button>
          </div>
        </div>
        <div className={styles.exploreAlertManagementModalFormRow}>
          <FormLabel
            label="Notify me when the occupancy is"
            htmlFor="update-alert-metric-quantity"
            input={<div style={{display: 'flex', alignItems: 'center'}}>
              <InputBox type="select" />
              <div style={{width: 8}}></div>
              <InputBox type="text" width="80px" />
              <div style={{width: 8}}></div>
              people
            </div>}
          />
        </div>
        <div className={styles.exploreAlertManagementModalFormRow}>
          <FormLabel
            label="Send a reminder every"
            htmlFor="update-alert-cooldown"
            input={<div style={{display: 'flex', alignItems: 'center'}}>
              <InputBox type="select" />
            </div>}
          />
        </div>
      </div>

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