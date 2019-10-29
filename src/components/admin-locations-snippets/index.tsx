import React, { Fragment } from 'react';
import classnames from 'classnames';
import commaNumber from 'comma-number';
import { Icons, ListViewColumn } from '@density/ui';

import styles from './styles.module.scss';

import { SpacesState } from '../../rx-stores/spaces';
import { DensitySpace, DensitySpaceTypes } from '../../types';
import { UserState } from '../../rx-stores/user';
import convertUnit, { UNIT_NAMES } from '../../helpers/convert-unit';
import AdminLocationsListViewImage from '../admin-locations-list-view-image';


/********************
Space detail wrappers for left pane items
*********************/

export function AdminLocationsLeftPaneDataRow({
  includeTopBorder = true,
  includeBottomBorder = true,
  children
}) {
  return (
    <div
      className={classnames(styles.leftPaneDataRow, {
        [styles.topBorder]: includeTopBorder,
        [styles.bottomBorder]: includeBottomBorder,
      })}
    >{children}</div>
  );
}

export function AdminLocationsLeftPaneDataRowItem({id, label, value}) {
  return (
    <div className={styles.leftPaneDataRowItem}>
      <label htmlFor={`left-pane-data-row-item-${id}`}>{label}</label>
      <span id={`left-pane-data-row-item-${id}`}>{value}</span>
    </div>
  );
}


/********************
Space detail snippets to render in left pane
*********************/

export function AdminLocationsDetailCapacity({space}: {space: DensitySpace}) {
  return <AdminLocationsLeftPaneDataRowItem
    id="capacity"
    label="Capacity:"
    value={space.capacity ? commaNumber(space.capacity) : <Fragment>&mdash;</Fragment>}
  />
}

export function AdminLocationsDetailTargetCapacity({space}: {space: DensitySpace}) {
  return <AdminLocationsLeftPaneDataRowItem
    id="target-capacity"
    label="Target capacity:"
    value={space.targetCapacity ? commaNumber(space.targetCapacity) : <Fragment>&mdash;</Fragment>}
  />;
}

export function AdminLocationsDetailDPUsTotal({space}: {space: DensitySpace}) {
  return <AdminLocationsLeftPaneDataRowItem
    id="dpus"
    label="DPUs:"
    value={space.sensorsTotal ? commaNumber(space.sensorsTotal) : <Fragment>&mdash;</Fragment>}
  />;
}

export function sizeAreaConverted(user: UserState, space: DensitySpace) {
  return user.data && space.sizeArea && space.sizeAreaUnit ? convertUnit(
    space.sizeArea,
    space.sizeAreaUnit,
    user.data.sizeAreaDisplayUnit,
  ) : null;
}

export function AdminLocationsDetailSizeArea({user, space}: {user: UserState, space: DensitySpace}) {
  const area = sizeAreaConverted(user, space);

  return <AdminLocationsLeftPaneDataRowItem
    id="size"
    label={user.data ? `Size (${UNIT_NAMES[user.data.sizeAreaDisplayUnit]}):` : null}
    value={area ? commaNumber(area) : <Fragment>&mdash;</Fragment>}
  />;
}

export function AdminLocationsDetailAnnualRent({user, space}: {user: UserState, space: DensitySpace}) {
  const area = sizeAreaConverted(user, space);

  return <AdminLocationsLeftPaneDataRowItem
    id="rent"
    label={user.data ? `Annual rent (per ${UNIT_NAMES[user.data.sizeAreaDisplayUnit]}):` : null}
    value={area && space.annualRent ? (
      `$${commaNumber((Math.round(space.annualRent / area * 2) / 2).toFixed(2))}`
    ) : <Fragment>&mdash;</Fragment>}
  />;
}

export function AdminLocationsDetailDescendantsTotal({
  spaces,
  space,
  spaceType,
  label,
  id,
}: {
  spaces: SpacesState,
  space: DensitySpace,
  spaceType: DensitySpaceTypes,
  label: string,
  id: string,

}) {
  return <AdminLocationsLeftPaneDataRowItem
    id={id}
    label={label}
    value={
      commaNumber(spaces.data.filter(x => (
        x.spaceType === spaceType && x.ancestry.map(a => a.id).includes(space.id)
      )).length)
    }
  />;
}

export function AdminLocationsDetailBuildingsTotal({spaces, space}: {spaces: SpacesState, space: DensitySpace}) {
  return <AdminLocationsDetailDescendantsTotal
    spaces={spaces} space={space} spaceType={DensitySpaceTypes.BUILDING} label="Buildings:" id="buildings" />;
}

export function AdminLocationsDetailLevelsTotal({spaces, space}: {spaces: SpacesState, space: DensitySpace}) {
  return <AdminLocationsDetailDescendantsTotal
    spaces={spaces} space={space} spaceType={DensitySpaceTypes.FLOOR} label="Levels:" id="floors" />;
}

export function AdminLocationsDetailRoomsTotal({spaces, space}: {spaces: SpacesState, space: DensitySpace}) {
  return <AdminLocationsDetailDescendantsTotal
    spaces={spaces} space={space} spaceType={DensitySpaceTypes.SPACE} label="Rooms:" id="spaces" />;
}


/********************
Space list snippets to render in ListViews
*********************/

export function AdminLocationsListInfo() {
  return <ListViewColumn
    id="Info"
    width={320}
    template={(item: DensitySpace) => (
      <Fragment>
        <AdminLocationsListViewImage space={item} />
        <span className={styles.listViewName}>{item.name}</span>
      </Fragment>
    )}
  />;
}

export function AdminLocationsListLevelsTotal({spaces}: {spaces: SpacesState}) {
  return <ListViewColumn
    id="Levels"
    width={80}
    template={(item: DensitySpace) => commaNumber(spaces.data.filter(
      space => space.spaceType === DensitySpaceTypes.SPACE && space.ancestry.map(a => a.id).includes(item.id)).length
    )}
  />;
}

export function AdminLocationsListRoomsTotal({spaces}: {spaces: SpacesState}) {
  return <ListViewColumn
    id="Rooms"
    width={80}
    template={(item: DensitySpace) => commaNumber(spaces.data.filter(
      space => space.spaceType === DensitySpaceTypes.SPACE && space.ancestry.map(a => a.id).includes(item.id)).length
    )}
  />
}

export function AdminLocationsListSize({user}: {user: UserState}) {
  return <ListViewColumn
    id={user.data ? `Size (${UNIT_NAMES[user.data.sizeAreaDisplayUnit]})` : null}
    width={120}
    template={(item: DensitySpace) => {
      const area = sizeAreaConverted(user, item);
      return area ? commaNumber(area) : <Fragment>&mdash;</Fragment>;
    }}
  />
}

export function AdminLocationsListAnnualRent() {
  return <ListViewColumn
    id="Annual rent"
    width={100}
    template={(item: DensitySpace) => item.annualRent ? `$${commaNumber(item.annualRent)}` : <Fragment>&mdash;</Fragment>}
  />;
}

export function AdminLocationsListTargetCapacity() {
  return <ListViewColumn
    id="Target capacity"
    width={120}
    template={(item: DensitySpace) => item.targetCapacity ?
      commaNumber(item.targetCapacity) : <Fragment>&mdash;</Fragment>}
  />;
}

export function AdminLocationsListCapacity() {
  return <ListViewColumn
    id="Capacity"
    width={100}
    template={(item: DensitySpace) => item.capacity ?
      commaNumber(item.capacity) : <Fragment>&mdash;</Fragment>}
  />;
}

export function AdminLocationsListDPUsTotal() {
  return <ListViewColumn
    id="DPUs"
    width={80}
    template={(item: DensitySpace) => item.sensorsTotal ?
      commaNumber(item.sensorsTotal) : <Fragment>&mdash;</Fragment>}
  />;
}

export function AdminLocationsListRightArrow() {
  return <ListViewColumn
    width={60}
    align="right"
    template={() => <span style={{paddingRight: 24}}>
      <Icons.ArrowRight width={17} height={17} />
    </span>}
  />
}
