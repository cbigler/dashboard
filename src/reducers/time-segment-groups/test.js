import assert from 'assert';
import timeSegmentGroups from './index';

import set from '../../actions/collection/time-segment-groups/set';
import error from '../../actions/collection/time-segment-groups/error';

import routeTransitionAdminLocationsNew from '../../actions/route-transition/admin-locations-new';
import routeTransitionAdminLocationsEdit from '../../actions/route-transition/admin-locations-edit';

const INITIAL_STATE = timeSegmentGroups(undefined, {});

describe('time-segment-groups', function() {
  it('should set time segments when given a new list of them', () => {
    const results = timeSegmentGroups(INITIAL_STATE, set([
      { id: 'tsg_1' },
      { id: 'tsg_2' },
      { id: 'tsg_3' },
    ]));
    assert.deepEqual(results.data, [
      { id: 'tsg_1' },
      { id: 'tsg_2' },
      { id: 'tsg_3' },
    ]);
    assert.equal(results.loading, false);
    assert.equal(results.error, null);
  });
  it('should error when given an error', () => {
    const results = timeSegmentGroups(INITIAL_STATE, error(new Error('Boom')));
    assert.deepEqual(results.error, 'Error: Boom');
  });
  it('should reset time segment groups collection when edit or new page is navigated to', () => {
    let results = timeSegmentGroups(INITIAL_STATE, routeTransitionAdminLocationsEdit('spc_xxx'));
    assert.deepEqual(results.view, 'LOADING');
    assert.deepEqual(results.data, []);

    results = timeSegmentGroups(INITIAL_STATE, routeTransitionAdminLocationsNew('spc_xxx'));
    assert.deepEqual(results.view, 'LOADING');
    assert.deepEqual(results.data, []);
  });
});

