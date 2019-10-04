export const COLLECTION_SENSORS_SET = 'COLLECTION_SENSORS_SET';

export default function collectionSensorsSet(sensors) {
  return { type: COLLECTION_SENSORS_SET, data: sensors };
}
