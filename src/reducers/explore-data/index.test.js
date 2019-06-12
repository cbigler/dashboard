import assert from 'assert';
import exploreData from './index';

import exploreDataCalculateDataLoading from '../../actions/explore-data/calculate-data-loading';
import exploreDataCalculateDataComplete from '../../actions/explore-data/calculate-data-complete';
import exploreDataCalculateDataError from '../../actions/explore-data/calculate-data-error';

const INITIAL_STATE = exploreData(undefined, {});

describe('explore data reducer', function() {
  it('should set report to be in a loading state', function() {
    const output = exploreData(INITIAL_STATE, exploreDataCalculateDataLoading('spaceList'));
    assert.deepEqual(output.calculations.spaceList.state, 'LOADING');
  });
  it(`should complete report and store the report's calculations`, function() {
    const output = exploreData(
      INITIAL_STATE,
      exploreDataCalculateDataComplete('spaceList', {foo: 'bar'}),
    );
    assert.deepEqual(output.calculations.spaceList.state, 'COMPLETE');
    assert.deepEqual(output.calculations.spaceList.data, {foo: 'bar'});
  });
  it(`should error if the report calculations error and store the error`, function() {
    const output = exploreData(
      INITIAL_STATE,
      exploreDataCalculateDataError('spaceList', 'My error here'),
    );
    assert.deepEqual(output.calculations.spaceList.state, 'ERROR');
    assert.deepEqual(output.calculations.spaceList.error, 'My error here');
  });
});
