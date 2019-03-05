import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import moment from 'moment';
import { AppBar, AppBarSection, AppBarTitle, Icons } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

import collectionDigestSchedulesLoad from '../../actions/collection/digest-schedules/load';

function generateHumanReadableFrequency(digest) {
  /* NOTE: the below is in local time. */
  const time = moment.tz(digest.time, 'HH:mm:ss', digest.timeZone).local().format('h:mm A');

  switch (digest.frequency) {
  case 'weekly':
    return `Weekly on ${
      digest.daysOfWeek.map(day => day.slice(0, 3)).join(', ')
    } @ ${time}`;

  case 'monthly':
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

class DashboardDigestPopupList extends Component<any, any> {
  state = {
    visible: false,
  }

  render() {
    const { digestSchedules, onEditDigest, onCreateDigest } = this.props;
    const { visible } = this.state;

    return (
      <div className="dashboard-digest-list">
				<div
          className={classnames('dashboard-digest-backdrop', {visible})}
          onClick={() => this.setState({visible: false})}
        />

        <button
          className={classnames('dashboard-digest-list-button', {visible})}
          onClick={() => this.setState({visible: !visible})}
        >
          <Icons.Mail color={colorVariables.brandPrimaryNew} />
          <span className="dashboard-digest-list-button-text">Email Digest</span>
          <Icons.ChevronDown width={12} height={12} color={colorVariables.brandPrimaryNew} />
        </button>

        <div className={classnames('dashboard-digest-list-dropdown', {visible})}>
          <AppBar>
            <AppBarSection>
              <AppBarTitle>Email Digests</AppBarTitle>
            </AppBarSection>
            <AppBarSection>
              <span
                className="dashboard-digest-list-dropdown-create-button"
                role="button"
                onClick={() => {
                  this.setState({visible: false}, () => {
                    onCreateDigest();
                  });
                }}
                tabIndex={visible ? 0 : -1}
              >
                <Icons.PlusCircle color={colorVariables.brandPrimary} />
                <span className="dashboard-digest-list-dropdown-create-button-text">
                  Create New Digest
                </span>
              </span>
            </AppBarSection>
          </AppBar>

          {/* regular state is a list of digestes */}
          {digestSchedules.view === 'VISIBLE' ? (
            <ul className="dashboard-digest-list-dropdown-list">
              {digestSchedules.data
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(digest => (
                <li key={digest.id} className="dashboard-digest-list-dropdown-item">
                  <div className="dashboard-digest-list-dropdown-item-row">
                    <span className="dashboard-digest-list-dropdown-item-name">
                      {digest.name}
                    </span>
                    <span
                      role="button"
                      className="dashboard-digest-list-dropdown-item-edit"
                      onClick={() => {
                        this.setState({visible: false}, () => {
                          onEditDigest(digest);
                        });
                      }}
                      tabIndex={visible ? 0 : -1}
                    >Edit</span>
                  </div>
                  <span className="dashboard-digest-list-dropdown-item-interval">
                    <Icons.Calendar color={colorVariables.grayDarker} />
                    <span className="dashboard-digest-list-dropdown-item-interval-text">
                      {generateHumanReadableFrequency(digest)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {/* empty state */}
          {digestSchedules.view === 'VISIBLE' && digestSchedules.data.length === 0 ? (
            <div className="dashboard-digest-list-dropdown-list">
              <div className="dashboard-digest-list-empty-container">
                <Letter />
                <div className="dashboard-digest-list-empty-container-text">
                  <h3 className="dashboard-digest-list-empty-container-title">
                    You haven't created any digests.
                  </h3>
                  <span className="dashboard-digest-list-empty-container-desc">
                    View dashboards in your inbox.
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* loading state has a bunch of placeholders */}
          {digestSchedules.view === 'LOADING' ? (
            <div className="dashboard-digest-list-dropdown-list">
              <div className="dashboard-digest-list-loading-placeholder-container">
                <div className="dashboard-digest-list-loading-placeholder-row one">
                  <div
                    className="dashboard-digest-list-loading-placeholder dark"
                    style={{width: 245}}
                  />
                  <div
                    className="dashboard-digest-list-loading-placeholder dark"
                    style={{width: 30}}
                  />
                </div>
                <div className="dashboard-digest-list-loading-placeholder-row two">
                  <div
                    className="dashboard-digest-list-loading-placeholder"
                    style={{width: 18, marginRight: 8}}
                  />
                  <div className="dashboard-digest-list-loading-placeholder" style={{width: 225}} />
                </div>
              </div>
            </div>
          ) : null}

          {/* error state */}
          {digestSchedules.view === 'ERROR' ? (
            <div className="dashboard-digest-list-dropdown-list">
              <div className="dashboard-digest-list-error-container">
                <div>
                  <h3 className="dashboard-digest-list-error-container-title">Whoops</h3>
                  <p className="dashboard-digest-list-error-container-desc">
                    Something went wrong.
                  </p>
                  <p className="dashboard-digest-list-error-container-desc">
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
