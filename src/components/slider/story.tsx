import React from 'react';
import { storiesOf } from '@storybook/react';
import { withState } from '../../helpers/storybook';
import range from 'lodash/range';

import { InputBox } from '@density/ui/src';
import Checkbox from '../checkbox';
import Slider from '.';
import {
  millisecondsToTimeOfDay,
  DAY_MILLISECONDS,
  MINUTE_MILLISECONDS,
  HOUR_MILLISECONDS,
} from '../../helpers/datetime-utilities/time-string';
import { TimeOfDay } from '../../types/datetime';


const TIME_OF_DAY_MARKS = [{
  value: 0,
  label: '12a',
}, {
  value: 6 * HOUR_MILLISECONDS,
  label: '6a',
}, {
  value: 12 * HOUR_MILLISECONDS,
  label: '12p',
}, {
  value: 18 * HOUR_MILLISECONDS,
  label: '6p',
}, {
  value: 24 * HOUR_MILLISECONDS,
  label: '12a',
}]


const formatTimeOfDay = (timeOfDay: TimeOfDay) => {
  const hourString = `0${timeOfDay.hour}`.slice(-2)
  const minuteString = `0${timeOfDay.minute}`.slice(-2)
  return `${hourString}:${minuteString}`
}

storiesOf('Slider', module)
  .add('default', withState<{value: number | number[]}>({
    value: 0
  }, (state, setState) => {
    const marks = range(0, 110, 10).map(v => {
      return {
        value: v,
        label: v.toString(10),
      }
    })
    return (
      <div style={{ width: 300, padding: 24 }}>
        <Slider
          value={state.value}
          min={0}
          max={100}
          step={1}
          marks={marks}
          onChange={(evt, value) => setState({ value })}
          onChangeCommitted={(evt, value) => setState({ value })}
        />
      </div>

    )
  }))
  .add('time of day', withState<{
    value: number | number[]
  }>({
    value: 0,
  }, (state, setState) => {
    const min = 0;
    const max = DAY_MILLISECONDS;
    const step = 15 * MINUTE_MILLISECONDS;
    
    return (
      <div style={{ width: 250, padding: 24 }}>
        <Slider
          value={state.value}
          min={min}
          max={max}
          step={step}
          marks={TIME_OF_DAY_MARKS}
          onChange={(evt, value) => setState({ value })}
          onChangeCommitted={(evt, value) => setState({ value })}
        />
      </div>
    )
  }))
  .add('time of day range', withState<{
    width: number,
    interval: number,
    value: [number, number],
    isOvernight: boolean
  }>({
    width: 300,
    interval: 15,
    value: [0, DAY_MILLISECONDS],
    isOvernight: false,
  }, (state, setState) => {
      const min = 0;
      const max = DAY_MILLISECONDS;
      const step = state.interval * MINUTE_MILLISECONDS;

      let start: number;
      let end: number;
      if (state.isOvernight) {
        [end, start] = state.value
      } else {
        [start, end] = state.value
      }

      const startTimeOfDay = millisecondsToTimeOfDay(start);
      const endTimeOfDay = millisecondsToTimeOfDay(end);

      return (
        <React.Fragment>

          <div style={{ width: state.width, padding: 24 }}>
            <Slider
              value={state.value}
              min={min}
              max={max}
              step={step}
              marks={TIME_OF_DAY_MARKS}
              track={state.isOvernight ? 'inverted' : 'normal'}
              onChange={(evt, value) => {
                setState({
                  ...state,
                  value: value as [number, number]
                })
              }}
              onChangeCommitted={(evt, value) => {
                setState({
                  ...state,
                  value: value as [number, number]
                })
              }}
            />
          </div>
          <Checkbox
            label="Overnight"
            checked={state.isOvernight}
            onChange={() => {
              setState({
                ...state,
                isOvernight: !state.isOvernight
              })
            }}
          />
          <br />
          <div><strong>Start</strong>: {formatTimeOfDay(startTimeOfDay)}</div>
          <div><strong>End</strong>: {`${formatTimeOfDay(endTimeOfDay)}${state.isOvernight ? ' (next day)' : ''}`}</div>
          <br />
          <h3 style={{ paddingBottom: 8, borderBottom: '1px solid #333'}}>Stuff to play with</h3>
          <div style={{ width: 300 }}>
            <strong>Width of slider</strong>: {state.width}
            <Slider
              min={100}
              max={1000}
              step={10}
              value={state.width}
              onChange={(evt, value) => {
                setState({
                  ...state,
                  width: value as number
                })
              }}
            />
            <InputBox
              type="select"
              choices={[{
                id: 5,
                label: '5m'
              }, {
                id: 15,
                label: '15m'
              }]}
              value={state.interval}
              onChange={value => {
                setState({
                  ...state,
                  interval: value.id,
                })
              }}
            />
          </div>
        </React.Fragment>
      )
  }))