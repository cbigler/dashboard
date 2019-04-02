import assert from 'assert';
import integrations from './index';

import routeTransitionExploreSpaceMeetings from '../../actions/route-transition/explore-space-meetings';
import {
  integrationsRoomBookingSetDefaultService,
  integrationsRoomBookingSelectSpaceMapping,
} from '../../actions/integrations/room-booking';

const INITIAL_STATE = integrations(undefined, {});

const EXAMPLE_SERVICE = {
  id: 'sve_abc',
  name: 'example_service',
  displayName: 'Example Service',
};

const EXAMPLE_SPACE_MAPPING = {
  id: 'spm_def',
  serviceId: EXAMPLE_SERVICE.id,
  serviceSpaceId: 123456,
  spaceId: 'spc_xxx',
};

describe('integrations', function() {
  it('should set both robin spaces and room booking to loading when page is visited', () => {
    const state = integrations(INITIAL_STATE, routeTransitionExploreSpaceMeetings('spc_xxx'));
    assert.deepStrictEqual(state.robinSpaces, {
      view: 'LOADING',
      data: [],
      error: null,
    });
    assert.deepStrictEqual(state.roomBooking, {
      view: 'LOADING',
      defaultService: null,
      spaceMappingForActiveSpace: null,
    });
  });
  it('should set the default room booking service', () => {
    const state = integrations(INITIAL_STATE, integrationsRoomBookingSetDefaultService(EXAMPLE_SERVICE));
    assert.deepStrictEqual(state.roomBooking, {
      view: 'VISIBLE',
      defaultService: EXAMPLE_SERVICE,
      spaceMappingForActiveSpace: null,
    });
  });
  it('should set the default room booking space mapping for the selected density space', () => {
    const state = integrations(INITIAL_STATE, integrationsRoomBookingSelectSpaceMapping(EXAMPLE_SPACE_MAPPING));
    assert.deepStrictEqual(state.roomBooking, {
      view: 'LOADING',
      defaultService: null,
      spaceMappingForActiveSpace: EXAMPLE_SPACE_MAPPING,
    });
  });
});

