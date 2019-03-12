import axios from 'axios';

export default function impersonateHeaderReducerEnhancer(reducer) {
  return (state, props) => {
    const result = reducer(state, props);
    if (result.data && result.data.selectedUser) {
      axios.defaults.headers.common['X-Impersonate-User'] = result.data.selectedUser.id;
    } else {
      delete axios.defaults.headers.common['X-Impersonate-User'];
    }
    return result;
  };
}
