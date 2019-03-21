export const COLLECTION_INTEGRATIONS_SERVICES_SET = 'COLLECTION_INTEGRATIONS_SERVICES_SET';

export default function collectionIntegrationsServicesSet(services) {
  return { type: COLLECTION_INTEGRATIONS_SERVICES_SET, data: services };
}
