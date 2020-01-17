import React from 'react';
import classnames from 'classnames';

import styles from './styles.module.scss';

import {
  Card,
  CardHeader,
  CardLoading,
  CardTable,
  Icons,
  InfoPopup,
} from '@density/ui/src';

import RawEventsPager from '../explore-space-detail-raw-events-pager/index';
import { calculateDailyRawEvents, DAILY_RAW_EVENTS_PAGE_SIZE } from '../../rx-actions/route-transition/explore-space-daily';
import collectionSpacesFilter from '../../rx-actions/collection/spaces-legacy/filter';

import { parseISOTimeAtSpace } from '../../helpers/space-time-utilities/index';
import useRxStore from '../../helpers/use-rx-store';
import ExploreDataStore from '../../rx-stores/explore-data';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import SpacesStore from '../../rx-stores/spaces';

export const LOADING = 'LOADING',
      EMPTY = 'EMPTY',
      VISIBLE = 'VISIBLE',
      ERROR = 'ERROR';

export function ExploreSpaceDetailRawEventsCardRaw({
  space,
  spaces,
  date,
  timeSegmentLabel,
  calculatedData,

  onRefresh,
  onChangePage,
}) {
  return (
    <div>
      <Card className={styles.exploreSpaceDetailRawEventsCard}>
        {calculatedData.state === 'LOADING' ? <CardLoading indeterminate /> : null}
        <CardHeader>
          Daily Raw Events
          <InfoPopup horizontalIconOffset={8}>
            <p className={styles.exploreSpaceDetailRawEventsCardPopupP}>
              All events at this space on{' '}
              <strong>{parseISOTimeAtSpace(date, space).format('MMMM D, YYYY')}</strong> during{' '}
              the time segment <strong>{timeSegmentLabel}</strong>.
            </p>

            <p className={styles.exploreSpaceDetailRawEventsCardPopupP}>
              Head to the <a href={`#/spaces/${space.id}/data-export`}>data export</a> page
              to download multiple days worth of event data in csv format.
            </p>
          </InfoPopup>
          <span
            className={classnames(styles.exploreSpaceDetailRawEventsCardHeaderRefresh, {
              disabled: !(calculatedData.state === 'COMPLETE' || calculatedData.state === EMPTY),
            })}
            onClick={() => onRefresh(space)}
          >
            <Icons.Refresh color={calculatedData.state === 'LOADING' ? 'gray' : 'primary'} />
          </span>
        </CardHeader>

        {calculatedData.state === 'COMPLETE' ? <CardTable
          headings={["Timestamp", "Event", "Doorway"]}
          data={calculatedData.data.data || []}
          mapDataItemToRow={item => [
            parseISOTimeAtSpace(item.timestamp, space).format('MMM Do YYYY, h:mm:ss a'),
            item.direction === 1 ? 'Entrance' : 'Exit',
            calculatedData.data.doorwayLookup[item.doorway_id] ? calculatedData.data.doorwayLookup[item.doorway_id].name : item.doorway_id,
          ]}
        /> : null}

        {calculatedData.state === 'COMPLETE' && (calculatedData.data.data || []).length === 0 ? <div className={styles.exploreSpaceDetailRawEventsCardBodyInfo}>
          No data available for this time period.
        </div> : null}
        {calculatedData.state === 'LOADING' ? <div className={styles.exploreSpaceDetailRawEventsCardBodyInfo}>
          Fetching events...
        </div> : null}
        {calculatedData.state === 'ERROR' ? <div className={styles.exploreSpaceDetailRawEventsCardBodyError}>
          <span>
            <span className={styles.exploreSpaceDetailRawEventsCardBodyErrorIcon}>&#xe91a;</span>
            {calculatedData.error.toString()}
          </span>
        </div> : null}
      </Card>

      <RawEventsPager
        disabled={calculatedData.state !== 'COMPLETE'}
        loading={calculatedData.state === 'LOADING'}
        page={spaces.filters.dailyRawEventsPage}
        totalPages={calculatedData.state === 'COMPLETE' ? Math.ceil(calculatedData.data.total / DAILY_RAW_EVENTS_PAGE_SIZE) : 0}
        totalEvents={calculatedData.state === 'COMPLETE' ? calculatedData.data.total : 0}
        onChange={page => onChangePage(space, page)}
      />
    </div>
  );
}


// FIXME: these props come from wherever this gets used
const ConnectedExploreSpaceDetailRawEventsCard: React.FC<Any<FixInRefactor>> = (externalProps) => {
  
  const dispatch = useRxDispatch();
  const spaces = useRxStore(SpacesStore);
  const exploreData = useRxStore(ExploreDataStore);

  const calculatedData = exploreData.calculations.dailyRawEvents;

  const onRefresh = async (space) => {
    dispatch(collectionSpacesFilter('dailyRawEventsPage', 1) as Any<FixInRefactor>);
    await calculateDailyRawEvents(dispatch, space);
  };
  const onChangePage = async (space, page) => {
    dispatch(collectionSpacesFilter('dailyRawEventsPage', page) as Any<FixInRefactor>);
    await calculateDailyRawEvents(dispatch, space);
  }
  
  return (
    <ExploreSpaceDetailRawEventsCardRaw
      {...externalProps}
      spaces={spaces}
      calculatedData={calculatedData}
      onRefresh={onRefresh}
      onChangePage={onChangePage}
    />
  )
}
export default ConnectedExploreSpaceDetailRawEventsCard;
