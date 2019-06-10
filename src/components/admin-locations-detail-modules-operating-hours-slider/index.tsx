import React, { Component } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';
import moment from 'moment';
import { Icons } from '@density/ui';

import generateResetTimeChoices from '../../helpers/generate-reset-time-choices/index';

const UTC_DAY_LENGTH_IN_SECONDS = moment.duration('24:00:00').as('seconds');
const FIFTEEN_MINUTES_IN_SECONDS = 15 * 60;
const ONE_HOUR_IN_SECONDS = 60 * 60;

export default class AdminLocationsDetailModulesOperatingHoursSlider extends Component<any, any> {
  pressedButton: 'start' | 'end' | null = null;
  trackWidthInPx: number = 0;
  trackLeftPositionInPx: number = 0;

  start = React.createRef<HTMLDivElement>();
  end = React.createRef<HTMLDivElement>();
  track = React.createRef<HTMLDivElement>();

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
    if (this.props.disabled) { return; }

    // Dragging must be done on the slider control heads
    if (event.target !== this.start.current && event.target !== this.end.current) {
      return;
    }
    if (event.target.id === this.track.current) {
      return;
    }

    // Find the track div that is a parent of the handle
    let track = event.target;
    while (track && track !== this.track.current) {
      track = track.parentElement;
    }

    if (track) {
      this.pressedButton = event.target === this.start.current ? 'start' : 'end';

      const trackBbox = track.getBoundingClientRect();
      this.trackWidthInPx = trackBbox.width;
      this.trackLeftPositionInPx = trackBbox.left;

      // Add or subtract a small offset from the track left position. This effectively ensures that
      // further handle movments are relative to the original cursor position so that the handle
      // doesn't "jump" to the original cursor position when it is first moved.
      const handleBbox = event.target.getBoundingClientRect();
      const cursorXOffsetWithinHandle = clientX - handleBbox.left - 8;
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
    const { dayStartTime } = this.props;
    const { startTime, endTime } = this.state;
    const dayStartTimeSeconds = moment.duration(dayStartTime).as('seconds');

    const mouseX = clientX - this.trackLeftPositionInPx;
    const seconds = ((mouseX / this.trackWidthInPx) * UTC_DAY_LENGTH_IN_SECONDS) + dayStartTimeSeconds;

    function clampValue(timeValueInSec) {
      // Limit on the left hand side to the daily reset time
      if (timeValueInSec < dayStartTimeSeconds) {
        timeValueInSec = dayStartTimeSeconds;
      }
      // Limit on the right hand side to the daily reset time + 24 hours
      if (timeValueInSec > (UTC_DAY_LENGTH_IN_SECONDS + dayStartTimeSeconds)) {
        timeValueInSec = UTC_DAY_LENGTH_IN_SECONDS + dayStartTimeSeconds;
      }
      return Math.round(timeValueInSec / FIFTEEN_MINUTES_IN_SECONDS) * FIFTEEN_MINUTES_IN_SECONDS;
    }

    function testIfValuesOverlap(startTime, endTime) {
      const secondsBetweenStartAndEndTime = endTime - startTime;
      return secondsBetweenStartAndEndTime < ONE_HOUR_IN_SECONDS;
    }

    let valuesChanged;
    switch (this.pressedButton) {
    case 'start':
      let newStartTime = clampValue(seconds);
      if (testIfValuesOverlap(newStartTime, endTime)) {
        newStartTime = endTime - ONE_HOUR_IN_SECONDS;
      }
      valuesChanged = newStartTime !== this.state.startTime || endTime !== this.state.endTime;
      this.setState({startTime: newStartTime, endTime}, () => valuesChanged && this.callOnChange());
      return;
    case 'end':
      let newEndTime = clampValue(seconds);
      if (testIfValuesOverlap(startTime, newEndTime)) {
        newEndTime = startTime + ONE_HOUR_IN_SECONDS;
      }
      valuesChanged = startTime !== this.state.startTime || newEndTime !== this.state.endTime;
      this.setState({startTime, endTime: newEndTime}, () => valuesChanged && this.callOnChange());
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
  }

  callOnChange = () => {
    this.props.onChange(this.state.startTime, this.state.endTime);
  };

  shouldRenderHourMark(value) {
    const valueHour = parseInt(value.hourOnlyDisplay.split(':')[0], 10);
    const startTimeHour = Math.floor(
      moment.duration(this.props.dayStartTime).as('hours')
    );
    const bothOdd = valueHour % 2 === 1 && startTimeHour % 2 === 1;
    const bothEven = valueHour % 2 === 0 && startTimeHour % 2 === 0;
    return bothOdd || bothEven;
  }

  render() {
    const { dayStartTime, timeZone, disabled } = this.props;
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
        className={classnames(styles.operatingHoursSliderWrapper, {[styles.disabled]: disabled})}

        onMouseDown={this.onMouseDown}
        /* no onmousemove, this is assigned to window when mousemove happens */
        /* no onmouseup, this is assigned to window when mousedown happens */

        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onMouseUp}
      >
        <div className={styles.operatingHoursSliderTrack} ref={this.track}>
          <div
            className={styles.operatingHoursSliderTrackFilledSection}
            style={{
              left: `${sliderStartTimePercentage}%`,
              width: `${sliderEndTimePercentage - sliderStartTimePercentage}%`,
            }}
          />
          <div
            className={styles.operatingHoursSliderHead}
            ref={this.start}
            style={{left: `calc(${sliderStartTimePercentage}% - 8px)`}}
          />
          <div
            className={styles.operatingHoursSliderHead}
            ref={this.end}
            style={{left: `calc(${sliderEndTimePercentage}% - 8px)`}}
          />
        </div>

        <div className={styles.operatingHoursLabelContainer}>
          <div className={styles.operatingHoursLabelResetTimeIcon}>
            <Icons.Reset />
          </div>
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
