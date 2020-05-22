// Standard types for an "action creator namespace"
// See ./spaces/index.ts for an example of a namespace
export type ValuesOf<T extends {[key: string]: (...args: any) => any}> = T[keyof T];
export type ActionTypesOf<T extends {[key: string]: (...args: any) => any}> = ReturnType<ValuesOf<T>>;
