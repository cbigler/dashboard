// Standard types for an "action creator namespace"
// See ./spaces/index.ts for an example of a namespace
export type ValuesOf<T> = T[keyof T];
export type ActionTypesOf<T extends any> = ReturnType<ValuesOf<T>>;
