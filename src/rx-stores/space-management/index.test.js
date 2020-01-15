import assert from 'assert';
import { spaceManagementReducer, initialState } from './index';
import 'moment-timezone';

import { ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW } from '../../rx-actions/route-transition/admin-locations-new';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT } from '../../rx-actions/route-transition/admin-locations-edit';
import { USER_SET } from '../../rx-actions/user/set';
import { USER_PUSH } from '../../rx-actions/user/push';

import spaceManagementSetData from '../../rx-actions/space-management/set-data';
import spaceManagementError from '../../rx-actions/space-management/error';
import spaceManagementFormUpdate from '../../rx-actions/space-management/form-update';


describe('spaceManagement', () => {
  it('should store the parent space id / the form space type from the route when loading new page', () => {
    const result = spaceManagementReducer(initialState, {
      type: ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW,
      parentSpaceId: 'spc_xxx',
      space_type: 'building',
    });
    assert.deepStrictEqual(result, {
      ...initialState,
      view: 'LOADING_INITIAL',
      error: null,
      formParentSpaceId: 'spc_xxx',
      formSpaceType: 'building',
    });
  });
  it('should store the selected space when loading edit page', () => {
    const result = spaceManagementReducer(initialState, {
      type: ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT,
      space_id: 'spc_xxx',
    });
    assert.strictEqual(result.spaces.selected, 'spc_xxx');
  });
  it('should update the size_area_display_unit when user is set', () => {
    const result = spaceManagementReducer(initialState, {
      type: USER_SET,
      data: {
        full_name: 'John Smith',
        size_area_display_unit: 'square_feet',
      },
    });
    assert.strictEqual(result.userDataSizeAreaDisplayUnit, 'square_feet');
  });
  it('should update the size_area_display_unit when user is pushed', () => {
    const result = spaceManagementReducer(initialState, {
      type: USER_PUSH,
      item: {
        size_area_display_unit: 'square_feet',
      },
    });
    assert.strictEqual(result.userDataSizeAreaDisplayUnit, 'square_feet');
  });


  it('should update all data collections inside when SPACE_MANAGEMENT_SET_DATA is sent', () => {
    const HIERARCHY = [
      {
        id: 'spc_xxx',
        name: 'My Campus',
        space_type: 'campus',
        has_purview: true,
        children: [
          {id: 'spc_xxy', name: 'My Building', has_purview: true, children: []},
        ],
      },
    ];
    const SPACES = [
      {id: 'spc_xxx', name: 'My Campus', parent_id: null },
      {id: 'spc_xxy', name: 'My Building', parent_id: 'spc_xxx' },
    ];
    const DOORWAYS = [
      {id: 'drw_xxx', name: 'My Door', spaces: []},
      {id: 'drw_xxy', name: 'My Door 2', spaces: []},
    ];
    const LABELS = ['foo', 'bar', 'baz'];
    const action = spaceManagementSetData(HIERARCHY, SPACES, DOORWAYS, LABELS);
    const result = spaceManagementReducer(initialState, action);
    assert.strictEqual(result.view, 'VISIBLE');
    assert.deepStrictEqual(result.spaces.data, SPACES);
    assert.deepStrictEqual(result.spaceHierarchy, HIERARCHY);
    assert.deepStrictEqual(result.doorways, DOORWAYS);
    assert.deepStrictEqual(result.operatingHoursLabels, LABELS);
  });
  it('should put reducer into an error state when SPACE_MANAGEMENT_ERROR is sent', () => {
    const result = spaceManagementReducer(initialState, spaceManagementError('My error'));
    assert.strictEqual(result.view, 'ERROR');
    assert.strictEqual(result.error, 'My error');
  });
  it('should update form state when SPACE_MANAGEMENT_FORM_UPDATE is sent', () => {
    const result = spaceManagementReducer(initialState, spaceManagementFormUpdate('foo', 'bar'));
    assert.strictEqual(result.formState.foo, 'bar');
  });
});
