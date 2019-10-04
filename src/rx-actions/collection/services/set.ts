export const COLLECTION_SERVICES_SET = 'COLLECTION_SERVICES_SET';

export default function collectionServicesSet(services) {
  return { type: COLLECTION_SERVICES_SET, data: services };
}
