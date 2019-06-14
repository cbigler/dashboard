import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { AppBar, AppBarSection, AppBarTitle, Icons, Switch } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

import styles from './styles.module.scss';

import { DensitySpace } from '../../types';

type ExploreAlertPopupListProps = {
  alerts: {
    view: 'VISIBLE' | 'LOADING' | 'ERROR',
    data: Array<any>,
    error: string | null,
  },
  selectedSpace: DensitySpace,
  onEditAlert: any,
  onCreateAlert: any,
};
type ExploreAlertPopupListState = {
  visible: boolean,
};

class ExploreAlertPopupList extends Component<ExploreAlertPopupListProps, ExploreAlertPopupListState> {
  state = {
    visible: false,
  }

  render() {
    const { alerts, selectedSpace, onEditAlert, onCreateAlert } = this.props;
    const { visible } = this.state;

    const alertsForSelectedSpace = selectedSpace ? (
      alerts.data.filter(alert => alert.spaceId === selectedSpace.id)
    ) : [];

    return (
      <div className={styles.dashboardAlertList}>
				<div
          className={classnames(styles.dashboardAlertBackdrop, {[styles.visible]: visible})}
          onClick={() => this.setState({visible: false})}
        />

        <button
          className={classnames(styles.dashboardAlertListButton, {[styles.visible]: visible})}
          onClick={() => this.setState({visible: !visible})}
        >
          <Icons.Mail color={colorVariables.brandPrimary} />
          <span className={styles.dashboardAlertListButtonText}>Alerts</span>
          <Icons.ChevronDown width={12} height={12} color={colorVariables.brandPrimary} />
        </button>

        <div className={classnames(styles.dashboardAlertListDropdown, {[styles.visible]: visible})}>
          <AppBar>
            <AppBarSection>
              <AppBarTitle>Alerts</AppBarTitle>
            </AppBarSection>
            <AppBarSection>
              <span
                className={styles.dashboardAlertListDropdownCreateButton}
                role="button"
                onClick={() => {
                  this.setState({visible: false}, () => {
                    onCreateAlert();
                  });
                }}
                tabIndex={visible ? 0 : -1}
              >
                <Icons.PlusCircle color={colorVariables.brandPrimary} />
                <span className={styles.dashboardAlertListDropdownCreateButtonText}>
                  Create new alert
                </span>
              </span>
            </AppBarSection>
          </AppBar>

          {/* regular state is a list of alerts */}
          {alerts.view === 'VISIBLE' ? (
            <ul className={styles.dashboardAlertListDropdownList}>
              {alertsForSelectedSpace
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(alert => (
                <li key={alert.id} className={styles.dashboardAlertListDropdownItem}>
                  <div className={styles.dashboardAlertListDropdownItemRow}>
                    <Switch />
                    <span className={styles.dashboardAlertListDropdownItemName}>
                      {alert.name}
                    </span>
                    <span
                      role="button"
                      className={styles.dashboardAlertListDropdownItemEdit}
                      onClick={() => {
                        this.setState({visible: false}, () => {
                          onEditAlert(alert);
                        });
                      }}
                      tabIndex={visible ? 0 : -1}
                    >Edit</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {/* empty state */}
          {alerts.view === 'VISIBLE' && alertsForSelectedSpace.length === 0 ? (
            <div className={styles.dashboardAlertListDropdownList}>
              <div className={styles.dashboardAlertListEmptyContainer}>
                <Letter />
                <div className={styles.dashboardAlertListEmptyContainerText}>
                  <h3 className={styles.dashboardAlertListEmptyContainerTitle}>
                    You haven't created any alerts.
                  </h3>
                  <span className={styles.dashboardAlertListEmptyContainerDesc}>
                    View dashboards in your inbox.
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* loading state has a bunch of placeholders */}
          {alerts.view === 'LOADING' ? (
            <div className={styles.dashboardAlertListDropdownList}>
              <div className={styles.dashboardAlertListLoadingPlaceholderContainer}>
                <div className={classnames(styles.dashboardAlertListLoadingPlaceholderRow, styles.one)}>
                  <div
                    className={classnames(styles.dashboardAlertListLoadingPlaceholder, styles.dark)}
                    style={{width: 245}}
                  />
                  <div
                    className={classnames(styles.dashboardAlertListLoadingPlaceholder, styles.dark)}
                    style={{width: 30}}
                  />
                </div>
                <div className={classnames(styles.dashboardAlertListLoadingPlaceholderRow, styles.two)}>
                  <div
                    className={styles.dashboardAlertListLoadingPlaceholder}
                    style={{width: 18, marginRight: 8}}
                  />
                  <div className={styles.dashboardAlertListLoadingPlaceholder} style={{width: 225}} />
                </div>
              </div>
            </div>
          ) : null}

          {/* error state */}
          {alerts.view === 'ERROR' ? (
            <div className={styles.dashboardAlertListDropdownList}>
              <div className={styles.dashboardAlertListErrorContainer}>
                <div>
                  <h3 className={styles.dashboardAlertListErrorContainerTitle}>Whoops</h3>
                  <p className={styles.dashboardAlertListErrorContainerDesc}>
                    Something went wrong.
                  </p>
                  <p className={styles.dashboardAlertListErrorContainerDesc}>
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
}

export default connect(
  state => ({ alerts: (state as any).alerts || { view: 'VISIBLE', error: null, data: [] } }),
  dispatch => ({}),
)(ExploreAlertPopupList);

function Letter() {
  return (
    <svg width="103" height="57" viewBox="0 0 103 57" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <rect id="path-1" width="99" height="53" rx="1" />
        <filter x="-2%" y="-3.8%" width="108.1%" height="115.1%" filterUnits="objectBoundingBox"
        id="filter-2">
          <feOffset dx="4" dy="4" in="SourceAlpha" result="shadowOffsetOuter1" />
          <feComposite in="shadowOffsetOuter1" in2="SourceAlpha" operator="out"
          result="shadowOffsetOuter1" />
          <feColorMatrix values="0 0 0 0 0.133333333 0 0 0 0 0.164705882 0 0 0 0 0.180392157 0 0 0 0.06 0"
          in="shadowOffsetOuter1" />
        </filter>
      </defs>

      {/* shadow */}
      <rect x={4} y={4} width={99} height={53} fill="rgba(0, 0, 0, 0.05)" rx={2} ry={2} />

      {/* letter */}
      <g id="Alert-Release-1.0" fill="none">
        <g id="dashboard.expanded" transform="translate(-718 -589)">
          <g id="overlay.dashboard.alert.empty" transform="translate(674 431)">
            <g id="nav-/overlay-/-account">
              <g id="letter" transform="translate(44 158)">
                <g id="envelope">
                  <use fill="#000" filter="url(#filter-2)" />
                  <rect stroke="#D7D7D7" fill="#FFF" x="1" y="1" width="97" height="51"
                  rx="1" />
                </g>
                <g id="sytem-nav" transform="translate(83 6)" fill="#DADADA">
                  <rect id="Rectangle" width="10" height="10" rx="1" />
                </g>
                <rect id="---" fill="#D8D8D8" x="7" y="8" width="15" height="2" />
                <rect id="---" fill="#D8D8D8" x="7" y="12" width="10" height="2" />
                <rect id="---" fill="#D8D8D8" x="36" y="23" width="25" height="2" />
                <rect id="---" fill="#D8D8D8" x="36" y="27" width="20" height="2" />
                <rect id="---" fill="#D8D8D8" x="36" y="31" width="30" height="2" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
