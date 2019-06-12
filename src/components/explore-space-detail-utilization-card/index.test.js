import React from 'react';
import { mount, shallow } from 'enzyme';
import assert from 'assert';
import sinon from 'sinon';

import moment from 'moment';
import 'moment-timezone';

import { ExploreSpaceDetailUtilizationCard } from './index';

import {
  DEFAULT_TIME_SEGMENT_LABEL,
  DEFAULT_TIME_SEGMENT,
} from '../../helpers/time-segments/index';

describe('space utilization card', function() {

  it('should render explore space utilization card (smoke test)', async function() {
    // Render the component
    shallow(<ExploreSpaceDetailUtilizationCard
      space={{
        id: 'spc_1',
        name: 'My Space',
        currentCount: 2,
        capacity: 5,
        timeZone: 'America/New_York',
      }}
      startDate="2016-12-25T00:00:00-05:00"
      endDate="2017-01-01T00:00:00-05:00"
      timeSegmentLabel={DEFAULT_TIME_SEGMENT_LABEL}
      timeSegment={DEFAULT_TIME_SEGMENT}
      chartWidth={900}
      calculatedData={{
        state: 'COMPLETE',
        data: {
          requiresCapacity: false,
          counts: [],
          groups: [],
          utilizations: [],
        },
        error: null,
      }}
    />);
  });
  it('should render explore space utilization card with a space that does not have a capacity', async function() {
    // Render the component
    shallow(<ExploreSpaceDetailUtilizationCard
      space={{
        id: 'spc_1',
        name: 'My Space',
        currentCount: 2,
          capacity: null, /* no capacity */
        timeZone: 'America/New_York',
      }}
      startDate="2016-12-25T00:00:00-05:00"
      endDate="2017-01-01T00:00:00-05:00"
      timeSegmentLabel={DEFAULT_TIME_SEGMENT_LABEL}
      timeSegment={DEFAULT_TIME_SEGMENT}
      chartWidth={900}
      calculatedData={{
        state: 'COMPLETE',
        data: {
          requiresCapacity: true,
        },
        error: null,
      }}
    />);
  });
});
