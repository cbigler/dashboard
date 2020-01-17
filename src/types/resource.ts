export enum ResourceStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export type ResourceIdle = { status: ResourceStatus.IDLE };
export type ResourceLoading = { status: ResourceStatus.LOADING };
export type ResourceComplete<T> = {
  status: ResourceStatus.COMPLETE,
  data: T,
};
export type ResourceError = {
  status: ResourceStatus.ERROR,
  error: any,
};

export type Resource<T> = ResourceIdle | ResourceLoading | ResourceComplete<T> | ResourceError;

export const RESOURCE_IDLE: ResourceIdle = { status: ResourceStatus.IDLE };
export const RESOURCE_LOADING: ResourceLoading = { status: ResourceStatus.LOADING };
