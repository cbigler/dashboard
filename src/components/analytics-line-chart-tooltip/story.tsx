/* eslint-disable import/first */
import React from 'react';
import { storiesOf } from '@storybook/react';
import uuid from 'uuid/v4';

import AnalyticsLineChartTooltip from './index';
import { AnalyticsDatapoint, AnalyticsFocusedMetric } from '../../types/analytics';
import { withState } from '../../helpers/storybook';


// const MODEL_DATAPOINT: AnalyticsDatapoint = {
//   space_id: '123',
//   space_name: 'A test space',
//   min: 0,
//   max: 3,
//   entrances: 5,
//   exits: 3,
//   events: 8,
//   utilization: 20,
//   millisecondsSinceUnixEpoch: 1567605600000,
//   localDay: '2019-09-04',
//   localTime: '10:00',
//   localBucketDay: '2019-09-04',
//   localBucketTime: '10:00',
// };

// const makeDatapoint = (overrides: Partial<AnalyticsDatapoint>): AnalyticsDatapoint => {
//   return Object.assign(
//     {},
//     MODEL_DATAPOINT,
//     {space_id: uuid()},
//     overrides,
//   );
// }

// storiesOf('Analytics / Line Chart / Tooltip', module)
//   .add('Default', withState({
//     targetValue: 4
//   }, (state, setState) => {
    
//     analyticsColorScale.reset();

//       const datapoints = [
//         makeDatapoint({ space_name: 'Mercury', max: 4 }),
//         makeDatapoint({ space_name: 'Venus', max: 13 }),
//         makeDatapoint({ space_name: 'Earth', max: 18 }),
//         makeDatapoint({ space_name: 'Mars', max: 15 }),
//         makeDatapoint({ space_name: 'Jupiter', max: 3 }),
//         makeDatapoint({ space_name: 'Saturn', max: 9 }),
//         makeDatapoint({ space_name: 'Uranus', max: 4 }),
//         makeDatapoint({ space_name: 'Neptune', max: 1 }),
//       ]
    
//     return (
//       <React.Fragment>
        
//         <AnalyticsLineChartTooltip
//           datapoints={datapoints}
//           selectedMetric={AnalyticsFocusedMetric.MAX}
//           targetValue={state.targetValue}
//         />

//         {/* Adjust this value to simulate vertical hover positions */}
//         <br />
//         <label htmlFor="targetValue">Target Value</label>
//         <input
//           id="targetValue"
//           type="number"
//           value={state.targetValue}
//           onChange={evt => setState({ targetValue: Number(evt.target.value) })}
//           style={{margin: 8, fontSize: 16}}
//         />
        
//       </React.Fragment>
//     )
//   }))
//   .add('with overflow', withState({
//     targetValue: 4
//   }, (state, setState) => {

//     analyticsColorScale.reset();

//     const datapoints = [
//       makeDatapoint({ space_name: 'Mercury', max: 0 }),
//       makeDatapoint({ space_name: 'Venus', max: 0 }),
//       makeDatapoint({ space_name: 'Earth', max: 12 }),
//       makeDatapoint({ space_name: 'Mars', max: 0 }),
//       makeDatapoint({ space_name: 'Jupiter', max: 0 }),
//       makeDatapoint({ space_name: 'Saturn', max: 0 }),
//       makeDatapoint({ space_name: 'Uranus', max: 0 }),
//       makeDatapoint({ space_name: 'Neptune', max: 0 }),
//     ]

//     return (
//       <React.Fragment>

//         <AnalyticsLineChartTooltip
//           datapoints={datapoints}
//           selectedMetric={AnalyticsFocusedMetric.MAX}
//           targetValue={state.targetValue}
//         />

//         {/* Adjust this value to simulate vertical hover positions */}
//         <br />
//         <label htmlFor="targetValue">Target Value</label>
//         <input
//           id="targetValue"
//           type="number"
//           value={state.targetValue}
//           onChange={evt => setState({ targetValue: Number(evt.target.value) })}
//           style={{ margin: 8, fontSize: 16 }}
//         />

//       </React.Fragment>
//     )
//   }))

