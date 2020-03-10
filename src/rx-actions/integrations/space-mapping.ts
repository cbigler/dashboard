import core from '../../client/core';
import { DispatchType } from '../../types/rx-actions';
import { integrationsActions } from '.';
import { showToast } from '../../rx-actions/toasts';

export async function spaceMappingsAdd(dispatch: DispatchType, serviceId: string, spaceId: string, serviceSpaceId: string) {
  let response, errorThrown;
  try {
    response = await core().post(`/integrations/space_mappings/`, {
      "service_id": serviceId,
      "space_id": spaceId,
      "service_space_id": serviceSpaceId,
    });
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    showToast(dispatch, {
      type: 'error',
      text: `Failed to create space mapping!`,
    });
    return;
  }

  dispatch(integrationsActions.spaceMappingsAdd(response.data.id, spaceId, serviceSpaceId));
}

export async function spaceMappingsUpdate(dispatch: DispatchType, spaceMappingId: string, spaceId: string, serviceSpaceId: string) {
  let errorThrown;
  try {
    await core().put(`/integrations/space_mappings/${spaceMappingId}/`, {
      "space_id": spaceId,
      "service_space_id": serviceSpaceId,
    });
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    showToast(dispatch, {
      type: 'error',
      text: `Failed to update space mapping!`,
    });
    return;
  }

  dispatch(integrationsActions.spaceMappingUpdateComplete(spaceMappingId));
}

export async function spaceMappingsDelete(dispatch: DispatchType, spaceMappingId: string) {
  let errorThrown;
  try {
    await core().delete(`/integrations/space_mappings/${spaceMappingId}/`);
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    showToast(dispatch, {
      type: 'error',
      text: `Failed to delete space mapping!`,
    });
    return;
  }

  dispatch(integrationsActions.spaceMappingDeleteComplete(spaceMappingId));
}

