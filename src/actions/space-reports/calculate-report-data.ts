import { REPORTS } from '@density/reports';
import { getGoSlow } from '../../components/environment-switcher/index';
import core from '../../client/core';

import { DensityReportCalculatationFunction, DensityService } from '../../types';
import { SpaceReportControlTypes } from '../../interfaces/space-reports';
import * as moment from 'moment';
import spacesUpdateReportController from './update-report-controller';
import { DEFAULT_TIME_SEGMENT_LABEL } from '../../helpers/time-segments';
import collectionServicesError from '../collection/services/error';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { integrationsRoomBookingSetService } from '../integrations/room-booking';

export const DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE = 'DASHBOARDS_CALCULATE_REPORT_DATA_COMPLETE';
export const DASHBOARDS_CALCULATE_REPORT_DATA_ERROR = 'DASHBOARDS_CALCULATE_REPORT_DATA_ERROR';
export const DASHBOARDS_CALCULATE_REPORT_DATA_UNAUTHORIZED = 'DASHBOARDS_CALCULATE_REPORT_DATA_UNAUTHORIZED';
export const DASHBOARDS_CALCULATE_REPORT_DATA_CLEAR = 'DASHBOARDS_CALCULATE_REPORT_DATA_CLEAR';
export const DASHBOARDS_CALCULATE_REPORT_DATA_NO_DATA = 'DASHBOARDS_CALCULATE_REPORT_DATA_NO_DATA';

export default function spaceReportsCalculateReportData(controller, space, roomBookingServiceName = null) {
  return async dispatch => {
    dispatch(spacesUpdateReportController(space, {
      ...controller,
      status: 'LOADING'
    }));

    // Determine if a room booking integration is active
    const services: Array<DensityService> = await (async function() {
      let servicesResponse;
      try {
        servicesResponse = await core().get('/integrations/services/', {});
      } catch (err) {
        dispatch(collectionServicesError(`Error loading integrations list: ${err.message}`));
        return null;
      }

      return servicesResponse.data.map(s => objectSnakeToCamel<DensityService>(s));
    })();

    let roomBookingService;
    if (roomBookingServiceName) {
      roomBookingService = services.find(service => service.name === roomBookingServiceName);
    } else {
      roomBookingService = services
        .filter(service => service.category === 'Room Booking')
        .filter(service => typeof service.serviceAuthorization.id !== 'undefined')
        .find(service => service.serviceAuthorization.default);
    }

    dispatch(integrationsRoomBookingSetService(roomBookingService));

    const spaceMappingExists = space.spaceMappings.length > 0;

    const reports = await Promise.all(
      controller.reports.map(async report => {
        const reportDataCalculationFunction: DensityReportCalculatationFunction = REPORTS[report.configuration.type].calculations;
        
        const dateRangeControl = controller.controls.find(x => x.controlType === SpaceReportControlTypes.DATE_RANGE) as any;
        const startDate = moment.tz(dateRangeControl.startDate, space.timeZone);
        const endDate = moment.tz(dateRangeControl.endDate, space.timeZone).add(1, 'day');

        const timeSegmentControl = controller.controls.find(x => x.controlType === SpaceReportControlTypes.TIME_SEGMENT) as any;

        const configuration = {
          ...report.configuration,
          settings: {
            ...report.configuration.settings,
            spaceId: space.id,
            timeRange: {
              type: 'CUSTOM_RANGE',
              startDate: startDate,
              endDate: endDate,
            },
            timeSegmentLabels: timeSegmentControl.timeSegment === DEFAULT_TIME_SEGMENT_LABEL ? [] : [ timeSegmentControl.timeSegment ],
          }
        };

        try {
          const data = await reportDataCalculationFunction(configuration, {
            client: core(),
            slow: getGoSlow(),
          });
          return { ...report, status: 'COMPLETE', data };
        } catch (error) {
          console.error(error);
          return { ...report, status: 'ERROR', error };
        }
      })
    );
    dispatch(spacesUpdateReportController(space, {
      ...controller,
      status: 'COMPLETE',
      reports,
    }));
  };
}
