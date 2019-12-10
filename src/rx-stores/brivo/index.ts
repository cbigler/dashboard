import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import { DensityBrivoSite, DensityDoorway, DensityDoorwayMapping } from '../../types';
import createRxStore from '..';


export type BrivoState = {
  sites: DensityBrivoSite[],
  doorways: DensityDoorway[],
  doorwayMappings: DensityDoorwayMapping[],
  sitesLoading: boolean,
  numberOfSitesLoaded: number,
}

const initialState: BrivoState = {
  sites: [],
  doorways: [],
  doorwayMappings: [],
  sitesLoading: false,
  numberOfSitesLoaded: 0,
};

export function brivoSitesReducer(state: BrivoState, action: Any<FixInRefactor>): BrivoState {
  switch (action.type) {

  case 'BRIVO_SET':
    return {
      ...state,
      doorways: action.doorways.map(t => objectSnakeToCamel<DensityDoorway>(t)),
      doorwayMappings: action.doorwayMappings.map(t => objectSnakeToCamel<DensityDoorwayMapping>(t)),
      sites: action.sites.map(t => objectSnakeToCamel<DensityBrivoSite>(t)),
    };

  case 'BRIVO_SET_ACCESS_POINTS':
    return {
      ...state,
      sites: state.sites.map(site => {
        if (site.id === action.site.id) {
          site.accessPoints = action.accessPoints;
        }
        return site;
      })
    }

  case 'BRIVO_SITES_LOADING':
    return {
      ...state,
      sitesLoading: action.sitesLoading,
      numberOfSitesLoaded: 0,
    }

  case 'BRIVO_INCREMENT_SITES_LOADED':
    return {
      ...state,
      numberOfSitesLoaded: state.numberOfSitesLoaded + 1,
    }

  case 'BRIVO_ADD_SITES':
    // ROB: This action just temporarily "adds" a list of sites so they show up in the interface
    // There's no corresponding change on the backend... once these sites actually have subscriptions
    // This property will have a real value in it
    return {
      ...state,
      sites: state.sites.map(site => {
        if (action.ids.indexOf(site.id) > -1) {
          site.eventSubscriptionId = 'PENDING';
        }
        return site;
      })
    }

  case 'BRIVO_REMOVE_SITE':
    return {
      ...state,
      sites: state.sites.filter(site => site.id !== action.id),
    }

  case 'BRIVO_ASSIGN_DOORWAY':
    // ROB: Not sure how necessary this is, this is to alter the collection so that the new mapping is reflected
    // If the backend API calls are all working, this mapping should show up just by reloading the data
    // Or in a pinch, reloading the dashboard with window.location.reload()
    return {
      ...state,
      doorwayMappings: [...state.doorwayMappings, {
        id: action.id,
        doorwayId: action.doorwayId,
        serviceDoorwayId: action.serviceDoorwayId,
        serviceId: action.serviceId,
      }]
    }
  
  case 'BRIVO_UNASSIGN_DOORWAY':
  // ROB: Not sure how necessary this is, this is to alter the collection so that the new mapping is reflected
  // If the backend API calls are all working, this mapping should show up just by reloading the data
  // Or in a pinch, reloading the dashboard with window.location.reload()
  return {
    ...state,
    doorwayMappings: state.doorwayMappings.filter(dwm => dwm.id !== action.id),
  }

  default:
    return state;
  }
  
}

const BrivoSitesStore = createRxStore('BrivoSitesStore', initialState, brivoSitesReducer);
export default BrivoSitesStore;
