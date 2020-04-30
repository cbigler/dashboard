
import React, { useState, useEffect } from 'react';
import * as moment from "moment";

import {
  Icons,
  Switch,
} from '@density/ui/src';
import colorVariables from '@density/ui/variables/colors.json';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { CoreSpaceEvent } from '@density/lib-api-types/core-v2/events';

import useRxDispatch from '../../helpers/use-rx-dispatch';
import useRxStore from '../../helpers/use-rx-store';
import QueueStore, { QueueSettings } from '../../rx-stores/queue';
import { QueueActionTypes } from '../../rx-actions/queue';
import { ResourceStatus } from '../../types/resource';
import classnames from 'classnames';

import styles from './styles.module.scss';
import CapacityChart from './capacity-chart';
import { isNullOrUndefined } from 'util';
import tallyControllerBg from '../../assets/images/tally_controller_bg.png';


function calculateGoAction(
  space: CoreSpace,
  settings: QueueSettings
): boolean {
    switch (settings.threshold_metric) {
    case 'CAPACITY':
      return space.current_count < settings.queue_capacity
    case 'UTILIZATION':
      return (space.current_count / settings.queue_capacity) < settings.threshold_value
    case 'PEOPLE_PER_SQFT':
      if (isNullOrUndefined(space.size_area)) {
        console.error('Go action not calculated due to null size_area')
        return false;
      }
      return (space.current_count / space.size_area) < settings.threshold_value
    default:
      return true
    }
}

function calculateWaitTime(
  spaceEvents: CoreSpaceEvent[],
  spaceDwellMean: number,
  settings: QueueSettings,
  shouldGo: boolean,
): number | null {
  // wait time is not set to display
  // space does not have dwell time calculations yet
  if (!settings.display_wait_time || isNullOrUndefined(spaceDwellMean)) {
    return null;
  }

  // no wait time if the space isn't at capacity
  if (shouldGo) {
    return 0;
  }

  const entrances = spaceEvents.filter((e)=> e.direction > 0);
  const numExits = spaceEvents.filter((e)=> e.direction < 0).length;

  // if there are no entrances, can't calculate wait time
  // also, there shouldn't be more exits than entrances
  // if the space is over capacity. Likely a drift issue, we can't calculate
  // the dwell time
  if (entrances.length === 0 || numExits >= entrances.length) {
    return null;
  }

  // find the first entrances that doesn't have a matching exit
  const firstUnmatchedEntrance = entrances.splice(numExits)[0];

  // estimate when the first unmatched entrance _should_ exit
  const estimatedExitTime = moment.utc(firstUnmatchedEntrance.timestamp)
    .add(spaceDwellMean, 'minutes');

  // calculate difference between estimated exit timestamp and now
  const timeUntilExit = moment.duration(
    estimatedExitTime.diff(moment.utc())
  ).asMinutes();

  // at a minimum, show 1 minute of wait time
  return Math.max(Math.round(timeUntilExit), 1)
}

function waitTimeToString(waitTime: number): string {
  if (waitTime === 0) {
    return 'No wait';
  }
  else if (waitTime === 1) {
    return '1 minute';
  }
  else {
    return `${waitTime} minutes`;
  }
}


const QueueSpaceDetail: React.FunctionComponent = () => {
  const state = useRxStore(QueueStore);
  const dispatch = useRxDispatch();
  const selected = state.selected;
  const tallyEnabled = state.tallyEnabled;
  const [settingsVisible, setSettingsVisible] = useState(false);

  // unmount effect
  useEffect(() => {
    return () => {
      dispatch({type: QueueActionTypes.QUEUE_WILL_UNMOUNT})
    };
  }, [dispatch]);

  if (
    selected.status === ResourceStatus.LOADING ||
    selected.status === ResourceStatus.IDLE
  ) {
    return (<h2>Hold up, k?</h2>)
  }
  else if (selected.status === ResourceStatus.ERROR) {
    return (<h2>Uh oh.</h2>)
  }

  const {
    space,
    spaceEvents,
    spaceDwellMean,
    virtualSensorSerial,
    settings
  } = selected.data;

  const supportEmail = settings.support_email || 'support@density.io';
  const percentFull = Math.round(space.current_count / settings.queue_capacity * 100);
  const shouldGo = calculateGoAction(space, settings);
  const waitTime = calculateWaitTime(
    spaceEvents,
    spaceDwellMean,
    settings,
    shouldGo
  );

  return (
    <div className={styles.queueDetailPage}>
      {/* Action Section */}
      <div className={styles.queueActionSection} style={{
        backgroundColor: shouldGo ? colorVariables.green : colorVariables.red
      }}>
        { settingsVisible ? (
        <div className={styles.queueSettings}>
          <div className={styles.queueSettingsHeader}>
            <div
              className={styles.queueSettingsCloseButton}
              onClick={() => setSettingsVisible(false)}>
              <Icons.Close
                color={colorVariables.midnight}
                width={24}
                height={24}
              />
            </div>
            <h1 className={styles.queueSettingsTitle}>Settings</h1>
          </div>
          <div className={styles.queueSetting}>
            <div className={styles.queueSettingHeader}>
              <h2 className={styles.queueSettingTitle}>Tally Mode</h2>
              <Switch
                value={tallyEnabled}
                onChange={()=>
                  dispatch({
                    type: QueueActionTypes.QUEUE_SET_TALLY_ENABLED,
                    enabled: !tallyEnabled
                })}
              />
            </div>
            <p className={styles.queueSettingBody}>Enable manual counting for this space.</p>
          </div>
        </div>) : null}
        <div
          className={styles.queueSettingsButton}
          onClick={()=> setSettingsVisible(true)}>
          <Icons.Cog
            color={'#0D183A'}
            width={24}
            height={24}
          />
        </div>
        <div className={styles.queueCapacity}>
          <CapacityChart
            outerRadius={48}
            outerBorderWidth={9}
            percentFull={Math.min(percentFull, 100)}
            color='#ffffff'
          />
          <h2 className={styles.queueActionStatusMetaSectionTitle}>{percentFull}% full</h2>
        </div>
        { !isNullOrUndefined(waitTime) ? <div className={styles.queueWaitTime}>
          <Icons.StopWatch
            color='#ffffff'
            width={87}
            height={96}
          />
          <h2 className={styles.queueActionStatusMetaSectionTitle}>{waitTimeToString(waitTime)}</h2>
        </div> : null}
        <div className={styles.queueActionTextSection}>
          <h1 className={styles.queueActionText}>
            { shouldGo ? "Go" : "Wait"}
          </h1>
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.queueDetailSection}>
        <div className={styles.queueDetailLogoSection}>
          <img className={styles.queueDetailLogo} src="https://dashboard.density.io/static/media/logo-black.ff062828.svg" alt="Density Inc."/>
        </div>
        <h1 className={styles.queueSpaceName}>
          {space.name}
        </h1>
        { tallyEnabled ? (
          <div className={styles.queueTallySection}>
            <div className={styles.queueOccupancyContainer}>
              <h6 className={styles.queueOccupancyLabel}>Occupancy</h6>
              <h2 className={styles.queueOccupancy}>
                {space.current_count}
              </h2>
              <Icons.Person
                color={colorVariables.midnight}
                width={64}
                height={64}
              />
            </div>
            <div className={styles.queueTallyController} style={{
              backgroundImage: `url(${tallyControllerBg}`
            }}>
              <div
                className={styles.queueTallyIngress}
                onClick={()=>
                  dispatch({
                    type: QueueActionTypes.QUEUE_CREATE_TALLY_EVENT,
                    virtualSensorSerial: virtualSensorSerial,
                    timestamp: moment.utc(),
                    trajectory: 1
                })}
              >+</div>
              <div
                className={styles.queueTallyEgress}
                onClick={()=>
                  dispatch({
                    type: QueueActionTypes.QUEUE_CREATE_TALLY_EVENT,
                    virtualSensorSerial: virtualSensorSerial,
                    timestamp: moment.utc(),
                    trajectory: -1
                })}
              >-</div>
            </div>
          </div>
        ) : (
          <div className={styles.queueMessageSection}>
            <p className={styles.queueMessage}>
              {settings.message}
            </p>
            <p className={classnames(styles.queueMessage, styles.queueMessageSupport)}>
              For more information, contact <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QueueSpaceDetail;
