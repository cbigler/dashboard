import createRxStore, { skipUpdate } from './index';

import { AlertActionTypes, AlertState } from '../types/alerts';

const initialState: AlertState = {
  view: 'LOADING',
  selected: null,
  error: null,
  data: [],
};

export default createRxStore<AlertState>(initialState, (state, action) => {
  switch (action.type) {
    case AlertActionTypes.COLLECTION_ALERTS_SET:
      return {
        ...state,
        data: action.alerts,
        view: 'VISIBLE',
        error: null
      };

    case AlertActionTypes.COLLECTION_ALERTS_PUSH:
      return {
        ...state,
        view: 'VISIBLE',
        data: [
          ...state.data.map(alert => (
            action.alert.id === alert.id ? {...alert, ...action.alert} : alert
          )),
          ...state.data.find(alert => alert.id === action.alert.id) ? [] : [action.alert]
        ],
      };

    case AlertActionTypes.COLLECTION_ALERTS_REMOVE:
      return {
        ...state,
        view: 'VISIBLE',
        data: state.data.filter(alert => action.alert.id !== alert.id)
      };

    case AlertActionTypes.COLLECTION_ALERTS_ERROR:
      return {
        ...state,
        view: 'ERROR',
        error: action.error
      };

    default:
      return skipUpdate;
  }
});
