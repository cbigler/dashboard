import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { ActionTypesOf } from '..';

const setAll = (data: Array<CoreSpace>) => ({ type: 'SPACES_SET_ALL' as const, data });
const setOne = (data: CoreSpace) => ({ type: 'SPACES_SET_ONE' as const, data });
const removeAll = () => ({ type: 'SPACES_REMOVE_ALL' as const });
const removeOne = (id: CoreSpace['id']) => ({ type: 'SPACES_REMOVE_ONE' as const, id });

export const spaceActions = { setAll, setOne, removeAll, removeOne };
export type SpaceAction = ActionTypesOf<typeof spaceActions>;
