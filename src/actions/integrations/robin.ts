import core from '../../client/core';
import showToast from '../toasts/index';

export const INTEGRATIONS_ROBIN_SPACES_SET = 'INTEGRATIONS_ROBIN_SPACES_SET',
             INTEGRATIONS_ROBIN_SPACES_ERROR = 'INTEGRATIONS_ROBIN_SPACES_ERROR',
             INTEGRATIONS_ROBIN_SPACES_SELECT = 'INTEGRATIONS_ROBIN_SPACES_SELECT';

export function integrationsRobinSpacesSet(data) {
  return { type: INTEGRATIONS_ROBIN_SPACES_SET, data };
}

export function integrationsRobinSpacesError(error) {
  return { type: INTEGRATIONS_ROBIN_SPACES_ERROR, error };
}

export function integrationsRobinSpacesSelect(id) {
  return { type: INTEGRATIONS_ROBIN_SPACES_SELECT, id };
}

export function integrationsSpaceMappingUpdate(spaceId, serviceSpaceId) {
  return async dispatch => {
    let spaceMappingResponse;
    try {
      spaceMappingResponse = await core().post(`/integrations/space_mappings/space/${spaceId}`, {
        space_id: spaceId,
        service_space_id: serviceSpaceId,
      });
    } catch (err) {
      console.error(err);
      dispatch(showToast({type: 'error', text: 'Error mapping spaces'}));
      return;
    }

    dispatch(integrationsRobinSpacesSelect(serviceSpaceId));
    dispatch(showToast({text: 'Space mapping complete'}));
  };
}
