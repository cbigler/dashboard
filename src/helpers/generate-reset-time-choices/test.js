import assert from 'assert';
import generateResetTimeChoices from './index';

import mockdate from 'mockdate';
import moment from 'moment';

const SPACE_IN_NY = {name: 'foo', timeZone: 'America/New_York'};
const SPACE_IN_LA = {name: 'foo', timeZone: 'America/Los_Angeles'};

describe('generate-reset-time-choices', function() {
  beforeEach(() => mockdate.reset());

  it('should work in ny', function() {
    // A time of the year without daylight savings on the US east coast
    mockdate.set(moment('2017-01-01T00:00:00Z'));

    assert.deepEqual(
      generateResetTimeChoices(SPACE_IN_NY),
      [
        {display: "12:00a", value: "00:00"},
        {display: "1:00a",  value: "01:00"},
        {display: "2:00a",  value: "02:00"},
        {display: "3:00a",  value: "03:00"},
        {display: "4:00a",  value: "04:00"},
        {display: "5:00a",  value: "05:00"},
        {display: "6:00a",  value: "06:00"},
        {display: "7:00a",  value: "07:00"},
        {display: "8:00a",  value: "08:00"},
        {display: "9:00a",  value: "09:00"},
        {display: "10:00a", value: "10:00"},
        {display: "11:00a", value: "11:00"},
        {display: "12:00p", value: "12:00"},
        {display: "1:00p",  value: "13:00"},
        {display: "2:00p",  value: "14:00"},
        {display: "3:00p",  value: "15:00"},
        {display: "4:00p",  value: "16:00"},
        {display: "5:00p",  value: "17:00"},
        {display: "6:00p",  value: "18:00"},
        {display: "7:00p",  value: "19:00"},
        {display: "8:00p",  value: "20:00"},
        {display: "9:00p",  value: "21:00"},
        {display: "10:00p", value: "22:00"},
        {display: "11:00p", value: "23:00"},
      ]
    );
  });
  it('should work in la', function() {
    // A time of the year without daylight savings in california
    mockdate.set(moment('2017-01-01T00:00:00Z'));

    assert.deepEqual(
      generateResetTimeChoices(SPACE_IN_LA),
      [
        {display: "12:00a", value: "00:00"},
        {display: "1:00a",  value: "01:00"},
        {display: "2:00a",  value: "02:00"},
        {display: "3:00a",  value: "03:00"},
        {display: "4:00a",  value: "04:00"},
        {display: "5:00a",  value: "05:00"},
        {display: "6:00a",  value: "06:00"},
        {display: "7:00a",  value: "07:00"},
        {display: "8:00a",  value: "08:00"},
        {display: "9:00a",  value: "09:00"},
        {display: "10:00a", value: "10:00"},
        {display: "11:00a", value: "11:00"},
        {display: "12:00p", value: "12:00"},
        {display: "1:00p",  value: "13:00"},
        {display: "2:00p",  value: "14:00"},
        {display: "3:00p",  value: "15:00"},
        {display: "4:00p",  value: "16:00"},
        {display: "5:00p",  value: "17:00"},
        {display: "6:00p",  value: "18:00"},
        {display: "7:00p",  value: "19:00"},
        {display: "8:00p",  value: "20:00"},
        {display: "9:00p",  value: "21:00"},
        {display: "10:00p", value: "22:00"},
        {display: "11:00p", value: "23:00"},
      ]
    );
  });
});

