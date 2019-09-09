import * as React from 'react';
import { mount } from 'enzyme';
import assert from 'assert';
import sinon from 'sinon';

import mockdate from 'mockdate';

import RawEventsCard, { EMPTY, LOADING, VISIBLE, ERROR } from './index';

const SAMPLE_CSV_DATA = `Timestamp,Event,Current Count,Direction,Doorway Name,Doorway ID
2017-01-01 21:28:56.997000,445699064458117321,257,-1,My Doorway,drw_215210757938217232
2017-01-01 21:28:55.262000,445699062633595080,258,-1,My Doorway,drw_215210757938217232
2017-01-01 19:52:11.768000,445674721070023443,240,1,My Doorway,drw_215210757938217232
2017-01-01 19:51:11.534000,445674468652614404,239,1,My Doorway,drw_215210757938217232`;

function timeout(delay) {
  return new Promise(r => setTimeout(r, delay));
}

describe.skip('raw events pager', function() {
  afterEach(() => mockdate.reset());

  it('should render the card without any events', async function() {
    // Mock out the api call to get the event data.
    global.fetch = sinon.stub().resolves({
      ok: true,
      status: 201,
      clone() { return this; },
      json: () => Promise.resolve({
        total: 0,
        next: null,
        previous: null,
        results: [],
      }),
    });

    // Render the component
    const component = mount(<RawEventsCard space={{id: 'spc_1', name: 'My Space', timeZone: 'America/New_York'}} />);

    // The card starts in a loading state
    assert.equal(component.state('state'), LOADING);

    // Ensure the data fetch was issued to the server.
    await timeout(250);
    assert.equal(global.fetch.callCount, 1);

    // Then, ensure the card is in fact empty, since no events were returned in the response.
    assert.equal(component.state('state'), EMPTY);
  });
  it('should render the card with a single page of events', async function() {
    mockdate.set('1/1/2017');

    // Mock out the api call to get the event data.
    // - If the user calls /doorways/drw_foo, return an appropriate response.
    // - If the user calls /spaces/spc_bar/events, return an appropriate response.
    global.fetch = sinon.stub().callsFake(async url => {
      if (url.indexOf('doorways/drw_') !== -1)  {
        return {
          ok: true,
          status: 201,
          clone() { return this; },
          json: () => Promise.resolve({
            id: 'drw_3',
            name: `My Fancy doorway: ${Math.random()}`,
          }),
        };
      } else {
        return {
          ok: true,
          status: 201,
          clone() { return this; },
          json: () => Promise.resolve({
            total: 2,
            next: null,
            previous: null,
            results: [
              {id: 'evt_a', sensor_id: 'snr_2', doorway_id: 'drw_3', timestamp: '2017-01-01T00:00:10-05:00'},
              {id: 'evt_b', sensor_id: 'snr_2', doorway_id: 'drw_3', timestamp: '2017-01-01T00:00:20-05:00'},
              {id: 'evt_c', sensor_id: 'snr_2', doorway_id: 'drw_4', timestamp: '2017-01-01T00:00:30-05:00'},
            ],
          }),
        };
      }
    });

    // Render the component
    const component = mount(<RawEventsCard space={{id: 'spc_1', name: 'My Space', timeZone: 'America/New_York'}} />);

    // The card starts in a loading state
    assert.equal(component.state('state'), LOADING);

    // Ensure the data fetch was issued to the server.
    // 1 request made to get all the events
    // 2 requests made to get doorway info (one for each unique doorway)
    await timeout(250);
    assert.equal(global.fetch.callCount, 1 + 2);

    // Make sure the card state is set properly.
    assert.equal(component.state('state'), VISIBLE);

    // Then, ensure the card is in fact showing events.
    // 1 row for the header
    // 3 rows for the items in the table
    assert.equal(component.find('.visualization-space-detail-raw-events-card-table-row').length, 1 + 3);

    // And just for giggles, pull out a random value in the table to make sure that it's correct.
    assert.equal(
      component.find('.visualization-space-detail-raw-events-card-table-row').last().find('li').first().text(),
      'Jan 1st 2017, 12:00:30 am'
    );
  });
  it('should render the card with a single page of events, refresh, and events should still be displayed', async function() {
    mockdate.set('1/1/2017');

    // Mock out the api call to get the event data.
    // - If the user calls /doorways/drw_foo, return an appropriate response.
    // - If the user calls /spaces/spc_bar/events, return an appropriate response.
    global.fetch = sinon.stub().callsFake(async url => {
      if (url.indexOf('doorways/drw_') !== -1)  {
        return {
          ok: true,
          status: 201,
          clone() { return this; },
          json: () => Promise.resolve({
            id: 'drw_3',
            name: `My Fancy doorway`,
          }),
        };
      } else {
        return {
          ok: true,
          status: 201,
          clone() { return this; },
          json: () => Promise.resolve({
            total: 2,
            next: null,
            previous: null,
            results: [
              {id: 'evt_a', sensor_id: 'snr_2', doorway_id: 'drw_3', timestamp: '2017-01-01T00:00:10-05:00'},
              {id: 'evt_b', sensor_id: 'snr_2', doorway_id: 'drw_3', timestamp: '2017-01-01T00:00:20-05:00'},
              {id: 'evt_c', sensor_id: 'snr_2', doorway_id: 'drw_4', timestamp: '2017-01-01T00:00:30-05:00'},
            ],
          }),
        };
      }
    });

    // Render the component
    const component = mount(<RawEventsCard space={{id: 'spc_1', name: 'My Space', timeZone: 'America/New_York'}} />);

    // The card starts in a loading state
    assert.equal(component.state('state'), LOADING);

    // Ensure the data fetch was issued to the server.
    // 1 request made to get all the events
    // 2 requests made to get doorway info (one for each unique doorway)
    await timeout(250);
    assert.equal(global.fetch.callCount, 1 + 2);

    // Make sure the card state is set properly.
    assert.equal(component.state('state'), VISIBLE);

    // Then, ensure the card is in fact showing events.
    // 1 row for the header
    // 3 rows for the items in the table
    assert.equal(component.find('.visualization-space-detail-raw-events-card-table-row').length, 1 + 3);

    // And just for giggles, pull out a random value in the table to make sure that it's correct.
    assert.equal(
      component.find('.visualization-space-detail-raw-events-card-table-row').last().find('li').last().text(),
      'My Fancy doorway'
    );

    // Then click the refresh button.
    component.find('.visualization-space-detail-raw-events-card-header-refresh').simulate('click');

    // Ensure the data fetch was issued to the server.
    // 3 requests made in the last section.
    // 1 request made to get all the events
    // 0 requests were made to get doorway information, because that info was already cached.
    await timeout(250);
    assert.equal(global.fetch.callCount, 4);

    // Assert that the same number of items were rendered to the screen.
    // 1 row for the header
    // 3 rows for the items in the table
    assert.equal(component.find('.visualization-space-detail-raw-events-card-table-row').length, 1 + 3);

    // And just for giggles, pull out a random value in the table to make sure that it's correct.
    assert.equal(
      component.find('.visualization-space-detail-raw-events-card-table-row').last().find('li').last().text(),
      'My Fancy doorway'
    );
  });

  it('should change the date range and have the raw event display reflect that change', async function() {
    mockdate.set('1/1/2017');

    // Mock out the api call to get the event data.
    // - If the user calls /doorways/drw_foo, return an appropriate response.
    // - If the user calls /spaces/spc_bar/events, return an appropriate response.
    global.fetch = sinon.stub().callsFake(async url => {
      if (url.indexOf('doorways/drw_') !== -1)  {
        return {
          ok: true,
          status: 201,
          clone() { return this; },
          json: () => Promise.resolve({
            id: 'drw_3',
            name: `My Fancy doorway: ${Math.random()}`,
          }),
        };
      } else {
        return {
          ok: true,
          status: 201,
          clone() { return this; },
          json: () => Promise.resolve({
            total: 2,
            next: null,
            previous: null,
            results: [
              {id: 'evt_a', sensor_id: 'snr_2', doorway_id: 'drw_3', timestamp: '2017-01-01T00:00:10-05:00'},
              {id: 'evt_b', sensor_id: 'snr_2', doorway_id: 'drw_3', timestamp: '2017-01-01T00:00:20-05:00'},
              {id: 'evt_c', sensor_id: 'snr_2', doorway_id: 'drw_4', timestamp: '2017-01-01T00:00:30-05:00'},
            ],
          }),
        };
      }
    });

    // Render the component
    const component = mount(<RawEventsCard space={{id: 'spc_1', name: 'My Space', timeZone: 'America/New_York'}} />);

    // Ensure the intial data fetch was issued to the server.
    // 1 request made to get all the events
    // 2 requests made to get doorway info (one for each unique doorway)
    await timeout(250);
    assert.equal(global.fetch.callCount, 1 + 2);

    // Make sure the card state is set properly.
    assert.equal(component.state('state'), VISIBLE);


    // Next, we're going to change the date range and see how the component responds.

    // Mock out the api call to get the event data.
    // - If the user calls /doorways/drw_foo, return an appropriate response.
    // - If the user calls /spaces/spc_bar/events, return an appropriate response.
    global.fetch = sinon.stub().callsFake(async url => {
      if (url.indexOf('doorways/drw_') !== -1)  {
        return {
          ok: true,
          status: 201,
          clone() { return this; },
          json: () => Promise.resolve({
            id: 'drw_3',
            name: `My Fancy doorway: ${Math.random()}`,
          }),
        };
      } else {
        return {
          ok: true,
          status: 201,
          clone() { return this; },
          json: () => Promise.resolve({
            total: 2,
            next: null,
            previous: null,
            results: [
              {id: 'evt_a', sensor_id: 'snr_2', doorway_id: 'drw_3', timestamp: '2017-11-01T00:00:10-05:00'},
              {id: 'evt_b', sensor_id: 'snr_2', doorway_id: 'drw_3', timestamp: '2017-11-01T00:00:20-05:00'},
              {id: 'evt_c', sensor_id: 'snr_2', doorway_id: 'drw_4', timestamp: '2017-11-01T00:00:30-05:00'},
            ],
          }),
        };
      }
    });

    // Change the date range.
    component.setState({
      startDate: '2017-11-01T00:00:00Z',
      endDate: '2017-11-07T00:00:00Z',
    });

    // And refetch data.
    component.instance().fetchData();

    // Ensure the data fetch was issued to the server.
    // 1 request is made to get all the events
    // (2 doorway requests aren't made because the requests were cached from the initial request)
    await timeout(250);
    assert.equal(global.fetch.callCount, 1);

    // Make sure the card state is set properly.
    assert.equal(component.state('state'), VISIBLE);

    // Then, ensure the card is in fact showing events.
    // 1 row for the header
    // 3 rows for the items in the table
    assert.equal(component.find('.visualization-space-detail-raw-events-card-table-row').length, 1 + 3);

    // And just for giggles, pull out a random value in the table to make sure that it's correct.
    assert.equal(
      component.find('.visualization-space-detail-raw-events-card-table-row').last().find('li').first().text(),
      'Nov 1st 2017, 1:00:30 am'
    );
  });

  it('should download a csv for data when the csv download link is clicked', async function() {
    mockdate.set('1/1/2017');

    // Mock out the api call to get the event data.
    // - If the user calls /doorways/drw_foo, return an appropriate response.
    // - If the user calls /spaces/spc_bar/events, return an appropriate response.
    global.fetch = sinon.stub().callsFake(async url => {
      if (url.indexOf('doorways/drw_') !== -1)  {
        return {
          ok: true,
          status: 201,
          clone() { return this; },
          json: () => Promise.resolve({
            id: 'drw_3',
            name: `My Fancy doorway: ${Math.random()}`,
          }),
        };
      } else {
        return {
          ok: true,
          status: 201,
          clone() { return this; },
          json: () => Promise.resolve({
            total: 2,
            next: null,
            previous: null,
            results: [
              {id: 'evt_a', sensor_id: 'snr_2', doorway_id: 'drw_3', timestamp: '2017-01-01T00:00:10-05:00'},
              {id: 'evt_b', sensor_id: 'snr_2', doorway_id: 'drw_3', timestamp: '2017-01-01T00:00:20-05:00'},
              {id: 'evt_c', sensor_id: 'snr_2', doorway_id: 'drw_4', timestamp: '2017-01-01T00:00:30-05:00'},
            ],
          }),
        };
      }
    });

    // Render the component
    const component = mount(<RawEventsCard space={{id: 'spc_1', name: 'My Space', timeZone: 'America/New_York'}} />);

    // Ensure the intial data fetch was issued to the server.
    // 1 request made to get all the events
    // 2 requests made to get doorway info (one for each unique doorway)
    await timeout(250);
    assert.equal(global.fetch.callCount, 1 + 2);

    // Mock out a couple objects needed to download the csv
    global.Blob = sinon.stub();
    const CSV_URL = '1234-567890-123456-7890';
    global.URL = { createObjectURL: sinon.stub().returns(CSV_URL) };

    global.fetch = sinon.stub().resolves({
      ok: true,
      status: 201,
      clone() { return this; },
      json: () => Promise.reject(),
      text: () => Promise.resolve(SAMPLE_CSV_DATA),
    });

    // Click the `CSV Download` link
    component.find('.visualization-space-detail-raw-events-card-csv-download').simulate('click');

    // Wait for the async stuff to settle.
    // FIXME: got to be a better way to do this?
    await timeout(250);

    // 
    // Make sure that the csv blob url download method worked
    // 

    // Confirm that the blob url was created with the csv
    assert.equal(global.Blob.firstCall.args[0][0], SAMPLE_CSV_DATA);

    // Ensure that the object url was created with the csv blob.
    assert(global.URL.createObjectURL.firstCall.args[0] instanceof global.Blob);

    // Lastly, make sure the a tag was added to the body as expected.
    assert.equal(document.querySelector('body > a:last-child').href, 'http://localhost/1234-567890-123456-7890');
  });
  it('should show a loading indicator when loading is started, and hide when loading is complete', async function() {
    mockdate.set('1/1/2017');

    // Mock out the api call to get the event data.
    // - If the user calls /doorways/drw_foo, return an appropriate response.
    // - If the user calls /spaces/spc_bar/events, return an appropriate response.
    global.fetch = sinon.stub().callsFake(async url => {
      if (url.indexOf('doorways/drw_') !== -1)  {
        return {
          ok: true,
          status: 201,
          clone() { return this; },
          json: () => Promise.resolve({
            id: 'drw_3',
            name: `My Fancy doorway: ${Math.random()}`,
          }),
        };
      } else {
        return {
          ok: true,
          status: 201,
          clone() { return this; },
          json: () => Promise.resolve({
            total: 2,
            next: null,
            previous: null,
            results: [
              {id: 'evt_a', sensor_id: 'snr_2', doorway_id: 'drw_3', timestamp: '2017-01-01T00:00:10-05:00'},
              {id: 'evt_b', sensor_id: 'snr_2', doorway_id: 'drw_3', timestamp: '2017-01-01T00:00:20-05:00'},
              {id: 'evt_c', sensor_id: 'snr_2', doorway_id: 'drw_4', timestamp: '2017-01-01T00:00:30-05:00'},
            ],
          }),
        };
      }
    });

    // Render the component
    const component = mount(<RawEventsCard space={{id: 'spc_1', name: 'My Space', timeZone: 'America/New_York'}} />);

    // Ensure the intial data fetch was issued to the server.
    // 1 request made to get all the events
    // 2 requests made to get doorway info (one for each unique doorway)
    await timeout(250);
    assert.equal(global.fetch.callCount, 1 + 2);

    // Mock out a couple objects needed to download the csv
    global.Blob = sinon.stub();
    const CSV_URL = '1234-567890-123456-7890';
    global.URL = {
      createObjectURL: () => {
        // Verify that the loading indicator is visible when we create the object url.
        assert.equal(component.find('.card-loading.card-loading-indeterminate').length, 1);

        // Make sure that the text changes when the loading is in progress.
        assert.equal(
          component.find('.visualization-space-detail-raw-events-card-csv-download').text(),
          'CSV Downloading...'
        );

        return CSV_URL;
      },
    };

    global.fetch = sinon.stub().resolves({
      ok: true,
      status: 201,
      clone() { return this; },
      json: () => Promise.reject(),
      text: () => Promise.resolve(SAMPLE_CSV_DATA),
    });

    // Click the `CSV Download` link
    component.find('.visualization-space-detail-raw-events-card-csv-download').simulate('click');

    // Wait for the async stuff to settle.
    // FIXME: got to be a better way to do this?
    await timeout(250);

    // Verify that the loading indicator is hidden when the operation is complete.
    assert.equal(component.find('.card-loading card-loading-indeterminate').length, 0);
  });
  it('should only download a csv once if clicked multiple times in a row', async function() {
    mockdate.set('1/1/2017');

    // Mock out the api call to get the event data.
    // - If the user calls /doorways/drw_foo, return an appropriate response.
    // - If the user calls /spaces/spc_bar/events, return an appropriate response.
    global.fetch = sinon.stub().callsFake(async url => {
      if (url.indexOf('doorways/drw_') !== -1)  {
        return {
          ok: true,
          status: 201,
          clone() { return this; },
          json: () => Promise.resolve({
            id: 'drw_3',
            name: `My Fancy doorway: ${Math.random()}`,
          }),
        };
      } else {
        return {
          ok: true,
          status: 201,
          clone() { return this; },
          json: () => Promise.resolve({
            total: 2,
            next: null,
            previous: null,
            results: [
              {id: 'evt_a', sensor_id: 'snr_2', doorway_id: 'drw_3', timestamp: '2017-01-01T00:00:10-05:00'},
              {id: 'evt_b', sensor_id: 'snr_2', doorway_id: 'drw_3', timestamp: '2017-01-01T00:00:20-05:00'},
              {id: 'evt_c', sensor_id: 'snr_2', doorway_id: 'drw_4', timestamp: '2017-01-01T00:00:30-05:00'},
            ],
          }),
        };
      }
    });

    // Render the component
    const component = mount(<RawEventsCard space={{id: 'spc_1', name: 'My Space', timeZone: 'America/New_York'}} />);

    // Ensure the intial data fetch was issued to the server.
    // 1 request made to get all the events
    // 2 requests made to get doorway info (one for each unique doorway)
    await timeout(250);
    assert.equal(global.fetch.callCount, 1 + 2);

    // Mock out a couple objects needed to download the csv
    global.Blob = sinon.stub();
    const CSV_URL = '1234-567890-123456-7890';
    global.URL = { createObjectURL: sinon.stub().returns(CSV_URL) };

    global.fetch = sinon.stub().resolves({
      ok: true,
      status: 201,
      clone() { return this; },
      json: () => Promise.reject(),
      text: () => Promise.resolve(SAMPLE_CSV_DATA),
    });

    // Click the `CSV Download` link
    component.find('.visualization-space-detail-raw-events-card-csv-download').simulate('click');

    // Wait for the async stuff to settle.
    // FIXME: got to be a better way to do this?
    await timeout(250);

    // Click the `CSV Download` link again.
    component.find('.visualization-space-detail-raw-events-card-csv-download').simulate('click');

    // Ensure that only one download happened.
    assert.equal(global.Blob.callCount, 1);
  });
});
