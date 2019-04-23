import assert from 'assert';
import miscellaneous from './index';

import showDashboardSidebar from '../../actions/miscellaneous/show-dashboards-sidebar';
import hideDashboardSidebar from '../../actions/miscellaneous/hide-dashboards-sidebar';
import setNewSpaceType from '../../actions/miscellaneous/set-new-space-type';
import setNewSpaceParentId from '../../actions/miscellaneous/set-new-space-parent-id';

const INITIAL_STATE = miscellaneous(undefined, {});

describe('miscellaneous', function() {
  it('opens the sidebar', function() {
    const result = miscellaneous(INITIAL_STATE, showDashboardSidebar());
    assert.equal(result.dashboardSidebarVisible, true);
  });
  it('closes the sidebar', function() {
    const result = miscellaneous(INITIAL_STATE, hideDashboardSidebar());
    assert.equal(result.dashboardSidebarVisible, false);
  });
  it('stores the new space type for the admin locations new pages', function() {
    const result = miscellaneous(INITIAL_STATE, setNewSpaceType('floor'));
    assert.equal(result.adminLocationsNewSpaceType, 'floor');
  });
  it('stashes the new space parent for the admin locations new pages', function() {
    const result = miscellaneous(INITIAL_STATE, setNewSpaceParentId('spc_xxx'));
    assert.equal(result.adminLocationsNewSpaceParentId, 'spc_xxx');
  });
});
