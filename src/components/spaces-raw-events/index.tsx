import React, { useRef } from 'react';
import classnames from 'classnames';
import uuid from 'uuid';

import styles from './styles.module.scss';
import commaNumber from 'comma-number';

import {
  Icons,
  ListView,
  ListViewColumn,
  AppBar,
  AppBarSection,
} from '@density/ui/src';
import colors from '@density/ui/variables/colors.json';
import spacing from '@density/ui/variables/spacing.json';

import RawEventsPager from '../spaces-raw-events-pager/index';

import core from '../../client/core';
import { parseISOTimeAtSpace } from '../../helpers/space-time-utilities/index';
import useRxStore from '../../helpers/use-rx-store';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import SpacesPageStore from '../../rx-stores/spaces-page';
import SpacesStore from '../../rx-stores/spaces';
import { spacesPageActions } from '../../rx-actions/spaces-page';
import DoorwaysStore from '../../rx-stores/doorways';
import moment, { min } from 'moment-timezone';
import { downloadFile } from '../../helpers/download-file';
import { showToast, hideToast } from '../../rx-actions/toasts';
import { useAutoWidth } from '../../helpers/use-auto-width';
import { ListViewColumnSpacer } from '@density/ui';
import { sanitizeCSVDocument } from '../../helpers/csv';

export function getCSVURL() {
  const baseV1 = (core().defaults.baseURL || 'https://api.density.io/v2').replace('/v2', '/v1');
  return `${baseV1}/csv`;
}

export default function SpacesRawEvents() {
  const dispatch = useRxDispatch();
  const doorways = useRxStore(DoorwaysStore);
  const spaces = useRxStore(SpacesStore);
  const spacesPage = useRxStore(SpacesPageStore);
  const rawEvents = spacesPage.rawEvents;
  const space = spacesPage.spaceId ? spaces.data.get(spacesPage.spaceId) : null;
  const doorway = spacesPage.doorwayId ? doorways.data.get(spacesPage.doorwayId) : null;

  const tableRef = useRef<HTMLDivElement>(null);
  const width = useAutoWidth(tableRef);

  const onChangePage = async (page: number = 1) => {
    dispatch(spacesPageActions.setRawEvents({page}));
  }

  return space ? (
    <div ref={tableRef}>
      <div style={{
        background: colors.white,
        borderRadius: spacing.borderRadiusBase,
        border: `1px solid ${colors.gray200}`
      }}>
        <AppBar>
          <AppBarSection>
            <span style={{fontSize: 18, fontWeight: 'bold', color: colors.midnight}}>Raw Events</span>
          </AppBarSection>
          <AppBarSection>
            <span
              className={classnames(styles.rawEventsRefresh, {
                disabled: rawEvents.status !== 'COMPLETE',
              })}
              onClick={async () => {
                let startDate = moment.tz(spacesPage.startDate, space.time_zone);
                const endDate = moment.tz(spacesPage.endDate, space.time_zone).add(1, 'days');
                const fileName = `density_raw-events_${startDate.toISOString()}_${endDate.toISOString()}.csv`;
                const headerRow = 'Timestamp,Local Time,Event,Current Count,Count Change,Doorway Name,Doorway ID';
                let csvData: string[] = [];

                const toastId = uuid.v4();
                showToast(dispatch, { text: 'Preparing CSV export...', id: toastId, timeout: 60000 });

                while(startDate < endDate) {
                  const csvResponse = await core().get(getCSVURL(), {
                    params: {
                      start_time: startDate.toISOString(),
                      end_time: min(endDate, startDate.clone().add(7, 'days')).toISOString(),
                      space_id: space.id,
                      order: 'ASC'
                    }
                  });

                  // Filter by doorway on frontend, at least until the backend,
                  // endpoint properly filters this
                  csvData = csvData.concat(csvResponse.data.split('\r\n').filter(line => {
                    return line !== headerRow && (!doorway || line.split(',')[6] === doorway.id);
                  }));

                  startDate = min(startDate.clone().add(7, 'days'), endDate);
                }

                hideToast(dispatch, toastId);

                const sanitizedData = sanitizeCSVDocument(`${headerRow}\r\n${csvData.join('\r\n')}`)

                downloadFile(
                  fileName,
                  sanitizedData,
                  'text/csv;charset=utf8;'
                );
              }}
            >
              <Icons.Download color={rawEvents.status === 'LOADING' ? colors.gray300 : colors.midnight} />
            </span>
            <div style={{width: 16}}></div>
            <span
              className={classnames(styles.rawEventsRefresh, {
                disabled: rawEvents.status !== 'COMPLETE',
              })}
              onClick={() => onChangePage(spacesPage.rawEvents.page)}
            >
              <Icons.Refresh color={rawEvents.status === 'LOADING' ? colors.gray300 : colors.midnight} />
            </span>
          </AppBarSection>
        </AppBar>
        {rawEvents.status === 'COMPLETE' ? <div style={{
          fontSize: 12,
          padding: '16px 24px 8px 24px',
          overflow: 'hidden'
        }}>
          <ListView
            data={rawEvents.data || []}
            rowHeight={43}
            fontSize={14}
          >
            <ListViewColumn
              id="Timestamp"
              template={item => parseISOTimeAtSpace(item.timestamp, space).format('MMM Do YYYY, h:mm:ss a')}
              width={200} />
            {width < 640 ? 
              <ListViewColumnSpacer /> :
              <ListViewColumn
                id="Doorway"
                template={item => (
                  <span style={{whiteSpace: 'nowrap'}}>
                    {doorways.data.get(item.doorway_id)?.name || item.doorway_id}
                  </span>
                )} />}
            <ListViewColumn
              id="Event"
              template={item => (
                width < 640 ? item.direction === 1 ? '+1' : '-1' :
                item.direction === 1 ? 'Entrance' : 'Exit'
              )}
              width={width < 640 ? 40 : 70} />
            <ListViewColumn
              id="Count"
              template={item => commaNumber(item.count)}
              width={80}
              align="right" />
          </ListView>
        </div> : null}

        {rawEvents.status === 'COMPLETE' && (rawEvents.data || []).length === 0 ? <div className={styles.rawEventsInfo}>
          No data available for this time period.
        </div> : null}
        {rawEvents.status === 'LOADING' ? <div className={styles.rawEventsInfo}>
          Fetching events...
        </div> : null}
        {rawEvents.status === 'ERROR' ? <div className={styles.rawEventsError}>
          <span>
            <span className={styles.rawEventsErrorIcon}>&#xe91a;</span>
            {rawEvents.error && rawEvents.error.toString()}
          </span>
        </div> : null}
      </div>
      <RawEventsPager
        disabled={rawEvents.status !== 'COMPLETE'}
        page={spacesPage.rawEvents.page}
        totalPages={rawEvents.status === 'COMPLETE' ? Math.ceil(rawEvents.totalEvents / 10) : 0}
        totalEvents={rawEvents.status === 'COMPLETE' ? rawEvents.totalEvents : 0}
        onChange={page => onChangePage(page)}
      />
    </div>
  ) : null;
}
