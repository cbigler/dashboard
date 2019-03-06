import React, { Fragment, Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import classnames from 'classnames';
import moment from 'moment';
import Modal from '../../components/modal/index';

import {
  Button,
  ButtonContext,
  Icons,
  InputBox,
  AppBar,
  AppBarContext,
  AppBarSection,
  AppBarTitle,
} from '@density/ui';
import TIMEZONE_CHOICES from '../../helpers/time-zone-choices/index';
import filterCollection from '../../helpers/filter-collection/index';

import collectionUsersLoad from '../../actions/collection/users/load';
import collectionDigestSchedulesCreate from '../../actions/collection/digest-schedules/create';
import collectionDigestSchedulesUpdate from '../../actions/collection/digest-schedules/update';
import collectionDigestSchedulesDestroy from '../../actions/collection/digest-schedules/destroy';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const WEEKLY = 'WEEKLY',
      MONTHLY = 'MONTHLY';

type DashboardDigestManagementModalProps = {
  visible: boolean,
  initialDigestSchedule: any,
  selectedDashboard: any,
  onCloseModal: () => any,
  onCreateDigest: (any) => any,
  onUpdateDigest: (any) => any,
  onDeleteDigest: (any) => any,

  users: {
    view: 'LOADING' | 'ERROR' | 'VISIBLE',
    loading: boolean,
    data: Array<any>,
    error: any,
  },
  onLoadUsers: () => any,
};

type DashboardDigestManagementModalState = {
  name: string,
  frequency: 'WEEKLY' | 'MONTHLY',
  daysOfWeek: Array<string>,
  recipients: Array<any>,
  time: string | null,
  timeZone: string,

  initiallyEnabledRecipientIds: Array<string>,

  searchQuery: string,
};

class DashboardDigestManagementModal extends Component<DashboardDigestManagementModalProps, DashboardDigestManagementModalState> {
  constructor(props) {
    super(props);

    if (props.initialDigestSchedule) {
      const frequency = props.initialDigestSchedule.frequency;
      const nameIsDefaultName = (
        this.calculateDefaultDigestName(frequency) === props.initialDigestSchedule.name
      );

      this.state = {
        // If the name is the default dispatch name, then leave the text bo empty so it can be
        // overridden easily by the user.
        name: nameIsDefaultName ? '' : props.initialDigestSchedule.name,
        frequency,

        daysOfWeek: props.initialDigestSchedule.daysOfWeek,
        recipients: props.initialDigestSchedule.recipients,

        time: props.initialDigestSchedule.time,
        timeZone: props.initialDigestSchedule.timeZone,

        // Capture all ids of recipients that were enabled when the modal opens. This is required
        // so that we can sort these at the start of all other users in the right hand side list.
        initiallyEnabledRecipientIds: props.initialDigestSchedule.recipients,

        searchQuery: '',
      };
    } else {
      // If creating a new dispatch, these are the default values
      this.state = {
        name: "",
        frequency: WEEKLY,
        daysOfWeek: [ DAYS_OF_WEEK[0] ],
        recipients: [],

        time: null,
        timeZone: moment.tz.guess(), // Default to the user's present time zone

        initiallyEnabledRecipientIds: [],

        searchQuery: '',
      };
    }
  }

  calculateDefaultDigestName(frequency=this.state.frequency) {
    const { selectedDashboard } = this.props;
    if (!selectedDashboard) {
      return null;
    }

    switch (frequency) {
    case WEEKLY:
      return `Weekly ${selectedDashboard.name}`;
    case MONTHLY:
      return `Monthly ${selectedDashboard.name}`;
    default:
      return null;
    }
  }

  componentDidMount() {
    this.props.onLoadUsers();
  }

  isFormValid() {
    const { daysOfWeek, recipients, time } = this.state

    return (
      daysOfWeek.length > 0 && // at least one day is selected
      recipients.length > 0 && // at least one recipient is selected
      time !== null // a time is selected
    );
  }

  render() {
    const {
      users,
      selectedDashboard,
      initialDigestSchedule,
      visible,

      onCloseModal,
      onCreateDigest,
      onUpdateDigest,
      onDeleteDigest,
    } = this.props;
    const {
      name,
      frequency,
      daysOfWeek,
      recipients,
      time,
      timeZone,

      initiallyEnabledRecipientIds,
      searchQuery,
    } = this.state;

    const showDeleteDigest = Boolean(this.props.initialDigestSchedule);

    return (
      <Modal
        visible={visible}
        width={895}
        height={636}
        onBlur={onCloseModal}
        onEscape={onCloseModal}
      >
        <div className="dashboard-dispatch-management-modal">
          <AppBar>
            <AppBarTitle>
              {initialDigestSchedule ? 'Edit Email Digest' : 'New Email Digest'}
            </AppBarTitle>
          </AppBar>
          <div className="dashboard-dispatch-management-modal-split-container">
            <div className="dashboard-dispatch-management-modal-split left">
              <DigestManagementForm
                name={name}
                onChangeName={name => this.setState({name})}

                frequency={frequency}
                onChangeFrequency={frequency => this.setState({frequency})}

                daysOfWeek={daysOfWeek}
                onChangeDaysOfWeek={daysOfWeek => this.setState({daysOfWeek})}

                time={time}
                onChangeTime={time => this.setState({time})}

                timeZone={timeZone}
                onChangeTimeZone={timeZone => this.setState({timeZone})}

                defaultDigestName={this.calculateDefaultDigestName() || 'Digest Name'}

                showDeleteDigest={showDeleteDigest}
                onDeleteDigest={() => {
                  onDeleteDigest({
                    id: this.props.initialDigestSchedule.id,
                    name: name || this.calculateDefaultDigestName() || 'Digest Name',
                    recipients: recipients,
                    dashboardId: selectedDashboard.id,
                    frequency,
                    daysOfWeek: daysOfWeek,
                    dayNumber: 1, /* What is this value for? */
                    time,
                    timeZone,
                  })
                }}
              />
            </div>
            <div className="dashboard-dispatch-management-modal-split right">
              <DigestManagementRecipientList
                recipients={recipients}
                users={users}

                // Used to sort the recipients vertically on the right hand side column
                initiallyEnabledRecipientIds={initiallyEnabledRecipientIds}

                searchQuery={searchQuery}
                onChangeSearchQuery={searchQuery => this.setState({searchQuery})}

                onAddRecipient={recipient => this.setState(state => ({
                  recipients: [...state.recipients, recipient.id],
                }))}
                onRemoveRecipient={recipient => this.setState(state => ({
                  recipients: state.recipients.filter(r => r !== recipient.id),
                }))}
              />
            </div>
          </div>
          <AppBarContext.Provider value="BOTTOM_ACTIONS">
            <AppBar>
              <AppBarSection />
              <AppBarSection>
                <span
                  role="button"
                  className="dashboard-dispatch-management-modal-footer-cancel"
                  onClick={onCloseModal}
                >Cancel</span>
                <Button
                  disabled={!this.isFormValid()}
                  type="primary"
                  onClick={() => {
                    let digest = {
                      id: undefined,
                      name: name || this.calculateDefaultDigestName() || 'Digest Name',
                      recipients: recipients,
                      dashboardId: selectedDashboard.id,
                      frequency,
                      daysOfWeek: daysOfWeek,
                      dayNumber: 1, /* What is this value for? */
                      time,
                      timeZone,
                    };

                    if (this.props.initialDigestSchedule) {
                      digest.id = this.props.initialDigestSchedule.id;
                      onUpdateDigest(digest);
                    } else {
                      onCreateDigest(digest);
                    }
                  }}
                >Save Email Digest</Button>
              </AppBarSection>
            </AppBar>
          </AppBarContext.Provider>
        </div>
      </Modal>
    )
  }
}

export default connect(
  state => ({ users: (state as any).users }),
  dispatch => ({
    onLoadUsers: () => dispatch<any>(collectionUsersLoad()),
    onCreateDigest: async digest => {
      const wasSuccessful = await dispatch<any>(collectionDigestSchedulesCreate(digest));
      if (wasSuccessful) {
        dispatch<any>(showModal('MODAL_DIGEST_MANAGEMENT_SUCCESS'));
      } else {
        dispatch<any>(showModal('MODAL_DIGEST_MANAGEMENT_ERROR'));
      }
    },
    onUpdateDigest: async digest => {
      const wasSuccessful = await dispatch<any>(collectionDigestSchedulesUpdate(digest));
      if (wasSuccessful) {
        dispatch<any>(showModal('MODAL_DIGEST_MANAGEMENT_SUCCESS'));
      } else {
        dispatch<any>(showModal('MODAL_DIGEST_MANAGEMENT_ERROR'));
      }
    },
    onDeleteDigest: async digest => {
      const wasSuccessful = await dispatch<any>(collectionDigestSchedulesDestroy(digest));
      if (wasSuccessful) {
        dispatch<any>(showModal('MODAL_DIGEST_MANAGEMENT_DELETED'));
      } else {
        dispatch<any>(showModal('MODAL_DIGEST_MANAGEMENT_ERROR'));
      }
    },
  }),
)(DashboardDigestManagementModal);

// Generate all possible values for the hour choices in the dispatch management form component
// below.
function generateDigestTimeChoices(timeZone) {
  const startOfLocalDay = moment.tz(timeZone).startOf('day');
  const choices: Array<{id: string, label: string}> = [];

  for (let index = 0; index < 24; index++) {
    const hour = startOfLocalDay.clone().add(index, 'hours');
    choices.push({
      id: hour.format('HH:mm:ss'),
      label: hour.format('h:mm a')
    });
  }

  return choices;
}

function DigestManagementForm({
  name,
  frequency,
  daysOfWeek,
  time,
  timeZone,

  defaultDigestName,

  onChangeName,
  onChangeFrequency,
  onChangeDaysOfWeek,
  onChangeTime,
  onChangeTimeZone,

  showDeleteDigest,
  onDeleteDigest,
}) {
  return (
    <div className="dispatch-management-form">
      <div className="dispatch-management-form-group">
        <label htmlFor="dispatch-name">Name</label>
        <InputBox
          type="text"
          id="dispatch-name"
          width="100%"
          placeholder={defaultDigestName}
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
            value={frequency}
            choices={[
              {id: WEEKLY, label: 'Weekly'},
              {id: MONTHLY, label: 'Monthly'},
            ]}
            onChange={item => onChangeFrequency(item.id)}
            width="120px"
          />

          {frequency === WEEKLY ? (
            <div className="dispatch-management-form-group-day-list">
              {DAYS_OF_WEEK.map(dayName => (
                <div key={dayName} className="dispatch-management-form-group-day-item">
                  <Button
                    type={daysOfWeek.indexOf(dayName) >= 0 ? 'primary' : 'default'}
                    size="small"
                    width={24}
                    height={24}
                    onClick={() => {
                      if (daysOfWeek.indexOf(dayName) === -1) {
                        // Add day
                        onChangeDaysOfWeek([...daysOfWeek, dayName]);
                      } else {
                        // Ensure the user doesn't deselect the last day
                        if (daysOfWeek.length <= 1) { return; }

                        // Remove day
                        onChangeDaysOfWeek(daysOfWeek.filter(day => day !== dayName));
                      }
                    }}
                  >
                    {dayName[0].toUpperCase()}
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
          {frequency === MONTHLY ? (
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
          choices={generateDigestTimeChoices(timeZone)}
          onChange={item => onChangeTime(item.id)}
          placeholder="Select a time"
          width={150}
          menuMaxHeight={300}
        />
        <div className="dispatch-management-form-group-time-zone-field">
          <InputBox
            type="select"
            value={timeZone}
            choices={TIMEZONE_CHOICES}
            onChange={item => onChangeTimeZone(item.id)}
            placeholder="Select a time"
            width="100%"
            menuMaxHeight={300}
          />
        </div>
      </div>
      {showDeleteDigest ? (
        <div className="dispatch-management-form-group">
          <ButtonContext.Provider value="DIGEST_DELETE_BUTTON">
            <Button onClick={onDeleteDigest}>Delete this Digest</Button>
          </ButtonContext.Provider>
        </div>
      ) : null}
    </div>
  );
}

const userCollectionFilter = filterCollection({fields: ['fullName']});

function DigestManagementRecipientList({
  users,
  initiallyEnabledRecipientIds,

  searchQuery,
  onChangeSearchQuery,

  recipients,
  onAddRecipient,
  onRemoveRecipient,
}) {
  const recipientIds = recipients;

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
        <InputBox
          type="text"
          placeholder={users.view === 'VISIBLE' ? (
            `Search through ${users.data.length} ${users.data.length === 1 ? 'user' : 'users'}`
          ) : 'Search users'}
          leftIcon={<Icons.Search width={16} height={16} />}
          value={searchQuery}
          onChange={e => onChangeSearchQuery(e.target.value)}
          width="100%"
        />
      </div>
      <div className="dispatch-management-recipient-list">
        {/* loading state - show some placeholders */}
        {users.view === 'LOADING' ? (
          <Fragment>
            <div className="dispatch-management-recipient-list-item">
              <div className="dispatch-management-recipient-list-item-name">
                <DigestManagementRecipientIcon user={{fullName: ''}} />
                <div className="dispatch-management-recipient-list-item-name-placeholder" />
              </div>
              <div className="dispatch-management-recipient-list-item-checkbox-placeholder" />
            </div>
            <div className="dispatch-management-recipient-list-item">
              <div className="dispatch-management-recipient-list-item-name">
                <DigestManagementRecipientIcon user={{fullName: ''}} />
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

        {/* error state */}
        {users.view === 'ERROR' ? (
          <div className="dispatch-management-recipient-list-empty-state">
            <div className="dispatch-management-recipient-list-empty-state-inner">
              <span className="dispatch-management-recipient-list-empty-state-title">Whoops</span>
              <span className="dispatch-management-recipient-list-empty-state-desc">
                Something went wrong. Try refreshing, or contacting{' '}
                <a href="mailto:support@density.io">support</a>.
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
        <DigestManagementRecipientIcon user={user} />
        {user.fullName || user.email}
      </div>
      <DigestAddedNotAddedBox
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

function DigestManagementRecipientIcon({ user }) {
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


function DigestAddedNotAddedBox({id, checked, onChange}) {
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
