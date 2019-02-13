import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { IconSearch } from '@density/ui-icons';

export default class DashboardDispatchManagementModal extends Component<any, any> {
  state = {
    outerVisibility: 'hidden',
  }
  timeout: any;

  componentDidMount() {
    this.timeout = window.setTimeout(() => {
      this.setState({outerVisibility: undefined});
    }, 1000);
  }
  componentWillUnmount() {
    window.clearTimeout(this.timeout);
  }

  render() {
    const { dispatchSchedule, visible, onCloseModal } = this.props;
    return ReactDOM.createPortal(
      (
        <div
          className={classnames('dashboard-dispatch-management-modal', {visible})}
          style={{visibility: this.state.outerVisibility} as any}
        >
          <div className="dashboard-dispatch-management-modal-inner">
            <div className="dashboard-dispatch-management-modal-header-app-bar">
              {dispatchSchedule ? dispatchSchedule.name : 'New Dispatch'}
            </div>
            <div className="dashboard-dispatch-management-modal-split-container">
              <div className="dashboard-dispatch-management-modal-split left">
                Stuff goes here
                <pre>{JSON.stringify(dispatchSchedule)}</pre>
              </div>
              <div className="dashboard-dispatch-management-modal-split right">
                <DispatchManagementRecipientList
                  owner={{
                    id: 1,
                    fullName: 'Ryan Gaus',
                  }}
                  recipients={[
                    {
                      id: 1,
                      fullName: 'Ryan Gaus',
                    },
                    {
                      id: 2,
                      fullName: 'Robery Grazioli',
                    },
                    {
                      id: 3,
                      fullName: 'Gus Cost',
                    },
                  ]}
                />
              </div>
            </div>
            <div className="dashboard-dispatch-management-modal-footer-app-bar">
              <span onClick={onCloseModal}>Cancel</span>
              <button>Save Dispatch</button>
            </div>
          </div>
        </div>
      ),
      document.body,
    );
  }
}

function DispatchManagementRecipientList({
  owner,
  recipients,
}) {
  return (
    <div className="dispatch-management-recipient-list-container">
      <div className="dispatch-management-recipient-list-app-bar">
        <span className="dispatch-management-recipient-list-title">Add a recipient</span>
        <DispatchManagementRecipientSearchBox
          value=""
          onChange={data => {}}
        />
      </div>
      <div className="dashboard-management-recipient-list">
        <ul>
        {recipients.map(recipient => (
          <li key={recipient.id}>{recipient.fullName}</li>
        ))}
        </ul>
      </div>
    </div>
  );
}

type SearchBoxProps = {
  value: string,
  onChange: (string) => any,
};
type SearchBoxState = {
  focused: boolean,
};

class DispatchManagementRecipientSearchBox extends Component<SearchBoxProps, SearchBoxState> {
  state = { focused: false }

  input: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    const { focused } = this.state;
    return (
      <div
        className={classnames('dispatch-management-recipient-search-box', {focused})}
        onClick={() => {
          if (this && this.input && this.input.current) {
            (this.input.current as any).focus();
          }
        }}
      >
        <IconSearch />
        <input
          type="text"
          placeholder="Search through 28 accounts"
          value=""
          ref={this.input}
          onFocus={() => this.setState({focused: true})}
          onBlur={() => this.setState({focused: false})}
        />
      </div>
    );
  }
}
