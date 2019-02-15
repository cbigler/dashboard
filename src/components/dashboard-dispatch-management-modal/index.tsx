import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { Icons, InputBox, Button } from '@density/ui';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

type DashboardDispatchManagementModalProps = {
  visible: boolean,
  initialDispatchSchedule: any,
  onCloseModal: () => any,
};

type DashboardDispatchManagementModalState = {
  name: string,
  frequency: "DAILY" | "WEEKLY" | "MONTHLY",
  frequencyDays: Array<string>,
};

export default class DashboardDispatchManagementModal extends Component<DashboardDispatchManagementModalProps, DashboardDispatchManagementModalState> {
  constructor(props) {
    super(props);

    if (props.initialDispatchSchedule) {
      this.state = {
        name: props.initialDispatchSchedule.name,
        frequency: props.initialDispatchSchedule.frequency,
        frequencyDays: props.initialDispatchSchedule.frequencyDays,
      };
    } else {
      // If creating a new dispatch, these are the default values
      this.state = {
        name: "",
        frequency: "DAILY",
        frequencyDays: [],
      };
    }
  }

  calculateDefaultDispatchName() {
    return 'TBD how the default name is calculated';
  }

  render() {
    const { initialDispatchSchedule, visible, onCloseModal } = this.props;
    const { name, frequency, frequencyDays } = this.state;

    return ReactDOM.createPortal(
      (
        <div className={classnames('dashboard-dispatch-management-modal', {visible})}>
          <div className="dashboard-dispatch-management-modal-inner">
            <div className="dashboard-dispatch-management-modal-header-app-bar">
              {initialDispatchSchedule ? initialDispatchSchedule.name : 'New Dispatch'}
            </div>
            <div className="dashboard-dispatch-management-modal-split-container">
              <div className="dashboard-dispatch-management-modal-split left">
                <DispatchManagementForm
                  name={name}
                  onChangeName={name => this.setState({name})}

                  frequency={frequency}
                  onChangeFrequency={frequency => this.setState({frequency})}

                  frequencyDays={frequencyDays}
                  onChangeFrequencyDays={frequencyDays => this.setState({frequencyDays})}

                  defaultDispatchName={this.calculateDefaultDispatchName()}
                />
              </div>
              <div className="dashboard-dispatch-management-modal-split right">
                <DispatchManagementRecipientList
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
              <Button style={{width: 126}}>Save Dispatch</Button>
            </div>
          </div>
        </div>
      ),
      document.body,
    );
  }
}

function DispatchManagementForm({
  name,
  frequency,
  frequencyDays,

  defaultDispatchName,

  onChangeName,
  onChangeFrequency,
  onChangeFrequencyDays,
}) {
  return (
    <div className="dispatch-management-form">
      <div className="dispatch-management-form-group">
        <label htmlFor="dispatch-name">Name</label>
        <InputBox
          type="text"
          id="dispatch-name"
          placeholder={defaultDispatchName}
          value={name}
          onChange={e => onChangeName(e.target.value)}
          width="100%"
        />
      </div>
      <div className="dispatch-management-form-group">
        <label htmlFor="dispatch-frequency">Frequency</label>
        <div className="dispatch-management-form-group-container">
          <InputBox
            type="select"
            id="dispatch-frequency"
            placeholder={defaultDispatchName}
            value={frequency}
            choices={[
              {id: 'DAILY', label: 'Daily'},
              {id: 'WEEKLY', label: 'Weekly'},
              {id: 'MONTHLY', label: 'Monthly'},
            ]}
            onChange={item => onChangeFrequency(item.id)}
            width="150px"
          />

          {frequency === 'WEEKLY' ? (
            <div className="dispatch-management-form-group-day-list">
              {DAYS_OF_WEEK.map(dayName => (
                <div key={dayName} className="dispatch-management-form-group-day-item">
                  <Button
                    size="small"
                    style={{
                      width: 24,
                      height: 24,
                      paddingLeft: 0,
                      paddingRight: 0,
                    }}
                  >
                    {dayName[0].toUpperCase()}
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
          {frequency === 'MONTHLY' ? (
            <div className="dispatch-management-form-group-day-status">
              <span>On the first of the month</span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="dispatch-management-form-group">
        <label htmlFor="dispatch-name">Time</label>
        <div style={{width: 200}}>
          Time questions:
          1. How does the select box work? Are we selecting in intervals of whole or half hours or
          something like that, or is this a custom control?
          2. There's been talk of a select box with search functionality for the time zone
          selection, I'm not sure exactly what that looks like yet either.
        </div>
      </div>
    </div>
  );
}

function DispatchManagementRecipientList({ recipients }) {
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
          <li key={recipient.id}>
            <DispatchManagementRecipientIcon user={recipient} />
            {recipient.fullName}
          </li>
        ))}
        </ul>
      </div>
    </div>
  );
}

function DispatchManagementRecipientIcon({user}) {
  return (
    <div className="dispatch-management-recipient-icon">
      {
        user.fullName
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word[0].toUpperCase())
        .join('')
      }
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
    const { value, onChange } = this.props;
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
        <Icons.Search />
        <input
          type="text"
          placeholder="Search through 28 accounts"
          value={value}
          ref={this.input}
          onFocus={() => this.setState({focused: true})}
          onBlur={() => this.setState({focused: false})}
          onChange={onChange}
        />
      </div>
    );
  }
}
