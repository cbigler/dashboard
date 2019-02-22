import React, { Fragment, Component } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { Icons, InputBox } from '@density/ui';
import Button from '../button/index';

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
  frequency: "WEEKLY" | "MONTHLY",
  frequencyDays: Array<string>,
  recipients: Array<any>,

  initiallyEnabledRecipientIds: Array<string>,
};

export default class DashboardDispatchManagementModal extends Component<DashboardDispatchManagementModalProps, DashboardDispatchManagementModalState> {
  constructor(props) {
    super(props);

    if (props.initialDispatchSchedule) {
      this.state = {
        name: props.initialDispatchSchedule.name,
        frequency: props.initialDispatchSchedule.frequency,
        frequencyDays: props.initialDispatchSchedule.frequencyDays || [ 'Monday' ],
        recipients: props.initialDispatchSchedule.recipients,

        // Capture all ids of recipients that were enabled when the modal opens. This is required
        // so that we can sort these at the start of all other users in the right hand side list.
        initiallyEnabledRecipientIds: props.initialDispatchSchedule.recipients.map(r => r.id),
      };
    } else {
      // If creating a new dispatch, these are the default values
      this.state = {
        name: "",
        frequency: "WEEKLY",
        frequencyDays: [ DAYS_OF_WEEK[0] ],
        recipients: [],

        initiallyEnabledRecipientIds: [],
      };
    }
  }

  calculateDefaultDispatchName() {
    return 'TBD how the default name is calculated';
  }

  render() {
    const { initialDispatchSchedule, visible, onCloseModal } = this.props;
    const { name, frequency, frequencyDays, recipients, initiallyEnabledRecipientIds } = this.state;

    return ReactDOM.createPortal(
      (
        <div className={classnames('dashboard-dispatch-management-modal', {visible})}>
          <div className="dashboard-dispatch-management-modal-inner">
            <div className="dashboard-dispatch-management-modal-header-app-bar">
              {initialDispatchSchedule ? initialDispatchSchedule.name : 'New Email Digest'}
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
                  recipients={recipients}
                  users={[
                    {
                      id: 'usr_123',
                      fullName: 'Ryan Gaus',
                    },
                    {
                      id: 'usr_456',
                      fullName: 'Robery Grazioli',
                    },
                    {
                      id: 'usr_789',
                      fullName: 'Gus Cost',
                    },
                  ]}

                  // Used to sort the recipients vertically on the right hand side column
                  initiallyEnabledRecipientIds={initiallyEnabledRecipientIds}

                  onAddRecipient={recipient => this.setState(state => ({
                    recipients: [...state.recipients, recipient],
                  }))}
                  onRemoveRecipient={recipient => this.setState(state => ({
                    recipients: state.recipients.filter(r => r.id !== recipient.id),
                  }))}
                />
              </div>
            </div>
            <div className="dashboard-dispatch-management-modal-footer-app-bar">
              <span
                role="button"
                className="dashboard-dispatch-management-modal-footer-cancel"
                onClick={onCloseModal}
              >Cancel</span>
              <Button type="primary">Save Email Digest</Button>
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
        <DispatchManagementInput
          type="text"
          id="dispatch-name"
          placeholder={defaultDispatchName}
          value={name}
          onChange={e => onChangeName(e.target.value)}
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
              {id: 'WEEKLY', label: 'Weekly'},
              {id: 'MONTHLY', label: 'Monthly'},
            ]}
            onChange={item => onChangeFrequency(item.id)}
            width="120px"
          />

          {frequency === 'WEEKLY' ? (
            <div className="dispatch-management-form-group-day-list">
              {DAYS_OF_WEEK.map(dayName => (
                <div key={dayName} className="dispatch-management-form-group-day-item">
                  <Button
                    type={frequencyDays.indexOf(dayName) >= 0 ? 'primary' : 'default'}
                    size="small"
                    width={24}
                    height={24}
                    onClick={() => {
                      if (frequencyDays.indexOf(dayName) === -1) {
                        // Add day
                        onChangeFrequencyDays([...frequencyDays, dayName]);
                      } else {
                        // Ensure the user doesn't deselect the last day
                        if (frequencyDays.length <= 1) { return; }

                        // Remove day
                        onChangeFrequencyDays(frequencyDays.filter(day => day !== dayName));
                      }
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

function DispatchManagementRecipientList({
  recipients,
  users,
  initiallyEnabledRecipientIds,

  onAddRecipient,
  onRemoveRecipient,
}) {
  const recipientIds = recipients.map(r => r.id);

  const pinnedUsers = users
    .filter(user => initiallyEnabledRecipientIds.includes(user.id))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
  const unpinnedUsers = users
    .filter(user => !initiallyEnabledRecipientIds.includes(user.id))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <Fragment>
      <div className="dispatch-management-recipient-list-app-bar">
        <span className="dispatch-management-recipient-list-title">Add a recipient</span>
        <DispatchManagementRecipientSearchBox
          placeholder={`Search through ${users.length} users`}
          value=""
          onChange={data => {}}
        />
      </div>
      <div className="dispatch-management-recipient-list">
        {pinnedUsers.map(user => (
          <div key={user.id} className="dispatch-management-recipient-list-item">
            <div className="dispatch-management-recipient-list-item-name">
              <DispatchManagementRecipientIcon user={user} />
              {user.fullName} pinned
            </div>
            <DispatchAddedNotAddedBox
              id={`${user.id}-checkbox`}
              checked={recipientIds.includes(user.id)}
              onChange={checked => {
                if (checked) {
                  onAddRecipient(user);
                } else {
                  onRemoveRecipient(user);
                }
              }}
            />
          </div>
        ))}
        {unpinnedUsers.map(user => (
          <div key={user.id} className="dispatch-management-recipient-list-item">
            <DispatchManagementRecipientIcon user={user} />
            {user.fullName}
            <input
              type="checkbox"
              checked={recipientIds.includes(user.id)}
              onChange={e => {
                const checked = e.target.checked;
                if (checked) {
                  onAddRecipient(user);
                } else {
                  onRemoveRecipient(user);
                }
              }}
            />
          </div>
        ))}
      </div>
    </Fragment>
  );
}

function DispatchManagementRecipientIcon({ user }) {
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
  [key: string]: any, /* other props */
};
type SearchBoxState = {
  focused: boolean,
};

class DispatchManagementRecipientSearchBox extends Component<SearchBoxProps, SearchBoxState> {
  state = { focused: false }

  input: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    const { ...props } = this.props;
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
          {...props}
          type="text"
          ref={this.input}
          onFocus={() => this.setState({focused: true})}
          onBlur={() => this.setState({focused: false})}
        />
      </div>
    );

  }
}

type InputProps = {
  value: string,
  onChange: (string) => any,
  [key: string]: any, /* other props */
};
type InputState = {
  focused: boolean,
};

class DispatchManagementInput extends Component<InputProps, InputState> {
  state = { focused: false }

  input: React.RefObject<HTMLInputElement> = React.createRef();

  render() {
    const { ...props } = this.props;
    const { focused } = this.state;
    return (
      <div className={classnames('dispatch-management-recipient-input-box', {focused})}>
        <input
          {...props}
          type="text"
          ref={this.input}
          onFocus={() => this.setState({focused: true})}
          onBlur={() => this.setState({focused: false})}
        />
      </div>
    );
  }
}

function DispatchAddedNotAddedBox({id, checked, onChange}) {
  return (
    <div className={classnames('dispatch-management-added-not-added-box', {checked})}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />

      <label htmlFor={id}>
        <span className="text-label">{checked ? 'Added' : 'Not Added'}</span>
        <div className="checkbox-well">
          <Icons.Check width={14} height={14} color="#fff" />
        </div>
      </label>
    </div>
  );
}
