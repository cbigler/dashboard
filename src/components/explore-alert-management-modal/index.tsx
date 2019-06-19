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
import hideModal from '../../actions/modal/hide';
import collectionAlertsCreate from '../../actions/collection/alerts/create';
import collectionAlertsUpdate from '../../actions/collection/alerts/update';
import collectionAlertsDestroy from '../../actions/collection/alerts/destroy';

const GREATER_THAN = 'greater_than',
      LESS_THAN = 'less_than';

export function ExploreAlertManagementModal({
  visible,
  alert,
  user,
  onUpdateAlert,
  onUpdateAlertMeta,
  onSaveAlert,
  onDeleteAlert,
  onCloseModal
}) {

  const triggerValueInvalid = isNaN(parseInt(alert.triggerValue));
  const escalationDeltaInvalid = isNaN(parseInt(alert.meta.escalationDelta));

  return <Modal
    visible={visible}
    width={480}
    height={540}
    onBlur={onCloseModal}
    onEscape={onCloseModal}
  >
    <div className={styles.exploreAlertManagementModalContainer}>
      <AppBar>
        <AppBarTitle>{alert.id ? 'Edit Text Alert' : 'New Text Alert'}</AppBarTitle>
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
          {user.data && user.data.phoneNumber ? <div style={{ paddingTop: 12 }}>
            <Button
              id="update-alert-phone-number-link"
              variant="underline"
              onClick={() => onUpdateAlertMeta(alert, 'toNum', user.data.phoneNumber)}
            >Use my number</Button>
          </div> : null}
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
                ]}
                onChange={value => onUpdateAlert(alert, 'triggerType', value.id)}
              />
              <div style={{width: 8}}></div>
              <InputBox
                type="text"
                width="80px"
                value={alert.triggerValue}
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
                value={alert.isOneShot ? -1 : alert.cooldown}
                width={160}
                choices={[
                  {id: -1, label: 'Don\'t remind'},
                  {id: 30, label: '30 minutes'},
                  {id: 60, label: '60 minutes'},
                  {id: 120, label: '2 hours'},
                  {id: 240, label: '4 hours'},
                  {id: 720, label: '12 hours'},
                  {id: 1440, label: '24 hours'},
                ]}
                onChange={value => onUpdateAlert(alert, 'cooldown', value.id)}
              />
            </div>}
          />
        </div>
        {alert.triggerType === GREATER_THAN ?
          <div className={styles.exploreAlertManagementModalFormRow}>
            <FormLabel
              label="Notify me again if it increases by"
              htmlFor="update-alert-escalation-threshold"
              input={<div style={{display: 'flex', alignItems: 'center'}}>
                <InputBox
                  type="text"
                  width="80px"
                  value={alert.meta.escalationDelta}
                  onChange={e => onUpdateAlertMeta(alert, 'escalationDelta', e.target.value)}
                />
                <div style={{width: 8}}></div>
                people
              </div>}
            />
          </div> : null
        }
      </div>

      <AppBarContext.Provider value="BOTTOM_ACTIONS">
        <AppBar>
          <AppBarSection>
            {alert.id ? <Button
              type="danger"
              variant="underline"
              onClick={() => onDeleteAlert(alert)}
            >Delete alert</Button> : null}
          </AppBarSection>
          <AppBarSection>
            <ButtonGroup>
              <Button variant="underline" onClick={onCloseModal}>Cancel</Button>
              <Button
                variant="filled"
                disabled={!alert.meta.toNum || triggerValueInvalid || escalationDeltaInvalid}
                onClick={() => onSaveAlert(alert)}
              >Save</Button>
            </ButtonGroup>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </div>
  </Modal>
}

export default connect(
  (state: any) => ({
    visible: state.activeModal.visible,
    alert: state.activeModal.data && state.activeModal.data.alert,
    user: state.user,
  }),
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
    },
    onSaveAlert: async alert => {
      if (alert.triggerType !== GREATER_THAN) {
        delete alert.meta.escalationDelta;
      }
      if (alert.cooldown === -1) {
        alert.cooldown = 60;
        alert.isOneShot = true;
      }
      if (alert.id) {
        dispatch<any>(collectionAlertsUpdate(alert));
      } else {
        dispatch<any>(collectionAlertsCreate(alert));
      }
      dispatch<any>(hideModal());
    },
    onDeleteAlert: async alert => {
      dispatch<any>(collectionAlertsDestroy(alert));
      dispatch<any>(hideModal());
    },
    onCloseModal: async alert => {
      dispatch<any>(hideModal());
    }
  }),
)(ExploreAlertManagementModal);