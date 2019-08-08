import styles from './styles.module.scss';

import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { AppScrollView, ListView, ListViewColumn, ListViewColumnSpacer } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

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

function renderNetworkAddressElement(item, networkInterface) {
  if (item.networkAddresses) {
    let networks = item.networkAddresses.filter(na => na.if === networkInterface);
    if (networks.length > 0) {
      return (
        <div key={networks[0].if}>
          {networks[0].mac ? (<div style={{fontSize: 12, marginBottom: 3}}>mac: <strong style={{fontWeight: 500}}>{networks[0].mac}</strong></div>) : null}
          {networks.map(network => <div style={{fontSize: 12, marginBottom: 3}} key={network.address}>{network.family}: <strong style={{fontWeight: 500}}>{network.address}</strong></div>)}
        </div>
      )
    } else {
      return null;
    }
  } else {
    return null;
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
  return <AppScrollView backgroundColor={colorVariables.grayLightest}>
    <div className={styles.adminDeviceList}>
      <ListView keyTemplate={item => item.serialNumber} data={sortedSensors}>
        <ListViewColumn
          id="Serial number"
          width={160}
          template={item => <strong>{item.serialNumber}</strong>} />
        <ListViewColumn
          id="Status"
          width={128}
          template={item => <span style={{
            color: getStatusColor(item.status)
          }}>{item.status}</span>} />
        <ListViewColumn
          id="Last heartbeat"
          width={146}
          template={item => moment(item.lastHeartbeat).format("MMM\u00a0D,\u00a0h:mma")} />
        <ListViewColumnSpacer />
        <ListViewColumn
          id="Doorway"
          width={320}
          template={item => item.doorwayName} />
        <ListViewColumn
          id="Space(s)"
          width={360}
          template={item => spaces.data.filter(space => {
            return space.doorways.map(doorway => {
              return doorway.id
            }).includes(item.doorwayId)
          }).map(space => {
            return <div style={{marginRight: 10}} key={space.id}>{space.name}</div>
          })} />
        <ListViewColumn
          id="Ethernet"
          width={280}
          template={item => renderNetworkAddressElement(item, 'eth0')}
        />
        <ListViewColumn
          id="WiFi"
          width={280}
          template={item => renderNetworkAddressElement(item, 'wlan0')}
        />
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
