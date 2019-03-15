import assert from 'assert';
import sinon from 'sinon';
import fetchAllPages from './index';

describe('fetch-all-pages', function() {
  it('should fetch a bunch of pages of data', async function() {
    const asyncMock = sinon.stub();
    asyncMock.onCall(0).resolves({next: 'https://api.density.io/v2/spaces?page=2', total: 18, results: [1, 2, 3, 4, 5]});
    asyncMock.onCall(1).resolves({next: 'https://api.density.io/v2/spaces?page=3', total: 18, results: [6, 7, 8, 9, 10]});
    asyncMock.onCall(2).resolves({next: 'https://api.density.io/v2/spaces?page=4', total: 18, results: [11, 12, 13, 14, 15]});
    asyncMock.onCall(3).resolves({next: null, total: 18, results: [16, 17, 18]});

    assert.deepEqual(await fetchAllPages(asyncMock), [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
    ]);

    // Make sure that the async function is only called 4 times
    assert.equal(asyncMock.callCount, 4);
  });
  it('should fetch a single page of data', async function() {
    const asyncMock = sinon.stub();
    asyncMock.onCall(0).resolves({next: null, total: 3, results: [16, 17, 18]});

    assert.deepEqual(await fetchAllPages(asyncMock), [16, 17, 18]);
  });
  it('should fetch no data', async function() {
    const asyncMock = sinon.stub();
    asyncMock.onCall(0).resolves({next: null, total: 0, results: []});

    assert.deepEqual(await fetchAllPages(asyncMock), []);
  });
  it('should fetch a core.spaces.allCounts response, which is an object with arrays', async function() {
    const asyncMock = sinon.stub();
    asyncMock.onCall(0).resolves({
      next: 'https://api.density.io/v2/spaces?page=2',
      total: 18,
      results: {
        foo: [1, 2, 3, 4, 5],
        bar: ['one', 'two', 'three', 'four', 'five'],
      },
    });
    asyncMock.onCall(1).resolves({
      next: 'https://api.density.io/v2/spaces?page=3',
      total: 18,
      results: {
        foo: [6, 7, 8, 9, 10],
        bar: ['six', 'seven', 'eight', 'nine', 'ten'],
      },
    });
    asyncMock.onCall(2).resolves({
      next: 'https://api.density.io/v2/spaces?page=4',
      total: 18,
      results: {
        foo: [11, 12, 13, 14, 15],
        bar: ['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'],
      },
    });
    asyncMock.onCall(3).resolves({
      next: null,
      total: 18,
      results: {
        foo: [16, 17, 18],
        bar: ['sixteen', 'seventeen', 'eighteen'],
      },
    });

    assert.deepEqual(await fetchAllPages(asyncMock), {
      foo: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      bar: [
        'one',
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
        'nine',
        'ten',
        'eleven',
        'twelve',
        'thirteen',
        'fourteen',
        'fifteen',
        'sixteen',
        'seventeen',
        'eighteen'
      ],
    });

    // Make sure that the async function is only called 4 times
    assert.equal(asyncMock.callCount, 4);
  });
});
