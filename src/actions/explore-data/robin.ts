export const EXPLORE_DATA_ROBIN_SPACES_SET = 'EXPLORE_DATA_ROBIN_SPACES_SET',
             EXPLORE_DATA_ROBIN_SPACES_ERROR = 'EXPLORE_DATA_ROBIN_SPACES_ERROR';

export function exploreDataRobinSpacesSet(data) {
  return { type: EXPLORE_DATA_ROBIN_SPACES_SET, data };
}

export function exploreDataRobinSpacesError(error) {
  return { type: EXPLORE_DATA_ROBIN_SPACES_ERROR, error };
}
