import React, { Fragment, useEffect, useRef } from 'react';
import commaNumber from 'comma-number';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways';
import { SpaceMetaField, SpaceDetailCardLoading } from '../spaces-snippets';
import useRxStore from '../../helpers/use-rx-store';
import SpacesPageStore from '../../rx-stores/spaces-page';

import styles from './styles.module.scss'
import colors from '@density/ui/variables/colors.json'

import * as d3Scale from 'd3-scale';
import moment from 'moment';

const CHART_HEIGHT = 80;
const CHART_WIDTH = 334;

// Animation frame handle
let animationFrame: number;

// Get list of distinct "marker" groups with totals, from a list of ingress/egress events
export function getIndicatorLocations(data, minimumStackDistance=4000) {
  let lastTimestamps = {};
  lastTimestamps['entrances'] = 0;
  lastTimestamps['exits'] = 0;

  return data.reduce((acc, i) => {
    let timestamp = new Date(i.timestamp).valueOf();

    const entrancesOrExits = i.direction > 0 ? 'entrances' : 'exits';
    const lastTimestamp = lastTimestamps[entrancesOrExits];

    if (timestamp - lastTimestamp > minimumStackDistance) {
      // No previous event marker was found to stack the current count into. Create a new event marker.
      lastTimestamps[entrancesOrExits] = timestamp;
      return [...acc, {timestamp, count: i.direction}];
    } else {
      // A previous marker was found within the minimum stack distance.  Add this event to the previous marker.
      let lastIndexOfIndicatorDirection = -1;
      for (let ct = acc.length - 1; ct >= 0; ct--) {
        if (
          (i.direction > 0 && acc[ct].count > 0) ||
          (i.direction < 0 && acc[ct].count < 0)
        ) {
          lastIndexOfIndicatorDirection = ct;
          break;
        }
      }
      acc.splice(lastIndexOfIndicatorDirection, 1, {
        ...acc[lastIndexOfIndicatorDirection],
        count: acc[lastIndexOfIndicatorDirection].count + i.direction,
      });

      // TODO: find out if this breaks anything
      //lastTimestamp[entrancesOrExits] = timestamp;
      return acc;
    }
  }, []);
}

export default function SpacesLiveEvents({space, doorway}: {space: CoreSpace, doorway?: CoreDoorway}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const spacesPage = useRxStore(SpacesPageStore);
  const liveMarkers = getIndicatorLocations(spacesPage.liveEvents.data);
  const metrics = spacesPage.liveEvents.metrics;

  useEffect(() => {
    function tick() {
      if (svgRef.current) {
        const now = moment.tz(space.time_zone).valueOf();
        const xScale = d3Scale.scaleTime()
            .domain([now - 60000, now])
            .range([16, CHART_WIDTH - 16]);
        svgRef.current.querySelectorAll('.density-live-event-marker').forEach(marker => {
          const timestamp = parseInt(marker.getAttribute('data-timestamp')!, 10);
          marker.setAttribute('transform', `translate(${xScale(timestamp)}, 0)`);
        })
      }
      animationFrame = window.requestAnimationFrame(tick);
    }
    tick();
    return () => window.cancelAnimationFrame(animationFrame);
  }, [space.time_zone]);

  return spacesPage.liveEvents.status === 'COMPLETE' ? <div
    style={{width: '100%', position: 'relative', paddingBottom: 12}}
  >
    <div style={{display: 'flex', marginBottom: -16}}>
      {doorway ? null : <Fragment>
        <SpaceMetaField
          label="Occupancy"
          value={commaNumber(metrics.occupancy)}
          compact={true} />
        <SpaceMetaField
          label="% Full"
          value={space.target_capacity ? (100 * metrics.occupancy / space.target_capacity).toFixed(0) + '%' : '--'}
          compact={true} />
      </Fragment>}
      <SpaceMetaField
        label={<div style={{display: 'flex', alignItems: 'center'}}>
          <div style={{height:6, width:6, borderRadius:3, backgroundColor:colors.blue, marginRight: 4}}></div>
          Entrances
        </div>}
        value={commaNumber(metrics.entrances)}
        compact={true} />
      <SpaceMetaField
        label={<div style={{display: 'flex', alignItems: 'center'}}>
          <div style={{height:6, width:6, borderRadius:3, backgroundColor:colors.gray400, marginRight: 4}}></div>
          Exits
        </div>}
        value={commaNumber(metrics.exits)}
        compact={true} />
    </div>
    <div style={{marginLeft: -16}}>
      <svg ref={svgRef} height={CHART_HEIGHT} width={CHART_WIDTH} preserveAspectRatio="none">
        <line x1={0} y1={CHART_HEIGHT / 2} x2={CHART_WIDTH} y2={CHART_HEIGHT / 2} stroke={colors.gray300} strokeWidth={1} />
        {liveMarkers.map(marker => {
          return <Fragment key={`${marker.timestamp}-${marker.count}`}>
            <g
              transform="translate(-999, 0)"
              className="density-live-event-marker"
              {...{'data-timestamp': moment(marker.timestamp).valueOf()}}
            >
              <circle
                fill={marker.count > 0 ? colors.blue : colors.gray400}
                cy={marker.count > 0 ? 33 : 47}
                r={3} />
              {Math.abs(marker.count) > 1 ? <g>
                <rect
                  x={-8}
                  y={marker.count > 0 ? 10 : 54}
                  width={16}
                  height={16}
                  rx={4}
                  fill={colors.gray200}
                ></rect>
                <text
                  x={-3}
                  y={marker.count > 0 ? 22 : 66}
                  fontSize={11}
                  stroke={colors.midnight}
                >
                  {Math.abs(marker.count)}
                </text>
              </g> : null}
            </g>
          </Fragment>;
        })}
      </svg>
    </div>
    <div className={styles.axisX}>
      <div className={styles.axisLabel}>
        1m ago
      </div>
      <div className={styles.axisLabel}>
        now
        <div className={styles.liveDot}></div>
      </div>
    </div>
  </div> : <SpaceDetailCardLoading />
}

// export default autoRefresh({shouldComponentUpdate: () => true})(SpacesLiveEvents);
