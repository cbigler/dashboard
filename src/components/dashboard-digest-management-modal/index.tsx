import styles from './styles.module.scss';

import React, { Fragment, useState, useEffect } from 'react';
import classnames from 'classnames';
import moment from 'moment';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  AppBarTitle,
  Button,
  ButtonGroup,
  Icons,
  InputBox,
  Modal,
} from '@density/ui';
import DayOfWeekSelector from '../day-of-week-selector/index';
import TIMEZONE_CHOICES from '../../helpers/time-zone-choices/index';
import filterCollection from '../../helpers/filter-collection/index';

import collectionUsersRead from '../../rx-actions/users/read';
import collectionDigestSchedulesCreate from '../../actions/collection/digest-schedules/create';
import collectionDigestSchedulesUpdate from '../../actions/collection/digest-schedules/update';
import collectionDigestSchedulesDestroy from '../../actions/collection/digest-schedules/destroy';

import hideModal from '../../actions/modal/hide';

import { DensityDigestSchedule, DensityDashboard } from '../../types';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import useRxStore from '../../helpers/use-rx-store';
import usersStore from '../../rx-stores/users';

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
  initialDigestSchedule: DensityDigestSchedule,
  selectedDashboard: DensityDashboard,
  onCloseModal: () => any,
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

function calculateDefaultDigestName(selectedDashboard, frequency) {
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

function isFormValid({ daysOfWeek, recipients, time }) {
  return (
    daysOfWeek.length > 0 && // at least one day is selected
    recipients.length > 0 && // at least one recipient is selected
    time !== null // a time is selected
  );
}

async function onCreateDigest(dispatch, digest) {
  dispatch(hideModal());
  dispatch(collectionDigestSchedulesCreate(digest));
}

async function onUpdateDigest(dispatch, digest) {
  dispatch(hideModal());
  dispatch(collectionDigestSchedulesUpdate(digest));
}

async function onDeleteDigest(dispatch, digest) {
  dispatch(hideModal());
  dispatch(collectionDigestSchedulesDestroy(digest));
}

export default function DashboardDigestManagementModal({
  selectedDashboard,
  initialDigestSchedule,
  visible,
  onCloseModal,
}: DashboardDigestManagementModalProps) {
  const users = useRxStore(usersStore);
  const dispatch = useRxDispatch();

  const [state, setState] = useState({
    name: "",
    frequency: WEEKLY,
    daysOfWeek: [ DAYS_OF_WEEK[0] ],
    recipients: [],

    time: null,
    timeZone: moment.tz.guess(), // Default to the user's present time zone

    initiallyEnabledRecipientIds: [],

    searchQuery: '',
  } as DashboardDigestManagementModalState);

  const defaultDigestName = calculateDefaultDigestName(selectedDashboard, state.frequency);

  useEffect(() => {
    collectionUsersRead(dispatch);
    if (initialDigestSchedule) {
      setState({
        // If the name is the default digest name, then leave the text box empty so it can be
        // overridden easily by the user.
        name: initialDigestSchedule.name === defaultDigestName ? '' : initialDigestSchedule.name,
        frequency: initialDigestSchedule.frequency,

        daysOfWeek: initialDigestSchedule.daysOfWeek,
        recipients: initialDigestSchedule.recipients,

        time: initialDigestSchedule.time,
        timeZone: initialDigestSchedule.timeZone,

        // Capture all ids of recipients that were enabled when the modal opens. This is required
        // so that we can sort these at the start of all other users in the right hand side list.
        initiallyEnabledRecipientIds: initialDigestSchedule.recipients,

        searchQuery: '',
      });
    }
  }, [dispatch, initialDigestSchedule, defaultDigestName]);

  const showDeleteDigest = Boolean(initialDigestSchedule);

  return (
    <Modal
      visible={visible}
      width={895}
      height={636}
      onBlur={onCloseModal}
      onEscape={onCloseModal}
    >
      <div className={styles.dashboardDigestManagementModal}>
        <AppBar>
          <AppBarTitle>
            {initialDigestSchedule ? 'Edit Email Digest' : 'New Email Digest'}
          </AppBarTitle>
        </AppBar>
        <div className={styles.dashboardDigestManagementModalSplitContainer}>
          <div className={`${styles.dashboardDigestManagementModalSplit} ${styles.left}`}>
            <DigestManagementForm
              name={state.name}
              onChangeName={name => setState({...state, name})}

              frequency={state.frequency}
              onChangeFrequency={frequency => setState({...state, frequency})}

              daysOfWeek={state.daysOfWeek}
              onChangeDaysOfWeek={daysOfWeek => setState({...state, daysOfWeek})}

              time={state.time}
              onChangeTime={time => setState({...state, time})}

              timeZone={state.timeZone}
              onChangeTimeZone={timeZone => setState({...state, timeZone})}

              defaultDigestName={defaultDigestName || 'Digest Name'}

              showDeleteDigest={showDeleteDigest}
              onDeleteDigest={() => {
                onDeleteDigest(dispatch, {
                  id: initialDigestSchedule.id,
                  name: state.name || defaultDigestName || 'Digest Name',
                  recipients: state.recipients,
                  dashboardId: selectedDashboard.id,
                  frequency: state.frequency,
                  daysOfWeek: state.daysOfWeek,
                  dayNumber: 1, /* What is this value for? */
                  time: state.time,
                  timeZone: state.timeZone,
                })
              }}
            />
          </div>
          <div className={`${styles.dashboardDigestManagementModalSplit} ${styles.right}`}>
            <DigestManagementRecipientList
              recipients={state.recipients}
              users={users}

              // Used to sort the recipients vertically on the right hand side column
              initiallyEnabledRecipientIds={state.initiallyEnabledRecipientIds}

              searchQuery={state.searchQuery}
              onChangeSearchQuery={searchQuery => setState({...state, searchQuery})}

              onAddRecipient={recipient => setState({
                ...state,
                recipients: [...state.recipients, recipient.id],
              })}
              onRemoveRecipient={recipient => setState({
                ...state,
                recipients: state.recipients.filter(r => r !== recipient.id),
              })}
            />
          </div>
        </div>
        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <ButtonGroup>
                <Button variant="underline" onClick={onCloseModal}>Cancel</Button>
                <Button
                  disabled={!isFormValid(state)}
                  variant="filled"
                  onClick={() => {
                    let digest: any = {
                      name: state.name || defaultDigestName || 'Digest Name',
                      recipients: state.recipients,
                      dashboardId: selectedDashboard.id,
                      frequency: state.frequency,
                      daysOfWeek: state.daysOfWeek,
                      dayNumber: 1, /* What is this value for? */
                      time: state.time,
                      timeZone: state.timeZone,
                    };

                    if (initialDigestSchedule) {
                      digest.id = initialDigestSchedule.id;
                      onUpdateDigest(dispatch, digest);
                    } else {
                      onCreateDigest(dispatch, digest);
                    }
                  }}
                >Save email digest</Button>
              </ButtonGroup>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </div>
    </Modal>
  )
}

// Generate all possible values for the hour choices in the digest management form component
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
    <div className={styles.digestManagementForm}>
      <div className={styles.digestManagementFormGroup}>
        <label htmlFor="digest-name">Name</label>
        <InputBox
          type="text"
          id="digest-name"
          width="100%"
          placeholder={defaultDigestName}
          value={name}
          onChange={e => onChangeName(e.target.value)}
        />
      </div>
      <div className={styles.digestManagementFormGroup}>
        <label htmlFor="digest-frequency">Frequency</label>
        <div className={styles.digestManagementFormGroupContainer}>
          <InputBox
            type="select"
            id="digest-frequency"
            value={frequency}
            choices={[
              {id: WEEKLY, label: 'Weekly'},
              {id: MONTHLY, label: 'Monthly'},
            ]}
            onChange={item => onChangeFrequency(item.id)}
            width="120px"
          />

          {frequency === WEEKLY ? (
            <div className={styles.digestManagementFormGroupDayList}>
              <DayOfWeekSelector
                daysOfWeek={daysOfWeek}
                onChange={onChangeDaysOfWeek}
              />
            </div>
          ) : null}
          {frequency === MONTHLY ? (
            <div className={styles.digestManagementFormGroupDayStatus}>
              <span>On the first of the month</span>
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.digestManagementFormGroup}>
        <label htmlFor="digest-name">Time</label>
        <InputBox
          type="select"
          value={time}
          choices={generateDigestTimeChoices(timeZone)}
          onChange={item => onChangeTime(item.id)}
          placeholder="Select a time"
          width={150}
          menuMaxHeight={300}
        />
        <div className={styles.digestManagementFormGroupTimeZoneField}>
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
        <div className={styles.digestManagementFormGroup}>
          <Button variant="underline" type="danger" onClick={onDeleteDigest}>Delete this digest</Button>
        </div>
      ) : null}
    </div>
  );
}

const userCollectionFilter = filterCollection({fields: ['fullName', 'email']});

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
      <div className={styles.digestManagementRecipientListAppBar}>
        <span className={styles.digestManagementRecipientListTitle}>Add a recipient</span>
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
      <div className={styles.digestManagementRecipientList}>
        {/* loading state - show some placeholders */}
        {users.view === 'LOADING' ? (
          <Fragment>
            <div className={styles.digestManagementRecipientListItem}>
              <div className={styles.digestManagementRecipientListItemName}>
                <DigestManagementRecipientIcon user={{fullName: ''}} />
                <div className={styles.digestManagementRecipientListItemNamePlaceholder} />
              </div>
              <div className={styles.digestManagementRecipientListItemCheckboxPlaceholder} />
            </div>
            <div className={styles.digestManagementRecipientListItem}>
              <div className={styles.digestManagementRecipientListItemName}>
                <DigestManagementRecipientIcon user={{fullName: ''}} />
                <div className={styles.digestManagementRecipientListItemNamePlaceholder} />
              </div>
              <div className={styles.digestManagementRecipientListItemCheckboxPlaceholder} />
            </div>
          </Fragment>
        ) : null}

        {/* regular state - show a list of users */}
        {users.view === 'VISIBLE' && filteredUsers.length > 0 ? (
          <Fragment>
            {pinnedUsers.map(user => (
              <DigestManagementRecipientListItem
                key={user.id}
                user={user}
                checked={recipientIds.includes(user.id)}
                onAddRecipient={onAddRecipient}
                onRemoveRecipient={onRemoveRecipient}
              />
            ))}
            {unpinnedUsers.map(user => (
              <DigestManagementRecipientListItem
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
          <div className={styles.digestManagementRecipientListEmptyState}>
            <div className={styles.digestManagementRecipientListEmptyStateInner}>
              <span className={styles.digestManagementRecipientListEmptyStateTitle}>Whoops</span>
              <span className={styles.digestManagementRecipientListEmptyStateDesc}>
                We couldn't find any users that matched "{searchQuery}". Head to <a href="/#/admin/user-management">User Management</a> to add a new account.
              </span>
            </div>
          </div>
        ) : null}

        {/* error state */}
        {users.view === 'ERROR' ? (
          <div className={styles.digestManagementRecipientListEmptyState}>
            <div className={styles.digestManagementRecipientListEmptyStateInner}>
              <span className={styles.digestManagementRecipientListEmptyStateTitle}>Whoops</span>
              <span className={styles.digestManagementRecipientListEmptyStateDesc}>
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

function DigestManagementRecipientListItem({user, checked, onAddRecipient, onRemoveRecipient}) {
  return (
    <div className={styles.digestManagementRecipientListItem}>
      <div className={classnames(styles.digestManagementRecipientListItemName, {[styles.checked]: checked})}>
        <DigestManagementRecipientIcon user={user} />
        <span>{user.fullName || user.email}</span>
      </div>
      <DigestAddedNotAddedBox
        id={`digest-management-${user.id}-checkbox`}
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
    <div className={styles.digestManagementRecipientIcon}>
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
    <div className={classnames(styles.digestManagementAddedNotAddedBox, {[styles.checked]: checked})}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />

      <label htmlFor={id}>
        <span className={styles.textLabel}>{checked ? 'Added' : 'Not added'}</span>
        <div className={styles.checkboxWell}>
          <Icons.Check width={14} height={14} color="#fff" />
        </div>
      </label>
    </div>
  );
}
