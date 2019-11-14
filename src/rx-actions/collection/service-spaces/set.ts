export const COLLECTION_SERVICE_SPACES_SET = 'COLLECTION_SERVICE_SPACES_SET';

export default function collectionServiceSpacesSet(service, serviceSpaces) {
  return { type: COLLECTION_SERVICE_SPACES_SET, service: service, data: serviceSpaces };
}
