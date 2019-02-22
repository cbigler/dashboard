import React, { Fragment, Component } from 'react';
import classnames from 'classnames';
import { Icons } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

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
          <ul>
            {dispatches.map(dispatch => (
              <li key={dispatch.id}>
                {dispatch.name}
                <button
                  onClick={() => {
                    this.setState({visible: false}, () => {
                      onEditDispatch(dispatch);
                    });
                  }}
                  tabIndex={visible ? 0 : -1}
                >Edit</button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              this.setState({visible: false}, () => {
                onCreateDispatch();
              });
            }}
            tabIndex={visible ? 0 : -1}
          >Create</button>
        </div>
      </div>
    );
  }
}
