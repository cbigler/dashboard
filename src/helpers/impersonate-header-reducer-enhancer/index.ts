export default function impersonateHeaderReducerEnhancer(reducer) {
  return (state, props) => {
    const result = reducer(state, props);
    if (!result) {
      delete localStorage['impersonate'];
    } else if (state && result.selectedUser !== state.selectedUser) {
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
