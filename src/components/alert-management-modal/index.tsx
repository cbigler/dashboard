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
} from '@density/ui/src';
import { DispatchType } from '../../types/rx-actions';
import styles from './styles.module.scss';
import FormLabel from '../form-label';
import updateModal from '../../rx-actions/modal/update';
import hideModal from '../../rx-actions/modal/hide';
import collectionAlertsCreate from '../../rx-actions/alerts/create';
import collectionAlertsUpdate from '../../rx-actions/alerts/update';
import collectionAlertsDelete from '../../rx-actions/alerts/delete';
import { showToast } from '../../rx-actions/toasts';
import useRxStore from '../../helpers/use-rx-store';
import UserStore from '../../rx-stores/user';
import ActiveModalStore from '../../rx-stores/active-modal';
import useRxDispatch from '../../helpers/use-rx-dispatch';

export const  GREATER_THAN = 'greater_than',
              LESS_THAN = 'less_than';

export const TRIGGER_TYPE_CHOICES = [
  {id: GREATER_THAN, label: 'Greater than'},
  {id: LESS_THAN, label: 'Less than'},
];

export const COOLDOWN_CHOICES = [
  {id: 0, label: 'Once'},
  {id: 30, label: 'Every 30 minutes'},
  {id: 60, label: 'Every 60 minutes'},
  {id: 120, label: 'Every 2 hours'},
  {id: 240, label: 'Every 4 hours'},
  {id: 720, label: 'Every 12 hours'},
  {id: 1440, label: 'Every 24 hours'},
];

export function AlertManagementModalRaw({
  visible,
  alert,
  user,
  onUpdateAlert,
  onUpdateAlertMeta,
  onSaveAlert,
  onDeleteAlert,
  onCloseModal
}) {

  const phoneNumberInvalid = !alert?.meta?.to_num;
  const cooldownInvalid = parseInt(alert.cooldown) < 0;
  const triggerValueInvalid = isNaN(parseInt(alert.trigger_value));
  const escalationDeltaInvalid = alert.meta.escalation_delta && isNaN(parseInt(alert.meta.escalation_delta));

  return <Modal
    visible={visible}
    width={480}
    onBlur={onCloseModal}
    onEscape={onCloseModal}
  >
    <div className={styles.alertManagementModalContainer}>
      <AppBar>
        <AppBarTitle>{alert.id ? 'Edit Text Alert' : 'New Text Alert'}</AppBarTitle>
      </AppBar>
      
      <div className={styles.alertManagementModalBody}>
        <div
          className={styles.alertManagementModalFormRow}
          style={{marginBottom: 4}}
        >
          <FormLabel
            label="Phone number"
            htmlFor="update-alert-phone-number"
            input={<PhoneInputBox
              id="update-alert-phone-number"
              width="100%"
              value={alert.meta.to_num}
              onChange={value => onUpdateAlertMeta(alert, 'to_num', value)}
            />}
          />
          {user.data && user.data.phone_number ? <div style={{ paddingTop: 12 }}>
            <Button
              id="update-alert-phone-number-link"
              variant="underline"
              onClick={() => onUpdateAlertMeta(alert, 'to_num', user.data.phone_number)}
            >Use my number</Button>
          </div> : null}
        </div>
        <div className={styles.alertManagementModalFormRow}>
          <FormLabel
            label="Notify me when the occupancy is"
            htmlFor="update-alert-metric-quantity"
            input={<div style={{display: 'flex', alignItems: 'center'}}>
              <InputBox
                type="select"
                value={alert.trigger_type}
                width={160}
                choices={TRIGGER_TYPE_CHOICES}
                onChange={value => onUpdateAlert(alert, 'trigger_type', value.id)}
              />
              <div style={{width: 8}}></div>
              <InputBox
                type="text"
                width="80px"
                value={alert.trigger_value}
                onChange={e => onUpdateAlert(
                  alert,
                  'trigger_value',
                  e.target.value.replace(/[^0-9]/, '')
                )}
              />
              <div style={{width: 8}}></div>
              {parseInt(alert.trigger_value) === 1 ? 'person' : 'people'}
            </div>}
          />
        </div>
        <div className={styles.alertManagementModalFormRow}>
          <FormLabel
            label="Notify me at most"
            htmlFor="update-alert-cooldown-period"
            input={<div style={{display: 'flex', alignItems: 'center'}}>
              <InputBox
                type="select"
                value={alert.cooldown}
                width={250}
                choices={COOLDOWN_CHOICES}
                onChange={value => onUpdateAlert(alert, 'cooldown', value.id)}
              />
            </div>}
          />
        </div>
        {alert.trigger_type === GREATER_THAN && parseInt(alert.cooldown, 10) > 0 ?
          <Fragment>
            <div className={styles.alertManagementModalFormRow}>
              <div className={styles.escalationDescription}>
                If the occupancy grows quickly, we can escalate this alert and bypass the {alert.cooldown} minute cooldown period.
              </div>
            </div>
            <div className={styles.alertManagementModalFormRow}>
              <FormLabel
                label="Notify me again if it increases by"
                htmlFor="update-alert-escalation-threshold"
                input={<div style={{display: 'flex', alignItems: 'center'}}>
                  <InputBox
                    type="text"
                    width="80px"
                    value={alert.meta.escalation_delta}
                    onChange={e => onUpdateAlertMeta(
                      alert,
                      'escalation_delta',
                      e.target.value.replace(/[^0-9]/, '')
                    )}
                  />
                  <div style={{width: 8}}></div>
                  {parseInt(alert.meta.escalation_delta) === 1 ? 'person' : 'people'}
                </div>}
              />
            </div>
          </Fragment> : null
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
                disabled={phoneNumberInvalid || cooldownInvalid || triggerValueInvalid || escalationDeltaInvalid}
                onClick={() => onSaveAlert(alert)}
              >Save</Button>
            </ButtonGroup>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </div>
  </Modal>
}

// FIXME: this is basically "connect"
export default () => {
  const dispatch = useRxDispatch();
  const user = useRxStore(UserStore);
  const activeModal = useRxStore(ActiveModalStore);

  const visible = activeModal.visible
  const alert = activeModal.data && activeModal.data.alert

  // formerly mapDispatchToProps
  const onUpdateAlert = async (current, key, value) => {
    const alert = {
      ...current,
      [key]: value
    };
    updateModal(dispatch, { alert });
  }
  const onUpdateAlertMeta = async (current, key, value) => {
    updateModal(dispatch, {
      alert: {
        ...current,
        meta: {
          ...current.meta,
          [key]: value
        }
      }
    });
  }
  const onSaveAlert = async (alert) => {
    alert.cooldown = parseInt(alert.cooldown);
    alert.is_one_shot = alert.cooldown === 0;
    if (!alert.meta.escalation_delta || alert.trigger_type !== GREATER_THAN) {
      alert.meta.escalation_delta = null;
    } else {
      alert.meta.escalation_delta = parseInt(alert.meta.escalation_delta);
    }
    if (alert.id) {
      collectionAlertsUpdate(dispatch as DispatchType, alert);
    } else {
      collectionAlertsCreate(dispatch as DispatchType, alert);
    }
    showToast(dispatch, { text: 'Alert saved' });
    await hideModal(dispatch);
  }
  const onDeleteAlert = async (alert) => {
    collectionAlertsDelete(dispatch as DispatchType, alert);
    showToast(dispatch, { text: 'Alert deleted' });
    await hideModal(dispatch);
  }
  const onCloseModal = async (alert) => {
    await hideModal(dispatch);
  }

  return (
    <AlertManagementModalRaw
      user={user}
      visible={visible}
      alert={alert}
      onUpdateAlert={onUpdateAlert}
      onUpdateAlertMeta={onUpdateAlertMeta}
      onSaveAlert={onSaveAlert}
      onDeleteAlert={onDeleteAlert}
      onCloseModal={onCloseModal}
    />
  )
}
