import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux'
import {push} from 'react-router-redux';

import alerts from './alerts';
import appbar from './appbar';
import doorways from './doorways';
import eventCount from './event-count';
import events from './events';
import login from './login';
import organization from './organization';
import rawEvents from './raw-events';
import spaces from './spaces';
import totalVisits from './total-visits';
import user from './user';



const appReducer = combineReducers({
  alerts,
  appbar,
  doorways,
  eventCount,
  events,
  login,
  organization,
  rawEvents,
  spaces,
  totalVisits,
  user,
  routing: routerReducer
})

const rootReducer = (state, action) => {
  if (action.type === 'LOGOUT_USER') {
    const {routing} = state;
    state = {routing}
  }

  return appReducer(state, action)
}

export default rootReducer;