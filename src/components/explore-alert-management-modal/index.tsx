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
  Switch,
} from '@density/ui';
import styles from './styles.module.scss';
import FormLabel from '../form-label';
import { connect } from 'react-redux';
import updateModal from '../../actions/modal/update';
import hideModal from '../../actions/modal/hide';
import collectionAlertsCreate from '../../actions/collection/alerts/create';
import collectionAlertsUpdate from '../../actions/collection/alerts/update';
import collectionAlertsDestroy from '../../actions/collection/alerts/destroy';
import showToast from '../../actions/toasts';

export const  GREATER_THAN = 'greater_than',
              LESS_THAN = 'less_than';

export const TRIGGER_TYPE_CHOICES = [
  {id: GREATER_THAN, label: 'Greater than'},
  {id: LESS_THAN, label: 'Less than'},
];

export const COOLDOWN_CHOICES = [
  {id: 30, label: 'Every 30 minutes'},
  {id: 60, label: 'Every 60 minutes'},
  {id: 120, label: 'Every 2 hours'},
  {id: 240, label: 'Every 4 hours'},
  {id: 720, label: 'Every 12 hours'},
  {id: 1440, label: 'Every 24 hours'},
  {id: -1, label: 'Once'},
];

export function ExploreAlertManagementModalRaw({
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
  const escalationDeltaInvalid = alert.meta.escalationDelta && isNaN(parseInt(alert.meta.escalationDelta));
  return <Modal
    visible={visible}
    width={480}
    height={520}
    onBlur={onCloseModal}
    onEscape={onCloseModal}
  >
    <div className={styles.exploreAlertManagementModalContainer}>
      <AppBar>
        <AppBarTitle>{alert.id ? 'Edit Text Alert' : 'New Text Alert'}</AppBarTitle>
      </AppBar>
      
      <div className={styles.exploreAlertManagementModalBody}>
        <div
          className={styles.exploreAlertManagementModalFormRow}
          style={{marginBottom: 4}}
        >
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
                choices={TRIGGER_TYPE_CHOICES}
                onChange={value => onUpdateAlert(alert, 'triggerType', value.id)}
              />
              <div style={{width: 8}}></div>
              <InputBox
                type="text"
                width="80px"
                value={alert.triggerValue}
                onChange={e => onUpdateAlert(
                  alert,
                  'triggerValue',
                  e.target.value.replace(/[^0-9]/, '')
                )}
              />
              <div style={{width: 8}}></div>
              {parseInt(alert.triggerValue) === 1 ? 'person' : 'people'}
            </div>}
          />
        </div>
        <div className={styles.exploreAlertManagementModalFormRow}>
          <FormLabel
            label="Notify me at most"
            htmlFor="update-alert-cooldown-period"
            input={<div style={{display: 'flex', alignItems: 'center'}}>
              <InputBox
                type="select"
                value={alert.isOneShot ? -1 : alert.cooldown}
                disabled={alert.isOneShot}
                width={250}
                choices={COOLDOWN_CHOICES}
                onChange={value => onUpdateAlert(alert, 'cooldown', value.id)}
              />
              <div style={{width: 14}}></div>
              <Switch
                value={!alert.isOneShot}
                onChange={e => onUpdateAlert(alert, 'isOneShot', !e.target.checked)}
              />
            </div>}
          />
        </div>
        {alert.triggerType === GREATER_THAN && !alert.isOneShot ?
          <div className={styles.exploreAlertManagementModalFormRow}>
            <FormLabel
              label="Notify me again if it increases by"
              htmlFor="update-alert-escalation-threshold"
              input={<div style={{display: 'flex', alignItems: 'center'}}>
                <InputBox
                  type="text"
                  width="80px"
                  value={alert.meta.escalationDelta}
                  onChange={e => onUpdateAlertMeta(
                    alert,
                    'escalationDelta',
                    e.target.value.replace(/[^0-9]/, '')
                  )}
                />
                <div style={{width: 8}}></div>
                {parseInt(alert.meta.escalationDelta) === 1 ? 'person' : 'people'}
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
      const alert = {
        ...current,
        [key]: value
      };
      if (alert.cooldown === -1) {
        alert.cooldown = 30;
        alert.isOneShot = true;
      }
      dispatch<any>(updateModal({ alert }));
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
      if (!alert.meta.escalationDelta || alert.triggerType !== GREATER_THAN) {
        alert.meta.escalationDelta = null;
      } else {
        alert.meta.escalationDelta = parseInt(alert.meta.escalationDelta);
      }
      if (alert.cooldown) {
        alert.cooldown = parseInt(alert.cooldown);
      }
      if (alert.id) {
        dispatch<any>(collectionAlertsUpdate(alert));
      } else {
        dispatch<any>(collectionAlertsCreate(alert));
      }
      dispatch<any>(showToast({ text: 'Alert saved' }));
      dispatch<any>(hideModal());
    },
    onDeleteAlert: async alert => {
      dispatch<any>(collectionAlertsDestroy(alert));
      dispatch<any>(showToast({ text: 'Alert deleted' }));
      dispatch<any>(hideModal());
    },
    onCloseModal: async alert => {
      dispatch<any>(hideModal());
    }
  }),
)(React.memo(ExploreAlertManagementModalRaw));
