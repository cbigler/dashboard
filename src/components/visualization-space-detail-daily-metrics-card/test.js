import * as React from 'react';
import { mount } from 'enzyme';
import assert from 'assert';
import sinon from 'sinon';
import mockdate from 'mockdate';

import moment from 'moment';
import 'moment-timezone';

import VisualizationSpaceDetailDailyMetricsCard, { isOutsideRange } from './index';

function timeout(delay) {
  return new Promise(r => setTimeout(r, delay));
}

describe('Visualization space 24 hour chart', function() {
  afterEach(() => mockdate.reset());

  // Used to figure out which days are visible and which days are hidden within the date range
  // picker.
  describe('isOutsideRange', function() {
    // Mock the current date for the tests.
    beforeEach(() => mockdate.set('1/1/2017'));

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


      // And days outside of that range should not be able to be selected.
      // Day before the range start
      const dayBeforeFirstDayOfRange = rangeStart.clone().subtract(1, 'day');
      assert.equal(isOutsideRange(rangeStart.format(), datePickerSelection, dayBeforeFirstDayOfRange), true);

      // Day after the range end
      const dayAfterLastDayOfRange = rangeStart.clone().add(14, 'days') 
      assert.equal(isOutsideRange(rangeStart.format(), datePickerSelection, dayAfterLastDayOfRange), true);

      // Many days before the range starts
      const manyDaysBeforeFirstDayOfRange = rangeStart.clone().subtract(1, 'month') 
      assert.equal(isOutsideRange(rangeStart.format(), datePickerSelection, manyDaysBeforeFirstDayOfRange), true);

      // Many days after the range ends.
      const manyDaysAfterLastDayOfRange = rangeStart.clone().add(1, 'month') 
      assert.equal(isOutsideRange(rangeStart.format(), datePickerSelection, manyDaysAfterLastDayOfRange), true);
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

  describe('data fetching', function() {
    it('should fetch entrance data for january 1st, 2017 and display it', async function() {
      const space = {
        id: 'spc_123',
        name: 'foo',
        currentCount: 5,
        timeZone: `America/New_York`
      };

      // Mock the data fetching call, and the current date so that we can assert properly.
      global.fetch = sinon.stub().resolves({
        ok: true,
        status: 200,
        clone() { return this; },
        json: () => Promise.resolve({
          "total": 7,
          "next": null,
          "previous": null,
          "results": [
            {
              "timestamp": "2017-01-07T05:00:00.000Z",
              "count": 9,
              "interval": {
                "start": "2017-01-07T05:00:00.000Z",
                "end": "2017-01-08T04:59:59.999Z",
                "analytics": {
                  "min": 9,
                  "max": 9,
                  "events": 9,
                  "entrances": 10,
                  "exits": 1
                }
              }
            },
            {
              "timestamp": "2017-01-06T05:00:00.000Z",
              "count": 9,
              "interval": {
                "start": "2017-01-06T05:00:00.000Z",
                "end": "2017-01-07T04:59:59.999Z",
                "analytics": {
                  "min": 9,
                  "max": 9,
                  "events": 0,
                  "entrances": 0,
                  "exits": 0
                }
              }
            },
            {
              "timestamp": "2017-01-05T05:00:00.000Z",
              "count": 9,
              "interval": {
                "start": "2017-01-05T05:00:00.000Z",
                "end": "2017-01-06T04:59:59.999Z",
                "analytics": {
                  "min": 9,
                  "max": 9,
                  "events": 0,
                  "entrances": 0,
                  "exits": 0,
                }
              }
            },
            {
              "timestamp": "2017-01-04T05:00:00.000Z",
              "count": 9,
              "interval": {
                "start": "2017-01-04T05:00:00.000Z",
                "end": "2017-01-05T04:59:59.999Z",
                "analytics": {
                  "min": 9,
                  "max": 9,
                  "events": 0,
                  "entrances": 0,
                  "exits": 0
                }
              }
            },
            {
              "timestamp": "2017-01-03T05:00:00.000Z",
              "count": 9,
              "interval": {
                "start": "2017-01-03T05:00:00.000Z",
                "end": "2017-01-04T04:59:59.999Z",
                "analytics": {
                  "min": 9,
                  "max": 9,
                  "events": 0,
                  "entrances": 0,
                  "exits": 0
                }
              }
            },
            {
              "timestamp": "2017-01-02T05:00:00.000Z",
              "count": 9,
              "interval": {
                "start": "2017-01-02T05:00:00.000Z",
                "end": "2017-01-03T04:59:59.999Z",
                "analytics": {
                  "min": 9,
                  "max": 9,
                  "events": 0,
                  "entrances": 0,
                  "exits": 0,
                }
              }
            },
            {
              "timestamp": "2017-01-01T05:00:00.000Z",
              "count": 9,
              "interval": {
                "start": "2017-01-01T05:00:00.000Z",
                "end": "2017-01-02T04:59:59.999Z",
                "analytics": {
                  "min": 9,
                  "max": 9,
                  "events": 0,
                  "entrances": 0,
                  "exits": 0
                }
              }
            },
          ]
        }),
      });
      mockdate.set('1/1/2017');

      // Render the component
      const component = mount(<VisualizationSpaceDetailDailyMetricsCard space={space} />);

      // Wait for data to be fetched.
      await timeout(250);
      assert.equal(global.fetch.callCount, 1);
      const requestParameters = global.fetch.getCall(0).args;

      // Make sure the request was correctly formulated for the `America/New_York` time zone.
      // On January 1st, the offset is NYC is 5 hours.
      const hoursOffsetFromUtc = parseInt(moment.tz(space.timeZone).format('Z').split(':')[0], 10);
      assert.equal(requestParameters[1].qs.start_time, '2016-12-26T00:00:00-05:00');
      assert.equal(requestParameters[1].qs.end_time, '2017-01-02T00:00:00-05:00');

      // Verify that the correct day was auto-inserted into the date input field, such that the last
      // week will be selected.
      assert.equal(component.find('#DateInput__screen-reader-message-startDate + div').text(), '12/26/2016');
      assert.equal(component.find('#DateInput__screen-reader-message-endDate + div').text(), '01/01/2017');

      // Also, verify that the correct data was passed to the chart given what the ajax return data.
      const chartProps = component.find('.visualization-space-detail-daily-metrics-card-body').children().nodes[0].props;
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
    it('should fetch exit data and display it during a different part of the year', async function() {
      const space = {
        id: 'spc_123',
        name: 'foo',
        currentCount: 5,
        timeZone: `America/New_York`
      };

      // Mock the data fetching call, and the current date so that we can assert properly.
      global.fetch = sinon.stub().resolves({
        ok: true,
        status: 200,
        clone() { return this; },
        json: () => Promise.resolve({
          "total": 7,
          "next": null,
          "previous": null,
          "results": [
            {
              "timestamp": "2017-09-20T04:00:00.000Z",
              "count": 0,
              "interval": {
                "start": "2017-09-20T04:00:00.000Z",
                "end": "2017-09-21T03:59:59.999Z",
                "analytics": {
                  "min": 0,
                  "max": 0
                }
              }
            },
            {
              "timestamp": "2017-09-19T04:00:00.000Z",
              "count": 0,
              "interval": {
                "start": "2017-09-19T04:00:00.000Z",
                "end": "2017-09-20T03:59:59.999Z",
                "analytics": {
                  "min": 0,
                  "max": 0
                }
              }
            },
            {
              "timestamp": "2017-09-18T04:00:00.000Z",
              "count": 0,
              "interval": {
                "start": "2017-09-18T04:00:00.000Z",
                "end": "2017-09-19T03:59:59.999Z",
                "analytics": {
                  "min": 0,
                  "max": 0
                }
              }
            },
            {
              "timestamp": "2017-09-17T04:00:00.000Z",
              "count": 0,
              "interval": {
                "start": "2017-09-17T04:00:00.000Z",
                "end": "2017-09-18T03:59:59.999Z",
                "analytics": {
                  "min": 0,
                  "max": 0
                }
              }
            },
            {
              "timestamp": "2017-09-16T04:00:00.000Z",
              "count": 0,
              "interval": {
                "start": "2017-09-16T04:00:00.000Z",
                "end": "2017-09-17T03:59:59.999Z",
                "analytics": {
                  "min": 0,
                  "max": 0
                }
              }
            },
            {
              "timestamp": "2017-09-15T04:00:00.000Z",
              "count": 0,
              "interval": {
                "start": "2017-09-15T04:00:00.000Z",
                "end": "2017-09-16T03:59:59.999Z",
                "analytics": {
                  "min": 0,
                  "max": 0
                }
              }
            },
            {
              "timestamp": "2017-09-14T04:00:00.000Z",
              "count": 0,
              "interval": {
                "start": "2017-09-14T04:00:00.000Z",
                "end": "2017-09-15T03:59:59.999Z",
                "analytics": {
                  "min": 0,
                  "max": 0
                }
              }
            },
          ],
        }),
      });
      mockdate.set('9/14/2017');

      // Render the component
      const component = mount(<VisualizationSpaceDetailDailyMetricsCard space={space} />);

      // Wait for data to be fetched.
      await timeout(250);
      assert.equal(global.fetch.callCount, 1);
      const requestParameters = global.fetch.getCall(0).args;

      // Make sure the request was correctly formulated for the `America/New_York` time zone.
      // On September 14th, the offset is NYC is 4 hours.
      const hoursOffsetFromUtc = parseInt(moment.tz(space.timeZone).format('Z').split(':')[0], 10);
      assert.equal(requestParameters[1].qs.start_time, '2017-09-08T00:00:00-04:00');
      assert.equal(requestParameters[1].qs.end_time, '2017-09-15T00:00:00-04:00');

      // Verify that the correct day was auto-inserted into the date input field, such that the last
      // week will be selected.
      assert.equal(component.find('#DateInput__screen-reader-message-startDate + div').text(), '09/08/2017');
      assert.equal(component.find('#DateInput__screen-reader-message-endDate + div').text(), '09/14/2017');

      // Also, verify that the correct data was passed to the chart given what the ajax return data.
      const chartProps = component.find('.visualization-space-detail-daily-metrics-card-body').children().nodes[0].props;
      assert.deepEqual(chartProps.data, [
        {label: '09/20', value: 0},
        {label: '09/19', value: 0},
        {label: '09/18', value: 0},
        {label: '09/17', value: 0},
        {label: '09/16', value: 0},
        {label: '09/15', value: 0},
        {label: '09/14', value: 0},
      ]);
    });
    it('should fetch data and display it in a different time zone', async function() {
      const space = {
        id: 'spc_123',
        name: 'foo',
        currentCount: 5,
        timeZone: `America/Los_Angeles`,
      };

      // Mock the data fetching call, and the current date so that we can assert properly.
      global.fetch = sinon.stub().resolves({
        ok: true,
        status: 200,
        clone() { return this; },
        json: () => Promise.resolve({
          "total": 7,
          "next": null,
          "previous": null,
          "results": [
            {
              "timestamp": "2016-09-13T07:00:00.000Z",
              "count": 0,
              "interval": {
                "start": "2016-09-13T07:00:00.000Z",
                "end": "2016-09-14T06:59:59.999Z",
                "analytics": {
                  "min": 0,
                  "max": 0
                }
              }
            },
            {
              "timestamp": "2016-09-12T07:00:00.000Z",
              "count": 0,
              "interval": {
                "start": "2016-09-12T07:00:00.000Z",
                "end": "2016-09-13T06:59:59.999Z",
                "analytics": {
                  "min": 0,
                  "max": 0
                }
              }
            },
            {
              "timestamp": "2016-09-11T07:00:00.000Z",
              "count": 0,
              "interval": {
                "start": "2016-09-11T07:00:00.000Z",
                "end": "2016-09-12T06:59:59.999Z",
                "analytics": {
                  "min": 0,
                  "max": 0
                }
              }
            },
            {
              "timestamp": "2016-09-10T07:00:00.000Z",
              "count": 0,
              "interval": {
                "start": "2016-09-10T07:00:00.000Z",
                "end": "2016-09-11T06:59:59.999Z",
                "analytics": {
                  "min": 0,
                  "max": 0
                }
              }
            },
            {
              "timestamp": "2016-09-09T07:00:00.000Z",
              "count": 0,
              "interval": {
                "start": "2016-09-09T07:00:00.000Z",
                "end": "2016-09-10T06:59:59.999Z",
                "analytics": {
                  "min": 0,
                  "max": 0
                }
              }
            },
            {
              "timestamp": "2016-09-08T07:00:00.000Z",
              "count": 0,
              "interval": {
                "start": "2016-09-08T07:00:00.000Z",
                "end": "2016-09-09T06:59:59.999Z",
                "analytics": {
                  "min": 0,
                  "max": 0
                }
              }
            },
            {
              "timestamp": "2016-09-07T07:00:00.000Z",
              "count": 0,
              "interval": {
                "start": "2016-09-07T07:00:00.000Z",
                "end": "2016-09-08T06:59:59.999Z",
                "analytics": {
                  "min": 0,
                  "max": 0
                }
              }
            }
          ]
        }),
      });
      mockdate.set('9/14/2017');

      // Render the component
      const component = mount(<VisualizationSpaceDetailDailyMetricsCard space={space} />);

      // Wait for data to be fetched.
      await timeout(250);
      assert.equal(global.fetch.callCount, 1);
      const requestParameters = global.fetch.getCall(0).args;

      // Make sure the request was correctly formulated for the `America/Los_Angeles` time zone.
      // On September 14th, the offset in LA is 7 hours.
      const hoursOffsetFromUtc = parseInt(moment.tz(space.timeZone).format('Z').split(':')[0], 10);
      assert.equal(requestParameters[1].qs.start_time, '2017-09-07T00:00:00-07:00');
      assert.equal(requestParameters[1].qs.end_time, '2017-09-14T00:00:00-07:00');

      // Verify that the correct day was auto-inserted into the date input field, such that the last
      // week will be selected.
      assert.equal(component.find('#DateInput__screen-reader-message-startDate + div').text(), '09/07/2017');
      assert.equal(component.find('#DateInput__screen-reader-message-endDate + div').text(), '09/13/2017');

      // Also, verify that the correct data was passed to the chart given what the ajax return data.
      const chartProps = component.find('.visualization-space-detail-daily-metrics-card-body').children().nodes[0].props;
      assert.deepEqual(chartProps.data, [
        {label: '09/13', value: 0},
        {label: '09/12', value: 0},
        {label: '09/11', value: 0},
        {label: '09/10', value: 0},
        {label: '09/09', value: 0},
        {label: '09/08', value: 0},
        {label: '09/07', value: 0},
      ]);
    });
  });

  // TODO: more tests could be used here. Possibly something that actually interacts with the
  // datepicker rather than just setting state (tried it, the css selectors I was tring weren't
  // working), maybe a test that tries to switch the type of metric displayed and makes sure the
  // data is refetched? Just some ideas.

  it('should correctly refetch data when sensor selected date range is changed', async function() {
    const space = {
      id: 'spc_123',
      name: 'foo',
      currentCount: 5,
      timeZone: `America/New_York`
    };

    // Mock the data fetching call, and the current date so that we can assert properly.
    global.fetch = sinon.stub().resolves({
      ok: true,
      status: 200,
      clone() { return this; },
      json: () => Promise.resolve({
        "total": 8,
        "next": null,
        "previous": null,
        "results": [
          {
            "timestamp": "2017-11-07T04:00:00.000Z",
            "count": 1,
            "interval": {
              "start": "2017-11-07T04:00:00.000Z",
              "end": "2017-11-08T03:59:59.999Z",
              "analytics": {
                "min": 1,
                "max": 1,
                "events": 0,
                "entrances": 0,
                "exits": 0
              }
            }
          },
          {
            "timestamp": "2017-11-06T04:00:00.000Z",
            "count": 1,
            "interval": {
              "start": "2017-11-06T04:00:00.000Z",
              "end": "2017-11-07T03:59:59.999Z",
              "analytics": {
                "min": 1,
                "max": 1,
                "events": 0,
                "entrances": 0,
                "exits": 0
              }
            }
          },
          {
            "timestamp": "2017-11-05T04:00:00.000Z",
            "count": 1,
            "interval": {
              "start": "2017-11-05T04:00:00.000Z",
              "end": "2017-11-06T03:59:59.999Z",
              "analytics": {
                "min": 1,
                "max": 1,
                "events": 0,
                "entrances": 0,
                "exits": 0
              }
            }
          },
          {
            "timestamp": "2017-11-04T04:00:00.000Z",
            "count": 0,
            "interval": {
              "start": "2017-11-04T04:00:00.000Z",
              "end": "2017-11-05T03:59:59.999Z",
              "analytics": {
                "min": 0,
                "max": 1,
                "events": 0,
                "entrances": 0,
                "exits": 0
              }
            }
          },
          {
            "timestamp": "2017-11-03T04:00:00.000Z",
            "count": 0,
            "interval": {
              "start": "2017-11-03T04:00:00.000Z",
              "end": "2017-11-04T03:59:59.999Z",
              "analytics": {
                "min": 0,
                "max": 0,
                "events": 0,
                "entrances": 0,
                "exits": 0
              }
            }
          },
          {
            "timestamp": "2017-11-02T04:00:00.000Z",
            "count": 0,
            "interval": {
              "start": "2017-11-02T04:00:00.000Z",
              "end": "2017-11-03T03:59:59.999Z",
              "analytics": {
                "min": 0,
                "max": 0,
                "events": 0,
                "entrances": 0,
                "exits": 0
              }
            }
          },
          {
            "timestamp": "2017-11-01T04:00:00.000Z",
            "count": 0,
            "interval": {
              "start": "2017-11-01T04:00:00.000Z",
              "end": "2017-11-02T03:59:59.999Z",
              "analytics": {
                "min": 0,
                "max": 0,
                "events": 0,
                "entrances": 0,
                "exits": 0
              }
            }
          },
          {
            "timestamp": "2017-10-31T04:00:00.000Z",
            "count": 0,
            "interval": {
              "start": "2017-10-31T04:00:00.000Z",
              "end": "2017-11-01T03:59:59.999Z",
              "analytics": {
                "min": 0,
                "max": 3,
                "events": 5,
                "entrances": 3,
                "exits": 2
              }
            }
          },
        ]
      }),
    });
    mockdate.set('1/1/2017');

    // Render the component
    const component = mount(<VisualizationSpaceDetailDailyMetricsCard space={space} />);

    // Wait for data to be fetched.
    await timeout(250);
    assert.equal(global.fetch.callCount, 1);

    // Update selected dates, as if selected by date picker.
    component.setState({
      startDate: '2017-11-01T00:00:00Z',
      endDate: '2017-11-07T00:00:00Z',
    });

    // Update data stored within tbe component.
    global.fetch = sinon.stub().resolves({
      ok: true,
      status: 200,
      clone() { return this; },
      json: () => Promise.resolve({
        "total": 8,
        "next": null,
        "previous": null,
        "results": [
          {
            "timestamp": "2017-11-07T04:00:00.000Z",
            "count": 1,
            "interval": {
              "start": "2017-11-07T04:00:00.000Z",
              "end": "2017-11-08T03:59:59.999Z",
              "analytics": {
                "min": 1,
                "max": 1,
                "events": 0,
                "entrances": 0,
                "exits": 0
              }
            }
          },
          {
            "timestamp": "2017-11-06T04:00:00.000Z",
            "count": 1,
            "interval": {
              "start": "2017-11-06T04:00:00.000Z",
              "end": "2017-11-07T03:59:59.999Z",
              "analytics": {
                "min": 1,
                "max": 1,
                "events": 0,
                "entrances": 0,
                "exits": 0
              }
            }
          },
          {
            "timestamp": "2017-11-05T04:00:00.000Z",
            "count": 1,
            "interval": {
              "start": "2017-11-05T04:00:00.000Z",
              "end": "2017-11-06T03:59:59.999Z",
              "analytics": {
                "min": 1,
                "max": 1,
                "events": 0,
                "entrances": 0,
                "exits": 0
              }
            }
          },
          {
            "timestamp": "2017-11-04T04:00:00.000Z",
            "count": 0,
            "interval": {
              "start": "2017-11-04T04:00:00.000Z",
              "end": "2017-11-05T03:59:59.999Z",
              "analytics": {
                "min": 0,
                "max": 1,
                "events": 0,
                "entrances": 0,
                "exits": 0
              }
            }
          },
          {
            "timestamp": "2017-11-03T04:00:00.000Z",
            "count": 0,
            "interval": {
              "start": "2017-11-03T04:00:00.000Z",
              "end": "2017-11-04T03:59:59.999Z",
              "analytics": {
                "min": 0,
                "max": 0,
                "events": 0,
                "entrances": 0,
                "exits": 0
              }
            }
          },
          {
            "timestamp": "2017-11-02T04:00:00.000Z",
            "count": 0,
            "interval": {
              "start": "2017-11-02T04:00:00.000Z",
              "end": "2017-11-03T03:59:59.999Z",
              "analytics": {
                "min": 0,
                "max": 0,
                "events": 0,
                "entrances": 0,
                "exits": 0
              }
            }
          },
          {
            "timestamp": "2017-11-01T04:00:00.000Z",
            "count": 0,
            "interval": {
              "start": "2017-11-01T04:00:00.000Z",
              "end": "2017-11-02T03:59:59.999Z",
              "analytics": {
                "min": 0,
                "max": 0,
                "events": 0,
                "entrances": 0,
                "exits": 0
              }
            }
          },
          {
            "timestamp": "2017-10-31T04:00:00.000Z",
            "count": 0,
            "interval": {
              "start": "2017-10-31T04:00:00.000Z",
              "end": "2017-11-01T03:59:59.999Z",
              "analytics": {
                "min": 0,
                "max": 3,
                "events": 5,
                "entrances": 3,
                "exits": 2
              }
            }
          },
        ]
      }),
    });
    await component.instance().fetchData();

    // Assert data was fetched.
    assert.equal(global.fetch.callCount, 1);
    const requestParameters = global.fetch.getCall(0).args;

    // Make sure the request was correctly formulated for the `America/New_York` time zone.
    // On January 1st, the offset is NYC is 5 hours.
    const hoursOffsetFromUtc = parseInt(moment.tz(space.timeZone).format('Z').split(':')[0], 10);
    assert.equal(requestParameters[1].qs.start_time, '2017-10-31T00:00:00-04:00');
    assert.equal(requestParameters[1].qs.end_time, '2017-11-07T00:00:00-05:00');

    // Verify that the correct day was auto-inserted into the date input field, such that the last
    // week will be selected.
    assert.equal(component.find('#DateInput__screen-reader-message-startDate + div').text(), '10/31/2017');
    assert.equal(component.find('#DateInput__screen-reader-message-endDate + div').text(), '11/06/2017');

    // Also, verify that the correct data was passed to the chart given what the ajax return data.
    const chartProps = component.find('.visualization-space-detail-daily-metrics-card-body').children().nodes[0].props;
    assert.deepEqual(chartProps.data, [
      { label: '11/06', value: 0 },
      { label: '11/05', value: 0 },
      { label: '11/05', value: 0 },
      { label: '11/04', value: 0 },
      { label: '11/03', value: 0 },
      { label: '11/02', value: 0 },
      { label: '11/01', value: 0 },
      { label: '10/31', value: 3 },
    ]);
  });
});
