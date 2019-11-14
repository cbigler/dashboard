import React, { Fragment, useState } from 'react';
import classnames from 'classnames';
import { AppBar, AppBarSection, AppBarTitle, Icons, Switch } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

import styles from './styles.module.scss';

import useRxStore from '../../helpers/use-rx-store';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import alertsStore from '../../rx-stores/alerts';

import showModal from '../../rx-actions/modal/show';
import collectionAlertsUpdate from '../../rx-actions/alerts/update';
import { showToast } from '../../rx-actions/toasts';

import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { DensityNotification } from '../../types';

function formatAlertPhoneNumber(alert: DensityNotification) {
  const phoneNumber = parsePhoneNumberFromString((alert.meta || {}).toNum || '');
  return phoneNumber ? phoneNumber.formatNational() : 'Invalid Number';
}

export default function AlertPopupList({ selectedSpace }) {
  const { view, data } = useRxStore(alertsStore);
  const dispatch = useRxDispatch();

  const [visible, setVisible] = useState(false);

  const alertsForSelectedSpace = selectedSpace ? (
    data.filter(alert => alert.spaceId === selectedSpace.id)
  ) : [];

  return (
    <div className={styles.alertList}>
      <div
        className={classnames(styles.alertBackdrop, {[styles.visible]: visible})}
        onClick={() => setVisible(false)}
      />

      <button
        className={classnames(styles.alertListButton, {[styles.visible]: visible})}
        onClick={() => setVisible(!visible)}
      >
        <Icons.Alert
          color={colorVariables.brandPrimary}
          accentColor={alertsForSelectedSpace.find(x => x.enabled) ? colorVariables.brandDanger : colorVariables.brandPrimary} />
        <span className={styles.alertListButtonText}>Alerts</span>
        <Icons.ChevronDown color={colorVariables.brandPrimary} />
      </button>

      <div className={classnames(styles.alertListDropdown, {[styles.visible]: visible})}>
        <AppBar>
          <AppBarSection>
            <AppBarTitle>Alerts</AppBarTitle>
          </AppBarSection>
          <AppBarSection>
            <span
              className={styles.alertListDropdownCreateButton}
              role="button"
              onClick={() => {
                showModal(dispatch, 'MODAL_ALERT_MANAGEMENT', {
                  alert: {
                    spaceId: selectedSpace.id,
                    enabled: true,
                    isOneShot: false,
                    notificationType: 'sms',
                    triggerValue: (selectedSpace && selectedSpace.capacity) || 50,
                    triggerType: 'greater_than',
                    cooldown: -1,
                    meta: {
                      toNum: '',
                      escalationDelta: null,
                    }
                  }
                });
                setVisible(false);
              }}
              tabIndex={visible ? 0 : -1}
            >
              <Icons.PlusCircle color={colorVariables.brandPrimary} />
              <span className={styles.alertListDropdownCreateButtonText}>
                Add an alert
              </span>
            </span>
          </AppBarSection>
        </AppBar>

        {/* regular state is a list of alerts */}
        {view === 'VISIBLE' ? (
          <ul className={styles.alertListDropdownList}>
            {alertsForSelectedSpace
            .sort((a, b) => (a.id || '') > (b.id || '') ? 1 : -1)
            .map(alert => (
              <li
                key={alert.id}
                className={classnames(styles.alertListDropdownItem, {
                  [styles.alertListDropdownItemDisabled]: !alert.enabled
                })}
              >
                <div className={styles.alertListDropdownItemRow}>
                  <Switch
                    value={alert.enabled}
                    onChange={async e => {
                      const enabled = e.target.checked;
                      const updated = {...alert, enabled};
                      await collectionAlertsUpdate(dispatch, updated);
                      showToast(dispatch, {
                        text: enabled ? 'Alert enabled' : 'Alert disabled',
                        timeout: 1000
                      });
                    }}
                  />
                  <div className={styles.alertListDropdownItemInfo}>
                    <div className={styles.alertListDropdownItemInfoFirstRow}>
                      Text <span className={styles.alertListDropdownItemInfoNumber}>
                        {formatAlertPhoneNumber(alert)}
                      </span> when
                    </div>
                    <div className={styles.alertListDropdownItemInfoSecondRow}>
                      <span className={styles.alertListDropdownItemInfoSecondRowText}>
                        Occupancy {alert.triggerType === 'greater_than' ? '>' : '<'}{' '}
                        {alert.triggerValue} {alert.triggerValue === 1 ? 'person' : 'people'}
                        {alert.isOneShot ? null :
                          <span className={styles.alertListDropdownItemInfoEscalationText}>
                            {(alert.meta || {}).escalationDelta ? <Fragment>
                              <div style={{transform: 'translateY(2.5px)', marginRight: 6}}>
                                <Icons.Danger
                                  height={16}
                                  color={colorVariables[alert.enabled ? 'brandWarning' : 'grayDarker']}
                                />
                              </div>
                              <div style={{marginTop: 3}}>+{(alert.meta || {}).escalationDelta}</div>
                            </Fragment> : null}
                          </span>
                        }
                      </span>
                    </div>
                  </div>
                  <span
                    role="button"
                    className={styles.alertListDropdownItemEdit}
                    onClick={() => {
                      showModal(dispatch, 'MODAL_ALERT_MANAGEMENT', {
                        alert: { meta: {}, ...alert }
                      });
                      setVisible(false);
                    }}
                    tabIndex={visible ? 0 : -1}
                  >Edit</span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {/* empty state */}
        {view === 'VISIBLE' && alertsForSelectedSpace.length === 0 ? (
          <div className={styles.alertListDropdownList}>
            <div className={styles.alertListEmptyContainer}>
              <div style={{marginTop: -24}}>
                <AlarmThing />
              </div>
              <div className={styles.alertListEmptyContainerText}>
                <h3 className={styles.alertListEmptyContainerTitle}>
                  You haven't created any alerts.
                </h3>
                <span className={styles.alertListEmptyContainerDesc}>
                  Get notified in real time.
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* loading state has a bunch of placeholders */}
        {view === 'LOADING' ? (
          <div className={styles.alertListDropdownList}>
            <div className={styles.alertListLoadingPlaceholderContainer}>
              <div className={classnames(styles.alertListLoadingPlaceholderRow, styles.one)}>
                <div
                  className={classnames(styles.alertListLoadingPlaceholder, styles.dark)}
                  style={{width: 245}}
                />
                <div
                  className={classnames(styles.alertListLoadingPlaceholder, styles.dark)}
                  style={{width: 30}}
                />
              </div>
              <div className={classnames(styles.alertListLoadingPlaceholderRow, styles.two)}>
                <div
                  className={styles.alertListLoadingPlaceholder}
                  style={{width: 18, marginRight: 8}}
                />
                <div className={styles.alertListLoadingPlaceholder} style={{width: 225}} />
              </div>
            </div>
          </div>
        ) : null}

        {/* error state */}
        {view === 'ERROR' ? (
          <div className={styles.alertListDropdownList}>
            <div className={styles.alertListErrorContainer}>
              <div>
                <h3 className={styles.alertListErrorContainerTitle}>Whoops</h3>
                <p className={styles.alertListErrorContainerDesc}>
                  Something went wrong.
                </p>
                <p className={styles.alertListErrorContainerDesc}>
                  Try refreshing, or contacting <a href="mailto:support@density.io">support</a>.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AlarmThing() {
  return (
    <svg width="113px" height="133px" viewBox="0 0 113 133" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <path d="M95,115.954023 L95,127.45977 L18,127.45977 L18,115.954023 L21.5402299,115.954023 L21.5402299,88.9597701 C21.5402299,69.6520222 37.1922521,54 56.5,54 C75.8077479,54 91.4597701,69.6520222 91.4597701,88.9597701 L91.4597701,115.954023 L95,115.954023 Z" id="path-1"></path>
            <filter x="-2.6%" y="-2.7%" width="110.4%" height="110.9%" filterUnits="objectBoundingBox" id="filter-2">
                <feOffset dx="4" dy="4" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
                <feComposite in="shadowOffsetOuter1" in2="SourceAlpha" operator="out" result="shadowOffsetOuter1"></feComposite>
                <feColorMatrix values="0 0 0 0 0.133333333   0 0 0 0 0.164705882   0 0 0 0 0.180392157  0 0 0 0.06 0" type="matrix" in="shadowOffsetOuter1"></feColorMatrix>
            </filter>
        </defs>
        <g id="⌞-Spaces:-Alerts-(in-design)" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g id="spaces.alerts.empty" transform="translate(-1015.000000, -203.000000)">
                <g id="overlay.dashboard.digest.empty" transform="translate(973.000000, 96.000000)">
                    <g id="alarm-thing" transform="translate(42.000000, 108.000000)">
                        <g id="Path">
                            <use fill="black" fillOpacity="1" filter="url(#filter-2)"></use>
                            <path stroke="#D7D7D7" strokeWidth="2" d="M94,116.954023 L90.4597701,116.954023 L90.4597701,88.9597701 C90.4597701,70.204307 75.2554631,55 56.5,55 C37.7445369,55 22.5402299,70.204307 22.5402299,88.9597701 L22.5402299,116.954023 L19,116.954023 L19,126.45977 L94,126.45977 L94,116.954023 Z" strokeLinejoin="inherit" fill="#FFFFFF" fillRule="evenodd"></path>
                        </g>
                        <path d="M32,91.0415946 L32,112 L28,112 L28,92.453624 C28,83.7924425 31.205975,75.4378055 37,69 L37,75.4481321 C33.7766757,79.9577003 32,85.400494 32,91.0415946 Z" id="Path" fill="#EDEDED"></path>
                        <rect id="envelope" stroke="#D7D7D7" strokeWidth="2" fill="#FFFFFF" x="19" y="116.954023" width="75" height="9.50574713"></rect>
                        <path d="M57,46 L57,32" id="Path-2" stroke="#D7D7D7" strokeWidth="2"></path>
                        <path d="M90,58 L90,44" id="Path-2" stroke="#D7D7D7" strokeWidth="2" transform="translate(90.000000, 51.000000) rotate(40.000000) translate(-90.000000, -51.000000) "></path>
                        <path d="M24,58 L24,44" id="Path-2" stroke="#D7D7D7" strokeWidth="2" transform="translate(24.000000, 51.000000) scale(-1, 1) rotate(40.000000) translate(-24.000000, -51.000000) "></path>
                        <circle id="Oval" stroke="#D7D7D7" strokeWidth="2" cx="84" cy="31" r="3"></circle>
                        <g id="chat" transform="translate(75.000000, 0.000000)">
                            <path d="M0,18 L4,14 L4,2 C4,0.8954305 4.8954305,0 6,0 L25,0 C26.1045695,0 27,0.8954305 27,2 L27,16 C27,17.1045695 26.1045695,18 25,18 L6,18 L0,18 Z" id="Path" stroke="#D7D7D7" strokeWidth="2" strokeLinejoin="round"></path>
                            <path d="M12.7020765,9.8635551 C13.1697408,9.58348327 13.5646573,9.1893081 13.8348634,8.72252171 C14.1258545,8.23498926 14.2921352,7.66447257 14.2921352,7.05246375 L14.2921352,4.87412728 C14.2921352,4.76002394 14.385668,4.66666667 14.499986,4.66666667 L15.4872773,4.66666667 C15.6015953,4.66666667 15.6951281,4.76002394 15.6951281,4.87412728 L15.6951281,7.05246375 C15.6951281,7.66447257 15.8614088,8.23498926 16.1523999,8.72252171 C16.4329985,9.1893081 16.8175225,9.58348327 17.2851868,9.8635551 L19.2285919,10.9838424 C19.3325173,11.0460806 19.3636949,11.170557 19.3013397,11.2639143 L18.8128903,12.1145028 C18.750535,12.2182331 18.6258245,12.2493522 18.5322917,12.187114 L16.6304568,11.0875727 C16.1523999,10.8178739 15.5912027,10.6622785 14.9988279,10.6622785 C14.4064531,10.6622785 13.8556485,10.8178739 13.3671991,11.0875727 L11.4653642,12.187114 C11.3614388,12.2493522 11.2367283,12.2078601 11.1847656,12.1145028 L10.6963162,11.2639143 C10.6339609,11.160184 10.6755311,11.0357076 10.769064,10.9838424 L12.7020765,9.8635551 Z" id="mark" fill="#BFBFBF" fillRule="nonzero"></path>
                        </g>
                        <circle id="Oval" stroke="#D7D7D7" strokeWidth="2" cx="14" cy="21" r="3"></circle>
                        <circle id="Oval" fill="#D8D8D8" cx="41.5" cy="24.5" r="1.5"></circle>
                        <circle id="Oval" fill="#D8D8D8" cx="1.5" cy="64.5" r="1.5"></circle>
                        <circle id="Oval" fill="#D8D8D8" cx="111.5" cy="64.5" r="1.5"></circle>
                    </g>
                </g>
            </g>
        </g>
    </svg>
  );
}
