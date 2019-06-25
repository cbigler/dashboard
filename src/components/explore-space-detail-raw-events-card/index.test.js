import React from 'react';
import { mount } from 'enzyme';
import assert from 'assert';
import sinon from 'sinon';

import mockdate from 'mockdate';

import RawEventsCard from './index';

const space = {id: 'spc_1', name: 'My Space', timeZone: 'America/New_York'};

describe('daily raw events card', function() {
  it('should render the card (smoke test)', async function() {
    mount(<RawEventsCard
      space={space}
      spaces={{
        data: [space],
        filters: {
          dailyRawEventsPage: 1,
        },
      }}
      date="2018-01-01T00:00:00-05:00"
      timeSegmentLabel={'My Time segment label'}
      calculatedData={{
        state: 'COMPLETE',
        data: {
          data: [],
          doorwayLookup: {},
        },
      }}
    />);
  });
});
