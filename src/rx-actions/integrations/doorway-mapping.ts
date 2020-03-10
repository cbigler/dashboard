import core from '../../client/core';
import { DispatchType } from '../../types/rx-actions';
import { integrationsActions } from '.';

import { showToast } from '../../rx-actions/toasts';

export async function doorwayMappingsAdd(dispatch: DispatchType, serviceId: string, doorwayId: string, serviceDoorwayId: string) {
  let response, errorThrown;
  try {
    response = await core().post(`/integrations/doorway_mappings/`, {
      "service_id": serviceId,
      "doorway_id": doorwayId,
      "service_doorway_id": serviceDoorwayId,
    });
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    showToast(dispatch, {
      type: 'error',
      text: `Failed to create doorway mapping!`,
    });
    return;
  }

  dispatch(integrationsActions.doorwayMappingsAdd(response.data.id, doorwayId, serviceDoorwayId));
}

export async function doorwayMappingsUpdate(dispatch: DispatchType, doorwayMappingId: string, doorwayId: string, serviceDoorwayId: string) {
  let errorThrown;
  try {
    await core().put(`/integrations/doorway_mappings/${doorwayMappingId}/`, {
      "doorway_id": doorwayId,
      "service_doorway_id": serviceDoorwayId,
    });
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    showToast(dispatch, {
      type: 'error',
      text: `Failed to update doorway mapping!`,
    });
    return;
  }

  dispatch(integrationsActions.doorwayMappingUpdateComplete(doorwayMappingId));
}

export async function doorwayMappingsDelete(dispatch: DispatchType, doorwayMappingId: string) {
  let errorThrown;
  try {
    await core().delete(`/integrations/doorway_mappings/${doorwayMappingId}/`);
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    showToast(dispatch, {
      type: 'error',
      text: `Failed to delete doorway mapping!`,
    });
    return;
  }

  dispatch(integrationsActions.doorwayMappingDeleteComplete(doorwayMappingId));
}

