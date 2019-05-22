import assert from 'assert';
import spaceManagement from './index';
import 'moment-timezone';

import { ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW } from '../../actions/route-transition/admin-locations-new';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT } from '../../actions/route-transition/admin-locations-edit';
import { USER_SET } from '../../actions/user/set';
import { USER_PUSH } from '../../actions/user/push';

import spaceManagementSetData from '../../actions/space-management/set-data';
import spaceManagementError from '../../actions/space-management/error';
import spaceManagementUpdateFormState from '../../actions/space-management/update-form-state';

const INITIAL_STATE = spaceManagement(undefined, {});

describe('spaceManagement', () => {
  it('should store the parent space id / the form space type from the route when loading new page', () => {
    const result = spaceManagement(INITIAL_STATE, {
      type: ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW,
      parentSpaceId: 'spc_xxx',
      spaceType: 'building',
    });
    assert.deepStrictEqual(result, {
      ...INITIAL_STATE,
      view: 'LOADING_INITIAL',
      error: null,
      formParentSpaceId: 'spc_xxx',
      formSpaceType: 'building',
    });
  });
  it('should store the selected space when loading edit page', () => {
    const result = spaceManagement(INITIAL_STATE, {
      type: ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT,
      spaceId: 'spc_xxx',
    });
    assert.strictEqual(result.spaces.selected, 'spc_xxx');
  });
  it('should update the sizeAreaDisplayUnit when user is set', () => {
    const result = spaceManagement(INITIAL_STATE, {
      type: USER_SET,
      data: {
        fullName: 'John Smith',
        sizeAreaDisplayUnit: 'square_feet',
      },
    });
    assert.strictEqual(result.userDataSizeAreaDisplayUnit, 'square_feet');
  });
  it('should update the sizeAreaDisplayUnit when user is pushed', () => {
    const result = spaceManagement(INITIAL_STATE, {
      type: USER_PUSH,
      data: {
        sizeAreaDisplayUnit: 'square_feet',
      },
    });
    assert.strictEqual(result.userDataSizeAreaDisplayUnit, 'square_feet');
  });


  it('should update all data collections inside when SPACE_MANAGEMENT_SET_DATA is sent', () => {
    const SPACES = [
      {id: 'spc_xxx', name: 'My Campus', parentId: null },
      {id: 'spc_xxy', name: 'My Building', parentId: 'spc_xxx' },
    ];
    const HIERARCHY = [
      {
        id: 'spc_xxx',
        name: 'My Campus',
        spaceType: 'campus',
        hasPurview: true,
        children: [
          {id: 'spc_xxy', name: 'My Building', hasPurview: true, children: []},
        ],
      },
    ];
    const LABELS = ['foo', 'bar', 'baz'];
    const action = spaceManagementSetData(SPACES, HIERARCHY, LABELS);
    const result = spaceManagement(INITIAL_STATE, action);
    assert.strictEqual(result.view, 'VISIBLE');
    assert.deepStrictEqual(result.spaces.data, SPACES);
    assert.deepStrictEqual(result.spaceHierarchy, HIERARCHY);
    assert.deepStrictEqual(result.operatingHoursLabels, LABELS);
  });
  it('should put reducer into an error state when SPACE_MANAGEMENT_ERROR is sent', () => {
    const result = spaceManagement(INITIAL_STATE, spaceManagementError('My error'));
    assert.strictEqual(result.view, 'ERROR');
    assert.strictEqual(result.error, 'My error');
  });
  it('should update form state when SPACE_MANAGEMENT_UPDATE_FORM_STATE is sent', () => {
    const result = spaceManagement(INITIAL_STATE, spaceManagementUpdateFormState('foo', 'bar'));
    assert.strictEqual(result.formState.foo, 'bar');
  });
});
