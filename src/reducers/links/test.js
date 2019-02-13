import assert from 'assert';
import links from './index';

import collectionLinksSet from '../../actions/collection/links/set';
import collectionLinksPush from '../../actions/collection/links/push';
import collectionLinksError from '../../actions/collection/links/error';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

const SPACE_ID_ONE = 'spc_3wxsa6e8dh5zdnf73ubpna';
const SPACE_ID_TWO = 'spc_aus86m8834xef4cqjeye2h';
const DOORWAY_ID_ONE = 'dor_5bGPVAmYKbcDTVuzuMogJp';
const DOORWAY_ID_TWO = 'dor_55kmCsy9SMbP1mkTKNYYt4';

describe('links', function() {
  it('should set links when given a bunch of links', function() {
    const initialState = links(undefined, {});

    const result = links(initialState, collectionLinksSet([
      {
        id: 0,
        space_name: 'foo',
        space_id: SPACE_ID_ONE,
        doorway_name: 'bar',
        doorway_id: DOORWAY_ID_ONE,
        sensor_placement: 1,
      },
      {
        id: 1,
        space_name: 'hello',
        space_id: SPACE_ID_TWO,
        doorway_name: 'world',
        doorway_id: DOORWAY_ID_TWO,
        sensor_placement: -1,
      },
    ]));

    assert.deepEqual(result, {
      ...initialState,
      loading: false,
      data: [
        {
          id: 0,
          spaceName: 'foo',
          spaceId: SPACE_ID_ONE,
          doorwayName: 'bar',
          doorwayId: DOORWAY_ID_ONE,
          sensorPlacement: 1,
        },
        {
          id: 1,
          spaceName: 'hello',
          spaceId: SPACE_ID_TWO,
          doorwayName: 'world',
          doorwayId: DOORWAY_ID_TWO,
          sensorPlacement: -1,
        },
      ],
    });
  });
  it('should push link when given a link update', function() {
    const initialState = links(undefined, {});

    // Add a new link.
    const linkInCollection = links(initialState, collectionLinksPush({
      id: 0,
      space_name: 'foo',
      space_id: SPACE_ID_ONE,
      doorway_name: 'bar',
      doorway_id: DOORWAY_ID_ONE,
      sensor_placement: 1,
    }));

    // Update link in collection
    const linkUpdatedInCollection = links(linkInCollection, collectionLinksPush({
      id: 0,
      spaceName: 'new name',
    }));

    assert.deepEqual(linkUpdatedInCollection, {
      ...initialState,
      loading: false,
      data: [{
        id: 0,
        spaceName: 'new name',
        spaceId: SPACE_ID_ONE,
        doorwayName: 'bar',
        doorwayId: DOORWAY_ID_ONE,
        sensorPlacement: 1,
      }],
    });
  });
  it('should push link when given a new link', function() {
    const initialState = links(undefined, {});

    const result = links(initialState, collectionLinksPush({
      id: 0,
      space_name: 'foo',
      space_id: SPACE_ID_ONE,
      doorway_name: 'bar',
      doorway_id: DOORWAY_ID_ONE,
      sensor_placement: 1,
    }));

    assert.deepEqual(result, {
      ...initialState,
      loading: false,
      data: [
        {
          id: 0,
          spaceName: 'foo',
          spaceId: SPACE_ID_ONE,
          doorwayName: 'bar',
          doorwayId: DOORWAY_ID_ONE,
          sensorPlacement: 1,
        },
      ],
    });
  });
});
