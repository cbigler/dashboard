import assert from 'assert';
import generateDisplayPrototypeUrl from './index';

describe('generate-display-prototype-url', function() {
  it('should work on production', function() {
    const href = 'https://dashboard.density.io';
    assert.equal(generateDisplayPrototypeUrl('/displays', href), 'https://safe.density.io/#/displays');
  });
  it('should work on staging', function() {
    const href = 'https://dashboard.density.rodeo';
    assert.equal(generateDisplayPrototypeUrl('/displays', href), 'https://safe.density.rodeo/#/displays');
  });
  it('should point to staging when on a preview link', function() {
    const href = 'https://dashboard.density.rodeo/preview/foobarbaz';
    assert.equal(generateDisplayPrototypeUrl('/displays', href), 'https://safe.density.rodeo/#/displays');
  });
  it('should point to locally running prototype when on local', function() {
    const href = 'http://localhost:3000';
    assert.equal(generateDisplayPrototypeUrl('/displays', href), 'http://localhost:4000/#/displays');
  });
});

