import React, { Fragment, useEffect } from 'react';
import { Moment } from 'moment';
import classnames from 'classnames';
import commaNumber from 'comma-number';
import colors from '@density/ui/variables/colors.json';
import spacing from '@density/ui/variables/spacing.json';
import styles from './styles.module.scss';

import { CoreSpace, CoreSpaceType, CoreSpaceFunction } from '@density/lib-api-types/core-v2/spaces';
import { Icons, ListView, ListViewColumn, AppScrollView, AppBarContext, AppBar, AppBarSection, AppBarTitle, Button, AppPane } from '@density/ui/src';
import SpacesLiveEvents from '../spaces-live-events';
import SpaceDailyOccupancy from '../spaces-daily-occupancy';
import { OperatingHoursList } from '../admin-locations-snippets';

import { loadDailyOccupancy } from '../../rx-actions/spaces-page/operations';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import { CoreUser } from '@density/lib-api-types/core-v2/users';
import AlertPopupList from '../alert-popup-list';
import { CoreDoorway, CoreDoorwaySpace } from '@density/lib-api-types/core-v2/doorways';
import { SpacesState } from '../../rx-stores/spaces';
import { DoorwaysState } from '../../rx-stores/doorways';
import { SensorsState } from '../../rx-stores/sensors';
import { getStatusText, getStatusColor } from '../admin-device-status';
import InfoPopupNew from '../info-popup-new';
import SpacesGraphic from './graphic';
import { SpacesPageState } from '../../rx-stores/spaces-page/reducer';

export function SpacesEmptyState() {
  return <AppPane>
    <div style={{
      margin: 24,
      padding: 40,
      borderRadius: spacing.borderRadiusBase,
      backgroundColor: colors.blueLight,
    }}>
      <div style={{fontSize: 24, fontWeight: 500, color: colors.midnight}}>Spaces</div>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <div style={{marginTop: 40, flexShrink: 1, minWidth: 300}}>
          <div>Hierarchical insights on your Density spaces and doorways.</div>
          <div style={{marginTop: 8}}>Create spaces in <a href="#/admin/locations" style={{color: colors.blueDark}}>Location Management.</a></div>
        </div>
        <div style={{
          marginTop: -40,
          marginBottom: -40,
          marginRight: -40,
          marginLeft: 32,
          height: 190,
          width: 500,
          overflow: 'hidden',
          borderRadius: spacing.borderRadiusBase
        }}><SpacesGraphic /></div>
      </div>
    </div>
    <div style={{margin: 24, marginTop: 64}}>
      You haven't created any spaces yet.
      <div style={{display: 'flex', marginTop: 24}}>
        <Button href="#/admin/locations">Create your first space</Button>
        <div style={{width: 8}}></div>
        <Button href="https://help.density.io/en/articles/3380938-how-to-create-a-doorway-in-dashboard" target="blank" variant="underline">
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Icons.Study />
            <div style={{marginLeft: 8}}>How to create spaces</div>
          </div>
        </Button>
      </div>
    </div>
  </AppPane>
}

export function SensorStatusLabel({status}: {status: string}) {
  return <Fragment>
    {getStatusText(status)}
    <div style={{width: 4, height: 4}}></div>
    <div style={{
      width:6,
      height: 6,
      marginTop: 2,
      borderRadius: 3,
      backgroundColor: getStatusColor(status),
    }}></div>
  </Fragment>;
}

export function SpaceIcon({space, color=colors.gray400, small=false}: {space: CoreSpace, color?: string, small?: boolean}) {
  const size = small ? 18 : 24;
  switch (space?.space_type) {
    case CoreSpaceType.BUILDING:
      return <Icons.Building width={size} height={size} color={color} />;
    case CoreSpaceType.FLOOR:
      return <Icons.Floor width={size} height={size} color={color} />;
    case CoreSpaceType.SPACE:
      switch (space?.function) {
        case CoreSpaceFunction.BREAK_ROOM:
          return <Icons.Breakroom width={size} height={size} color={color} />;
        case CoreSpaceFunction.CAFE:
          return <Icons.Cafeteria width={size} height={size} color={color} />;
        case CoreSpaceFunction.COLLABORATION:
          return <Icons.BreakoutRoom width={size} height={size} color={color} />;
        case CoreSpaceFunction.CONFERENCE_ROOM:
          return <Icons.ConferenceRoom width={size} height={size} color={color} />;
        case CoreSpaceFunction.DINING_AREA:
          return <Icons.Cafeteria width={size} height={size} color={color} />;
        case CoreSpaceFunction.EVENT_SPACE:
          return <Icons.EventSpace width={size} height={size} color={color} />;
        case CoreSpaceFunction.FOCUS_QUIET:
          return <Icons.Study width={size} height={size} color={color} />;
        case CoreSpaceFunction.GYM:
          return <Icons.Gym width={size} height={size} color={color} />;
        case CoreSpaceFunction.KITCHEN:
          return <Icons.Kitchen width={size} height={size} color={color} />;
        case CoreSpaceFunction.LAB:
          return <Icons.Lab width={size} height={size} color={color} />;
        case CoreSpaceFunction.LIBRARY:
          return <Icons.Study width={size} height={size} color={color} />;
        case CoreSpaceFunction.LOUNGE:
          return <Icons.Lounge width={size} height={size} color={color} />;
        case CoreSpaceFunction.MEETING_ROOM:
          return <Icons.ConferenceRoom width={size} height={size} color={color} />;
        case CoreSpaceFunction.OFFICE:
          return <Icons.Lobby width={size} height={size} color={color} />;
        case CoreSpaceFunction.PHONE_BOOTH:
          return <Icons.CallRoom width={size} height={size} color={color} />;
        case CoreSpaceFunction.PLACE_OF_WORSHIP:
          return <Icons.Study width={size} height={size} color={color} />;
        case CoreSpaceFunction.RECEPTION:
          return <Icons.Lobby width={size} height={size} color={color} />;
        case CoreSpaceFunction.RESTROOM:
          return <Icons.RestroomUnisex width={size} height={size} color={color} />;
        case CoreSpaceFunction.RETAIL:
          return <Icons.Space width={size} height={size} color={color} />;
        case CoreSpaceFunction.THEATER:
          return <Icons.Theater width={size} height={size} color={color} />;
        case CoreSpaceFunction.WELLNESS_ROOM:
          return <Icons.BabyChanging width={size} height={size} color={color} />;
        default:
          return <Icons.Space width={size} height={size} color={color} />;
      }
    default:
      return null;
  }
}

export function SpaceMetaField({
  label,
  value,
  tooltip,
  tooltipPlacement='bottom-start',
  compact=false,
}: {
  label: React.ReactNode,
  value: React.ReactNode,
  tooltip?: React.ReactNode,
  tooltipPlacement?: 'bottom-start' | 'bottom-end',
  compact?: boolean,
}) {
  const common = <Fragment>
    <div style={{fontSize: 12, fontWeight: 600, color: colors.gray400, height: 16}}>{label}</div>
    <div style={{fontSize: 18, fontWeight: 500, display: 'flex', alignItems: 'center'}}>
      {value !== undefined ? value : '--'}
    </div>
  </Fragment>;

  return <div className={classnames(styles.spaceMetaField, { [styles.compact]: compact })}>
    {tooltip ? <InfoPopupNew target={common} contents={tooltip} placement={tooltipPlacement} /> : common}
  </div>;
}

export default function SpaceDetailCard({
  background = colors.white,
  border = `1px solid ${colors.grayLight}`,
  titleColor = colors.midnight,
  titleBorderColor = colors.gray200,
  actions = null as React.ReactNode | string | null,
  title,
  children,
}: {
  background?: string,
  border?: string,
  titleColor?: string,
  titleBorderColor?: string,
  actions?: React.ReactNode | string | null,
  title: React.ReactNode,
  children?: React.ReactNode,
}) {
  return <div style={{
    width: 304,
    marginTop: 16,
    padding: 16,
    fontSize: 14,
    borderRadius: spacing.borderRadiusBase,
    border,
    background,
    overflow: 'auto',
  }}>
    <div style={{
      borderBottom: `1px solid ${titleBorderColor}`,
      marginBottom: 8,
      paddingBottom: 8,
      fontSize: 12,
      fontWeight: 600,
      color: colors.midnight,
      display: 'flex',
      justifyContent: 'space-between',
    }}>
      <div style={{display: 'flex', color: titleColor}}>{title}</div>
      {actions ? <div style={{display: 'flex', color: titleColor}}>{actions}</div> : null}
    </div>
    {children}
  </div>;
}

export function SpaceDetailCardLoading({height}: {height?: number}) {
  return <div style={{
    height: height || 143,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.gray400,
    fontWeight: 600
  }}>Loading...</div>
}

export function SpaceMetaBar({
  selectedSpace,
  spaces,
  doorways,
  user
}: {
  spaces: SpacesState['data'],
  doorways: DoorwaysState['data'],
  selectedSpace: CoreSpace,
  user: CoreUser | null,
}) {

  const linkedDoorwayIds = selectedSpace.doorways.map(x => x.id);
  const linkedSensorSerials = Array.from(doorways.values()).filter(doorway => (
    linkedDoorwayIds.includes(doorway.id) &&
    doorway.sensor_serial_number !== null
  )).map(x => x.sensor_serial_number);

  const descendantSpaces = Array.from(spaces.values()).filter(space => (
    space.ancestry.some(x => x.id === selectedSpace.id)
  ));

  return <Fragment>
    <AppBarContext.Provider value="TRANSPARENT">
      <AppBar>
        <AppBarSection>
          <AppBarTitle>
            <SpaceIcon space={selectedSpace} color={colors.midnight} />
            <div
              style={{marginLeft: 8}}
              className="density-space-name"
              {...{
                'data-density-space-type': selectedSpace.space_type,
                'data-density-space-function': selectedSpace.function,
              }}
            >{selectedSpace.name}</div>
          </AppBarTitle>
        </AppBarSection>
        {((user as Any<FixInRefactor>)?.permissions || []).includes('core_write') ? (
          <AppBarSection>
            <AlertPopupList selectedSpace={selectedSpace} />
            <div style={{width: 8}}></div>
            <InfoPopupNew
              placement="bottom-end"
              contents="Open in Analytics"
              // TODO: make this open the space in a new report
              target={<Button onClick={() => {
                localStorage.sessionAnalyticsPreload = JSON.stringify({spaceIds: [selectedSpace.id]});
                window.location.href = `#/analytics`;
              }}>
                <div style={{marginTop: 7, marginLeft: -7, marginRight: -7}}>
                  <Icons.ReportShare />
                </div>
              </Button>}
            />
            <div style={{width: 8}}></div>
            <InfoPopupNew
              placement="bottom-end"
              contents="Manage Space"
              target={<Button onClick={() => window.location.href = `#/admin/locations/${selectedSpace.id}`}>
                <div style={{marginTop: 7, marginLeft: -7, marginRight: -7}}>
                  <Icons.Cog />
                </div>
              </Button>}
            />
          </AppBarSection>
        ) : null}
      </AppBar>
    </AppBarContext.Provider>
    <AppBar>
      <AppBarSection>
        <div style={{display: 'flex'}}>
          <SpaceMetaField
            label="Target Capacity"
            value={commaNumber(selectedSpace.target_capacity) || '--'}
            tooltip="The number of people this space should hold by design. Synonymous with “seats”." />
          <SpaceMetaField
            label="Legal Capacity"
            value={commaNumber(selectedSpace.capacity) || '--'}
            tooltip="The number of people this space can legally hold." />
          <SpaceMetaField
            label="Spaces"
            value={commaNumber(descendantSpaces.length)}
            tooltip="The number of descendant spaces contained within this parent space." />
          <SpaceMetaField
            label="Doorways"
            value={commaNumber(linkedDoorwayIds.length)}
            tooltip="The number of doorways linked to this space." />
          <SpaceMetaField
            label="Sensors"
            value={commaNumber(linkedSensorSerials.length)}
            tooltip="The number of sensors counting this space." />
          <SpaceMetaField
            label="Size Area"
            value={commaNumber(selectedSpace.size_area) || '--'}
            tooltip="The total size of this space, in square feet." />
          <SpaceMetaField
            label="Annual Rent"
            value={selectedSpace.annual_rent !== null ? '$' + commaNumber(selectedSpace.annual_rent) : '--'}
            tooltip="The rent for this space, annualized." />
        </div>
      </AppBarSection>
      <AppBarSection>
        <SpaceMetaField
          label="Time Zone"
          value={selectedSpace.time_zone}
          tooltip="The time zone this space operates in."
          tooltipPlacement="bottom-end" />
      </AppBarSection>
    </AppBar>
  </Fragment>
}

export function SpaceRightSidebar({
  sensorsByDoorway,
  dailyOccupancy,
  selectedSpace,
  localDate,
  isToday
}: {
  sensorsByDoorway: SensorsState['data']['byDoorway'],
  dailyOccupancy: SpacesPageState['dailyOccupancy'],
  selectedSpace: CoreSpace,
  localDate: Moment,
  isToday: boolean
}) {
  const dispatch = useRxDispatch();
  const hasRoomBooking = selectedSpace.space_mappings.length > 0;

  // Primitive (string) dependencies for useEffect hook
  const spaceId = selectedSpace.id;
  const spaceTimeZone = selectedSpace.time_zone;
  const dateString = localDate.format('YYYY-MM-DD');

  // Refresh daily occupancy every 5 minutes
  useEffect(() => {
    const dailyOccupancyRefreshHandle = setInterval(() => {
      loadDailyOccupancy(dispatch, spaceId, spaceTimeZone, dateString);
    }, 300000);
    return () => clearInterval(dailyOccupancyRefreshHandle);
  }, [dispatch, spaceId, spaceTimeZone, dateString]);

  return <AppScrollView backgroundColor="#FAFBFC">
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, paddingBottom: 64}}>
      <SpaceDetailCard
        title="Live Events"
        actions={<span style={{color: colors.gray400}}>Today</span>}
      >
        <SpacesLiveEvents space={selectedSpace} />
      </SpaceDetailCard>
      <SpaceDetailCard
        title="Daily Occupancy"
        actions={<div style={{display: 'flex'}}>
          <div
            style={{marginTop: -6, marginBottom: -7, cursor: 'pointer'}}
            onClick={() => loadDailyOccupancy(
              dispatch,
              selectedSpace.id,
              selectedSpace.time_zone,
              localDate.clone().subtract(1, 'day').format('YYYY-MM-DD')
            )}
          ><Icons.ChevronLeft /></div>
          <div style={{color: colors.gray400, width: 40, textAlign: 'center', userSelect: 'none'}}>
            {isToday ? 'Today' : localDate.format('MMM D')}
          </div>
          <div
            style={{marginTop: -6, marginBottom: -7, cursor: isToday ? undefined : 'pointer'}}
            onClick={() => !isToday && loadDailyOccupancy(
              dispatch,
              selectedSpace.id,
              selectedSpace.time_zone,
              localDate.clone().add(1, 'day').format('YYYY-MM-DD')
            )}
          ><Icons.ChevronRight color={isToday ? colors.gray400 : undefined} /></div>
        </div>}
      >
        <SpaceDailyOccupancy
          space={selectedSpace}
          date={localDate}
          isToday={isToday}
          dailyOccupancy={dailyOccupancy}
        />
      </SpaceDetailCard>
      <SpaceDetailCard
        background={colors.gray100}
        titleBorderColor={colors.gray300}
        title={<Fragment>
          <div style={{width:160}}>Doorways</div>
          <div style={{width:80}}>Position</div>
          <div style={{width:60}}>Status</div>
        </Fragment>}
      >
        {selectedSpace.doorways.map(doorway => {
          const sensorStatus = sensorsByDoorway.get(doorway.id)?.status;
          return <Fragment key={`${selectedSpace.id}-${doorway.id}`}>
            <div
              style={{display: 'flex', alignItems: 'center', cursor: 'pointer', marginTop: 13}}
              onClick={() => window.location.href = `#/spaces/${selectedSpace.id}/doorways/${doorway.id}`}
            >
              <InfoPopupNew
                contents={doorway.name}
                target={<div style={{
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  textDecoration: 'underline',
                  overflow: 'hidden',
                  color: colors.blue,
                  width: 300,
                }}>{doorway.name}</div>}
              />
            </div>
            <div className={styles.spaceDoorwayListDeviceInfoRow}>
              <div style={{width:160, display: 'flex', alignItems: 'center'}}>
                <Icons.DeviceSide height={16} width={16} color={colors.gray400} />
                &nbsp;
                {sensorStatus ? sensorsByDoorway.get(doorway.id)?.serial_number : '--'}
              </div>
              <div style={{width:80, display: 'flex', alignItems: 'center'}}>
                {sensorStatus ? doorway.sensor_placement === 1 ? 'Inside' : 'Outside' : '--'}
              </div>
              <div style={{width:60, display: 'flex', alignItems: 'center'}}>
                {sensorStatus ? <SensorStatusLabel status={sensorStatus} /> : '--'}
              </div>
            </div>
          </Fragment>;
        })}
      </SpaceDetailCard>
      <SpaceDetailCard background={colors.gray100} titleBorderColor={colors.gray300} title="Operating Hours">
        <div style={{overflowX: 'auto'}}>
          <OperatingHoursList space={selectedSpace} />
        </div>
      </SpaceDetailCard>
      {selectedSpace.tags.length ? <SpaceDetailCard background={colors.gray100} titleBorderColor={colors.gray300} title="Tags">
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          paddingTop: 4,
          marginBottom: -8
        }}>
          {selectedSpace.tags.map(tag => <div key={tag} style={{
            background: colors.blueLight,
            borderRadius: spacing.borderRadiusBase,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            fontSize: 14,
            fontWeight: 500,
            color: colors.gray700,
            height: 28,
            paddingLeft: 8,
            paddingRight: 8,
            marginBottom: 8,
            marginRight: 8,
          }}>{tag}</div>)}
        </div>
      </SpaceDetailCard> : null}
      <SpaceDetailCard
        background={hasRoomBooking ? colors.gray100 : colors.blueLight}
        titleBorderColor={colors.gray400}
        title="Room Booking"
      >
        <p style={{fontSize: 16}}>
          {hasRoomBooking ?
          'Room booking data is enabled for this space.' :
          'Connect to your room booking service to unlock reports about meetings.'}
        </p>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 16}}>
          <Button href="#/admin/integrations">
            <div style={{display: 'flex', alignItems: 'center'}}>
              <Icons.Calendar color={colors.blueDark} />
              &nbsp;
              {hasRoomBooking ? 'Manage this integration' : 'Integrate room booking'}
            </div>
          </Button>
        </div>
      </SpaceDetailCard>
    </div>
  </AppScrollView>
}


export function DoorwayDetailSpaceList({doorwaySpaces, spaces}: {doorwaySpaces: Array<CoreDoorwaySpace>, spaces: ReadonlyMap<string, CoreSpace>}) {
  return <div style={{marginTop: -8, marginBottom: -16}}>
    <ListView data={doorwaySpaces} showHeaders={false} rowHeight={40}>
      <ListViewColumn
        id="Spaces"
        onClick={item => window.location.href = `#/spaces/${item.id}`}
        template={item => {
          const space = spaces.get(item.id);
          return <span style={{fontSize: 14, display: 'flex', alignItems: 'center'}}> 
            {space ? <SpaceIcon small={true} space={space} /> : null}
            <div style={{width: 8}}></div>
            <InfoPopupNew
              contents={item.name}
              target={<div style={{
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                textDecoration: 'underline',
                overflow: 'hidden',
                color: colors.blue,
                width: 177,
              }}>{item.name}</div>}
            />
          </span>
        }}
      />
      <ListViewColumn
        id="Sensor position"
        align="right"
        template={i => i.sensor_placement !== null ? <span style={{fontSize: 14}}>
          {i.sensor_placement === 1 ? 'Inside' : 'Outside'}
        </span> : '&mdash;'}
        width={60}
      />
    </ListView>
  </div>;
}

export function DoorwayMetaBar({
  sensorsByDoorway,
  selectedSpace,
  selectedDoorway
}: {
  sensorsByDoorway: SensorsState['data']['byDoorway'],
  selectedSpace: CoreSpace,
  selectedDoorway: CoreDoorway,
}) {
  const sensorStatus = sensorsByDoorway.get(selectedDoorway.id)?.status;
  return <Fragment>
    <AppBarContext.Provider value="TRANSPARENT">
      <AppBar>
        <AppBarSection>
          <AppBarTitle>
            <Icons.Doorway color={colors.midnight} />
            <div style={{marginLeft: 8}}>{selectedDoorway.name}</div>
          </AppBarTitle>
        </AppBarSection>
      </AppBar>
    </AppBarContext.Provider>
    <AppBar>
      <AppBarSection>
        <div style={{display: 'flex'}}>
          <SpaceMetaField
            label="Sensor Serial"
            value={selectedDoorway.sensor_serial_number || '--'}
            tooltip="The serial number of the sensor attached to this doorway." />
          <SpaceMetaField
            label="Status"
            value={sensorStatus ? <SensorStatusLabel status={sensorStatus} /> : '--'}
            tooltip="The current status of the sensor attached to this doorway." />
        </div>
      </AppBarSection>
      <AppBarSection>
        <SpaceMetaField
          label="Time Zone"
          value={selectedSpace.time_zone}
          tooltip="The time zone this doorway's space operates in."
          tooltipPlacement="bottom-end" />
      </AppBarSection>
    </AppBar>
  </Fragment>
}

export function DoorwayRightSidebar({
  spaces,
  selectedSpace,
  selectedDoorway,
  doorwayMappings
}: {
  spaces: ReadonlyMap<string, CoreSpace>,
  selectedSpace: CoreSpace,
  selectedDoorway: CoreDoorway,
  doorwayMappings: SpacesPageState['doorwayMappings'],
}) {
  const hasAccessControl = doorwayMappings.has(selectedDoorway.id);
  return <AppScrollView backgroundColor="#FAFBFC">
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, paddingBottom: 64}}>
      <SpaceDetailCard
        title="Live Events"
        actions={<span style={{color: colors.gray400}}>Today</span>}
      >
        <SpacesLiveEvents space={selectedSpace} doorway={selectedDoorway} />
      </SpaceDetailCard>
      <SpaceDetailCard background={colors.gray100} titleBorderColor={colors.gray300} title="Spaces" actions="Sensor Position">
        <DoorwayDetailSpaceList spaces={spaces} doorwaySpaces={selectedDoorway.spaces} />
      </SpaceDetailCard>
      <SpaceDetailCard
        background={hasAccessControl ? colors.gray100 : colors.blueLight}
        titleBorderColor={colors.gray400}
        title="Access Control"
      >
        <p style={{fontSize: 16}}>
          {hasAccessControl ?
            'Access control is enabled for this doorway.' :
            'You haven’t linked this doorway to an access control provider.'}
        </p>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 16}}>
          <Button href="#/admin/integrations">
            <div style={{display: 'flex', alignItems: 'center'}}>
              <Icons.Calendar color={colors.blueDark} />
              &nbsp;
              {hasAccessControl ? 'Manage access control' : 'Integrate access control'}
            </div>
          </Button>
        </div>
      </SpaceDetailCard>
    </div>
  </AppScrollView>
}
