import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways';
import { ActionTypesOf } from '..';

const setAll = (data: Array<CoreDoorway>) => ({ type: 'DOORWAYS_SET_ALL' as const, data });
const setOne = (data: CoreDoorway) => ({ type: 'DOORWAYS_SET_ONE' as const, data });
const removeAll = () => ({ type: 'DOORWAYS_REMOVE_ALL' as const });
const removeOne = (id: CoreDoorway['id']) => ({ type: 'DOORWAYS_REMOVE_ONE' as const, id });

export const doorwayActions = { setAll, setOne, removeAll, removeOne };
export type DoorwayAction = ActionTypesOf<typeof doorwayActions>;
