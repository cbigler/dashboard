import {hashHistory} from 'react-router';
import store from 'dashboard/store';
import {syncHistoryWithStore} from 'react-router-redux'

import fetchParam from 'dashboard/helpers/fetch-param';

import {alertsIndex} from 'dashboard/actions/alerts';
import {getCustomer} from 'dashboard/actions/billing';
import {doorway} from 'dashboard/ducks/doorways';
import {eventCountFetch} from 'dashboard/actions/event-count';
import {eventsIndex} from 'dashboard/actions/events';
import {servicesIndex, servicesSlackChannels, servicesSendSlackCode} from 'dashboard/actions/integrations';
import {token} from 'dashboard/actions/tokens';
import {sensorsIndex} from 'dashboard/actions/sensors';
import {spacesIndex, spacesRead} from 'dashboard/actions/spaces';
import {totalVisitsFetch} from 'dashboard/actions/total-visits';
import {rawEventsFetch} from 'dashboard/actions/raw-events';

const history = syncHistoryWithStore(hashHistory, store);

var spacesReadInterval;
var spacesIndexInterval;

// there is a weird bug where the history.listen gets fired twice, not sure what it is yet
// but either way, this is a terrible way to fix it
// ......
var requestNum = 3; 

// stupid hack for right now because react-router is poopy
if (window.location.hash.startsWith("#/integrations/alerts?code=")) {
  var tempCodeWithState = window.location.hash.substring(27);
  var code = tempCodeWithState.substring(0, tempCodeWithState.length-7);
  console.log("Using Code: "+code);
  store.dispatch(servicesSendSlackCode(code));
} else {
  console.log(window.location);
}

history.listen(location => {
  if (requestNum==1 || requestNum==3) {
    clearInterval(spacesIndexInterval);
    clearInterval(spacesReadInterval);
    if (location.pathname === "/") {
      window.localStorage.token ? hashHistory.push('/spaces') : hashHistory.push('/login');
    } else if (location.pathname === "/tokens") {
      store.dispatch(spacesIndex());
      store.dispatch(doorway.list());
      store.dispatch(token.list());
      store.dispatch(eventsIndex('2016-10-01', 1, 10));
    } else if (location.pathname.startsWith("/spaces/") && location.pathname.length > 8) {
      var spaceId = fetchParam(location);
      store.dispatch(doorway.list());
      store.dispatch(spacesRead(spaceId, function() {
        let state = store.getState();
        let timeZone = state.spaces.currentObj.timezone;
        store.dispatch(totalVisitsFetch(spaceId, timeZone));
        store.dispatch(eventCountFetch(state.eventCount.date, spaceId, timeZone));
        store.dispatch(rawEventsFetch(state.rawEvents.startDate, state.rawEvents.endDate, timeZone, 1, 10, spaceId));
      }));
      store.dispatch(sensorsIndex());
      spacesReadInterval = setInterval(() => {
        store.dispatch(spacesRead(spaceId));
      }, 2000);
    } else if (location.pathname === "/spaces") {
      store.dispatch(spacesIndex());
      spacesIndexInterval = setInterval(() => {
        store.dispatch(spacesIndex());
      }, 2000);
    } else if (location.pathname === "/integrations/alerts") {
      if (!location.query.code) {
        store.dispatch(servicesSlackChannels());
        store.dispatch(alertsIndex());
        store.dispatch(servicesIndex());
      }
      store.dispatch(spacesIndex());
    } else if (location.pathname === "/account/billing") {
      store.dispatch(getCustomer());
    }
  }
  requestNum = (requestNum==1 || requestNum==3) ? 0 : 1;
});

export default history;