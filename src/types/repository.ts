export enum RepositoryStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  ERROR = 'error',
}

export type RepositoryIdle<T> = { status: RepositoryStatus.IDLE, data: T };
export type RepositoryLoading<T> = { status: RepositoryStatus.LOADING, data: T };
export type RepositoryError<T> = { status: RepositoryStatus.ERROR, data: T, error: any };

// TODO: Figure out whether the "status" in this pattern should be coupled with the raw data map
// TODO: "Idle" in this pattern is closer to "Complete" in the Resource pattern. Rename?
export type Repository<T> = RepositoryIdle<T> | RepositoryLoading<T> | RepositoryError<T>;
