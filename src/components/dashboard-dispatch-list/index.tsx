import React, { Fragment, Component } from 'react';
import classnames from 'classnames';
import { IconMail, IconChevronDown } from '@density/ui-icons';
import colorVariables from '@density/ui/variables/colors.json';

export default class DashboardDispatchList extends Component<any, any> {
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
          <IconMail color={colorVariables.brandPrimaryNew} />
          <span className="dashboard-dispatch-list-button-text">Dispatch</span>
          <IconChevronDown width={10} height={10} color={colorVariables.brandPrimaryNew} />
        </button>

        <div className={classnames('dashboard-dispatch-list-dropdown', {visible})}>
          <ul>
            {dispatches.map(dispatch => (
              <li key={dispatch.id}>
                {dispatch.name}
                <button onClick={() => onEditDispatch(dispatch)}>Edit</button>
              </li>
            ))}
          </ul>
          <button onClick={() => onCreateDispatch()}>Create</button>
        </div>
      </div>
    );
  }
}
