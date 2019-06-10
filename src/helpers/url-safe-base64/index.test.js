import assert from 'assert';
import { encode, decode } from './index';

const ENCODED_SLUG = `eyJlbWFpbCI6ImJyZWRmaWVsZEBnbWFpbC5jb20iLCJpbnZpdGF0aW9uX3Rva2VuIjoiaW52X0RIeUI1ODJZczNkV29QWGJucWpYWVBHQnQ1WUZIaHFLMzd1OFhQYXg2NHIifQ==`;
const DECODED_DATA = {
  email: 'bredfield@gmail.com',
  invitation_token: 'inv_DHyB582Ys3dWoPXbnqjXYPGBt5YFHhqK37u8XPax64r',
};

describe('url-safe-base64', function() {
  it('should encode properly', function() {
    assert.deepEqual(encode(DECODED_DATA), ENCODED_SLUG);
  });
  it('should decode properly', function() {
    assert.deepEqual(decode(ENCODED_SLUG), DECODED_DATA);
  });
});
