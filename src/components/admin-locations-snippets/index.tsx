import React, { Fragment } from 'react';
import classnames from 'classnames';
import commaNumber from 'comma-number';

import { Icons, ListView, ListViewColumn, InfoPopup } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

import styles from './styles.module.scss';

import { SpacesState } from '../../rx-stores/spaces';
import { DensitySpace, DensitySpaceTypes, DensityDoorway } from '../../types';
import { UserState } from '../../rx-stores/user';
import convertUnit, { UNIT_NAMES } from '../../helpers/convert-unit';
import AdminLocationsListViewImage from '../admin-locations-list-view-image';
import moment from 'moment';


/********************
Space detail wrappers for left pane items
*********************/

export function AdminLocationsLeftPane({ children }) {
  return <div className={styles.leftPane}>{children}</div>
}

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
        <span className={styles.listViewSpaceName}>{item.name}</span>
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


/********************
Larger items to render in sidebar
*********************/

function AdminLocationsOperatingHoursSegment({segment}) {
  const start = moment(segment.start, 'HH:mm:ss');
  const end = moment(segment.end, 'HH:mm:ss');
  // if (start.diff(end) === 0 && start.hour() === 0) {
  //   end.add(1, 'day').subtract(1, 'minute'); 
  // }
  const isNextDay = end <= start;

  return <div className={styles.operatingHoursSegment}>
    {start.format('h:mma').slice(0, -1)}
    {' - '}
    {end.format('h:mma').slice(0, -1)}
    {isNextDay ? ' (next day)' : ''}
  </div>;
} 

export function AdminLocationsOperatingHours({space}: {space: DensitySpace}) {
  const DEFAULT_OPERATING_HOURS_BY_DAY = {
    'Sunday': [{ start: '00:00:00', end: '00:00:00' }],
    'Monday': [{ start: '00:00:00', end: '00:00:00' }],
    'Tuesday': [{ start: '00:00:00', end: '00:00:00' }],
    'Wednesday': [{ start: '00:00:00', end: '00:00:00' }],
    'Thursday': [{ start: '00:00:00', end: '00:00:00' }],
    'Friday': [{ start: '00:00:00', end: '00:00:00' }],
    'Saturday': [{ start: '00:00:00', end: '00:00:00' }],
  };

  const operatingHoursByDay = space.timeSegments.length === 0 ?
    DEFAULT_OPERATING_HOURS_BY_DAY :
    space.timeSegments.reduce((acc, next) => {
      next.days.forEach(day => {
        acc[day] = acc[day] || [];
        acc[day].push({ start: next.start, end: next.end });
        acc[day].sort((a, b) => moment(a.start, 'HH:mm:ss').diff(moment(b.start, 'HH:mm:ss')));
      });
      return acc;
    }, {} as typeof DEFAULT_OPERATING_HOURS_BY_DAY);

  return <AdminLocationsLeftPaneDataRow>
    <div className={styles.operatingHoursContainer}>
      <div className={styles.operatingHoursTitle}>Operating Hours</div>
      <div className={styles.operatingHoursCard}>
        {Object.keys(operatingHoursByDay).map(day => {
          const segments = operatingHoursByDay[day];
          return <div key={day} className={styles.operatingHoursDayRow}>
            <div className={styles.operatingHoursDayName}>{moment(day, 'dddd').format('ddd')}:</div>
            {segments.map((segment, index) => <Fragment key={index}>
              <AdminLocationsOperatingHoursSegment segment={segment} />
              {index < segments.length - 1 ? <div style={{ marginRight: 4 }}>, </div> : null}
            </Fragment>)}
          </div>;
        })}
      </div>
    </div>
  </AdminLocationsLeftPaneDataRow>;
}

export function AdminLocationsOtherLinkedDoorways({space, doorway}: {space: DensitySpace, doorway: DensityDoorway}) {
  const spacesOtherThanSelectedSpace = doorway.spaces.filter(s => s.id !== space.id);
  if (spacesOtherThanSelectedSpace.length > 1) {
    return (
      <InfoPopup
        target={<div className={styles.doorwayLinkedSpacesTag}>
          <div className={styles.doorwayLinkedSpacesIcon}>
            <Icons.Link width={20} height={20} />
          </div>
          <span className={styles.doorwayLinkedSpacesText}>
            {
              spacesOtherThanSelectedSpace.length > 1 ?
              `${spacesOtherThanSelectedSpace.length} other spaces` :
              spacesOtherThanSelectedSpace[0].name
            }
          </span>
        </div>}
        popupAnchor="left"
        popupWidth="auto"
        popupBackground={colorVariables.grayCinder}
        popupBorder={colorVariables.grayCinder}
      >
        {spacesOtherThanSelectedSpace.map(space => (
          <div className={styles.doorwayLinkedSpacesPopoverTag}>
            <div className={styles.doorwayLinkedSpacesIcon}>
              <Icons.Link width={20} height={20} color={colorVariables.grayLight} />
            </div>
            <span className={styles.doorwayLinkedSpacesText}>{space.name}</span>
          </div>
        ))}
      </InfoPopup>
    );
  } else if (spacesOtherThanSelectedSpace.length === 1) {
    return (
      <div className={styles.doorwayLinkedSpacesTag}>
        <div className={styles.doorwayLinkedSpacesIcon}>
          <Icons.Link width={20} height={20} />
        </div>
        <span className={styles.doorwayLinkedSpacesText}>
          {
            spacesOtherThanSelectedSpace.length > 1 ?
            `${spacesOtherThanSelectedSpace.length} other spaces` :
            spacesOtherThanSelectedSpace[0].name
          }
        </span>
      </div>
    );
  } else {
    return (
      <Fragment>No other spaces</Fragment>
    );
  }
}

export function AdminLocationsDoorwayList({space, doorways}: {space: DensitySpace, doorways: Array<DensityDoorway>}) {
  const linkedDoorways = doorways.filter(doorway => doorway.spaces.map(s => s.id).indexOf(space.id) > -1);
  return linkedDoorways.length > 0 ? (
    <AdminLocationsLeftPaneDataRow>
      <div className={classnames(styles.doorwayList, {[styles.shaded]: true})}>
        <ListView data={linkedDoorways} padOuterColumns={false}>
          <ListViewColumn
            id="Doorways"
            template={item => <Fragment>
              <div className={styles.doorwayContainer}>
                <div className={styles.doorwayIcon}>
                  <Icons.Doorway width={20} height={20} color={colorVariables.grayDarkest} />
                </div>
                <span className={styles.doorwayName}>{item.name}</span>
              </div>
            </Fragment>}
            width={220}
          />
          <ListViewColumn
            id="Linked spaces"
            template={i => <AdminLocationsOtherLinkedDoorways space={space} doorway={i} />}
            width={200}
          />
          <ListViewColumn
            id="DPU position"
            align="right"
            template={i => {
              const link = i.spaces.find(x => x.id === space.id);
              return <Fragment>
                {link.sensorPlacement !== null ? (
                  <Fragment>
                    <span className={styles.doorwayDpuPosition}>
                      {link.sensorPlacement === 1 ? 'Inside' : 'Outside'}
                    </span>
                  </Fragment>
                ) : (
                  <Fragment>&mdash;</Fragment>
                )}
              </Fragment>
            }}
            width={80}
          />
        </ListView>
      </div>
    </AdminLocationsLeftPaneDataRow>
  ) : null;
}
