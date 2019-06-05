import React from 'react';

import AdminLocationsSpaceMap from '../admin-locations-space-map/index';
import AdminLocationsDetailModule from './index';

import styles from './address.module.scss';

export default function AdminLocationsDetailModulesAddress({
  spaceType,
  address,
  coordinates,
  onChangeAddress,
  onChangeCoordinates,
}) {
  return (
    <AdminLocationsDetailModule title="Address">
      <AdminLocationsSpaceMap
        spaceType={spaceType}
        address={address}
        onChangeAddress={onChangeAddress}
        coordinates={coordinates}
        onChangeCoordinates={onChangeCoordinates}
      />
    </AdminLocationsDetailModule>
  );
}
