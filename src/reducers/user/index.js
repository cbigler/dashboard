import { USER_SET } from '../../actions/user/set';
import { USER_PUSH } from '../../actions/user/push';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import mixpanelUserReducerEnhancer from '../../helpers/mixpanel-user-reducer-enhancer/index';

const initialState = {
  user: null,
  loading: false,
  error: false,
};

export function user(state=initialState, action) {
  switch (action.type) {
  case USER_SET:
    return {...state, user: objectSnakeToCamel(action.data)};
  case USER_PUSH:
    return {...state, user: {...state.user, ...objectSnakeToCamel(action.item)}};
  default:
    return state;
  }
}

export default mixpanelUserReducerEnhancer(user);