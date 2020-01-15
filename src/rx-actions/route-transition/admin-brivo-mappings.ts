import { showToast } from '../toasts';

import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways';
import { DensityService, DensityBrivoSite } from '../../types';
import core from '../../client/core';

import collectionServicesError from '../collection/services/error';
import collectionServicesSet from '../collection/services/set';
import fetchAllObjects from '../../helpers/fetch-all-objects';

export const ROUTE_TRANSITION_ADMIN_BRIVO_MAPPINGS = 'ROUTE_TRANSITION_ADMIN_BRIVO_MAPPINGS';
export const BRIVO_ERROR = 'BRIVO_ERROR';
export const BRIVO_SET = 'BRIVO_SET';


export default async function routeTransitionAdminBrivoMappings(dispatch) {
  dispatch({ type: ROUTE_TRANSITION_ADMIN_BRIVO_MAPPINGS })

  // fetch list of all services
  let response, servicesError;
  try {
    response = await core().get('/integrations/services/')
  } catch (err) {
    servicesError = err;
  }

  if (servicesError) {
    dispatch(collectionServicesError('Could not find third party integrations.'));
    return false;
  } else {
    const services = response.data as Array<DensityService>;
    dispatch(collectionServicesSet(services));
    fetchAllBrivoSites(dispatch);
  }
}

async function fetchAllBrivoSites(dispatch) { 
  let doorways, doorwayMappings, sites, errorThrown;
  try {
    // BRIAN: Not sure how guys handle loading states, but I'm using this to determine if it's loading...
    dispatch({type: 'BRIVO_SITES_LOADING', sitesLoading: true})
    doorways = await fetchAllObjects<CoreDoorway>('/doorways', {
      cache: false,
      params: { environment: 'true' }
    });
    doorwayMappings = await fetchAllObjects<CoreDoorway>('/integrations/doorway_mappings/', { cache: false });
    sites = await fetchAllObjects<DensityBrivoSite>('/integrations/brivo/sites/', { cache: false });
    Promise.all(sites.map(site => {      
      return fetchAllObjects<any>(`integrations/brivo/sites/${site.id}/access_points/`, { cache: false }).then(accessPoints => {
        dispatch({type: 'BRIVO_INCREMENT_SITES_LOADED'})
        dispatch({type: 'BRIVO_SET_ACCESS_POINTS', site, accessPoints})
      })
    })).then(() => {
      dispatch({type: 'BRIVO_SITES_LOADING', sitesLoading: false})
    })
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    console.log(errorThrown);
    showToast(dispatch, {type: 'error', text: 'Error fetching Brivo data'});
    dispatch({type: 'BRIVO_ERROR', errorThrown});
  } else {
    dispatch({type: 'BRIVO_SET', doorways, doorwayMappings, sites});
  }
}
