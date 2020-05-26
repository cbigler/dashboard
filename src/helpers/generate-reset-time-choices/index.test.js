import assert from 'assert';
import generateResetTimeChoices from './index';

import mockdate from 'mockdate';
import moment from 'moment-timezone';

const SPACE_IN_NY = {name: 'foo', time_zone: 'America/New_York'};
const SPACE_IN_LA = {name: 'foo', time_zone: 'America/Los_Angeles'};

describe('generate-reset-time-choices', function() {
  beforeEach(() => mockdate.reset());

  it('should work in ny', function() {
    // A time of the year without daylight savings on the US east coast
    mockdate.set(moment('2017-01-01T00:00:00Z'));

    assert.deepEqual(
      generateResetTimeChoices(SPACE_IN_NY),
      [
        {display: "12:00a", hourOnlyDisplay: "12a", value: "00:00"},
        {display: "1:00a", hourOnlyDisplay: "1a",  value: "01:00"},
        {display: "2:00a", hourOnlyDisplay: "2a",  value: "02:00"},
        {display: "3:00a", hourOnlyDisplay: "3a",  value: "03:00"},
        {display: "4:00a", hourOnlyDisplay: "4a",  value: "04:00"},
        {display: "5:00a", hourOnlyDisplay: "5a",  value: "05:00"},
        {display: "6:00a", hourOnlyDisplay: "6a",  value: "06:00"},
        {display: "7:00a", hourOnlyDisplay: "7a",  value: "07:00"},
        {display: "8:00a", hourOnlyDisplay: "8a",  value: "08:00"},
        {display: "9:00a", hourOnlyDisplay: "9a",  value: "09:00"},
        {display: "10:00a", hourOnlyDisplay: "10a", value: "10:00"},
        {display: "11:00a", hourOnlyDisplay: "11a", value: "11:00"},
        {display: "12:00p", hourOnlyDisplay: "12p", value: "12:00"},
        {display: "1:00p", hourOnlyDisplay: "1p",  value: "13:00"},
        {display: "2:00p", hourOnlyDisplay: "2p",  value: "14:00"},
        {display: "3:00p", hourOnlyDisplay: "3p",  value: "15:00"},
        {display: "4:00p", hourOnlyDisplay: "4p",  value: "16:00"},
        {display: "5:00p", hourOnlyDisplay: "5p",  value: "17:00"},
        {display: "6:00p", hourOnlyDisplay: "6p",  value: "18:00"},
        {display: "7:00p", hourOnlyDisplay: "7p",  value: "19:00"},
        {display: "8:00p", hourOnlyDisplay: "8p",  value: "20:00"},
        {display: "9:00p", hourOnlyDisplay: "9p",  value: "21:00"},
        {display: "10:00p", hourOnlyDisplay: "10p", value: "22:00"},
        {display: "11:00p", hourOnlyDisplay: "11p", value: "23:00"},
      ]
    );
  });
  it('should work in la', function() {
    // A time of the year without daylight savings in california
    mockdate.set(moment('2017-01-01T00:00:00Z'));

    assert.deepEqual(
      generateResetTimeChoices(SPACE_IN_LA),
      [
        {display: "12:00a", hourOnlyDisplay: "12a", value: "00:00"},
        {display: "1:00a", hourOnlyDisplay: "1a",  value: "01:00"},
        {display: "2:00a", hourOnlyDisplay: "2a",  value: "02:00"},
        {display: "3:00a", hourOnlyDisplay: "3a",  value: "03:00"},
        {display: "4:00a", hourOnlyDisplay: "4a",  value: "04:00"},
        {display: "5:00a", hourOnlyDisplay: "5a",  value: "05:00"},
        {display: "6:00a", hourOnlyDisplay: "6a",  value: "06:00"},
        {display: "7:00a", hourOnlyDisplay: "7a",  value: "07:00"},
        {display: "8:00a", hourOnlyDisplay: "8a",  value: "08:00"},
        {display: "9:00a", hourOnlyDisplay: "9a",  value: "09:00"},
        {display: "10:00a", hourOnlyDisplay: "10a", value: "10:00"},
        {display: "11:00a", hourOnlyDisplay: "11a", value: "11:00"},
        {display: "12:00p", hourOnlyDisplay: "12p", value: "12:00"},
        {display: "1:00p", hourOnlyDisplay: "1p",  value: "13:00"},
        {display: "2:00p", hourOnlyDisplay: "2p",  value: "14:00"},
        {display: "3:00p", hourOnlyDisplay: "3p",  value: "15:00"},
        {display: "4:00p", hourOnlyDisplay: "4p",  value: "16:00"},
        {display: "5:00p", hourOnlyDisplay: "5p",  value: "17:00"},
        {display: "6:00p", hourOnlyDisplay: "6p",  value: "18:00"},
        {display: "7:00p", hourOnlyDisplay: "7p",  value: "19:00"},
        {display: "8:00p", hourOnlyDisplay: "8p",  value: "20:00"},
        {display: "9:00p", hourOnlyDisplay: "9p",  value: "21:00"},
        {display: "10:00p", hourOnlyDisplay: "10p", value: "22:00"},
        {display: "11:00p", hourOnlyDisplay: "11p", value: "23:00"},
      ]
    );
  });
});

