import { Subject } from 'rxjs';

import { AnalyticsActionType } from '../../rx-actions/analytics';
import { ResourceStatus } from '../../types/resource';
import { AnalyticsState, QuerySelectionType } from '../../types/analytics';
import { StoreSubject } from '..';
import { GlobalAction } from '../../types/rx-actions';

import createReport from '../../rx-actions/analytics/operations/create-report'
import { UserState, userReducer, initialState as initialUserState } from '../user';
import { SpacesLegacyState, spacesLegacyReducer, initialState as initialSpacesLegacyState } from '../spaces-legacy';
import { createTestStore, createTestActionStream } from '../../helpers/test-utilities/state-management';

import analyticsReducer from './reducer';
import { registerSideEffects } from './effects';
import { CoreSpaceFunction } from '@density/lib-api-types/core-v2/spaces';
import { TimeFilter } from '../../types/datetime';
import { DayOfWeek } from '@density/lib-api-types/node_modules/@density/lib-common-types';


describe('AnalyticsStore', () => {

  const initialAnalyticsState: AnalyticsState = {
    status: ResourceStatus.COMPLETE,
    data: {
      reports: [],
      activeReportId: null,
    }
  }
  
  let actionStream: Subject<GlobalAction>;
  let dispatch: (action: GlobalAction) => void;
  let analyticsStore: StoreSubject<AnalyticsState>;
  let spacesLegacyStore: StoreSubject<SpacesLegacyState>;
  let userStore: StoreSubject<UserState>;

  beforeEach(() => {
    [actionStream, dispatch] = createTestActionStream();
    analyticsStore = createTestStore(initialAnalyticsState, analyticsReducer, actionStream);
    spacesLegacyStore = createTestStore(initialSpacesLegacyState, spacesLegacyReducer, actionStream);
    userStore = createTestStore(initialUserState, userReducer, actionStream)
  })

  test('Creating a new report', async () => {
    await createReport(dispatch);

    let state = analyticsStore.imperativelyGetValue();
    if (state.status !== ResourceStatus.COMPLETE) throw new Error('analytics status should be complete')

    expect(state.status).toBe(ResourceStatus.COMPLETE)
    expect(state.data.reports.length).toBe(1)
  })

  test('Triggering a query to run by updating the query selections', async () => {
    
    const mockRunQuery = jest.fn();
    registerSideEffects(actionStream, analyticsStore, userStore, spacesLegacyStore, dispatch, mockRunQuery);
    await createReport(dispatch);
    
    let state = analyticsStore.imperativelyGetValue();
    if (state.status !== ResourceStatus.COMPLETE) throw new Error('analytics status should be complete')
    
    const newReportId = state.data.reports[0].id;

    dispatch({
      type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_SELECTIONS,
      reportId: newReportId,
      selections: [{
        type: QuerySelectionType.SPACE,
        field: 'function',
        values: [CoreSpaceFunction.CAFE],
      }]
    })
    
    expect(mockRunQuery).toBeCalledTimes(1);
  })

  // FIXME: this test is failing, because it needs a way to know the massive
  //  pipeline has finished, which is going to need some code changes...
  // For now, disabling this test
  xtest('Handling a bad query response from the API', async (done) => {
    const mockRunQuery = jest.fn().mockRejectedValue(new Error('Query failed'));
    registerSideEffects(actionStream, analyticsStore, userStore, spacesLegacyStore, dispatch, mockRunQuery);
    await createReport(dispatch);
    
    // get state
    let state = analyticsStore.imperativelyGetValue();
    if (state.status !== ResourceStatus.COMPLETE) throw new Error('analytics status should be complete')

    const newReportId = state.data.reports[0].id;

    // change selections
    dispatch({
      type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_SELECTIONS,
      reportId: newReportId,
      selections: [{
        type: QuerySelectionType.SPACE,
        field: 'function',
        values: [CoreSpaceFunction.CAFE],
      }]
    })

    // query should fail...

    // get state again
    state = analyticsStore.imperativelyGetValue();

    // the status of the analytics resource should still be COMPLETE
    expect(state.status).toBe(ResourceStatus.COMPLETE);
    if (state.status !== ResourceStatus.COMPLETE) throw new Error('analytics status should be complete')

    // the status of the queryResult should be ERROR
    expect(state.data.reports[0].queryResult.status).toBe(ResourceStatus.ERROR);

  })
})

describe('snapping the TimeFilter to a QueryInterval properly', () => {
  let state: AnalyticsState;
  let sampleA: TimeFilter;
  
  beforeEach(() => {
    sampleA = [{
      start: { hour: 9, minute: 0, second: 0, millisecond: 0 },
      end: { hour: 17, minute: 0, second: 0, millisecond: 0 },
      days: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY]
    }];
    state = {
      status: ResourceStatus.COMPLETE,
      data: {
        reports: [{
          id: '123',
          name: 'Some Report',
          // TODO: figure out correct types for this
          // @ts-ignore
          type: 'LINE_CHART',
          settings: {
            query: {

            }
          },

        }],
        activeReportId: '123'
      }
    }
  })
})
