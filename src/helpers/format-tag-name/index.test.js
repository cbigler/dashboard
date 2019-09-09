import assert from 'assert';
import formatTagName from './index';

describe('format-tag-name', function() {
  it('should work', function() {
    assert.equal(formatTagName('foo'), 'foo');
    assert.equal(formatTagName('foo bar'), 'foo-bar');
    assert.equal(formatTagName('foo    bar'), 'foo-bar');
    assert.equal(formatTagName('study: boston'), 'study-boston');
  });
});

