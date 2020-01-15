import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';

// Space Report Actions

export enum SpaceReportActionTypes {
  SPACES_SET_REPORT_CONTROLLERS = 'SPACES_SET_REPORT_CONTROLLERS',
  SPACES_UPDATE_REPORT_CONTROLLER = 'SPACES_UPDATE_REPORT_CONTROLLER',
};

export type SpaceReportsAction = {
  type: SpaceReportActionTypes.SPACES_SET_REPORT_CONTROLLERS,
  controllers: Array<ISpaceReportController>,
  space: CoreSpace,
} | {
  type: SpaceReportActionTypes.SPACES_UPDATE_REPORT_CONTROLLER,
  controller: ISpaceReportController
};


// Space Report State

export interface ISpaceReport {
  data: Any<FixInRefactor>;
  status: 'LOADING' | 'COMPLETE' | 'ERROR';
  configuration: {
    id: string;
    name: string;
    type: string;
    settings: Any<FixInRefactor>;
  };
};

export enum SpaceReportControlTypes {
  DATE = 'DATE',
  DATE_RANGE = 'DATE_RANGE',
  TIME_SEGMENT = 'TIME_SEGMENT'
};

export type ISpaceReportControl = {
  key: string,
  label?: string,
} & ({
  controlType: SpaceReportControlTypes.DATE,
  date: string,
} | {
  controlType: SpaceReportControlTypes.DATE_RANGE,
  startDate: string,
  endDate: string,
} | {
  controlType: SpaceReportControlTypes.TIME_SEGMENT,
  timeSegment: string,
});

export interface ISpaceReportController {
  key: string;
  status: 'LOADING' | 'COMPLETE' | 'ERROR';
  reports: Array<ISpaceReport>;
  controls: Array<ISpaceReportControl>;
};
