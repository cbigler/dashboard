import { Subject, combineLatest } from 'rxjs';
import { filter, take, switchMap } from 'rxjs/operators';
import { SpacesPageState } from './reducer';
import { SpacesState } from '../spaces';
import { StoreSubject } from '..';
import { GlobalAction } from '../../types/rx-actions';
import { loadRawEvents } from '../../rx-actions/spaces-page/operations';
import { spacesPageActions } from '../../rx-actions/spaces-page';

export function registerSideEffects(
  actionStream: Subject<GlobalAction>,
  spacesPageStore: StoreSubject<SpacesPageState>,
  spacesStore: StoreSubject<SpacesState>,
  dispatch: (action: GlobalAction) => void,
) {
  spacesPageStore.subscribe(state => {
    localStorage.sessionSpacesPageState = JSON.stringify({
      startDate: state.startDate,
      endDate: state.endDate,
      timeFilter: state.timeFilter,
      timeSegmentLabel: state.timeSegmentLabel,
      showDoorways: state.showDoorways,
      collapsedSpaces: Array.from(state.collapsedSpaces).slice(-1000),
    });
  });

  // This loads the correct page of raw events,
  // Whenever state affecting that data changes
  actionStream.pipe(
    filter(action => (
      action.type === 'SPACES_PAGE_SET_REPORT_DATES' ||
      (action.type === 'SPACES_PAGE_SET_RAW_EVENTS' && !!action.rawEvents.page)
    )),
    switchMap(() => combineLatest(
      spacesPageStore.pipe(take(1)),
      spacesStore.pipe(take(1))
    )),
  ).subscribe(([spacesPage, spaces]) => {
    dispatch(spacesPageActions.setRawEvents({status: 'LOADING'}));
    loadRawEvents(dispatch, spaces, spacesPage);
  });
}
