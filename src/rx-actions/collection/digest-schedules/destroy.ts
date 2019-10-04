import core from '../../../client/core';
import collectionDigestSchedulesError from './error';
import collectionDigestSchedulesRemove from './remove';
import { showToast } from '../../../rx-actions/toasts';

export const COLLECTION_DIGEST_SCHEDULES_DESTROY = 'COLLECTION_DIGEST_SCHEDULES_DESTROY';

export default async function collectionDigestSchedulesDestroy(dispatch, schedule) {
  dispatch({ type: COLLECTION_DIGEST_SCHEDULES_DESTROY });

  let errorThrown;
  try {
    await core().delete(`/digest_schedules/${schedule.id}`);
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    console.error(errorThrown);
    dispatch(collectionDigestSchedulesError(errorThrown));
    showToast(dispatch, { type: 'error', text: `Whoops! That didn't work.` });
  } else {
    dispatch(collectionDigestSchedulesRemove(schedule));
    showToast(dispatch, { text: 'Digest deleted.' });
  }
}
