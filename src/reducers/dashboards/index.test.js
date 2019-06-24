import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import assert from 'assert';
import dashboards from './index';

import dashboardsSet from '../../actions/dashboards/set';
import dashboardsSelect from '../../actions/dashboards/select';
import dashboardsSetData from '../../actions/dashboards/set-data';
import dashboardsUpdateFormState from '../../actions/dashboards/update-form-state';
import {
  clearReportData as dashboardsCalculateReportDataClear,
} from '../../actions/dashboards/calculate-report-data';

const DASHBOARD = {
  id: 'das_123',
  name: 'My Dashboard',
  reportSet: [
    // This report will "calculate" data successfully.
    {
      id: 'rpt_456',
      name: 'My Report One',
      type: 'NOOP_COMPLETES_IMMEDIATELY',
      settings: {
        hello: 'world',
      },
    },

    // This report will throw an error during data calculation.
    {
      id: 'rpt_789',
      name: 'My Report Two',
      type: 'NOOP_ERRORS_IMMEDIATELY',
      settings: {
        hello: 'world',
      },
    },
  ],
};

const REPORT_LIST = [
  { id: 'rpt_xxx', name: 'Sample Report', settings: {}, type: 'SAMPLE_REPORT'},
];

const TIME_SEGMENT_LABELS = [
  "foo",
  "bar",
  "baz",
];

const INITIAL_STATE = dashboards(undefined, {});

describe('dashboards', () => {
  it('should load some report data from a dashboard', async () => {
    const store = createStore(dashboards, {}, applyMiddleware(thunk));
    store.dispatch(dashboardsSet([DASHBOARD]));

    // Ensure that the now that the dashboard was set, all reports within it are in a loading state
    const loadedState = store.getState();
    assert.deepEqual(Object.keys(loadedState.calculatedReportData), ['rpt_456', 'rpt_789']);
    assert.equal(loadedState.calculatedReportData['rpt_456'].state, 'LOADING');
    assert.equal(loadedState.calculatedReportData['rpt_789'].state, 'LOADING');

    await store.dispatch(dashboardsSelect(DASHBOARD, '2019-01-01', 'Sunday'))

    const finalState = store.getState();

    // Report one should have completed.
    assert.equal(finalState.calculatedReportData['rpt_456'].state, 'COMPLETE');
    assert.deepEqual(finalState.calculatedReportData['rpt_456'].data, {hello: 'world'});
    assert.equal(finalState.calculatedReportData['rpt_456'].error, null);

    // Report two should have errored.
    assert.equal(finalState.calculatedReportData['rpt_789'].state, 'ERROR');
    assert.deepEqual(
      finalState.calculatedReportData['rpt_789'].error.message,
      'Error was thrown during calculation',
    );
    assert.equal(finalState.calculatedReportData['rpt_789'].data, null);
  });
  it('should update the store with data', () => {
    const result = dashboards(
      INITIAL_STATE,
      dashboardsSetData(DASHBOARD, REPORT_LIST, TIME_SEGMENT_LABELS),
    );

    // Ensure data is set
    assert.deepStrictEqual(result.data, [DASHBOARD]);
    assert.deepStrictEqual(result.reportList, REPORT_LIST);
    assert.deepStrictEqual(result.timeSegmentLabels, TIME_SEGMENT_LABELS);

    // Ensure formstate defaults to the dashboard to be edited
    assert.deepStrictEqual(result.formState, DASHBOARD);

    // Ensure that all reports are put into a loading state
    assert.deepStrictEqual(result.calculatedReportData, {
      'rpt_456': { state: 'LOADING', data: null },
      'rpt_789': { state: 'LOADING', data: null },
    });
  });
  it('should update the form state when dashboard data is changed on the form', () => {
    const result = dashboards(INITIAL_STATE, dashboardsUpdateFormState('foo', 'bar'));
    assert.strictEqual(result.formState.foo, 'bar');
  });
  it(`should reset a report's stored data back to being loading`, () => {
    const initialStateWithReport = {
      ...INITIAL_STATE,
      calculatedReportData: {
        'rpt_123': { state: 'COMPLETE', data: { foo: 'bar' } },
        'rpt_456': { state: 'COMPLETE', data: { hello: 'world' } },
      },
    };
    const result = dashboards(initialStateWithReport, dashboardsCalculateReportDataClear('rpt_123'));
    assert.strictEqual(result.calculatedReportData['rpt_123'].state, 'LOADING');
    assert.strictEqual(result.calculatedReportData['rpt_456'].state, 'COMPLETE');
  });
});
