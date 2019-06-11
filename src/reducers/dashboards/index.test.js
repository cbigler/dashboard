import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import assert from 'assert';
import dashboards from './index';

import collectionDashboardsSet from '../../actions/collection/dashboards/set';
import collectionDashboardsSelect from '../../actions/collection/dashboards/select';

const DASHBOARDS = {
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

describe('dashboards', () => {
  it('should work', async () => {
    const store = createStore(dashboards, {}, applyMiddleware(thunk));
    store.dispatch(collectionDashboardsSet([DASHBOARDS]));

    // Ensure that the now that the dashboard was set, all reports within it are in a loading state
    const loadedState = store.getState();
    assert.deepEqual(Object.keys(loadedState.calculatedReportData), ['rpt_456', 'rpt_789']);
    assert.equal(loadedState.calculatedReportData['rpt_456'].state, 'LOADING');
    assert.equal(loadedState.calculatedReportData['rpt_789'].state, 'LOADING');

    await store.dispatch(collectionDashboardsSelect(DASHBOARDS, '2019-01-01', 'Sunday'))

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
});
