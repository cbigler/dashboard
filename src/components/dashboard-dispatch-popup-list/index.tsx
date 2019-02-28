import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { AppBar, AppBarSection, AppBarTitle, Icons } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

import collectionDispatchSchedulesLoad from '../../actions/collection/dispatch-schedules/load';

function generateHumanReadableFrequency(frequency) {
  switch (frequency) {
  case 'WEEKLY':
    return 'Weekly';
  case 'MONTHLY':
    return 'Monthly';
  default:
    return 'Unknown Frequency';
  }
}

class DashboardDispatchPopupList extends Component<any, any> {
  state = {
    visible: false,
  }

  render() {
    const { dispatches, onEditDispatch, onCreateDispatch } = this.props;
    const { visible } = this.state;

    const view: 'VISIBLE' | 'LOADING' = 'VISIBLE';

    return (
      <div className="dashboard-dispatch-list">
				<div
          className={classnames('dashboard-dispatch-backdrop', {visible})}
          onClick={() => this.setState({visible: false})}
        />

        <button
          className={classnames('dashboard-dispatch-list-button', {visible})}
          onClick={() => this.setState({visible: !visible})}
        >
          <Icons.Mail color={colorVariables.brandPrimaryNew} />
          <span className="dashboard-dispatch-list-button-text">Email Digest</span>
          <Icons.ChevronDown width={12} height={12} color={colorVariables.brandPrimaryNew} />
        </button>

        <div className={classnames('dashboard-dispatch-list-dropdown', {visible})}>
          <AppBar>
            <AppBarSection>
              <AppBarTitle>Email Digests</AppBarTitle>
            </AppBarSection>
            <AppBarSection>
              <span
                className="dashboard-dispatch-list-dropdown-create-button"
                role="button"
                onClick={() => {
                  this.setState({visible: false}, () => {
                    onCreateDispatch();
                  });
                }}
                tabIndex={visible ? 0 : -1}
              >
                <Icons.PlusCircle color={colorVariables.brandPrimary} />
                <span className="dashboard-dispatch-list-dropdown-create-button-text">
                  Create New Digest
                </span>
              </span>
            </AppBarSection>
          </AppBar>

          <ul className="dashboard-dispatch-list-dropdown-list">

            {/* regular state is a list of dispatches */}
            {view === 'VISIBLE' ? dispatches.map(dispatch => (
              <li key={dispatch.id} className="dashboard-dispatch-list-dropdown-item">
                <div className="dashboard-dispatch-list-dropdown-item-row">
                  <span className="dashboard-dispatch-list-dropdown-item-name">
                    {dispatch.name}
                  </span>
                  <span
                    role="button"
                    className="dashboard-dispatch-list-dropdown-item-edit"
                    onClick={() => {
                      this.setState({visible: false}, () => {
                        onEditDispatch(dispatch);
                      });
                    }}
                    tabIndex={visible ? 0 : -1}
                  >Edit</span>
                </div>
                <span className="dashboard-dispatch-list-dropdown-item-interval">
                  <Icons.Calendar color={colorVariables.grayDarker} />
                  <span className="dashboard-dispatch-list-dropdown-item-interval-text">
                    {generateHumanReadableFrequency(dispatch.frequency)} on Wednesday at 9:00 AM
                  </span>
                </span>
              </li>
            )) : null}

            {/* empty state */}
            {view === 'VISIBLE' && dispatches.length === 0 ? (
              <div className="dashboard-dispatch-list-empty-container">
                <Letter />
                <div className="dashboard-dispatch-list-empty-container-text">
                  <h3 className="dashboard-dispatch-list-empty-container-title">
                    You haven't created any digests.
                  </h3>
                  <span className="dashboard-dispatch-list-empty-container-desc">
                    View dashboards in your inbox.
                  </span>
                </div>
              </div>
            ) : null}
          </ul>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({ dispatchSchedules: (state as any).dispatchSchedules }),
  dispatch => ({}),
)(DashboardDispatchPopupList);

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
