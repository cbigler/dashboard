import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import Card, { CardHeader, CardLoading, CardTable } from '@density/ui-card';
import { IconRefresh } from '@density/ui-icons';
import InfoPopup from '@density/ui-info-popup';

import RawEventsPager from '../explore-space-detail-raw-events-pager/index';
import { calculateDailyRawEvents, DAILY_RAW_EVENTS_PAGE_SIZE } from '../../actions/route-transition/explore-space-daily';
import collectionSpacesFilter from '../../actions/collection/spaces/filter';

import { parseISOTimeAtSpace } from '../../helpers/space-time-utilities/index';

export const LOADING = 'LOADING',
      EMPTY = 'EMPTY',
      VISIBLE = 'VISIBLE',
      ERROR = 'ERROR';

export function ExploreSpaceDetailRawEventsCard({
  space,
  spaces,
  date,
  timeSegmentGroup,
  calculatedData,

  onRefresh,
  onChangePage,
}) {
  return (
    <div>
      <Card className="explore-space-detail-raw-events-card">
        {calculatedData.state === 'LOADING' ? <CardLoading indeterminate /> : null}
        <CardHeader>
          Daily Raw Events
          <InfoPopup horizontalIconOffset={8}>
            <p className="explore-space-detail-raw-events-card-popup-p">
              All events that the doorways within this space have seen over{' '}
              <strong>{parseISOTimeAtSpace(date, space).format('MM/DD/YYYY')}</strong> during{' '}
              the time segment <strong>{timeSegmentGroup.name}</strong>.
            </p>

            <p className="explore-space-detail-raw-events-card-popup-p">
              Head to the <a href={`#/spaces/explore/${space.id}/data-export`}>data export</a> page
              to download multiple days worth of event data in csv format.
            </p>
          </InfoPopup>
          <span
            className={classnames('explore-space-detail-raw-events-card-header-refresh', {
              disabled: !(calculatedData.state === 'COMPLETE' || calculatedData.state === EMPTY),
            })}
            onClick={() => onRefresh(space)}
          >
            <IconRefresh color={calculatedData.state === 'LOADING' ? 'gray' : 'primary'} />
          </span>
        </CardHeader>

        {calculatedData.state === 'COMPLETE' ? <CardTable
          headings={["Timestamp", "Event", "Doorway"]}
          data={calculatedData.data.data || []}
          mapDataItemToRow={item => [
            parseISOTimeAtSpace(item.timestamp, space).format('MMM Do YYYY, h:mm:ss a'),
            item.direction === 1 ? 'Entrance' : 'Exit',
            calculatedData.data.doorwayLookup[item.doorwayId] ? calculatedData.data.doorwayLookup[item.doorwayId].name : item.doorwayId,
          ]}
        /> : null}

        {calculatedData.state === 'COMPLETE' && (calculatedData.data.data || []).length === 0 ? <div className="explore-space-detail-raw-events-card-body-info">
          No data available for this time period.
        </div> : null}
        {calculatedData.state === 'LOADING' ? <div className="explore-space-detail-raw-events-card-body-info">
          Fetching events...
        </div> : null}
        {calculatedData.state === 'ERROR' ? <div className="explore-space-detail-raw-events-card-body-error">
          <span>
            <span className="explore-space-detail-raw-events-card-body-error-icon">&#xe91a;</span>
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

export default connect((state: any) => ({
  spaces: state.spaces,
  calculatedData: state.exploreData.calculations.dailyRawEvents,
}), dispatch => ({
  onRefresh(space) {
    dispatch<any>(calculateDailyRawEvents(space));
  },
  onChangePage(space, page) {
    dispatch(collectionSpacesFilter('dailyRawEventsPage', page));
    dispatch<any>(calculateDailyRawEvents(space));
  },
}))(ExploreSpaceDetailRawEventsCard);
