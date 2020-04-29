
import React, { useState } from 'react';
import {
  Icons,
  Switch,
} from '@density/ui/src';

import colorVariables from '@density/ui/variables/colors.json';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';

import useRxDispatch from '../../helpers/use-rx-dispatch';
import useRxStore from '../../helpers/use-rx-store';
import QueueStore, { QueueSettings } from '../../rx-stores/queue';
import { QueueActionTypes } from '../../rx-actions/queue';
import { ResourceStatus } from '../../types/resource';

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
  space: CoreSpace,
  spaceDwellMean: number,
  settings: QueueSettings
): number | null {
  if (!settings.display_wait_time || isNullOrUndefined(spaceDwellMean)) {
    return null;
  }
  console.log(space);
  // get the last ingress event, add the mean dwell time to it
  return 1
}


const QueueSpaceDetail: React.FunctionComponent = () => {
  const state = useRxStore(QueueStore);
  const dispatch = useRxDispatch();
  const selected = state.selected;
  const tallyEnabled = state.tallyEnabled;
  const [settingsVisible, setSettingsVisible] = useState(false);

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
    spaceDwellMean,
    virtualSensorSerial,
    settings
  } = selected.data;

  const supportEmail = settings.support_email || 'support@density.io';
  const percentFull = Math.round(space.current_count / settings.queue_capacity * 100);
  const shouldGo = calculateGoAction(space, settings);
  const waitTime = calculateWaitTime(space, spaceDwellMean, settings);
  console.log(space)

  return (
    <div className={styles.queueDetailPage}>
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
                width={40}
                height={40}
              />
            </div>
            <h1 className={styles.queueSettingsTitle}>Settings</h1>
          </div>
          <div className={styles.queueSetting}>
            <div className={styles.queueSettingHeader}>
              <h2 className={styles.queueSettingTitle}>Tally Mode</h2>
              <Switch
                checked={tallyEnabled}
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
            width={40}
            height={40}
          />
        </div>
        <div className={styles.queueCapacity}>
          <CapacityChart
            outerRadius={48}
            outerBorderWidth={9}
            percentFull={percentFull}
            color='#ffffff'
          />
          <h2>{percentFull}% full</h2>
        </div>
        { waitTime ? <div className={styles.queueWaitTime}>
          <Icons.StopWatch
            color='#ffffff'
            width={87}
            height={96}
          />
          <h2>Wait Time</h2>
        </div> : null}
        <h1 className={styles.queueActionText}>
          { shouldGo ? "Go" : "Wait"}
        </h1>
      </div>
      <div className={styles.queueDetailSection}>
        <h1 className={styles.queueSpaceName} style={{
          textAlign: tallyEnabled ? "center" : "left"
        }}>
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
                onClick={console.log}
              >+</div>
              <div
                className={styles.queueTallyEgress}
                onClick={console.log}
              >-</div>
            </div>
          </div>
        ) : (
          <div className={styles.queueMessageSection}>
            <p className={styles.queueMessage}>
              {settings.message}
            </p>
            <p className={styles.queueMessage}>
              For more information, contact <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QueueSpaceDetail;
