import doorwayDeleted from './doorway-deleted';
import error from './error';
import formUpdate from './form-update';
import formDoorwayUpdate from './form-doorway-update';
import formDoorwayPush from './form-doorway-push';
import pushDoorway from './push-doorway';
import reset from './reset';
import setData from './set-data';
import setDoorways from './set-doorways';


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


// FIXME: temporary duplication, delete me once new abstractions are brought in
export type ValuesOf<T> = T[keyof T]
export type ActionTypesOf<T extends any> = ReturnType<ValuesOf<T>>

export type SpaceManagementAction = ActionTypesOf<typeof spaceManagementActions>