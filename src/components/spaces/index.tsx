import React, { Fragment } from 'react';
import moment from 'moment';
import { formatSpaceFunction } from '@density/lib-space-helpers';

// Stores
import useRxStore from '../../helpers/use-rx-store';
import ActiveModalStore from '../../rx-stores/active-modal';
import DoorwaysStore from '../../rx-stores/doorways';
import SensorsStore from '../../rx-stores/sensors';
import SpacesStore from '../../rx-stores/spaces';
import SpacesPageStore from '../../rx-stores/spaces-page';
import SpaceHierarchyStore from '../../rx-stores/space-hierarchy';
import UserStore from '../../rx-stores/user';

// Actions
import useRxDispatch from '../../helpers/use-rx-dispatch';
import hideModal from '../../rx-actions/modal/hide';

// Components
import {
  AppFrame,
  AppPane,
  AppSidebar,
  Icons,
} from '@density/ui/src';
import colors from '@density/ui/variables/colors.json';
import styles from './styles.module.scss';
import AlertManagementModal from '../alert-management-modal';
import { ExpandedReportModal } from '../dashboard-report';
import { SpaceRightSidebar, SpaceMetaBar, DoorwayMetaBar, DoorwayRightSidebar, SpacesEmptyState } from '../spaces-snippets';
import SpacesNavigation from '../spaces-navigation';
import {
  DailyEntrances,
  DailyExits,
  SpacesReportDateRangePicker,
  EntrancesPerHour,
  AveragePeakOccupancyPerHour,
  DailyPeakOccupancy,
  TimeOccupied,
  OccupancyDistribution,
  MeetingAttendance,
  MeetingSize,
  BookerBehavior,
  DayToDayMeetings,
  SpacesReportTimeSegmentLabelPicker,
  PopularTimes,
} from '../spaces-reports';
import { spacesPageActions } from '../../rx-actions/spaces-page';
import SpacesRawEvents from '../spaces-raw-events';
import { getShownTimeSegmentsForSpace, DEFAULT_TIME_SEGMENT_LABEL } from '../../helpers/time-segments';
import { RepositoryStatus } from '../../types/repository';

// Space functions that render additional reports
const SMALL_ROOM_FUNCTIONS = ['collaboration', 'conference_room', 'focus_quiet', 'meeting_room', 'phone_booth'];
const MEETING_ROOM_FUNCTIONS = ['conference_room', 'meeting_room'];

// Spaces component
export default function Spaces() {
  const dispatch = useRxDispatch();

  const user = useRxStore(UserStore);
  const spaces = useRxStore(SpacesStore);
  const doorways = useRxStore(DoorwaysStore);
  const sensors = useRxStore(SensorsStore);
  const spacesPage = useRxStore(SpacesPageStore);
  const spaceHierarchy = useRxStore(SpaceHierarchyStore);
  const activeModal = useRxStore(ActiveModalStore);

  const selectedSpace = spaces.data.get(spacesPage.spaceId || 'spc_0');
  const selectedDoorway = doorways.data.get(spacesPage.doorwayId || 'drw_0');
  const spaceDoorways = new Map(Array.from(spaces.data.values()).map(x => [x.id, x.doorways]));

  const shownTimeSegments = selectedSpace ? getShownTimeSegmentsForSpace(selectedSpace, spaceHierarchy.data) : [];
  const spaceTimeSegmentLabels = [DEFAULT_TIME_SEGMENT_LABEL, ...shownTimeSegments.map(i => i.label)];

  const spaceNavigationValue = (spacesPage.spaceId && spacesPage.doorwayId) ? {
    type: 'DOORWAY' as const,
    space_id: spacesPage.spaceId,
    doorway_id: spacesPage.doorwayId,
  } : spacesPage.spaceId ? {
    type: 'SPACE' as const,
    space_id: spacesPage.spaceId,
  } : null;

  return <Fragment>
    {activeModal.name === 'MODAL_ALERT_MANAGEMENT' ? (
      <AlertManagementModal />
    ) : null}
    {activeModal.name === 'MODAL_REPORT_EXPANDED' ? (
      <ExpandedReportModal
        visible={activeModal.visible}
        report={activeModal.data.report}
        reportData={activeModal.data.reportData}
        onCloseModal={() => hideModal(dispatch)}
      />
    ) : null}

    <div className={styles.appFrameWrapper}>
      <AppFrame>
        <AppSidebar visible={true} width={spacesPage.navigationCollapsed ? 16 : 265}>
          {(spaces.status === RepositoryStatus.IDLE && spaces.data.size > 0) ? <div
            onClick={() => {
              dispatch(spacesPageActions.setNavigationCollapsed(!spacesPage.navigationCollapsed));
            }}
            style={{
              position: 'absolute',
              left: spacesPage.navigationCollapsed ? 4 : 253,
              transition: 'left 200ms ease-in-out',
              top: 59,
              height: 24,
              borderRadius: 12,
              background: colors.white,
              boxShadow: `0 2px 4px ${colors.midnightTransparent10}`,
              border: `1px solid ${colors.gray200}`,
              cursor: 'pointer'
            }}
          >
            {spacesPage.navigationCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
          </div> : null}
          {spaces.status !== RepositoryStatus.IDLE ?
            <div className={styles.loadingSpaces}>Loading spaces...</div> :
            spaceDoorways ?
              <SpacesNavigation
                value={spaceNavigationValue}
                spaceDoorways={spaceDoorways}
                spaceHierarchy={spaceHierarchy.data}
                spaces={spaces}
                spacesPage={spacesPage}
                setShowDoorways={value => dispatch(spacesPageActions.setShowDoorways(value))}
                setCollapsedSpaces={value => dispatch(spacesPageActions.setCollapsedSpaces(value))}
                navigateToItem={item => {
                  const space = spaces.data.get(item.space_id);
                  if (space && item.type === 'DOORWAY') {
                    window.location.href = `#/spaces/${item.space_id}/doorways/${item.doorway_id}`;
                  } else if (space) {
                    window.location.href = `#/spaces/${item.space_id}`;
                  }
                }}
                isSpaceDisabled={space => {
                  const loadedSpace = spaces.data.get(space.id);
                  return !loadedSpace || !loadedSpace.doorways.length;
                }}
              /> :
              null
          }
        </AppSidebar>
        {selectedSpace ? <AppPane>
          {selectedDoorway ? 
            <DoorwayMetaBar sensorsByDoorway={sensors.data.byDoorway} selectedSpace={selectedSpace} selectedDoorway={selectedDoorway} /> :
            <SpaceMetaBar selectedSpace={selectedSpace} spaces={spaces.data} doorways={doorways.data} user={user.data} />}
          <div style={{display: 'flex', height: 'calc(100% - 128px)'}}>
            <div style={{
              flexGrow: 1,
              flexShrink: 1,
              overflowX: 'auto',
              backgroundColor: '#FAFBFC',
              position: 'relative',
              paddingBottom: 64,
            }}>
              <div style={{padding: '0 24px 24px 24px', position: 'relative'}}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  position: 'fixed',
                  zIndex: 1,
                  width: 'calc(100% - 265px - 384px - 48px)',
                  paddingBottom: 8,
                  paddingTop: 16,
                  marginTop: -32,
                  backgroundColor: '#FAFBFC'
                }}>
                  <SpacesReportTimeSegmentLabelPicker
                    timeSegmentLabel={spacesPage.timeSegmentLabel}
                    spaceTimeSegmentLabels={spaceTimeSegmentLabels}
                    shownTimeSegments={shownTimeSegments}
                    selectedSpace={selectedSpace}
                    onChange={value => dispatch(spacesPageActions.setTimeSegmentLabel(value))}
                  />
                  <div style={{width: 8}}></div>
                  <SpacesReportDateRangePicker
                    startDate={spacesPage.startDate}
                    endDate={spacesPage.endDate}
                    space={selectedSpace}
                    onChange={value => {
                      dispatch(spacesPageActions.setReportDates(value.startDate, value.endDate));
                    }}
                  />
                  {/* <SpacesReportTimeFilterPicker
                    timeFilter={spacesPage.timeFilter}
                    onChange={value => dispatch(spacesPageActions.setTimeFilter(value))}
                  /> */}
                </div>
                <div style={{marginTop: 32, paddingTop: 64}}>
                  <h1 className={styles.spaceReportHeader}>
                    {selectedDoorway ?
                      'How busy is this Doorway?' : 
                      `How many people visit this ${selectedSpace.function ? formatSpaceFunction(selectedSpace.function) : 'Space'}?`}
                  </h1>

                  {/* All spaces have "entrances per day" */}
                  <DailyEntrances
                    space={selectedSpace}
                    doorway={selectedDoorway}
                    startDate={spacesPage.startDate}
                    endDate={spacesPage.endDate}
                    timeSegmentLabel={spacesPage.timeSegmentLabel}
                  />

                  {/* Doorways have "exits per day", spaces have three other reports */}
                  {selectedDoorway ? 
                    <DailyExits
                      space={selectedSpace}
                      doorway={selectedDoorway}
                      startDate={spacesPage.startDate}
                      endDate={spacesPage.endDate}
                      timeSegmentLabel={spacesPage.timeSegmentLabel}
                    /> :
                    <Fragment>
                      <EntrancesPerHour
                        space={selectedSpace}
                        startDate={spacesPage.startDate}
                        endDate={spacesPage.endDate}
                        timeSegmentLabel={spacesPage.timeSegmentLabel}
                      />
                      <h1 className={styles.spaceReportHeader}>
                        How busy does this {selectedSpace.function ? formatSpaceFunction(selectedSpace.function) : 'Space'} get?
                      </h1>
                      <AveragePeakOccupancyPerHour
                        space={selectedSpace}
                        startDate={spacesPage.startDate}
                        endDate={spacesPage.endDate}
                        timeSegmentLabel={spacesPage.timeSegmentLabel}
                      />
                      <DailyPeakOccupancy
                        space={selectedSpace}
                        startDate={spacesPage.startDate}
                        endDate={spacesPage.endDate}
                        timeSegmentLabel={spacesPage.timeSegmentLabel}
                      />
                    </Fragment>
                  }

                  {/* Small spaces have additional reports */}
                  {!selectedDoorway && SMALL_ROOM_FUNCTIONS.includes(selectedSpace.function || '') ? <Fragment>
                    <h1 className={styles.spaceReportHeader}>
                      How is this {selectedSpace.function ? formatSpaceFunction(selectedSpace.function) : 'Space'} used?
                    </h1>
                    <TimeOccupied
                      space={selectedSpace}
                      startDate={spacesPage.startDate}
                      endDate={spacesPage.endDate}
                      timeSegmentLabel={spacesPage.timeSegmentLabel}
                    />
                    <OccupancyDistribution
                      space={selectedSpace}
                      startDate={spacesPage.startDate}
                      endDate={spacesPage.endDate}
                      timeSegmentLabel={spacesPage.timeSegmentLabel}
                    />
                    {/* Note: This might not work with overnight segments */}
                    <PopularTimes
                      space={selectedSpace}
                      startDate={spacesPage.startDate}
                      endDate={spacesPage.endDate}
                      timeSegmentLabel={spacesPage.timeSegmentLabel}
                    />
                  </Fragment> : null}

                  {/* Meeting rooms have additional reports */}
                  {(!selectedDoorway &&
                    MEETING_ROOM_FUNCTIONS.includes(selectedSpace.function || '') &&
                    selectedSpace.space_mappings.length > 0) ? <Fragment>
                    <h1 className={styles.spaceReportHeader}>
                      How is this {selectedSpace.function ? formatSpaceFunction(selectedSpace.function) : 'Space'} used for meetings?
                    </h1>
                    <MeetingAttendance
                      space={selectedSpace}
                      startDate={spacesPage.startDate}
                      endDate={spacesPage.endDate}
                      timeSegmentLabel={spacesPage.timeSegmentLabel}
                    />
                    <MeetingSize
                      space={selectedSpace}
                      startDate={spacesPage.startDate}
                      endDate={spacesPage.endDate}
                      timeSegmentLabel={spacesPage.timeSegmentLabel}
                    />
                    <BookerBehavior
                      space={selectedSpace}
                      startDate={spacesPage.startDate}
                      endDate={spacesPage.endDate}
                      timeSegmentLabel={spacesPage.timeSegmentLabel}
                    />
                    <DayToDayMeetings
                      space={selectedSpace}
                      startDate={spacesPage.startDate}
                      endDate={spacesPage.endDate}
                      timeSegmentLabel={spacesPage.timeSegmentLabel}
                    />
                  </Fragment> : null}

                  {/* Raw events list has its own paging, etc logic */}
                  <h1 className={styles.spaceReportHeader}>
                    All data at this {selectedDoorway ? 'Doorway' : selectedSpace.function ? formatSpaceFunction(selectedSpace.function) : 'Space'}
                  </h1>
                  <SpacesRawEvents />
                </div>
              </div>
            </div>
            <div className={styles.spaceDetailBar}>
              {selectedDoorway ?
                <DoorwayRightSidebar
                  spaces={spaces.data}
                  selectedSpace={selectedSpace}
                  selectedDoorway={selectedDoorway}
                  doorwayMappings={spacesPage.doorwayMappings} /> :
                <SpaceRightSidebar
                  sensorsByDoorway={sensors.data.byDoorway}
                  dailyOccupancy={spacesPage.dailyOccupancy}
                  selectedSpace={selectedSpace}
                  localDate={moment.tz(spacesPage.dailyDate, selectedSpace?.time_zone)}
                  isToday={spacesPage.dailyDate === moment().format('YYYY-MM-DD')} />}
            </div>
          </div>
        </AppPane> : null}
        {spaces.status === RepositoryStatus.IDLE && spaces.data.size === 0 ? <SpacesEmptyState /> : null}
      </AppFrame>
    </div>
  </Fragment>;
}
