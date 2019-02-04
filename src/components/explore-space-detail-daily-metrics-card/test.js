import React from 'react';
import { mount } from 'enzyme';
import assert from 'assert';
import sinon from 'sinon';
import mockdate from 'mockdate';

import moment from 'moment';
import 'moment-timezone';

import {
  ExploreSpaceDetailDailyMetricsCard as DailyMetricsCard,
  isOutsideRange,
} from './index';

import { DEFAULT_TIME_SEGMENT_GROUP, DEFAULT_TIME_SEGMENT } from '../../helpers/time-segments/index';

describe('Explore space daily metrics chart', function() {
  // Used to figure out which days are visible and which days are hidden within the date range
  // picker.
  describe('isOutsideRange', function() {
    // Mock the current date for the tests.
    beforeEach(() => mockdate.set(moment('2017-01-01T00:00:00-05:00')));
    afterEach(() => mockdate.reset());

    it('should block out two weeks way before the current date', function() {
      // Start a date selection. 
      let datePickerSelection = 'startDate';

      // The user clicks a start date many months ago (ie, not around now)
      const rangeStart = moment.utc().subtract(3, 'months');
      datePickerSelection = 'endDate';


      // The two weeks after that date should be available to select.
      // First day; (1 day into the 2 week range)
      const firstDayOfRange = rangeStart.clone();
      assert.equal(isOutsideRange(rangeStart.format(), datePickerSelection, firstDayOfRange), false);

      // In the middle-ish; (5 days into the 2 week range)
      const randomDayInRange = rangeStart.clone().add(5, 'days');
      assert.equal(isOutsideRange(rangeStart.format(), datePickerSelection, randomDayInRange), false);

      // At the end; (2 weeks - 1 start day = 13 days)
      const lastDayOfRange = rangeStart.clone().add(13, 'days');
      assert.equal(isOutsideRange(rangeStart.format(), datePickerSelection, lastDayOfRange), false);

      // Days outside of that range can still be selected, a different chart will just be shown.
    });
    it('should block out two weeks that has the current date within the range', function() {
      // Start a date selection. 
      let datePickerSelection = 'startDate';

      // The user clicks a start date a few days in the past.
      const rangeStart = moment.utc().subtract(3, 'days');
      datePickerSelection = 'endDate';


      // The time range should be from the start date until the current date (which can be < 2 weeks)
      // First day; (1 day into the 3 day range)
      const firstDayOfRange = rangeStart.clone();
      assert.equal(isOutsideRange(rangeStart.format(), datePickerSelection, firstDayOfRange), false);

      // In the middle; (2 days into the 3 day range)
      const middleDayInRange = rangeStart.clone().add(1, 'days');
      assert.equal(isOutsideRange(rangeStart.format(), datePickerSelection, middleDayInRange), false);

      // At the end; (final day of three day range)
      const lastDayOfRange = rangeStart.clone().add(2, 'days');
      assert.equal(isOutsideRange(rangeStart.format(), datePickerSelection, lastDayOfRange), false);


      // And days outside of that range should not be able to be selected.
      // Day before the range start
      const dayBeforeFirstDayOfRange = rangeStart.clone().subtract(1, 'day');
      assert.equal(isOutsideRange(rangeStart.format(), datePickerSelection, dayBeforeFirstDayOfRange), true);

      // Day after the range end
      const dayAfterLastDayOfRange = rangeStart.clone().add(4, 'days') 
      assert.equal(isOutsideRange(rangeStart.format(), datePickerSelection, dayAfterLastDayOfRange), true);

      // Many days before the range starts
      const manyDaysBeforeFirstDayOfRange = rangeStart.clone().subtract(1, 'month') 
      assert.equal(isOutsideRange(rangeStart.format(), datePickerSelection, manyDaysBeforeFirstDayOfRange), true);

      // Many days after the range ends.
      const manyDaysAfterLastDayOfRange = rangeStart.clone().add(1, 'month') 
      assert.equal(isOutsideRange(rangeStart.format(), datePickerSelection, manyDaysAfterLastDayOfRange), true);
    });
  });

  it('should display entrance data for january 1st, 2017', async function() {
    const space = {
      id: 'spc_123',
      name: 'foo',
      currentCount: 5,
      timeZone: `America/New_York`
    };

    // Render the component
    const component = mount(<DailyMetricsCard
      space={space}
      spaces={{
        data: [space],
        filters: {
          metricToDisplay: 'entrances',
        },
      }}
      startDate="2016-12-26T00:00:00-05:00"
      endDate="2017-01-01T00:00:00-05:00"
      timeSegmentGroup={DEFAULT_TIME_SEGMENT_GROUP}
      timeSegment={DEFAULT_TIME_SEGMENT}
      chartWidth={900}
      calculatedData={{
        state: 'COMPLETE',
        data: {
          metrics: [
            {timestamp: '2018-01-07T00:00:00-05:00', value: 10},
            {timestamp: '2018-01-06T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-05T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-04T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-03T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-02T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-01T00:00:00-05:00', value: 0},
          ]
        }
      }}
    />);

    // Verify that the correct data was passed to the chart given what the ajax return data.
    const chartProps = component.find('.short-timespan-chart > _class').props();
    assert.deepEqual(chartProps.data, [
      {label: '01/07', value: 10},
      {label: '01/06', value: 0},
      {label: '01/05', value: 0},
      {label: '01/04', value: 0},
      {label: '01/03', value: 0},
      {label: '01/02', value: 0},
      {label: '01/01', value: 0},
    ]);
  });

  it('should correctly use the daily metrics chart when data range is <= 14 days', async function() {
    const space = {
      id: 'spc_123',
      name: 'foo',
      currentCount: 5,
      timeZone: `America/New_York`
    };

    // Render the component
    const component = mount(<DailyMetricsCard
      space={space}
      spaces={{
        data: [space],
        filters: {
          metricToDisplay: 'entrances',
        },
      }}
      startDate="2016-12-26T00:00:00-05:00"
      endDate="2017-01-01T00:00:00-05:00"
      timeSegmentGroup={DEFAULT_TIME_SEGMENT_GROUP}
      timeSegment={DEFAULT_TIME_SEGMENT}
      chartWidth={900}
      calculatedData={{
        state: 'COMPLETE',
        data: {
          metrics: [
            {timestamp: '2018-01-07T00:00:00-05:00', value: 10},
            {timestamp: '2018-01-06T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-05T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-04T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-03T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-02T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-01T00:00:00-05:00', value: 0},
          ]
        }
      }}
    />);

    // Ensure the correct chart was rendered
    assert.equal(component.find('.short-timespan-chart').length, 1);
  });

  it('should correctly use the daily metrics chart when data range is > 14 days', async function() {
    const space = {
      id: 'spc_123',
      name: 'foo',
      currentCount: 5,
      timeZone: `America/New_York`
    };

    // Render the component
    const component = mount(<DailyMetricsCard
      space={space}
      spaces={{
        data: [space],
        filters: {
          metricToDisplay: 'entrances',
        },
      }}
      startDate="2016-12-26T00:00:00-05:00"
      endDate="2017-01-01T00:00:00-05:00"
      timeSegmentGroup={DEFAULT_TIME_SEGMENT_GROUP}
      timeSegment={DEFAULT_TIME_SEGMENT}
      chartWidth={900}
      calculatedData={{
        state: 'COMPLETE',
        data: {
          metrics: [
            {timestamp: '2018-01-15T00:00:00-05:00', value: 10},
            {timestamp: '2018-01-14T00:00:00-05:00', value: 10},
            {timestamp: '2018-01-13T00:00:00-05:00', value: 10},
            {timestamp: '2018-01-12T00:00:00-05:00', value: 10},
            {timestamp: '2018-01-11T00:00:00-05:00', value: 10},
            {timestamp: '2018-01-10T00:00:00-05:00', value: 10},
            {timestamp: '2018-01-09T00:00:00-05:00', value: 10},
            {timestamp: '2018-01-08T00:00:00-05:00', value: 10},
            {timestamp: '2018-01-07T00:00:00-05:00', value: 10},
            {timestamp: '2018-01-06T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-05T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-04T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-03T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-02T00:00:00-05:00', value: 0},
            {timestamp: '2018-01-01T00:00:00-05:00', value: 0},
          ]
        }
      }}
    />);

    // Ensure the correct chart was rendered
    assert.equal(component.find('.large-timespan-chart').length, 1);
  });
});
