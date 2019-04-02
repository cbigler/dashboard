
export const INTEGRATIONS_ROBIN_SPACES_SET = 'INTEGRATIONS_ROBIN_SPACES_SET',
             INTEGRATIONS_ROBIN_SPACES_ERROR = 'INTEGRATIONS_ROBIN_SPACES_ERROR',
             INTEGRATIONS_ROBIN_SPACES_SELECT = 'INTEGRATIONS_ROBIN_SPACES_SELECT';

export function integrationsRobinSpacesSet(data) {
  return { type: INTEGRATIONS_ROBIN_SPACES_SET, data };
}

export function integrationsRobinSpacesError(error) {
  return { type: INTEGRATIONS_ROBIN_SPACES_ERROR, error };
}

export function integrationsRobinSpacesSelect(id) {
  return { type: INTEGRATIONS_ROBIN_SPACES_SELECT, id };
}
