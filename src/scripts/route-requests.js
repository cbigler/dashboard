import {hashHistory} from 'react-router';
import store from 'dashboard/store';
import {syncHistoryWithStore} from 'react-router-redux'

import fetchParam from 'dashboard/helpers/fetch-param';

import {spacesIndex, spacesRead} from 'dashboard/actions/spaces';
import {eventsIndex} from 'dashboard/actions/events';
import {doorwaysIndex} from 'dashboard/actions/doorways';
import {tokensIndex} from 'dashboard/actions/tokens';
import {totalVisitsFetch} from 'dashboard/actions/total-visits';
import {rawEventsFetch} from 'dashboard/actions/raw-events';
import {eventCountFetch} from 'dashboard/actions/event-count';

const history = syncHistoryWithStore(hashHistory, store);

var spacesReadInterval;
var spacesIndexInterval;

// there is a weird bug where the history.listen gets fired twice, not sure what it is yet
// but either way, this is a terrible way to fix it
// ......
var requestNum = 3; 

history.listen(location => {
  if (requestNum==1 || requestNum==3) {
    clearInterval(spacesIndexInterval);
    clearInterval(spacesReadInterval);
    if (location.pathname === "/") {
      window.localStorage.jwt ? hashHistory.push('/spaces') : hashHistory.push('/login');
    } else if (location.pathname === "/tokens") {
      store.dispatch(spacesIndex());
      store.dispatch(doorwaysIndex());
      store.dispatch(tokensIndex());
      store.dispatch(eventsIndex(1, 10));
    } else if (location.pathname.startsWith("/spaces/") && location.pathname.length > 8) {
      let state = store.getState();
      var spaceId = fetchParam(location);
      store.dispatch(doorwaysIndex());
      store.dispatch(spacesRead(spaceId));
      store.dispatch(totalVisitsFetch(spaceId));
      store.dispatch(eventCountFetch(state.eventCount.date, spaceId));
      store.dispatch(rawEventsFetch(state.rawEvents.startDate, state.rawEvents.endDate, 1, 10, spaceId));
      spacesReadInterval = setInterval(() => {
        store.dispatch(spacesRead(spaceId));
      }, 2000);
    } else if (location.pathname === "/spaces") {
      store.dispatch(spacesIndex());
      spacesIndexInterval = setInterval(() => {
        store.dispatch(spacesIndex());
      }, 2000);
    }
  }
  requestNum = (requestNum==1 || requestNum==3) ? 0 : 1;
});

export default history;