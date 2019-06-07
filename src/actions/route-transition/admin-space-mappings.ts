import showToast from '../toasts/index';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import { DensityService, DensityServiceSpace } from '../../types';
import core from '../../client/core';

import collectionServiceSpacesSet from '../collection/service-spaces/set';
import collectionServicesError from '../collection/services/error';
import collectionServicesSet from '../collection/services/set';
import fetchAllObjects from '../../helpers/fetch-all-objects';

export const ROUTE_TRANSITION_ADMIN_SPACE_MAPPINGS = 'ROUTE_TRANSITION_ADMIN_SPACE_MAPPINGS';


export default function routeTransitionAdminSpaceMappings(serviceName) {
  return async (dispatch, getState) => {
    dispatch({ type: ROUTE_TRANSITION_ADMIN_SPACE_MAPPINGS })

    let service = getState().integrations.services.find(service => service.name == serviceName)
    if (service) {
      dispatch(fetchAllServiceSpaces(service));
    } else {
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
        const services = response.data.map(d => objectSnakeToCamel<DensityService>(d));
        dispatch(collectionServicesSet(services));
        service = services.find(service => service.name === serviceName)
        dispatch(fetchAllServiceSpaces(service));
      }  
    }
  }
}

function fetchAllServiceSpaces(service) { 
  return async (dispatch) => {
    let serviceSpaces, errorThrown;
    try {
      serviceSpaces = await fetchAllObjects<DensityServiceSpace>(`/integrations/${service.name}/spaces`);
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      console.log(errorThrown)
      dispatch(showToast({type: 'error', text: 'Error grabbing third party spaces'}));
      return;
    } else {
      dispatch(collectionServiceSpacesSet(service, serviceSpaces))  
    }
  }
}