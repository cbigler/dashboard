import React, { Fragment, Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import classnames from 'classnames';
import moment from 'moment';

import { Icons, InputBox } from '@density/ui';
import Button from '../button/index';
import TIMEZONE_CHOICES from '../../helpers/time-zone-choices/index';

import collectionUsersLoad from '../../actions/collection/users/load';

import filterCollection from '../../helpers/filter-collection/index';

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
  selectedDashboard: any;
  onCloseModal: () => any,

  users: {
    loading: boolean,
    data: Array<any>,
    error: any,
  },
  onLoadUsers: () => any,
};

type DashboardDispatchManagementModalState = {
  name: string,
  frequency: "WEEKLY" | "MONTHLY",
  frequencyDays: Array<string>,
  recipients: Array<any>,
  time: string | null,
  timeZone: string,

  initiallyEnabledRecipientIds: Array<string>,

  searchQuery: string,
};

class DashboardDispatchManagementModal extends Component<DashboardDispatchManagementModalProps, DashboardDispatchManagementModalState> {
  constructor(props) {
    super(props);

    if (props.initialDispatchSchedule) {
      this.state = {
        name: props.initialDispatchSchedule.name,
        frequency: props.initialDispatchSchedule.frequency,
        frequencyDays: props.initialDispatchSchedule.frequencyDays || [ 'Monday' ],
        recipients: props.initialDispatchSchedule.recipients,

        time: '12:00',
        timeZone: 'America/New_York',

        // Capture all ids of recipients that were enabled when the modal opens. This is required
        // so that we can sort these at the start of all other users in the right hand side list.
        initiallyEnabledRecipientIds: props.initialDispatchSchedule.recipients.map(r => r.id),

        searchQuery: '',
      };
    } else {
      // If creating a new dispatch, these are the default values
      this.state = {
        name: "",
        frequency: "WEEKLY",
        frequencyDays: [ DAYS_OF_WEEK[0] ],
        recipients: [],

        time: null,
        timeZone: 'America/New_York',

        initiallyEnabledRecipientIds: [],

        searchQuery: '',
      };
    }
  }

  calculateDefaultDispatchName() {
    const { frequency } = this.state;
    const { selectedDashboard } = this.props;

    switch (frequency) {
    case 'WEEKLY':
      return `Weekly ${selectedDashboard.name}`;
    case 'MONTHLY':
      return `Monthly ${selectedDashboard.name}`;
    default:
      return null;
    }
  }

  componentDidMount() {
    this.props.onLoadUsers();
  }

  isFormValid() {
    const { frequencyDays, recipients, time } = this.state

    return (
      frequencyDays.length > 0 && // at least one day is selected
      recipients.length > 0 && // at least one recipient is selected
      time !== null // a time is selected
    );
  }

  render() {
    const { users, initialDispatchSchedule, visible, onCloseModal } = this.props;
    const {
      name,
      frequency,
      frequencyDays,
      recipients,
      time,
      timeZone,

      initiallyEnabledRecipientIds,
      searchQuery,
    } = this.state;

    return ReactDOM.createPortal(
      (
        <div className={classnames('dashboard-dispatch-management-modal', {visible})}>
          <div className="dashboard-dispatch-management-modal-inner">
            <div className="dashboard-dispatch-management-modal-header-app-bar">
              {initialDispatchSchedule ? 'Edit Email Digest' : 'New Email Digest'}
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

                  time={time}
                  onChangeTime={time => this.setState({time})}

                  timeZone={timeZone}
                  onChangeTimeZone={timeZone => this.setState({timeZone})}

                  defaultDispatchName={this.calculateDefaultDispatchName() || 'Dispatch Name'}
                />
              </div>
              <div className="dashboard-dispatch-management-modal-split right">
                <DispatchManagementRecipientList
                  recipients={recipients}
                  users={users}

                  // Used to sort the recipients vertically on the right hand side column
                  initiallyEnabledRecipientIds={initiallyEnabledRecipientIds}

                  searchQuery={searchQuery}
                  onChangeSearchQuery={searchQuery => this.setState({searchQuery})}

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
              <Button disabled={!this.isFormValid()} type="primary">Save Email Digest</Button>
            </div>
          </div>
        </div>
      ),
      document.body,
    );
  }
}

export default connect(
  state => ({ users: (state as any).users }),
  dispatch => ({ onLoadUsers: () => dispatch<any>(collectionUsersLoad()) })
)(DashboardDispatchManagementModal);

// Generate all possible values for the hour choices in the dispatch management form component
// below.
function generateDispatchTimeChoices(timeZone) {
  const startOfLocalDay = moment.tz(timeZone).startOf('day');
  const choices: Array<{id: string, label: string}> = [];

  for (let index = 0; index < 24; index++) {
    const hour = startOfLocalDay.clone().add(index, 'hours');
    choices.push({
      id: hour.format('HH:mm'),
      label: hour.format('h:mm a')
    });
  }

  return choices;
}

function DispatchManagementForm({
  name,
  frequency,
  frequencyDays,
  time,
  timeZone,

  defaultDispatchName,

  onChangeName,
  onChangeFrequency,
  onChangeFrequencyDays,
  onChangeTime,
  onChangeTimeZone,
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
        <InputBox
          type="select"
          value={time}
          choices={generateDispatchTimeChoices(timeZone)}
          onChange={item => onChangeTime(item.id)}
          placeholder="Select a time"
          width={140}
          menuMaxHeight={300}
        />
        <div className="dispatch-management-form-group-time-zone-field">
          <InputBox
            type="select"
            value={timeZone}
            choices={TIMEZONE_CHOICES}
            onChange={item => onChangeTimeZone(item.id)}
            placeholder="Select a time"
            width={300}
            menuMaxHeight={300}
          />
        </div>
      </div>
    </div>
  );
}

const userCollectionFilter = filterCollection({fields: ['fullName']});

function DispatchManagementRecipientList({
  users,
  initiallyEnabledRecipientIds,

  searchQuery,
  onChangeSearchQuery,

  recipients,
  onAddRecipient,
  onRemoveRecipient,
}) {
  const recipientIds = recipients.map(r => r.id);

  const filteredUsers = userCollectionFilter(users.data, searchQuery);

  const pinnedUsers = filteredUsers
    .filter(user => initiallyEnabledRecipientIds.includes(user.id))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
  const unpinnedUsers = filteredUsers
    .filter(user => !initiallyEnabledRecipientIds.includes(user.id))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  return (
    <Fragment>
      <div className="dispatch-management-recipient-list-app-bar">
        <span className="dispatch-management-recipient-list-title">Add a recipient</span>
        <DispatchManagementRecipientSearchBox
          placeholder={users.view === 'VISIBLE' ? `Search through ${users.data.length} users` : 'Search users' }
          value={searchQuery}
          onChange={e => onChangeSearchQuery(e.target.value)}
        />
      </div>
      <div className="dispatch-management-recipient-list">
        {/* loading state - show some placeholders */}
        {users.view === 'LOADING' ? (
          <Fragment>
            <div className="dispatch-management-recipient-list-item">
              <div className="dispatch-management-recipient-list-item-name">
                <DispatchManagementRecipientIcon user={{fullName: ''}} />
                <div className="dispatch-management-recipient-list-item-name-placeholder" />
              </div>
              <div className="dispatch-management-recipient-list-item-checkbox-placeholder" />
            </div>
            <div className="dispatch-management-recipient-list-item">
              <div className="dispatch-management-recipient-list-item-name">
                <DispatchManagementRecipientIcon user={{fullName: ''}} />
                <div className="dispatch-management-recipient-list-item-name-placeholder" />
              </div>
              <div className="dispatch-management-recipient-list-item-checkbox-placeholder" />
            </div>
          </Fragment>
        ) : null}

        {/* regular state - show a list of users */}
        {users.view === 'VISIBLE' && filteredUsers.length > 0 ? (
          <Fragment>
            {pinnedUsers.map(user => (
              <RecipientListItem
                key={user.id}
                user={user}
                checked={recipientIds.includes(user.id)}
                onAddRecipient={onAddRecipient}
                onRemoveRecipient={onRemoveRecipient}
              />
            ))}
            {unpinnedUsers.map(user => (
              <RecipientListItem
                key={user.id}
                user={user}
                checked={recipientIds.includes(user.id)}
                onAddRecipient={onAddRecipient}
                onRemoveRecipient={onRemoveRecipient}
              />
            ))}
          </Fragment>
        ) : null}

        {/* empty state */}
        {users.view === 'VISIBLE' && filteredUsers.length === 0 ? (
          <div className="dispatch-management-recipient-list-empty-state">
            <div className="dispatch-management-recipient-list-empty-state-inner">
              <span className="dispatch-management-recipient-list-empty-state-title">Whoops</span>
              <span className="dispatch-management-recipient-list-empty-state-desc">
                We couldn't find any users that matched "{searchQuery}"
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </Fragment>
  );
}

function RecipientListItem({user, checked, onAddRecipient, onRemoveRecipient}) {
  return (
    <div className="dispatch-management-recipient-list-item">
      <div className={classnames('dispatch-management-recipient-list-item-name', {checked})}>
        <DispatchManagementRecipientIcon user={user} />
        {user.fullName}
      </div>
      <DispatchAddedNotAddedBox
        id={`dispatch-management-${user.id}-checkbox`}
        checked={checked}
        onChange={checked => {
          if (checked) {
            onAddRecipient(user);
          } else {
            onRemoveRecipient(user);
          }
        }}
      />
    </div>
  );
}

function DispatchManagementRecipientIcon({ user }) {
  return (
    <div className="dispatch-management-recipient-icon">
      {
        user.fullName
        .split(' ')
        .slice(0, 2)
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
