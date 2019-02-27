export const COLLECTION_DISPATCH_SCHEDULES_ERROR = 'COLLECTION_DISPATCH_SCHEDULES_ERROR';

export default function collectionDispatchSchedulesError(error) {
  // Convert error objects to strings.
  if (error instanceof Error) {
    error = error.toString();
  }
  return { type: COLLECTION_DISPATCH_SCHEDULES_ERROR, error };
}
