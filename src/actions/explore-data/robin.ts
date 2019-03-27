import core from '../../client/core';
import showToast from '../toasts/index';

export const EXPLORE_DATA_ROBIN_SPACES_SET = 'EXPLORE_DATA_ROBIN_SPACES_SET',
             EXPLORE_DATA_ROBIN_SPACES_ERROR = 'EXPLORE_DATA_ROBIN_SPACES_ERROR',
             EXPLORE_DATA_ROBIN_SPACES_SELECT = 'EXPLORE_DATA_ROBIN_SPACES_SELECT';

export function exploreDataRobinSpacesSet(data) {
  return { type: EXPLORE_DATA_ROBIN_SPACES_SET, data };
}

export function exploreDataRobinSpacesError(error) {
  return { type: EXPLORE_DATA_ROBIN_SPACES_ERROR, error };
}

export function exploreDataRobinSpacesSelect(id) {
  return { type: EXPLORE_DATA_ROBIN_SPACES_SELECT, id };
}

export function exploreDataSpaceMappingUpdate(spaceId, serviceSpaceId) {
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

    dispatch(exploreDataRobinSpacesSelect(serviceSpaceId));
    dispatch(showToast({text: 'Space mapping complete'}));
  };
}
