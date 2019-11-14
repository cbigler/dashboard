import assert from 'assert';
import { miscellaneousReducer, initialState } from '.';

import showDashboardSidebar from '../../rx-actions/miscellaneous/show-dashboards-sidebar';
import hideDashboardSidebar from '../../rx-actions/miscellaneous/hide-dashboards-sidebar';


describe('miscellaneous', () => {
  it('opens the sidebar', () => {
    const result = miscellaneousReducer(initialState, showDashboardSidebar());
    assert.equal(result.dashboardSidebarVisible, true);
  });
  it('closes the sidebar', () => {
    const result = miscellaneousReducer(initialState, hideDashboardSidebar());
    assert.equal(result.dashboardSidebarVisible, false);
  });
});
