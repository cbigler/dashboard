import { IMPERSONATE_UNSET } from '../../actions/impersonate';

export default function impersonateReducerEnhancer(reducer) {
  return (state, props) => {
    const result = reducer(state, props);
    if (props.type === IMPERSONATE_UNSET) {
      delete localStorage['impersonate'];
    }
    if (result && state && result.selectedUser !== state.selectedUser) {
      if (result.selectedUser) {
        localStorage['impersonate'] = JSON.stringify(result);
      } else {
        delete localStorage['impersonate'];
      }
      window.location.hash = '/';
      window.location.reload();
    }
    return result;
  };
}
