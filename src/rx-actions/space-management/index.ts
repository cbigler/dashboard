import formUpdate from './form-update';
import formDoorwayUpdate from './form-doorway-update';
import formDoorwayPush from './form-doorway-push';


const spaceManagementActions = {
    formUpdate,
    formDoorwayUpdate,
    formDoorwayPush,
}


// FIXME: temporary duplication, delete me once new abstractions are brought in
export type ValuesOf<T> = T[keyof T]
export type ActionTypesOf<T extends any> = ReturnType<ValuesOf<T>>

export type SpaceManagementAction = ActionTypesOf<typeof spaceManagementActions>