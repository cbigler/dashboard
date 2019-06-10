import assert from 'assert';
import objectSnakeToCamel from './';

describe('object-snake-to-camel', function() {
  it('should work', function() {
    const actual = {
      fooBar: 'baz',
      alreadyCamel: 'bla',
    };

    const input = {
      foo_bar: 'baz',
      alreadyCamel: 'bla',
    };

    assert.deepEqual(objectSnakeToCamel(input), actual);
  });
  it('should work for deeply nested objects', function() {
    const actual = {
      fooBar: 'baz',
      alreadyCamel: 'bla',
      deeplyNested: {
        heyLook: 'value',
        meToo: 'yea!',
        butNot: 'me',
      },
    };

    const input = {
      foo_bar: 'baz',
      alreadyCamel: 'bla',
      deeply_nested: {
        hey_look: 'value',
        me_too: 'yea!',
        butNot: 'me',
      },
    };

    assert.deepEqual(objectSnakeToCamel(input), actual);
  });
  it('should work for deeply nested arrays', function() {
    const actual = {
      fooBar: 'baz',
      alreadyCamel: 'bla',
      deeplyNested: [0, 1, 'two'],
    };

    const input = {
      foo_bar: 'baz',
      alreadyCamel: 'bla',
      deeply_nested: [0, 1, 'two'],
    };

    assert.deepEqual(objectSnakeToCamel(input), actual);
  });
});
