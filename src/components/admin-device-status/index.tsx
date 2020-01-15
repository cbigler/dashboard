import styles from './styles.module.scss';

import React, { Fragment, useState } from 'react';
import moment from 'moment';

import {
  AppBar,
  AppScrollView,
  InputBox,
  ListView,
  ListViewColumn,
  ListViewColumnSpacer,
  Icons
} from '@density/ui/src';
import colorVariables from '@density/ui/variables/colors.json';
import useRxStore from '../../helpers/use-rx-store';
import SpacesStore from '../../rx-stores/spaces';
import SensorsStore from '../../rx-stores/sensors';
import filterCollection from '../../helpers/filter-collection/index';
// @ts-ignore
import { IntercomAPI } from 'react-intercom';


const sensorsFilter = filterCollection({ fields: ['serial_number', 'doorway_name'] });

function getStatusColor(status) {
  switch (status) {
    case 'error':
    case 'offline':
    case 'low_power':
      return colorVariables.brandDanger;
    case 'online':
      return colorVariables.brandSuccess;
    default:
      return colorVariables.grayDarkest;
  }
}

function getStatusText(status) {
  switch (status) {
    case 'error':
    case 'offline':
        return 'Offline'
    case 'low_power':
      return 'Low Power';
    case 'online':
      return 'Online';
    default:
      return 'Unconfigured';
  }
}

function openIntercom(e) {
  IntercomAPI('show');
}


export function NetworkAddressElement({
  item,
  networkInterface,
}) {
  if (item.network_addresses) {
    let networks = item.network_addresses.filter(na => na.if === networkInterface);
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
  const [ sensorsFilterText, setSensorsFilterText ] = useState('');
  let sortedSensors = sensorsFilter(sensors.data, sensorsFilterText).sort(function(a, b){
    if (a.status === 'low_power') {
      return -1;
    }
    if (a.status < b.status) {
      return -1;
    }
    if (a.status > b.status) {
      return 1;
    }
    return 0;
  });

  const numLowPowerSensors = sensors.data.filter(s => s.status === 'low_power').length;
  const lowPowerAlert = numLowPowerSensors > 0 ? (
    <div className={styles.lowPowerWarningSection}>
      <div className={styles.lowPowerWarningAlert}>
        <Icons.Danger color='#f4ab4e'/>
        <h4 className={styles.lowPowerWarningTitle}>
          {numLowPowerSensors} DPUs are not counting due to insufficient power. Please&nbsp;
          <span
            className={styles.lowPowerWarningLink}
            onClick={openIntercom}>reach out to customer support.
          </span>
        </h4>
      </div>
    </div>
  ) : null;

  return <Fragment>
    <AppBar>
      <InputBox
        type="text"
        width={250}
        placeholder="Filter dpus ..."
        value={sensorsFilterText}
        onChange={e => setSensorsFilterText(e.target.value)}
      />
    </AppBar>
    {lowPowerAlert}
    <AppScrollView backgroundColor={colorVariables.grayLightest}>
      <div className={styles.adminDeviceList}>
        <ListView keyTemplate={item => item.serial_number} data={sortedSensors}>
          <ListViewColumn
            id="Serial number"
            width={160}
            template={item => <strong>{item.serial_number}</strong>} />
          <ListViewColumn
            id="Status"
            width={128}
            template={item => <span style={{
              color: getStatusColor(item.status)
            }}>{getStatusText(item.status)}</span>} />
          <ListViewColumn
            id="Last heartbeat"
            width={146}
            template={item => moment(item.last_heartbeat).format("MMM\u00a0D,\u00a0h:mma")} />
          <ListViewColumnSpacer />
          <ListViewColumn
            id="Doorway"
            width={320}
            template={item => item.doorway_name} />
          <ListViewColumn
            id="Space(s)"
            width={360}
            template={item => spaces.data.filter(space => {
              return space.doorways.map(doorway => {
                return doorway.id
              }).includes(item.doorway_id)
            }).map(space => {
              return <div style={{ marginRight: 10 }} key={space.id}>{space.name}</div>
            })} />
          <ListViewColumn
            id="Firmware Version"
            width={360}
            template={item => item.firmwareVersion} />
          <ListViewColumn
            id="Ethernet"
            width={280}
            template={item => <NetworkAddressElement item={item} networkInterface={'eth0'} />}
          />
          <ListViewColumn
            id="WiFi"
            width={280}
            template={item => <NetworkAddressElement item={item} networkInterface={'wlan0'} />}
          />
        </ListView>
      </div>
    </AppScrollView>
  </Fragment>;
}


const ConnectedAdminDeviceStatus: React.FC = () => {

  const spaces = useRxStore(SpacesStore);
  const sensors = useRxStore(SensorsStore);

  return (
    <AdminDeviceStatus
      spaces={spaces}
      sensors={sensors}
    />
  )
}

export default ConnectedAdminDeviceStatus;
