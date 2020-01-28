import formUpdate from './form-update';


const spaceManagementActions = {
    formUpdate,
}


// FIXME: temporary duplication, delete me once new abstractions are brought in
export type ValuesOf<T> = T[keyof T]
export type ActionTypesOf<T extends any> = ReturnType<ValuesOf<T>>

export type SpaceManagementAction = ActionTypesOf<typeof spaceManagementActions>