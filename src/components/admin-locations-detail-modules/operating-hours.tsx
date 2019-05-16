import React, { Fragment, ReactNode, Component } from 'react';
import uuid from 'uuid';
import moment from 'moment';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import classnames from 'classnames';

import TIME_ZONE_CHOICES from '../../helpers/time-zone-choices/index';
import generateResetTimeChoices from '../../helpers/generate-reset-time-choices/index';

import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter/index';
import spaceHierarchySearcher from '../../helpers/space-hierarchy-searcher/index';

import collectionSpacesFilter from '../../actions/collection/spaces/filter';
import showModal from '../../actions/modal/show';
import updateModal from '../../actions/modal/update';
import hideModal from '../../actions/modal/hide';

import { calculateOperatingHoursFromSpace } from '../../reducers/space-management';
import { getAllTimeSegmentLabelsForSpace } from '../../helpers/time-segments';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  Button,
  ButtonContext,
  InputBox,
  Icons,
  Modal,
  RadioButton,
  Switch,
} from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';
import DayOfWeekSelector from '../day-of-week-selector/index';

import AdminLocationsDetailModule from './index';

import AdminLocationsDetailModulesOperatingHoursSlider from '../admin-locations-detail-modules-operating-hours-slider/index';

function AdminLocationsDetailModulesOperatingHoursCopyFromSpaceModal({
  activeModal,
  spaceHierarchy,
  spaces,
  spaceManagement,
  selectedSpaceId,
  user,

  onSubmitModal,
  onCloseModal,
  onChangeSearchText,
  onChangeSelectedSpace,
}) {
  if (activeModal.name === 'OPERATING_HOURS_COPY_FROM_SPACE') {
    let formattedHierarchy = spaceHierarchyFormatter(spaceHierarchy);
    if (spaces.filters.search) {
      formattedHierarchy = spaceHierarchySearcher(formattedHierarchy, spaces.filters.search);
    }

    return (
      <Modal
        visible={activeModal.visible}
        width={486}
        height={636}
        onBlur={onCloseModal}
        onEscape={onCloseModal}
      >
        <AppBar>
          <AppBarTitle>Copy Operating Hours</AppBarTitle>
        </AppBar>

        <div className={styles.operatingHoursCopyFromSpaceModalSearchBar}>
          <AppBar>
            <InputBox
              type="text"
              leftIcon={<Icons.Search />}
              placeholder="Search for space name"
              width="100%"
              value={spaces.filters.search}
              onChange={e => onChangeSearchText(e.target.value)}
            />
          </AppBar>
        </div>

        <div className={styles.operatingHoursCopyFromSpaceModalContainer}>
          {formattedHierarchy.map(item => {
            const space = spaces.data.find(s => s.id === item.space.id);
            const spaceHasNoTimeSegments = space ? space.timeSegments.length === 0 : false;
            const spaceDisabled = !item.space.hasPurview || spaceHasNoTimeSegments;
            return (
              <div
                key={item.space.id}
                className={classnames(styles.operatingHoursCopyFromSpaceModalItem, {
                  [styles.depth0]: item.depth === 0,
                  [styles.disabled]: spaceDisabled,
                })}
                style={{marginLeft: item.depth * 24}}
                onClick={() => {
                  if (!spaceDisabled) {
                    onChangeSelectedSpace(item.space.id)
                  }
                }}
              >
                <RadioButton
                  disabled={spaceDisabled}
                  checked={selectedSpaceId === item.space.id}
                  onChange={() => onChangeSelectedSpace(item.space.id)}
                />

                {item.space.spaceType === 'building' ? (
                  <span className={styles.operatingHoursCopyFromSpaceModalItemIcon}>
                    <Icons.Building color={selectedSpaceId === item.space.id ? colorVariables.grayCinder : colorVariables.grayDarker} />
                  </span>
                ) : null}
                {item.space.spaceType === 'floor' ? (
                  <span className={styles.operatingHoursCopyFromSpaceModalItemIcon}>
                    <Icons.Folder color={selectedSpaceId === item.space.id ? colorVariables.grayCinder : colorVariables.grayDarker} />
                  </span>
                ) : null}

                <span
                  className={classnames(styles.operatingHoursCopyFromSpaceModalItemName, {
                    [styles.bold]: ['campus', 'building', 'floor'].includes(item.space.spaceType),
                    [styles.disabled]: spaceDisabled,
                  })}
                >
                  {item.space.name}
                </span>
              </div>
            );
          })}
        </div>

        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <ButtonContext.Provider value="CANCEL_BUTTON">
                <Button onClick={onCloseModal}>Cancel</Button>
              </ButtonContext.Provider>
              <Button
                type="primary"
                disabled={selectedSpaceId === null}
                onClick={() => onSubmitModal(selectedSpaceId)}
              >Copy Hours</Button>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Modal>
    );
  } else {
    return null;
  }
}

function formatDuration(duration, format) {
  return moment.utc()
    .startOf('day')
    .add(duration.as('milliseconds'), 'milliseconds')
    .format(format);
}

const HOURGLASS_ICON = (
  <svg width="78" height="88" viewBox="0 0 78 88" xmlns="http://www.w3.org/2000/svg">
      <g id="-Admin:-Locations-(release)" fill="none" fillRule="evenodd">
          <g id="org.locations.level.edit" transform="translate(-459 -1670)">
              <g id="operating-hours" transform="translate(297 1484)">
                  <g id="empty" transform="translate(163 187)">
                      <g id="alarm-thing">
                          <circle id="Oval" stroke="#D7D7D7" strokeWidth="2" cx="73" cy="13" r="3"
                          />
                          <circle id="Oval" stroke="#D7D7D7" strokeWidth="2" cx="3" cy="3" r="3"
                          />
                          <circle id="Oval" fill="#D8D8D8" cx="30.5" cy="6.5" r="1.5" />
                          <path d="M19.5,14 C18.5,38 25,50 39,50 C53,50 59.5,38 58.5,14 L19.5,14 Z"
                          id="Path-2" stroke="#D7D7D7" strokeWidth="2" />
                          <path d="M58.0829103,28 C56.3052735,42.6666667 49.9443034,50 39,50 C28.0556966,50 21.6947265,42.6666667 19.9170897,28 L58.0829103,28 Z"
                          id="Combined-Shape" stroke="#D7D7D7" strokeWidth="2" fill="#EDEDED" />
                          <rect id="Rectangle" fill="#EDEDED" x="38" y="49" width="2" height="12"
                          />
                          <rect id="Rectangle" fill="#EDEDED" x="38" y="63" width="2" height="5"
                          />
                          <path d="M19.5,86 C18.5,62 25,50 39,50 C53,50 59.5,62 58.5,86 L19.5,86 Z"
                          id="Path-2" stroke="#D7D7D7" strokeWidth="2" />
                          <path d="M19.5,86 C18.8333333,78.8888889 25.3333333,74.5555556 39,73 C52.6666667,74.5555556 59.1666667,78.8888889 58.5,86 L19.5,86 Z"
                          id="Path-2" stroke="#D7D7D7" strokeWidth="2" fill="#EDEDED" />
                          <path d="M11.5,14 L66,14" id="Path-3" stroke="#D7D7D7" strokeWidth="2"
                          />
                          <path d="M11.5,86 L66,86" id="Path-3" stroke="#D7D7D7" strokeWidth="2"
                          />
                      </g>
                  </g>
              </g>
          </g>
      </g>
  </svg>
);

function AdminLocationsDetailModulesOperatingHoursUnconnected({
  formState,
  activeModal,
  selectedSpaceParentId,
  timeSegmentGroups,
  user,
  spaceManagement,
  spaces,

  onChangeField,
  onClickAddLabel,
  onConfirmSegmentCanBeDeleted,
  onOpenCopyFromSpace,
  onCloseModal,
  onChangeSearchText,
  onChangeSelectedSpace,
  onConfirmResetTimeChange,
}) {
  const resetTimeChoices = generateResetTimeChoices({timeZone: formState.timeZone});

  // Get all operating hours for all spaces above this one in the hierarchy
  const parentSpace = spaceManagement.spaces.data.find(space => space.id === selectedSpaceParentId);
  const spaceAncestryIds = parentSpace ? [ parentSpace.id, ...parentSpace.ancestry.map(i => i.id) ] : [];
  const spaceAncestrySpaces = spaceAncestryIds.map(id => spaceManagement.spaces.data.find(s => s.id === id));
  const parentOperatingHours = spaceAncestrySpaces.flatMap(s => calculateOperatingHoursFromSpace(s));

  // Depending on if "override default" is checked, show either this space's segments or
  // the the above calculated operating hours.
  const shownOperatingHours = (formState.overrideDefault ? formState.operatingHours : parentOperatingHours);

  return (
    <Fragment>
      <AdminLocationsDetailModulesOperatingHoursCopyFromSpaceModal
        activeModal={activeModal}
        spaceHierarchy={spaceManagement.spaceHierarchy}
        user={user}
        spaces={spaces}
        spaceManagement={spaceManagement}

        onSubmitModal={spaceId => {
          const space = spaceManagement.spaces.data.find(s => s.id === spaceId);

          // Each time segment on the space becomes an entry in the operating hours structure
          const newOperatingHours = [
            ...formState.operatingHours.slice(),
            ...(
              // Ensure that there aren't duplicate segments
              calculateOperatingHoursFromSpace(space)
                .filter(oh => !formState.operatingHours.find(i => i.id === oh.id))
                .map(oh => ({ ...oh, operationToPerform: 'CREATE' }))
            ),
          ];

          // And each set of operating hours has a label that is determined from the associated time
          // segment.
          const operatingHoursLabels = space.timeSegmentGroups;
          const newOperatingHoursLabels = formState.operatingHoursLabels.slice();
          // Only add operating hours labels that aren't alraedy assigned to the space
          getAllTimeSegmentLabelsForSpace(space).forEach(label => {
            if (!newOperatingHoursLabels.includes(label)) {
              newOperatingHoursLabels.push(label);
            }
          });

          onChangeField('operatingHours', newOperatingHours);
          onChangeField('operatingHoursLabels', newOperatingHoursLabels);

          onCloseModal();
        }}
        onCloseModal={onCloseModal}
        onChangeSearchText={onChangeSearchText}

        selectedSpaceId={activeModal.data.selectedSpaceId}
        onChangeSelectedSpace={onChangeSelectedSpace}
      />

      <AdminLocationsDetailModule
        title="Operating Hours"
        includePadding={false}
        actions={
          <AppBarSection>
            {!formState.overrideDefaultControlHidden ? (
              <Fragment>
                <label
                  className={styles.operatingHoursOverrideDefaultLabel}
                  htmlFor="admin-locations-detail-module-operating-hours-override-default"
                >
                  Override Default:
                </label>
                <Switch
                  id="admin-locations-detail-module-operating-hours-override-default"
                  value={formState.overrideDefault}
                  onChange={e => {
                    const switchEnabled = e.target.checked;
                    onChangeField('overrideDefault', switchEnabled);

                    if (switchEnabled) {
                      // Copy operating hours from parent into this space
                      onChangeField('operatingHours', parentOperatingHours);
                    } else {
                      // Remove all operating hour segments when the switch is disabled
                      onChangeField('operatingHours', []);
                    }
                  }}
                />
                </Fragment>
            ) : null}
          </AppBarSection> as any
        }
      >
        <AppBar>
          <AppBarSection>
            <div className={styles.operatingHoursLeft}>
              <label htmlFor="admin-locations-detail-modules-operating-hours-time-zone">
                Time Zone:
              </label>
              <InputBox
                id="admin-locations-detail-modules-operating-hours-time-zone"
                type="select"
                disabled={!formState.overrideDefault}
                choices={TIME_ZONE_CHOICES}
                value={formState.timeZone}
                onChange={choice => onChangeField('timeZone', choice.id)}
                width={320}
                menuMaxHeight={300}
              />
            </div>
          </AppBarSection>
          <AppBarSection>
            <div className={styles.operatingHoursRight}>
              <label htmlFor="admin-locations-detail-modules-operating-hours-reset-time">
                Reset the count at:
              </label>
              <InputBox
                id="admin-locations-detail-modules-operating-hours-reset-time"
                type="select"
                disabled={!formState.overrideDefault}
                choices={resetTimeChoices.map(i => ({ id: i.value, label: i.display }))}
                value={
                  resetTimeChoices
                  .map(i => ({
                    id: i.value,
                    label: (
                      <div className={styles.operatingHoursResetTimeChoiceWrapper}>
                        <div className={styles.operatingHoursResetTimeIconWrapper}>
                          <Icons.Reset width={20} height={20} color={colorVariables.gray} />
                        </div>
                        {i.display}
                      </div>
                    ),
                  }))
                  .find(choice => choice.id === formState.dailyReset)
                }
                onChange={choice => {
                  function changeResetTime() {
                    onChangeField('dailyReset', choice.id);
                    onChangeField('operatingHours', []);
                  }

                  // Only propmpt if operating hours entries need to change
                  if (formState.operatingHours.filter(i => i.operationToPerform !== 'DELETE').length > 0) {
                    onConfirmResetTimeChange(changeResetTime);
                  } else {
                    changeResetTime();
                  }
                }}
                menuMaxHeight={300}
                width={154}
              />
            </div>
          </AppBarSection>
        </AppBar>

        {shownOperatingHours.filter(i => i.operationToPerform !== 'DELETE').length === 0 ? (
          <div className={styles.operatingHoursEmptyState}>
            <div className={styles.operatingHoursEmptyStateInner}>
              <div className={styles.operatingHoursEmptyStateInnerLeft}>
                {HOURGLASS_ICON}
              </div>
              <div className={styles.operatingHoursEmptyStateInnerRight}>
                <h3>
                  You haven't assigned any operating hours to
                  {formState.overrideDefault ? ' this' : ' the parent'} space
                </h3>
                <p>Doing so allows you to conveniently organize count data by time</p>
              </div>
            </div>
          </div>
        ) : null}

        {shownOperatingHours.map((operatingHoursItem, index) => {
          if (operatingHoursItem.operationToPerform === 'DELETE') { return; }
          return (
            <div key={operatingHoursItem.id} className={styles.operatingHoursTimeSegmentItem}>
              <div className={styles.operatingHoursTimeSegmentItemSection}>
                <AppBarContext.Provider value="TRANSPARENT">
                  <AppBar>
                    <AppBarSection>
                      <InputBox
                        type="select"
                        value={operatingHoursItem.label}
                        disabled={!formState.overrideDefault}
                        onChange={async item => {
                          // When adding a new label, display a prompt to get the user's
                          // information.
                          if (item.id === 'ADD_A_LABEL') {
                            const itemName = await onClickAddLabel();

                            const existingItemThatMatchesCaseInsensitively = (
                              formState.operatingHoursLabels.find(
                                i => i.name.toLowerCase() === itemName.toLowerCase()
                              )
                            );
                            if (existingItemThatMatchesCaseInsensitively) {
                              // Label matches casing, don't add a new label and instead use the one
                              // that matches.
                              item = existingItemThatMatchesCaseInsensitively;
                            } else {
                              // There are no similar labels that have the came content, so make a
                              // new label
                              item = {id: itemName, name: itemName };
                              onChangeField('operatingHoursLabels', [
                                ...formState.operatingHoursLabels,
                                item,
                              ]);
                            }
                          }

                          const operatingHoursCopy = formState.operatingHours.slice();
                          operatingHoursCopy[index] = {
                            ...operatingHoursCopy[index],
                            label: item.id,
                            operationToPerform: operatingHoursCopy[index].operationToPerform || 'UPDATE',
                          };
                          onChangeField('operatingHours', operatingHoursCopy);
                        }}
                        choices={[
                          {
                            id: 'ADD_A_LABEL',
                            label: (
                              <span className={styles.operatingHoursAddLabel}>
                                <Icons.Plus width={10} height={10} color={colorVariables.brandPrimary} />
                                <span>Add a label</span>
                              </span>
                            ),
                          },
                          ...formState.operatingHoursLabels.map(i => ({ id: i, label: i })),
                        ]}
                        placeholder="Select a label"
                        invalid={operatingHoursItem.label === null}
                        width={350}
                      />
                    </AppBarSection>
                    <AppBarSection>
                      <span className={styles.operatingHoursDayOfWeekLabel}>Days Affected:</span>
                      <DayOfWeekSelector
                        daysOfWeek={operatingHoursItem.daysAffected}
                        disabled={!formState.overrideDefault}
                        onChange={daysAffected => {
                          const operatingHoursCopy = formState.operatingHours.slice();
                          operatingHoursCopy[index] = {
                            ...operatingHoursCopy[index],
                            daysAffected,
                            operationToPerform: operatingHoursCopy[index].operationToPerform || 'UPDATE',
                          };
                          onChangeField('operatingHours', operatingHoursCopy);
                        }}
                      />
                    </AppBarSection>
                  </AppBar>
                </AppBarContext.Provider>
              </div>
              <div className={styles.operatingHoursTimeSegmentItemSection}>
                <AdminLocationsDetailModulesOperatingHoursSlider
                  timeZone={formState.timeZone}
                  dayStartTime={formState.dailyReset}
                  startTime={operatingHoursItem.startTimeSeconds}
                  endTime={operatingHoursItem.endTimeSeconds}
                  disabled={!formState.overrideDefault}
                  onChange={(startTimeSeconds, endTimeSeconds) => {
                    const operatingHoursCopy = formState.operatingHours.slice();
                    operatingHoursCopy[index] = {
                      ...operatingHoursCopy[index],
                      startTimeSeconds,
                      endTimeSeconds,
                      operationToPerform: operatingHoursCopy[index].operationToPerform || 'UPDATE',
                    };
                    onChangeField('operatingHours', operatingHoursCopy);
                  }}
                />
              </div>
              <AppBar>
                <AppBarSection>
                  <div className={classnames(styles.operatingHoursTimeRangeBubble, {
                    [styles.disabled]: !formState.overrideDefault,
                  })}>
                    {formatDuration(
                      moment.duration(operatingHoursItem.startTimeSeconds, 'seconds'),
                      'h:mma',
                    ).slice(0, -1)}
                  </div>
                  <div className={classnames(
                    styles.operatingHoursTimeRangeBubbleBridge,
                    { [styles.disabled]: !formState.overrideDefault }
                  )} />
                  <div className={classnames(styles.operatingHoursTimeRangeBubble, {
                    [styles.disabled]: !formState.overrideDefault,
                  })}>
                    {formatDuration(
                      moment.duration(operatingHoursItem.endTimeSeconds, 'seconds'),
                      'h:mma',
                    ).slice(0, -1)}
                  </div>
                </AppBarSection>
                {formState.overrideDefault ? (
                  <AppBarSection>
                    <ButtonContext.Provider value="DELETE_SEGMENT_BUTTON">
                      <Button
                        onClick={async () => {
                          onConfirmSegmentCanBeDeleted(() => {
                            const operatingHoursCopy = formState.operatingHours.slice();
                            if (operatingHoursCopy[index].operationToPerform === 'CREATE') {
                              // The server has not received the operating hours item yet, so just
                              // remove it
                              operatingHoursCopy.splice(index, 1);
                            } else {
                              // The server has a copy of the operating hours item, so it must be
                              // explicitly deleted
                              operatingHoursCopy[index].operationToPerform = 'DELETE';
                            }
                            onChangeField('operatingHours', operatingHoursCopy);
                          });
                        }}
                      >Delete Segment</Button>
                    </ButtonContext.Provider>
                  </AppBarSection>
                ) : null}
              </AppBar>
            </div>
          );
        })}

        {formState.overrideDefault ? (
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <div className={styles.operatingHoursCopyFromSpaceButton}>
                <Button onClick={onOpenCopyFromSpace}>Copy from Space</Button>
              </div>
              <Button type="primary" onClick={() => {
                // NOTE: An ephemeral id is needed so that time segments that haven't been sent to
                // the server yet have a unique identifier. This uuid will be discarded after the
                // time segment is sent to the server and has a real id.
                const id = 'TEMPORARY_ID_THAT_IS_GENERATED_BY_THE_CLIENT:'+uuid.v4();

                const operatingHoursItem = {
                  label: null,
                  startTimeSeconds: moment.duration(formState.dailyReset).add(2, 'hours').as('seconds'),
                  endTimeSeconds: moment.duration(formState.dailyReset).add(12+2, 'hours').as('seconds'),
                  daysAffected: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  operationToPerform: 'CREATE',
                };

                onChangeField('operatingHours', [
                  ...formState.operatingHours,
                  { ...operatingHoursItem, id },
                ]);
              }}>Add a Segment</Button>
            </AppBarSection>
          </AppBar>
        ) : null}
      </AdminLocationsDetailModule>
    </Fragment>
  );
}

export default connect(
  (state: any) => ({
    activeModal: state.activeModal,
    spaceManagement: state.spaceManagement,
    spaceHierarchy: state.spaceHierarchy,
    spaces: state.spaces,
    selectedSpaceParentId: state.spaceManagement.spaces.selected ? (
      state.spaceManagement.spaces.data.find(s => s.id === state.spaceManagement.spaces.selected).parentId
    ) : state.spaceManagement.formParentSpaceId,
    timeSegmentGroups: state.timeSegmentGroups,
    user: state.user,
  }),
  (dispatch) => ({
    async onClickAddLabel() {
      const newLabelName = await (new Promise(resolve => {
        dispatch<any>(showModal('MODAL_PROMPT', {
          title: 'Add a label',
          prompt: 'Please enter a name for this label:',
          placeholder: 'ex. Breakfast hours',
          callback: data => resolve(data),
        }));
      }));

      return newLabelName;
    },
    async onConfirmSegmentCanBeDeleted(callback) {
      dispatch<any>(showModal('MODAL_CONFIRM', {
        prompt: 'Are you sure you want to delete this time segment?',
        callback,
      }));
    },
    async onConfirmResetTimeChange(callback) {
      dispatch<any>(showModal('MODAL_CONFIRM', {
        prompt: `Changing this space's reset time will remove this space's time segments. Are you sure?`,
        callback,
      }));
    },

    // The below are all used by the "copy from space" modal
    onOpenCopyFromSpace() {
      dispatch<any>(showModal('OPERATING_HOURS_COPY_FROM_SPACE', { selectedSpaceId: null }));
    },
    onCloseModal() {
      dispatch<any>(hideModal());
    },
    onChangeSearchText(text) {
      dispatch<any>(collectionSpacesFilter('search', text));
    },
    onChangeSelectedSpace(selectedSpaceId) {
      dispatch<any>(updateModal({ selectedSpaceId }));
    },
  }),
)(AdminLocationsDetailModulesOperatingHoursUnconnected);
