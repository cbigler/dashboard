import assert from 'assert';
import { exploreDataReducer, initialState } from '.';

import exploreDataCalculateDataLoading from '../../rx-actions/explore-data/calculate-data-loading';
import exploreDataCalculateDataComplete from '../../rx-actions/explore-data/calculate-data-complete';
import exploreDataCalculateDataError from '../../rx-actions/explore-data/calculate-data-error';


describe('explore data reducer', () => {
  it('should set report to be in a loading state', () => {
    const output = exploreDataReducer(initialState, exploreDataCalculateDataLoading('spaceList'));
    assert.deepEqual(output.calculations.spaceList.state, 'LOADING');
  });
  it(`should complete report and store the report's calculations`, () => {
    const output = exploreDataReducer(
      initialState,
      exploreDataCalculateDataComplete('spaceList', {foo: 'bar'})
    );
    assert.deepEqual(output.calculations.spaceList.state, 'COMPLETE');
    assert.deepEqual(output.calculations.spaceList.data, {foo: 'bar'});
  });
  it(`should error if the report calculations error and store the error`, () => {
    const output = exploreDataReducer(
      initialState,
      exploreDataCalculateDataError('spaceList', 'My error here')
    );
    assert.deepEqual(output.calculations.spaceList.state, 'ERROR');
    assert.deepEqual(output.calculations.spaceList.error, 'My error here');
  });
});
