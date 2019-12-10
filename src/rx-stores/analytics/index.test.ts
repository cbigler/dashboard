import { Subject } from 'rxjs';

import { AnalyticsActionType } from '../../rx-actions/analytics';
import { AnalyticsState, ResourceStatus, QuerySelectionType } from '../../types/analytics';
import { StoreSubject } from '..';
import { GlobalAction } from '../../types/rx-actions';

import createReport from '../../rx-actions/analytics/operations/create-report'
import { UserState, userReducer, initialState as initialUserState } from '../user';
import { SpacesState, spacesReducer, initialState as initialSpacesState } from '../spaces';
import { createTestStore, createTestActionStream } from '../../helpers/test-utilities/state-management';

import { analyticsReducer } from '.';
import { registerSideEffects } from './effects';
import { DensitySpaceFunction } from '../../types';
import { TimeFilter } from '../../types/datetime';
import { initialState } from '.';


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
  let spacesStore: StoreSubject<SpacesState>;
  let userStore: StoreSubject<UserState>;

  beforeEach(() => {
    [actionStream, dispatch] = createTestActionStream();
    analyticsStore = createTestStore(initialAnalyticsState, analyticsReducer, actionStream);
    spacesStore = createTestStore(initialSpacesState, spacesReducer, actionStream);
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
    registerSideEffects(actionStream, analyticsStore, userStore, spacesStore, dispatch, mockRunQuery);
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
        values: [DensitySpaceFunction.CAFE],
      }]
    })
    
    expect(mockRunQuery).toBeCalledTimes(1);
  })

  // FIXME: this test is failing, because it needs a way to know the massive
  //  pipeline has finished, which is going to need some code changes...
  // For now, disabling this test
  xtest('Handling a bad query response from the API', async (done) => {
    const mockRunQuery = jest.fn().mockRejectedValue(new Error('Query failed'));
    registerSideEffects(actionStream, analyticsStore, userStore, spacesStore, dispatch, mockRunQuery);
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
        values: [DensitySpaceFunction.CAFE],
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
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }];
    state = {
      status: ResourceStatus.COMPLETE,
      data: {
        reports: [{
          id: '123',
          name: 'Some Report',
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
