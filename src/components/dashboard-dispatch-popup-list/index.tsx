import React, { Fragment, Component } from 'react';
import classnames from 'classnames';
import { AppBar, AppBarSection, AppBarTitle, Icons } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

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

export default class DashboardDispatchPopupList extends Component<any, any> {
  state = {
    visible: false,
  }

  render() {
    const { dispatches, onEditDispatch, onCreateDispatch } = this.props;
    const { visible } = this.state;

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
          <Icons.ChevronDown width={10} height={10} color={colorVariables.brandPrimaryNew} />
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
            {dispatches.map(dispatch => (
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
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
