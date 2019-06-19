import React from 'react';

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
import { connect } from 'react-redux';
import updateModal from '../../actions/modal/update';

const GREATER_THAN = 'greater_than',
      LESS_THAN = 'less_than',
      EQUAL_TO = 'equal_to';

export function ExploreAlertManagementModal({
  visible,
  alert,
  onUpdateAlert,
  onUpdateAlertMeta,
  onCloseModal
}) {
  return <Modal
    visible={visible}
    width={480}
    height={540}
    onBlur={onCloseModal}
    onEscape={onCloseModal}
  >
    <div className={styles.exploreAlertManagementModalContainer}>
      <AppBar>
        <AppBarTitle>{alert ? 'Edit Text Alert' : 'New Text Alert'}</AppBarTitle>
      </AppBar>
      
      <div className={styles.exploreAlertManagementModalBody}>
        <div className={styles.exploreAlertManagementModalFormRow}>
          <FormLabel
            label="Phone number"
            htmlFor="update-alert-phone-number"
            input={<PhoneInputBox
              id="update-alert-phone-number"
              width="100%"
              value={alert.meta.toNum}
              onChange={value => onUpdateAlertMeta(alert, 'toNum', value)}
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
              <InputBox
                type="select"
                value={alert.triggerType}
                width={160}
                choices={[
                  {id: GREATER_THAN, label: 'Greater than'},
                  {id: LESS_THAN, label: 'Less than'},
                  {id: EQUAL_TO, label: 'Equal to'},
                ]}
                onChange={value => onUpdateAlert(alert, 'triggerType', value)}
              />
              <div style={{width: 8}}></div>
              <InputBox
                type="text"
                width="80px"
                value={alert.triggerValue}
                invalid={!alert.triggerValue}
                onChange={e => onUpdateAlert(alert, 'triggerValue', e.target.value)}
              />
              <div style={{width: 8}}></div>
              people
            </div>}
          />
        </div>
        <div className={styles.exploreAlertManagementModalFormRow}>
          <FormLabel
            label="Send a reminder every"
            htmlFor="update-alert-cooldown-period"
            input={<div style={{display: 'flex', alignItems: 'center'}}>
              <InputBox
                type="select"
                value={alert.cooldown}
                width={160}
                choices={[
                  {id: 30, label: '30 minutes'},
                  {id: 60, label: '60 minutes'},
                  {id: 120, label: '2 hours'},
                  {id: 240, label: '4 hours'},
                  {id: 360, label: '6 hours'},
                  {id: 720, label: '12 hours'},
                  {id: 1440, label: '24 hours'},
                ]}
                onChange={value => onUpdateAlert(alert, 'cooldown', value)}
              />
            </div>}
          />
        </div>
        <div className={styles.exploreAlertManagementModalFormRow}>
          <FormLabel
            label="Notify me again if it increases by"
            htmlFor="update-alert-escalation-threshold"
            input={<div style={{display: 'flex', alignItems: 'center'}}>
              <InputBox
                type="text"
                width="80px"
                value={alert.meta.escalationDelta}
                invalid={!alert.meta.escalationDelta}
                onChange={e => onUpdateAlertMeta(alert, 'escalationDelta', e.target.value)}
              />
              <div style={{width: 8}}></div>
              people
            </div>}
          />
        </div>
      </div>

      <AppBarContext.Provider value="BOTTOM_ACTIONS">
        <AppBar>
          <AppBarSection>
            <Button type="muted" variant="underline">Delete alert</Button>
          </AppBarSection>
          <AppBarSection>
            <ButtonGroup>
              <Button variant="underline">Cancel</Button>
              <Button variant="filled">Save</Button>
            </ButtonGroup>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </div>
  </Modal>
}

export default connect(
  state => ({}),
  dispatch => ({
    onUpdateAlert: async (current, key, value) => {
      dispatch<any>(updateModal({
        alert: {
          ...current,
          [key]: value
        }
      }));
    },
    onUpdateAlertMeta: async (current, key, value) => {
      dispatch<any>(updateModal({
        alert: {
          ...current,
          meta: {
            ...current.meta,
            [key]: value
          }
        }
      }));
    }
  }),
)(ExploreAlertManagementModal);