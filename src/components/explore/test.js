import React from 'react';
import { mount, shallow } from 'enzyme';
import assert from 'assert';
import sinon from 'sinon';
import moment from 'moment';

import { Explore } from './index';
import { DEFAULT_TIME_SEGMENT_GROUP } from '../../helpers/time-segments/index';
import { SORT_A_Z } from '../../helpers/sort-collection/index';

function timeout(delay) {
  return new Promise(r => setTimeout(r, delay));
}

const DATA_DURATION_WEEK = 'DATA_DURATION_WEEK';
const testSpaceData = [
  {
    "id": "spc_1",
    "name": "Cool Campus",
    "description": "",
    "parent_id": "",
    "space_type": "campus",
    "time_zone": "America/New_York",
    "daily_reset": "00:00",
    "current_count": 0,
    "capacity": null,
    "created_at": "2018-07-12T14:43:33.135Z",
    "doorways": [
      
    ],
    "tags": [
      
    ],
    "address_line1": "",
    "address_line2": null,
    "city": null,
    "state_province": null,
    "postal_code": null,
    "country_code": null,
    "latitude": null,
    "longitude": null,
    "time_segments": [],
    "time_segment_groups": []
  },
  {
    "id": "spc_4",
    "name": "Cool Other Campus",
    "description": "",
    "parent_id": "",
    "space_type": "campus",
    "time_zone": "America/New_York",
    "daily_reset": "00:00",
    "current_count": 0,
    "capacity": null,
    "created_at": "2018-07-12T14:43:33.135Z",
    "doorways": [
      
    ],
    "tags": [
      
    ],
    "address_line1": "",
    "address_line2": null,
    "city": null,
    "state_province": null,
    "postal_code": null,
    "country_code": null,
    "latitude": null,
    "longitude": null,
    "time_segments": [],
    "time_segment_groups": []
  },
  {
    "id": "spc_2",
    "name": "Cool Building",
    "description": "",
    "parent_id": "spc_1",
    "space_type": "building",
    "time_zone": "America/New_York",
    "daily_reset": "04:00",
    "current_count": 0,
    "capacity": null,
    "created_at": "2018-07-12T14:49:53.755Z",
    "doorways": [
    ],
    "tags": [
    ],
    "address_line1": "12 E 49th St.",
    "address_line2": null,
    "city": null,
    "state_province": null,
    "postal_code": null,
    "country_code": null,
    "latitude": null,
    "longitude": null,
    "time_segments": [
    ],
    "time_segment_groups": [      
    ]
  },
  {
    "id": "spc_3",
    "name": "Cool Space",
    "description": "",
    "parent_id": "spc_2",
    "space_type": "space",
    "time_zone": "America/New_York",
    "daily_reset": "04:00",
    "current_count": 0,
    "capacity": null,
    "created_at": "2018-07-12T14:54:52.780Z",
    "doorways": [
      
    ],
    "tags": [
      
    ],
    "address_line1": null,
    "address_line2": null,
    "city": null,
    "state_province": null,
    "postal_code": null,
    "country_code": null,
    "latitude": null,
    "longitude": null,
    "time_segments": [
      
    ],
    "time_segment_groups": [
      
    ]
  }
]

const testSpaces = {
  data: testSpaceData,
  loading: true,
  error: null,
  selected: null,
  filters: {
    doorwayId: null,
    search: '',
    sort: SORT_A_Z,
    parent: null,

    timeSegmentGroupId: DEFAULT_TIME_SEGMENT_GROUP.id,
    dataDuration: DATA_DURATION_WEEK,

    metricToDisplay: 'entrances',
    dailyRawEventsPage: 1,

    // Used for date ranges
    startDate: null,
    endDate: null,

    // Used for a single date
    date: moment.utc().format(),
  },

  // An object that maps space id to an array of events
  events: {
    /* For example:
    'spc_XXXX': [{timestamp: '2017-07-24T12:37:42.946Z', direction: 1}],
    */
  },
}

describe('Explore Sidebar', function() {
  it('should render the list of spaces in the sidebar', function() {
    const component = mount(<Explore
      spaces={testSpaces}
    />);

  })
})


