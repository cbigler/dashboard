import React from 'react';

import AdminLocationsSpaceMap from '../admin-locations-space-map/index';
import AdminLocationsDetailModule from './index';

export default function AdminLocationsDetailModulesAddress({
  space_type,
  address,
  coordinates,
  onChangeAddress,
  onChangeCoordinates,
}) {
  return (
    <AdminLocationsDetailModule title="Address">
      <AdminLocationsSpaceMap
        space_type={space_type}
        address={address}
        onChangeAddress={onChangeAddress}
        coordinates={coordinates}
        onChangeCoordinates={onChangeCoordinates}
      />
    </AdminLocationsDetailModule>
  );
}
