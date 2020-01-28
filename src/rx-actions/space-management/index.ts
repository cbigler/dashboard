import doorwayDeleted from './doorway-deleted';
import error from './error';
import formUpdate from './form-update';
import formDoorwayUpdate from './form-doorway-update';
import formDoorwayPush from './form-doorway-push';
import pushDoorway from './push-doorway';
import reset from './reset';
import setData from './set-data';
import setDoorways from './set-doorways';
import { ActionTypesOf } from '../../types/rx-actions';


export const spaceManagementActions = {
    doorwayDeleted,
    error,
    formUpdate,
    formDoorwayUpdate,
    formDoorwayPush,
    pushDoorway,
    reset,
    setData,
    setDoorways,
}

export type SpaceManagementAction = ActionTypesOf<typeof spaceManagementActions>