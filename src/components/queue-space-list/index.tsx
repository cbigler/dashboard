import React, { Fragment, useState } from 'react';
import classnames from 'classnames';

import {
  Icons,
  InputBox,
  AppBar,
  AppBarTitle,
  AppBarSection,
  ListView,
  ListViewColumn,
} from '@density/ui/src';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import GenericLoadingState from '../generic-loading-state';
import GenericErrorState from '../generic-error-state';

import useRxDispatch from '../../helpers/use-rx-dispatch';
import useRxStore from '../../helpers/use-rx-store';
import QueueStore, { QueueSettings } from '../../rx-stores/queue';
import { QueueActionTypes } from '../../rx-actions/queue';
import { ResourceStatus } from '../../types/resource';

import styles from './styles.module.scss';
import filterCollection from '../../helpers/filter-collection';


function calculateThreshold(
  space: CoreSpace,
  queueSettings: {[id: string]: QueueSettings},
): React.ReactNode {
  const settings = queueSettings[space.id] || queueSettings.default;
  switch (settings.threshold_metric) {
  case 'CAPACITY':
    return `Capacity: ${settings.queue_capacity} ${settings.queue_capacity === 1 ? 'person' : 'people'}`;
  case 'UTILIZATION':
    return `Utilization: ${settings.threshold_value * 100}%`;
  case 'PEOPLE_PER_SQFT':
    return `People per square foot: ${settings.threshold_value}`;
  default:
    return true
  }
}

const filterSpaces = filterCollection({fields: ['name']});

const QueueSpaceList: React.FunctionComponent = () => {
  const state = useRxStore(QueueStore);
  const dispatch = useRxDispatch();

  const [hoveredSpaceId, setHoveredSpaceId] = useState<CoreSpace['id'] | null>(null);

  const header = (
    <AppBar>
      <AppBarTitle>Queue Spaces</AppBarTitle>
      <AppBarSection>
        <InputBox
          type="text"
          leftIcon={<Icons.Search />}
          placeholder="Search for a space"
          value={state.list.searchText}
          onChange={e => dispatch({
            type: QueueActionTypes.QUEUE_LIST_CHANGE_SEARCH_TEXT,
            text: e.target.value,
          })}
          width={300}
        />
      </AppBarSection>
    </AppBar>
  );

  switch (state.list.resource.status) {
  case ResourceStatus.IDLE:
  case ResourceStatus.LOADING:
    return (
      <Fragment>
        {header}
        <div className={styles.centered}>
          <GenericLoadingState />
        </div>
      </Fragment>
    );

  case ResourceStatus.ERROR:
    return (
      <Fragment>
        {header}
        <div className={styles.centered}>
          <GenericErrorState />
        </div>
      </Fragment>
    );

  case ResourceStatus.COMPLETE:
    const visibleSpaceIds = state.list.resource.data.visibleSpaceIds;
    const orgSettings = state.list.resource.data.orgSettings;

    let spaces = state.list.resource.data.spaces;
    spaces = spaces.filter(s => visibleSpaceIds.includes(s.id));
    spaces = filterSpaces(spaces, state.list.searchText);

    return (
      <Fragment>
        {header}
        <div className={styles.spaceList}>
          <div className={styles.intro}>
            <h1>Queue<sup>BETA</sup></h1>
            <p>Give your employees or customers real-time occupancy information they can use to make safe decisions about their day.</p>
          </div>
          {!orgSettings ? (
            <div className={styles.centered}>
              <h4>Queue is not enabled</h4>
              <span>Please <a href="mailto:support@density.io">contact support</a> to get started.</span>
            </div>
          ) : (
            spaces.length > 0 ? (
              <ListView
                data={spaces}
                padOuterColumns
                onClickRow={space => { window.location.href = `#/queue/spaces/${space.id}`; }}
              >
                <ListViewColumn
                  id="Space Name"
                  template={i => (
                    <div
                      className={styles.cell}
                      onMouseEnter={() => setHoveredSpaceId(i.id)}
                      onMouseLeave={() => setHoveredSpaceId(null)}
                    >
                      {i.name}
                    </div>
                  )}
                />
                <ListViewColumn
                  id="Threshold"
                  template={i => {
                    if (state.list.resource.status !== ResourceStatus.COMPLETE) { return null; }
                    if (!orgSettings) { return null; }

                    return (
                      <div
                        className={styles.cell}
                        onMouseEnter={() => setHoveredSpaceId(i.id)}
                        onMouseLeave={() => setHoveredSpaceId(null)}
                      >
                        {calculateThreshold(i, orgSettings)}
                      </div>
                    );
                  }}
                  width="auto"
                />
                <ListViewColumn
                  id="Details"
                  title=" "
                  template={i => (
                    <div
                      className={classnames(
                        styles.cell,
                        styles.detailsArrow,
                        {[styles.hovered]: hoveredSpaceId === i.id},
                      )}
                      onMouseEnter={() => setHoveredSpaceId(i.id)}
                      onMouseLeave={() => setHoveredSpaceId(null)}
                    >
                      <span>View Space</span>
                      <Icons.ArrowRight color="currentColor" />
                    </div>
                  )}
                />
              </ListView>
            ) : (
              <div className={styles.centered}>
                No spaces were found.
              </div>
            )
          )}
        </div>
      </Fragment>
    );
  }
}

export default QueueSpaceList;
