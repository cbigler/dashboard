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
import {
  TIME_SEGMENT_CREATE,
  TIME_SEGMENT_UPDATE,
  TIME_SEGMENT_DELETE,
  TIME_SEGMENT_GROUP_CREATE,
  TIME_SEGMENT_ASSIGN_TO_TIME_SEGMENT_GROUP,
} from '../../actions/space-management/time-segments';

import { calculateOperatingHoursFromSpace } from '../admin-locations-edit/index';

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
} from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';
import DayOfWeekSelector from '../day-of-week-selector/index';

import AdminLocationsDetailModule from './index';

class AdminLocationsDetailModulesOperatingHoursSlider extends Component<any, any> {
  pressedButton: 'start' | 'end' | null = null;
  trackWidthInPx: number = 0;
  trackLeftPositionInPx: number = 0;

  constructor(props) {
    super(props);

    // Wait, wait - why are these values stored in the state? Well it turns out that treating this
    // component as "controlled" and calling `onChange` on every single update is super slow because
    // the AdminLocationsEdit component has to rerender and this takes a long time. So instead,
    // store tha values in the component's state and when the user finished dragging a handle, then
    // call onChange and update the parent component.
    this.state = {
      startTime: props.startTime,
      endTime: props.endTime,
    };
  }
  componentWillReceiveProps({startTime, endTime}) {
    this.setState({startTime, endTime});
  }

  onStart = (event, clientX) => {
    // Dragging must be done on the slider control heads
    if (event.target.id.indexOf('start') === -1 && event.target.id.indexOf('end') === -1) {
      return;
    }
    if (event.target.id.indexOf('track') >= 0) {
      return;
    }

    // Find the track div that is a parent of the handle
    let track = event.target;
    while (track && track.id.indexOf('track') === -1) {
      track = track.parentElement;
    }

    if (track) {
      this.pressedButton = event.target.id.indexOf('start') >= 0 ? 'start' : 'end';

      const trackBbox = track.getBoundingClientRect();
      this.trackWidthInPx = trackBbox.width;
      this.trackLeftPositionInPx = trackBbox.left;

      // Add or subtract a small offset from the track left position. This effectively ensures that
      // further handle movments are relative to the original cursor position so that the handle
      // doesn't "jump" to the original cursor position when it is first moved.
      const handleBbox = event.target.getBoundingClientRect();
      const cursorXOffsetWithinHandle = clientX - handleBbox.left - 12;
      if (this.pressedButton === 'start') {
        this.trackLeftPositionInPx += cursorXOffsetWithinHandle;
      } else {
        this.trackLeftPositionInPx -= cursorXOffsetWithinHandle;
      }
    }
  }
  onMouseDown = event => {
    this.onStart(event, event.clientX);

    // Assign these events to window so that mouse movements outside of this component will
    // still cause this control to update.
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }
  onTouchStart = event => this.onStart(event, event.touches[0].clientX);

  onDrag = (event, clientX) => {
    const { dayStartTime, onChange } = this.props;
    const { startTime, endTime } = this.state;
    const dayStartTimeSeconds = moment.duration(dayStartTime).as('seconds');

    const mouseX = clientX - this.trackLeftPositionInPx;
    const seconds = ((mouseX / this.trackWidthInPx) * UTC_DAY_LENGTH_IN_SECONDS) + dayStartTimeSeconds;

    function clampValue(timeValueInSec) {
      // Limit on the left hand side to the daily reset time
      if (timeValueInSec < dayStartTimeSeconds) {
        timeValueInSec = dayStartTimeSeconds;
      }
      // Limit on the right hand side to (the daily reset time + 24 hours)
      if (timeValueInSec > (UTC_DAY_LENGTH_IN_SECONDS + dayStartTimeSeconds)) {
        timeValueInSec = UTC_DAY_LENGTH_IN_SECONDS + dayStartTimeSeconds;
      }
      return Math.round(timeValueInSec / FIFTEEN_MINUTES_IN_SECONDS) * FIFTEEN_MINUTES_IN_SECONDS;
    }

    function testIfValuesOverlap(startTime, endTime) {
      const secondsBetweenStartAndEndTime = endTime - startTime;
      return secondsBetweenStartAndEndTime < ONE_HOUR_IN_SECONDS;
    }

    switch (this.pressedButton) {
    case 'start':
      let newStartTime = clampValue(seconds);
      if (testIfValuesOverlap(newStartTime, endTime)) {
        newStartTime = endTime - ONE_HOUR_IN_SECONDS;
      }
      this.setState({startTime: newStartTime, endTime});
      return;
    case 'end':
      let newEndTime = clampValue(seconds);
      if (testIfValuesOverlap(startTime, newEndTime)) {
        newEndTime = startTime + ONE_HOUR_IN_SECONDS;
      }
      this.setState({startTime, endTime: newEndTime});
      return;
    default:
      return;
    }
  }
  onTouchMove = event => this.onDrag(event, event.touches[0].clientX);
  onMouseMove = event => {
    if (!this.pressedButton || event.buttons !== 1 /* left button */) { return; }
    this.onDrag(event, event.clientX);
  }

  onMouseUp = event => {
    // Remove these mouse events from window so that they will no longer fire and pollute the
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);

    this.pressedButton = null;
    this.props.onChange(this.state.startTime, this.state.endTime);
  }

  shouldRenderHourMark(value) {
    return parseInt(value.hourOnlyDisplay.split(':')[0], 10) % 2 === 0;
  }

  render() {
    const { dayStartTime, timeZone } = this.props;
    const { startTime, endTime } = this.state;
    const dayStartTimeSeconds = moment.duration(dayStartTime).as('seconds');

    const startTimeDuration = moment.duration(startTime, 'seconds');
    const endTimeDuration = moment.duration(endTime, 'seconds');

    const sliderStartTimePercentage = (startTime - dayStartTimeSeconds) / UTC_DAY_LENGTH_IN_SECONDS * 100;
    const sliderEndTimePercentage = (endTime - dayStartTimeSeconds) / UTC_DAY_LENGTH_IN_SECONDS * 100;

    // Render all possible reset time choices underneath the slider, starting at the reset time and
    // working upwards in hours until that same reset time the next day.
    const resetTimeChoices = generateResetTimeChoices({timeZone});
    const splitPointIndex = resetTimeChoices.findIndex(choice => {
      const choiceSeconds = moment.duration(choice.value).as('seconds');
      return choiceSeconds === dayStartTimeSeconds;
    });
    const tickMarks = [
      ...resetTimeChoices.slice(splitPointIndex), // Everything after the split point
      ...resetTimeChoices.slice(0, splitPointIndex), // Everything before the split point
    ];

    return (
      <div
        className={styles.operatingHoursSliderWrapper}

        onMouseDown={this.onMouseDown}
        /* onMouseMove={this.onMouseMove} */
        /* no onmouseup, this is assigned to window when mousedown happens */

        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onMouseUp}
      >
        <div className={styles.operatingHoursSliderTrack} id="track">
          <div
            className={styles.operatingHoursSliderTrackFilledSection}
            style={{
              left: `${sliderStartTimePercentage}%`,
              width: `${sliderEndTimePercentage - sliderStartTimePercentage}%`,
            }}
          />
          <div
            className={styles.operatingHoursSliderHead}
            id="start"
            style={{left: `calc(${sliderStartTimePercentage}% - 12px)`}}
          />
          <div
            className={styles.operatingHoursSliderHead}
            id="end"
            style={{left: `calc(${sliderEndTimePercentage}% - 12px)`}}
          />
        </div>

        <div className={styles.operatingHoursLabelContainer}>
          {tickMarks.map((tickMark, index) => {
            if (this.shouldRenderHourMark(tickMark)) {
              return (
                <span
                  className={styles.operatingHoursLabel}
                  style={{left: `${index * (100 / tickMarks.length)}%`}}
                  key={tickMark.value}
                >{tickMark.hourOnlyDisplay}</span>
              );
            } else {
              return null;
            }
          })}
          {this.shouldRenderHourMark(tickMarks[0]) ? (
            <span
              className={styles.operatingHoursLabel}
              style={{left: '100%'}}
              key={tickMarks[0].value}
            >{tickMarks[0].hourOnlyDisplay}</span>
          ) : null}
        </div>
      </div>
    );
  }
}

function AdminLocationsDetailModulesOperatingHoursCopyFromSpaceModal({
  activeModal,
  spaceHierarchy,
  spaces,
  selectedSpaceId,
  user,

  onSubmitModal,
  onCloseModal,
  onChangeSearchText,
  onChangeSelectedSpace,
}) {
  if (activeModal.name === 'OPERATING_HOURS_COPY_FROM_SPACE') {
    let formattedHierarchy = spaceHierarchyFormatter(spaceHierarchy.data);
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
            const spaceDisabled = space ? space.timeSegments.length === 0 : true;
            return (
              <div
                key={item.space.id}
                className={classnames(styles.operatingHoursCopyFromSpaceModalItem, {
                  [styles.depth0]: item.depth === 0,
                })}
                style={{marginLeft: item.depth * 24}}
                onClick={() => {
                  if (!spaceDisabled) {
                    onChangeSelectedSpace(item.space.id)
                  }
                }}
              >
                <RadioButton
                  disabled={spaceDisabled || user.data.spaces.includes(item.space.id)}
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

const UTC_DAY_LENGTH_IN_SECONDS = 24 * 60 * 60;
const FIFTEEN_MINUTES_IN_SECONDS = 15 * 60;
const ONE_HOUR_IN_SECONDS = 60 * 60;

function formatDuration(duration, format) {
  return moment.utc()
    .startOf('day')
    .add(duration.as('milliseconds'), 'milliseconds')
    .format(format);
}

function AdminLocationsDetailModulesOperatingHoursUnconnected({
  formState,
  activeModal,
  spaces,
  spaceHierarchy,
  timeSegmentGroups,
  user,

  onChangeField,
  onClickAddLabel,
  onConfirmSegmentCanBeDeleted,
  onOpenCopyFromSpace,
  onCloseModal,
  onChangeSearchText,
  onChangeSelectedSpace,
}) {
  return (
    <Fragment>
      <AdminLocationsDetailModulesOperatingHoursCopyFromSpaceModal
        activeModal={activeModal}
        spaceHierarchy={spaceHierarchy}
        spaces={spaces}
        user={user}

        onSubmitModal={spaceId => {
          let log = formState.operatingHoursLog.slice();
          const space = spaces.data.find(s => s.id === spaceId);

          // Each time segment on the space becomes an entry in the operating hours structure
          const newOperatingHours = calculateOperatingHoursFromSpace(space, timeSegmentGroups.data);
          log = [
            ...log,
            ...newOperatingHours.map((data, index) => ({
              action: TIME_SEGMENT_CREATE,
              id: data.id,
              data,
            })),
          ];

          // And each set of operating hours has a label that is determined from the associated time
          // segment.
          const operatingHoursLabels = space.timeSegmentGroups;
          const newOperatingHoursLabels = formState.operatingHoursLabels.slice();
          // Only add operating hours labels that aren't alraedy assigned to the space
          space.timeSegmentGroups.forEach(tsg => {
            if (!newOperatingHoursLabels.find(l => l.id === tsg.id)) {
              newOperatingHoursLabels.push({
                id: tsg.id,
                name: tsg.name,
              });
              log.push({
                action: TIME_SEGMENT_GROUP_CREATE,
                data: tsg,
              });
            }

            // Link the new time segment group with each operating hours item (time segment)
            log = [
              ...log,
              ...(
                newOperatingHours
                  .filter(o => o.labelId === tsg.id)
                  .map(operatingHour => ({
                    action: TIME_SEGMENT_ASSIGN_TO_TIME_SEGMENT_GROUP,
                    timeSegmentGroupId: tsg.id,
                    timeSegmentId: operatingHour.id,
                  }))
              ),
            ];
          });

          onChangeField('operatingHours', [...formState.operatingHours, ...newOperatingHours]);
          onChangeField('operatingHoursLabels', newOperatingHoursLabels);
          onChangeField('operatingHoursLog', log);

          onCloseModal();
        }}
        onCloseModal={onCloseModal}
        onChangeSearchText={onChangeSearchText}

        selectedSpaceId={activeModal.data.selectedSpaceId}
        onChangeSelectedSpace={onChangeSelectedSpace}
      />

      <AdminLocationsDetailModule title="Operating Hours">
        <AppBar>
          <AppBarSection>
            <div className={styles.operatingHoursLeft}>
              <label htmlFor="admin-locations-detail-modules-operating-hours-time-zone">
                Time Zone:
              </label>
              <InputBox
                id="admin-locations-detail-modules-operating-hours-time-zone"
                type="select"
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
                choices={
                  generateResetTimeChoices({timeZone: formState.timeZone})
                  .map(i => ({ id: i.value, label: i.display }))
                }
                value={formState.dailyReset}
                onChange={choice => onChangeField('dailyReset', choice.id)}
                menuMaxHeight={300}
                width={114}
              />
            </div>
          </AppBarSection>
        </AppBar>

        {formState.operatingHours.length === 0 ? (
          <div style={{height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>TODO: EMPTY STATE NOT DESIGNED</div>
        ) : null}

        {formState.operatingHours.map((operatingHoursItem, index) => {
          const isTimeSegmentLinkedToMultipleGroups = timeSegmentGroups.data.filter(tsg => {
            return tsg.timeSegments
              .map(t => t.timeSegmentId)
              .includes(operatingHoursItem.id);
          }).length > 1;

          return (
            <div key={operatingHoursItem.id} className={styles.operatingHoursTimeSegmentItem}>
              {isTimeSegmentLinkedToMultipleGroups ? (
                <div className={styles.operatingHoursTimeSegmentsItemInvalid}>
                  This segment has multiple labels and can cannot be edited using this interface.
                </div>
              ) : null}
              <div
                className={classnames(styles.operatingHoursTimeSegmentItemSection, {
                  [styles.disabled]: isTimeSegmentLinkedToMultipleGroups,
                })}
              >
                <AppBarContext.Provider value="TRANSPARENT">
                  <AppBar>
                    <AppBarSection>
                      <InputBox
                        type="select"
                        value={operatingHoursItem.labelId}
                        onChange={async item => {
                          let log = formState.operatingHoursLog.slice();

                          // When adding a new label, display a prompt to get the user's
                          // information.
                          if (item.id === 'ADD_A_LABEL') {
                            item = await onClickAddLabel();
                            onChangeField('operatingHoursLabels', [
                              ...formState.operatingHoursLabels,
                              item,
                            ]);
                            log.push({
                              action: TIME_SEGMENT_GROUP_CREATE,
                              id: item.id,
                              data: item,
                            });
                          }

                          const operatingHoursCopy = formState.operatingHours.slice();
                          operatingHoursCopy[index] = {
                            ...operatingHoursCopy[index],
                            labelId: item.id,
                          };
                          onChangeField('operatingHours', operatingHoursCopy);

                          log.push({
                            action: TIME_SEGMENT_ASSIGN_TO_TIME_SEGMENT_GROUP,
                            timeSegmentGroupId: item.id,
                            timeSegmentId: operatingHoursItem.id,
                          });

                          onChangeField('operatingHoursLog', log);
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
                          ...formState.operatingHoursLabels.map(i => ({ id: i.id, label: i.name })),
                        ]}
                        placeholder="Select a label"
                        invalid={operatingHoursItem.labelId === null}
                        width={350}
                      />
                    </AppBarSection>
                    <AppBarSection>
                      <span className={styles.operatingHoursDayOfWeekLabel}>Days Affected:</span>
                      <DayOfWeekSelector
                        daysOfWeek={operatingHoursItem.daysAffected}
                        onChange={daysAffected => {
                          const operatingHoursCopy = formState.operatingHours.slice();
                          operatingHoursCopy[index] = {
                            ...operatingHoursCopy[index],
                            daysAffected,
                          };
                          onChangeField('operatingHours', operatingHoursCopy);

                          onChangeField('operatingHoursLog', [
                            ...formState.operatingHoursLog,
                            {
                              action: TIME_SEGMENT_UPDATE,
                              id: operatingHoursCopy[index].id,
                              data: operatingHoursCopy[index],
                            },
                          ]);
                        }}
                      />
                    </AppBarSection>
                  </AppBar>
                </AppBarContext.Provider>
              </div>
              <div
                className={classnames(styles.operatingHoursTimeSegmentItemSection, {
                  [styles.disabled]: isTimeSegmentLinkedToMultipleGroups,
                })}
              >
                <AdminLocationsDetailModulesOperatingHoursSlider
                  timeZone={formState.timeZone}
                  dayStartTime={formState.dailyReset}
                  startTime={operatingHoursItem.startTimeSeconds}
                  endTime={operatingHoursItem.endTimeSeconds}
                  onChange={(startTimeSeconds, endTimeSeconds) => {
                    const operatingHoursCopy = formState.operatingHours.slice();
                    operatingHoursCopy[index] = {
                      ...operatingHoursCopy[index],
                      startTimeSeconds,
                      endTimeSeconds,
                    };
                    onChangeField('operatingHours', operatingHoursCopy);

                    onChangeField('operatingHoursLog', [
                      ...formState.operatingHoursLog,
                      {
                        action: TIME_SEGMENT_UPDATE,
                        id: operatingHoursCopy[index].id,
                        data: operatingHoursCopy[index],
                      },
                    ]);
                  }}
                />
              </div>
              <AppBar>
                <AppBarSection>
                  {formatDuration(
                    moment.duration(operatingHoursItem.startTimeSeconds, 'seconds'),
                    'h:mma',
                  ).slice(0, -1)}
                  {' to '}
                  {formatDuration(
                    moment.duration(operatingHoursItem.endTimeSeconds, 'seconds'),
                    'h:mma',
                  ).slice(0, -1)}
                </AppBarSection>
                <AppBarSection>
                  <ButtonContext.Provider value="DELETE_SEGMENT_BUTTON">
                    <Button
                      onClick={async () => {
                        onConfirmSegmentCanBeDeleted(() => {
                          const operatingHoursCopy = formState.operatingHours.slice();
                          operatingHoursCopy.splice(index, 1);
                          onChangeField('operatingHours', operatingHoursCopy);

                          onChangeField('operatingHoursLog', [
                            ...formState.operatingHoursLog,
                            {
                              action: TIME_SEGMENT_DELETE,
                              id: operatingHoursItem.id,
                            },
                          ]);
                        });
                      }}
                    >Delete Segment</Button>
                  </ButtonContext.Provider>
                </AppBarSection>
              </AppBar>
            </div>
          );
        })}

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
                labelId: null,
                startTimeSeconds: moment.duration('8:00:00').as('seconds'),
                endTimeSeconds: moment.duration('20:00:00').as('seconds'),
                daysAffected: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              };

              onChangeField('operatingHours', [
                ...formState.operatingHours,
                { ...operatingHoursItem, id },
              ]);

              onChangeField('operatingHoursLog', [
                ...formState.operatingHoursLog,
                {
                  action: TIME_SEGMENT_CREATE,
                  data: operatingHoursItem,
                  id,
                },
              ]);
            }}>Add a Segment</Button>
          </AppBarSection>
        </AppBar>
      </AdminLocationsDetailModule>
    </Fragment>
  );
}

export default connect(
  (state: any) => ({
    activeModal: state.activeModal,
    spaceHierarchy: state.spaceHierarchy,
    spaces: state.spaces,
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

      return {
        id: 'TEMPORARY_ID_THAT_IS_GENERATED_BY_THE_CLIENT:'+uuid.v4(),
        name: newLabelName,
      };
    },
    async onConfirmSegmentCanBeDeleted(callback) {
      dispatch<any>(showModal('MODAL_CONFIRM', {
        prompt: 'Are you sure you want to delete this time segment?',
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
