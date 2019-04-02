import styles from './styles.module.scss';

import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { AppScrollView } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

import ListView, { ListViewColumn } from '../list-view';

function getStatusColor(status) {
  switch (status) {
    case 'error':
    case 'offline':
      return colorVariables.brandDanger;
    case 'online':
      return colorVariables.brandSuccess;
    default:
      return colorVariables.grayDarkest;
  }
}

export function AdminDeviceStatus({
  sensors,
  spaces
}) {
  let sortedSensors = sensors.data.sort(function(a, b){
   if (a.status < b.status)
      return -1;
    if (a.status > b.status)
      return 1;
    return 0;
  });
  return <AppScrollView>
    <div className={styles.adminDeviceList}>
      <ListView keyTemplate={item => item.serialNumber} data={sortedSensors}>
        <ListViewColumn
          title="Serial Number"
          template={item => <strong>{item.serialNumber}</strong>} />
        <ListViewColumn
          title="Status"
          template={item => <span style={{
            color: getStatusColor(item.status)
          }}>{item.status}</span>} />
        <ListViewColumn
          title="Last Heartbeat"
          template={item => moment(item.lastHeartbeat).format("MMM\u00a0D,\u00a0h:mma")} />
        <ListViewColumn flexGrow={1} />
        <ListViewColumn
          title="Doorway"
          template={item => item.doorwayName} />
        <ListViewColumn
          title="Space(s)"
          template={item => spaces.data.filter(space => {
            return space.doorways.map(doorway => {
              return doorway.id
            }).includes(item.doorwayId)
          }).map(space => {
            return <div style={{marginRight: 10}} key={space.id}>{space.name}</div>
          })} />
      </ListView>
    </div>
  </AppScrollView>;
}

export default connect((state: any) => {
  return {
    sensors: state.sensors,
    spaces: state.spaces
  };
}, dispatch => {
  return {};
})(AdminDeviceStatus);
