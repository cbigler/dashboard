import update from 'react-addons-update';

const initialState = {
  orgToken: null,
  id: null
}

export default function organization(state=initialState, action) {
  switch(action.type) {
    case 'TOKENS_SUCCESS':
      return Object.assign({}, state, {
        orgToken: action.json.tokens[0]
      });
    case 'USERS_ME_SUCCESS':
      let orgId = action.json.auth.orgs[0].id;
      return Object.assign({}, state, {
        id: orgId
      });
    default:
      return state;
  }
}
