import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import moment from 'moment';
import { AppBar, AppBarSection, AppBarTitle, Icons } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

import styles from './styles.module.scss';

import { DensityDashboard, DensityDigestSchedule } from '../../types';

function generateHumanReadableFrequency(digest) {
  /* NOTE: the below is in local time. */
  const time = moment.tz(digest.time, 'HH:mm:ss', digest.timeZone).local().format('h:mm A');

  switch (digest.frequency) {
  case 'WEEKLY':
    return `Weekly on ${
      digest.daysOfWeek.map(day => day.slice(0, 3)).join(', ')
    } @ ${time}`;

  case 'MONTHLY':
    let postfixedNumber;
    if (digest.dayNumber === 1) {
      postfixedNumber = '1st';
    } else if (digest.dayNumber === 2) {
      postfixedNumber = '2nd';
    } else if (digest.dayNumber === 3) {
      postfixedNumber = '3rd';
    } else {
      postfixedNumber = `${digest.dayNumber}th`;
    }
    return `Monthly on the ${postfixedNumber} @ ${time}`;

  default:
    return 'Unknown Frequency';
  }
}

type DashboardDigestPopupListProps = {
  digestSchedules: {
    view: 'VISIBLE' | 'LOADING' | 'ERROR',
    data: Array<DensityDigestSchedule>,
    error: string | null,
  },
  selectedDashboard: DensityDashboard,
  onEditDigest: (DensityDigestSchedule) => any,
  onCreateDigest: () => any,
};
type DashboardDigestPopupListState = {
  visible: boolean,
};

class DashboardDigestPopupList extends Component<DashboardDigestPopupListProps, DashboardDigestPopupListState> {
  state = {
    visible: false,
  }

  render() {
    const { digestSchedules, selectedDashboard, onEditDigest, onCreateDigest } = this.props;
    const { visible } = this.state;

    const digestSchedulesForSelectedDashboard = selectedDashboard ? (
      digestSchedules.data.filter(digest => digest.dashboardId === selectedDashboard.id)
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
          <span className={styles.dashboardDigestListButtonText}>Email digest</span>
          <Icons.ChevronDown width={12} height={12} color={colorVariables.brandPrimary} />
        </button>

        <div className={classnames(styles.dashboardDigestListDropdown, {[styles.visible]: visible})}>
          <AppBar>
            <AppBarSection>
              <AppBarTitle>Email Digests</AppBarTitle>
            </AppBarSection>
            <AppBarSection>
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
                  Create new digest
                </span>
              </span>
            </AppBarSection>
          </AppBar>

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
                    You haven't created any digests.
                  </h3>
                  <span className={styles.dashboardDigestListEmptyContainerDesc}>
                    View dashboards in your inbox.
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

export default connect(
  state => ({ digestSchedules: (state as any).digestSchedules }),
  digest => ({}),
)(DashboardDigestPopupList);

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
