import React, { Fragment } from 'react';
import classnames from 'classnames';
import commaNumber from 'comma-number';

import { Icons, ListView, ListViewColumn, InfoPopup } from '@density/ui/src';
import colorVariables from '@density/ui/variables/colors.json';

import styles from './styles.module.scss';

import { SpacesLegacyState } from '../../rx-stores/spaces-legacy';
import { CoreSpace, CoreSpaceType } from '@density/lib-api-types/core-v2/spaces';
import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways';
import { UserState } from '../../rx-stores/user';
import { convertUnit, UNIT_DISPLAY_NAMES, SQUARE_FEET } from '@density/lib-common-helpers';
import AdminLocationsListViewImage from '../admin-locations-list-view-image';
import moment from 'moment-timezone';
import InfoPopupNew from '../info-popup-new';


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

export function AdminLocationsDetailCapacity({space}: {space: CoreSpace}) {
  return <AdminLocationsLeftPaneDataRowItem
    id="capacity"
    label="Capacity:"
    value={space.capacity ? commaNumber(space.capacity) : <Fragment>&mdash;</Fragment>}
  />
}

export function AdminLocationsDetailTargetCapacity({space}: {space: CoreSpace}) {
  return <AdminLocationsLeftPaneDataRowItem
    id="target-capacity"
    label="Target capacity:"
    value={space.target_capacity ? commaNumber(space.target_capacity) : <Fragment>&mdash;</Fragment>}
  />;
}

export function AdminLocationsDetailSensorsTotal({space}: {space: CoreSpace}) {
  return <AdminLocationsLeftPaneDataRowItem
    id="sensors"
    label="Sensors:"
    value={space.sensors_total ? commaNumber(space.sensors_total) : <Fragment>&mdash;</Fragment>}
  />;
}

export function sizeAreaConverted(user: UserState, space: CoreSpace) {
  return (user.data && space.size_area) ? convertUnit(
    space.size_area,
    space.size_area_unit || user.data.size_area_display_unit || SQUARE_FEET,
    user.data.size_area_display_unit,
  ) : null;
}

export function AdminLocationsDetailSizeArea({user, space}: {user: UserState, space: CoreSpace}) {
  const area = sizeAreaConverted(user, space);

  return <AdminLocationsLeftPaneDataRowItem
    id="size"
    label={user.data ? `Size (${UNIT_DISPLAY_NAMES[user.data.size_area_display_unit]}):` : null}
    value={area ? commaNumber(area) : <Fragment>&mdash;</Fragment>}
  />;
}

export function AdminLocationsDetailAnnualRent({user, space}: {user: UserState, space: CoreSpace}) {
  const area = sizeAreaConverted(user, space);

  return <AdminLocationsLeftPaneDataRowItem
    id="rent"
    label={user.data ? `Annual rent (per ${UNIT_DISPLAY_NAMES[user.data.size_area_display_unit]}):` : null}
    value={area && space.annual_rent ? (
      `$${commaNumber((Math.round(space.annual_rent / area * 2) / 2).toFixed(2))}`
    ) : <Fragment>&mdash;</Fragment>}
  />;
}

export function AdminLocationsDetailDescendantsTotal({
  spaces,
  space,
  space_type,
  label,
  id,
}: {
  spaces: SpacesLegacyState,
  space: CoreSpace,
  space_type: CoreSpaceType,
  label: string,
  id: string,
}) {
  return <AdminLocationsLeftPaneDataRowItem
    id={id}
    label={label}
    value={
      commaNumber(spaces.data.filter(x => (
        x.space_type === space_type && x.ancestry.map(a => a.id).includes(space.id)
      )).length)
    }
  />;
}

export function AdminLocationsDetailBuildingsTotal({spaces, space}: {spaces: SpacesLegacyState, space: CoreSpace}) {
  return <AdminLocationsDetailDescendantsTotal
    spaces={spaces} space={space} space_type={CoreSpaceType.BUILDING} label="Buildings:" id="buildings" />;
}

export function AdminLocationsDetailLevelsTotal({spaces, space}: {spaces: SpacesLegacyState, space: CoreSpace}) {
  return <AdminLocationsDetailDescendantsTotal
    spaces={spaces} space={space} space_type={CoreSpaceType.FLOOR} label="Floors:" id="floors" />;
}

export function AdminLocationsDetailRoomsTotal({spaces, space}: {spaces: SpacesLegacyState, space: CoreSpace}) {
  return <AdminLocationsDetailDescendantsTotal
    spaces={spaces} space={space} space_type={CoreSpaceType.SPACE} label="Spaces:" id="spaces" />;
}


/********************
Space list snippets to render in ListViews
*********************/

export function AdminLocationsListInfo() {
  return <ListViewColumn
    id="Info"
    width={320}
    template={(item: CoreSpace) => (
      <Fragment>
        <AdminLocationsListViewImage space={item} />
        <span className={styles.listViewSpaceName}>{item.name}</span>
      </Fragment>
    )}
  />;
}

export function AdminLocationsListLevelsTotal({spaces}: {spaces: SpacesLegacyState}) {
  return <ListViewColumn
    id="Floors"
    width={80}
    template={(item: CoreSpace) => commaNumber(spaces.data.filter(
      space => space.space_type === CoreSpaceType.FLOOR && space.ancestry.map(a => a.id).includes(item.id)).length
    )}
  />;
}

export function AdminLocationsListRoomsTotal({spaces}: {spaces: SpacesLegacyState}) {
  return <ListViewColumn
    id="Spaces"
    width={80}
    template={(item: CoreSpace) => commaNumber(spaces.data.filter(
      space => space.space_type === CoreSpaceType.SPACE && space.ancestry.map(a => a.id).includes(item.id)).length
    )}
  />
}

export function AdminLocationsListSize({user}: {user: UserState}) {
  return <ListViewColumn
    id={user.data ? `Size (${UNIT_DISPLAY_NAMES[user.data.size_area_display_unit]})` : 'Size'}
    width={120}
    template={(item: CoreSpace) => {
      const area = sizeAreaConverted(user, item);
      return area ? commaNumber(area) : <Fragment>&mdash;</Fragment>;
    }}
  />
}

export function AdminLocationsListAnnualRent() {
  return <ListViewColumn
    id="Annual rent"
    width={100}
    template={(item: CoreSpace) => item.annual_rent ? `$${commaNumber(item.annual_rent)}` : <Fragment>&mdash;</Fragment>}
  />;
}

export function AdminLocationsListTargetCapacity() {
  return <ListViewColumn
    id="Target capacity"
    width={120}
    template={(item: CoreSpace) => item.target_capacity ?
      commaNumber(item.target_capacity) : <Fragment>&mdash;</Fragment>}
  />;
}

export function AdminLocationsListCapacity() {
  return <ListViewColumn
    id="Capacity"
    width={100}
    template={(item: CoreSpace) => item.capacity ?
      commaNumber(item.capacity) : <Fragment>&mdash;</Fragment>}
  />;
}

export function AdminLocationsListSensorsTotal() {
  return <ListViewColumn
    id="Sensors"
    width={80}
    template={(item: CoreSpace) => item.sensors_total ?
      commaNumber(item.sensors_total) : <Fragment>&mdash;</Fragment>}
  />;
}

export function AdminLocationsListRightArrow() {
  return <ListViewColumn
    id="ArrowRight"
    title=""
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

function OperatingHoursSegment({segment}) {
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

export function OperatingHoursList({space}: {space: CoreSpace}) {
  const DEFAULT_OPERATING_HOURS_BY_DAY = {
    'Sunday': [{ start: '00:00:00', end: '00:00:00' }],
    'Monday': [{ start: '00:00:00', end: '00:00:00' }],
    'Tuesday': [{ start: '00:00:00', end: '00:00:00' }],
    'Wednesday': [{ start: '00:00:00', end: '00:00:00' }],
    'Thursday': [{ start: '00:00:00', end: '00:00:00' }],
    'Friday': [{ start: '00:00:00', end: '00:00:00' }],
    'Saturday': [{ start: '00:00:00', end: '00:00:00' }],
  };

  const operatingHoursByDay = space.time_segments.length === 0 ?
    DEFAULT_OPERATING_HOURS_BY_DAY :
    space.time_segments.reduce((acc, next) => {
      next.days.forEach(day => {
        acc[day] = acc[day] || [];
        acc[day].push({ start: next.start, end: next.end });
        acc[day].sort((a, b) => moment(a.start, 'HH:mm:ss').diff(moment(b.start, 'HH:mm:ss')));
      });
      return acc;
    }, {} as typeof DEFAULT_OPERATING_HOURS_BY_DAY);

  return <Fragment>
    {Object.keys(operatingHoursByDay).map(day => {
      const segments = operatingHoursByDay[day];
      return <div key={day} className={styles.operatingHoursDayRow}>
        <div className={styles.operatingHoursDayName}>{moment(day, 'dddd').format('ddd')}:</div>
        {segments.map((segment, index) => <Fragment key={index}>
          <OperatingHoursSegment segment={segment} />
          {index < segments.length - 1 ? <div style={{ marginRight: 4 }}>, </div> : null}
        </Fragment>)}
      </div>;
    })}
  </Fragment>
}

export function AdminLocationsOperatingHours({space}: {space: CoreSpace}) {
  return <AdminLocationsLeftPaneDataRow>
    <div className={styles.operatingHoursContainer}>
      <div className={styles.operatingHoursTitle}>Operating Hours</div>
      <div className={styles.operatingHoursCard}>
        <OperatingHoursList space={space} />
      </div>
    </div>
  </AdminLocationsLeftPaneDataRow>;
}

export function AdminLocationsOtherLinkedDoorways({space, doorway}: {space: CoreSpace, doorway: CoreDoorway}) {
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
        popupBackground={colorVariables.midnight}
        popupBorder={colorVariables.midnight}
      >
        {spacesOtherThanSelectedSpace.map(space => (
          <div className={styles.doorwayLinkedSpacesPopoverTag}>
            <div className={styles.doorwayLinkedSpacesIcon}>
              <Icons.Link width={20} height={20} color={colorVariables.gray300} />
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

export function AdminLocationsDoorwayList({space, doorways}: {space: CoreSpace, doorways: Array<CoreDoorway>}) {
  const linkedDoorways = doorways.filter(doorway => doorway.spaces.map(s => s.id).indexOf(space.id) > -1);
  return linkedDoorways.length > 0 ? (
    <AdminLocationsLeftPaneDataRow>
      <div className={classnames(styles.doorwayList, {[styles.shaded]: true})}>
        <ListView data={linkedDoorways} padOuterColumns={false}>
          <ListViewColumn
            id="Doorways"
            template={item => <div className={styles.doorwayContainer}>
              <div className={styles.doorwayIcon}>
                <Icons.Doorway width={20} height={20} color={colorVariables.gray700} />
              </div>
              <InfoPopupNew target={<div className={styles.doorway_name}>{item.name}</div>} contents={item.name}></InfoPopupNew>
            </div>}
            width={220}
          />
          <ListViewColumn
            id="Linked spaces"
            template={i => <AdminLocationsOtherLinkedDoorways space={space} doorway={i} />}
            width={200}
          />
          <ListViewColumn
            id="Sensor position"
            align="right"
            template={i => {
              const link = i.spaces.find(x => x.id === space.id);
              return <Fragment>
                {link.sensor_placement !== null ? (
                  <Fragment>
                    <span className={styles.doorwaySensorPosition}>
                      {link.sensor_placement === 1 ? 'Inside' : 'Outside'}
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
