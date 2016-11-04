import update from 'react-addons-update';

const initialState = {
  email: null,
  password: null,
  statusText: null,
  jwt: window.localStorage.jwt
}

export default function login(state=initialState, action) {
  switch(action.type) {
    case 'LOGIN_FIELD_UPDATE':
      return Object.assign({}, state, {[action.field]: action.value});
    case 'LOGIN_REQUEST':
      return Object.assign({}, state, {statusText: "Logging in..."});
    case 'LOGIN_FAILURE':
      return Object.assign({}, state, {statusText: action.message });
    case 'LOGIN_SUCCESS':
      return Object.assign({}, state, {statusText: "", jwt: action.jwt});
    default:
      return state;
  }
}
