import React, { Component } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import { AppBar, AppBarSection, AppBarTitle, AppBarContext, Icons } from '@density/ui/src';
import colorVariables from '@density/ui/variables/colors.json';

import styles from './styles.module.scss';

import { DensityDashboard } from '../../types';
import DigestSchedulesStore, { DigestSchedulesState } from '../../rx-stores/digest-schedules';
import useRxStore from '../../helpers/use-rx-store';

function generateHumanReadableFrequency(digest) {
  /* NOTE: the below is in local time. */
  const time = moment.tz(digest.time, 'HH:mm:ss', digest.time_zone).local().format('h:mm A');

  switch (digest.frequency) {
  case 'WEEKLY':
    return `Weekly on ${
      digest.days_of_week.map(day => day.slice(0, 3)).join(', ')
    } @ ${time}`;

  case 'MONTHLY':
    let postfixedNumber;
    if (digest.day_number === 1) {
      postfixedNumber = '1st';
    } else if (digest.day_number === 2) {
      postfixedNumber = '2nd';
    } else if (digest.day_number === 3) {
      postfixedNumber = '3rd';
    } else {
      postfixedNumber = `${digest.day_number}th`;
    }
    return `Monthly on the ${postfixedNumber} @ ${time}`;

  default:
    return 'Unknown Frequency';
  }
}

type DashboardDigestPopupListProps = {
  digestSchedules: DigestSchedulesState,
  selectedDashboard: DensityDashboard,
  onEditDigest: (DensityDigestSchedule) => any,
  onCreateDigest: () => any,
  onCreateEmail: () => any,
};
type DashboardDigestPopupListState = {
  visible: boolean,
};

class DashboardDigestPopupList extends Component<DashboardDigestPopupListProps, DashboardDigestPopupListState> {
  state = {
    visible: false,
  }

  render() {
    const {
      digestSchedules,
      selectedDashboard,
      onEditDigest,
      onCreateDigest,
      onCreateEmail,
    } = this.props;
    const { visible } = this.state;

    const digestSchedulesForSelectedDashboard = selectedDashboard ? (
      digestSchedules.data.filter(digest => digest.dashboard_id === selectedDashboard.id)
    ) : [];

    return (
      <div className={styles.dashboardDigestList}>
        <div
          className={classnames(styles.dashboardDigestBackdrop, {[styles.visible]: visible})}
          onClick={() => this.setState({visible: false})}
        />

        <button
          className={classnames(styles.dashboardDigestListButton, {[styles.visible]: visible})}
          onClick={() => this.setState({visible: !visible})}
        >
          <Icons.Mail color={colorVariables.brandPrimary} />
          <span className={styles.dashboardDigestListButtonText}>Email</span>
          <Icons.ChevronDown color={colorVariables.brandPrimary} />
        </button>

        <div className={classnames(styles.dashboardDigestListDropdown, {[styles.visible]: visible})}>
          <AppBarContext.Provider value="CARD_HEADER">
            <AppBar>
              <AppBarSection>
                <AppBarTitle>Email Dashboard</AppBarTitle>
              </AppBarSection>
              <AppBarSection>
                <span
                  className={styles.dashboardDigestListDropdownCreateButton}
                  role="button"
                  onClick={() => {
                    this.setState({visible: false}, () => {
                      onCreateEmail();
                    });
                  }}
                  tabIndex={visible ? 0 : -1}
                >
                  <Icons.Share color={colorVariables.brandPrimary} />
                  <span className={styles.dashboardDigestListDropdownCreateButtonText}>
                    Send once
                  </span>
                </span>
                <span
                  className={styles.dashboardDigestListDropdownCreateButton}
                  role="button"
                  onClick={() => {
                    this.setState({visible: false}, () => {
                      onCreateDigest();
                    });
                  }}
                  tabIndex={visible ? 0 : -1}
                >
                  <Icons.PlusCircle color={colorVariables.brandPrimary} />
                  <span className={styles.dashboardDigestListDropdownCreateButtonText}>
                    Create digest
                  </span>
                </span>
              </AppBarSection>
            </AppBar>
          </AppBarContext.Provider>

          {/* regular state is a list of digestes */}
          {digestSchedules.view === 'VISIBLE' ? (
            <ul className={styles.dashboardDigestListDropdownList}>
              {digestSchedulesForSelectedDashboard
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(digest => (
                <li key={digest.id} className={styles.dashboardDigestListDropdownItem}>
                  <div className={styles.dashboardDigestListDropdownItemRow}>
                    <span className={styles.dashboardDigestListDropdownItemName}>
                      {digest.name}
                    </span>
                    <span
                      role="button"
                      className={styles.dashboardDigestListDropdownItemEdit}
                      onClick={() => {
                        this.setState({visible: false}, () => {
                          onEditDigest(digest);
                        });
                      }}
                      tabIndex={visible ? 0 : -1}
                    >Edit</span>
                  </div>
                  <span className={styles.dashboardDigestListDropdownItemInterval}>
                    <Icons.Calendar color={colorVariables.grayDarker} />
                    <span className={styles.dashboardDigestListDropdownItemIntervalText}>
                      {generateHumanReadableFrequency(digest)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {/* empty state */}
          {digestSchedules.view === 'VISIBLE' && digestSchedulesForSelectedDashboard.length === 0 ? (
            <div className={styles.dashboardDigestListDropdownList}>
              <div className={styles.dashboardDigestListEmptyContainer}>
                <Letter />
                <div className={styles.dashboardDigestListEmptyContainerText}>
                  <h3 className={styles.dashboardDigestListEmptyContainerTitle}>
                    You haven't created any scheduled digests.
                  </h3>
                  <span className={styles.dashboardDigestListEmptyContainerDesc}>
                    Get dashboards delivered to your inbox.
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* loading state has a bunch of placeholders */}
          {digestSchedules.view === 'LOADING' ? (
            <div className={styles.dashboardDigestListDropdownList}>
              <div className={styles.dashboardDigestListLoadingPlaceholderContainer}>
                <div className={classnames(styles.dashboardDigestListLoadingPlaceholderRow, styles.one)}>
                  <div
                    className={classnames(styles.dashboardDigestListLoadingPlaceholder, styles.dark)}
                    style={{width: 245}}
                  />
                  <div
                    className={classnames(styles.dashboardDigestListLoadingPlaceholder, styles.dark)}
                    style={{width: 30}}
                  />
                </div>
                <div className={classnames(styles.dashboardDigestListLoadingPlaceholderRow, styles.two)}>
                  <div
                    className={styles.dashboardDigestListLoadingPlaceholder}
                    style={{width: 18, marginRight: 8}}
                  />
                  <div className={styles.dashboardDigestListLoadingPlaceholder} style={{width: 225}} />
                </div>
              </div>
            </div>
          ) : null}

          {/* error state */}
          {digestSchedules.view === 'ERROR' ? (
            <div className={styles.dashboardDigestListDropdownList}>
              <div className={styles.dashboardDigestListErrorContainer}>
                <div>
                  <h3 className={styles.dashboardDigestListErrorContainerTitle}>Whoops</h3>
                  <p className={styles.dashboardDigestListErrorContainerDesc}>
                    Something went wrong.
                  </p>
                  <p className={styles.dashboardDigestListErrorContainerDesc}>
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


const ConnectedDashboardDigestPopupList: React.FC<Omit<DashboardDigestPopupListProps, 'digestSchedules'>> = (externalProps) => {
  
  const digestSchedules = useRxStore(DigestSchedulesStore);

  return (
    <DashboardDigestPopupList
      {...externalProps}
      digestSchedules={digestSchedules}
    />
  )
}

export default ConnectedDashboardDigestPopupList;

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
      <g id="Email-Digest-Release-1.0" fill="none">
        <g id="dashboard.expanded" transform="translate(-718 -589)">
          <g id="overlay.dashboard.digest.empty" transform="translate(674 431)">
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
