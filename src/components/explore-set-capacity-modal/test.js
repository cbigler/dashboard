import React from 'react';
import { mount } from 'enzyme';
import assert from 'assert';
import sinon from 'sinon';

import ExploreSetCapacityModal from './index';

describe('explore set capacity modal', function() {
  it('should let a user enter a capacity', async function() {
    const onSubmit = sinon.spy();
    const onDismiss = sinon.spy();

    // Render the component
    const component = mount(<ExploreSetCapacityModal
      space={{
        id: 'spc_1',
        name: 'My Space',
        currentCount: 2,
        capacity: 5,
        timeZone: 'America/New_York',
      }}
      onSubmit={onSubmit}
      onDismiss={onDismiss}
    />);

    // Type in a capacity into the box
    const input = component.find('.explore-set-capacity-modal-capacity-input input')
    input.simulate('focus');
    input.simulate('change', {target: {value: '123'}});

    // Verify that the submit button is not disabled
    assert.equal(component.find('Button').props().disabled, false)

    // Click submit
    component.find('Button').simulate('click');

    // Verify that the `onSubmit` callback was called with the new capacity.
    assert.equal(onSubmit.callCount, 1);
    assert.deepEqual(onSubmit.firstCall.args, [123]);
  });
  it('should let a user enter a capacity, but if it is non-numeric, to not accept it', async function() {
    const onSubmit = sinon.spy();
    const onDismiss = sinon.spy();

    // Render the component
    const component = mount(<ExploreSetCapacityModal
      space={{
        id: 'spc_1',
        name: 'My Space',
        currentCount: 2,
        capacity: null,
        timeZone: 'America/New_York',
      }}
      onSubmit={onSubmit}
      onDismiss={onDismiss}
    />);

    // Type in a capacity into the box
    const input = component.find('.explore-set-capacity-modal-capacity-input input')
    input.simulate('focus');
    input.simulate('change', {target: {value: 'abc'}});

    // Verify that the submit button is disabled
    assert.equal(component.find('Button').props().disabled, true);
  });
  it('should let a user enter a capacity, but if it is < 0, do not accept it', async function() {
    const onSubmit = sinon.spy();
    const onDismiss = sinon.spy();

    // Render the component
    const component = mount(<ExploreSetCapacityModal
      space={{
        id: 'spc_1',
        name: 'My Space',
        currentCount: 2,
        capacity: null,
        timeZone: 'America/New_York',
      }}
      onSubmit={onSubmit}
      onDismiss={onDismiss}
    />);

    // Type in a capacity into the box
    const input = component.find('.explore-set-capacity-modal-capacity-input input')
    input.simulate('focus');
    input.simulate('change', {target: {value: '-5'}});

    // Verify that the submit button is disabled
    assert.equal(component.find('Button').props().disabled, true);
  });
  it('should let a user enter a capacity, but not accept it if the box is empty', async function() {
    const onSubmit = sinon.spy();
    const onDismiss = sinon.spy();

    // Render the component
    const component = mount(<ExploreSetCapacityModal
      space={{
        id: 'spc_1',
        name: 'My Space',
        currentCount: 2,
        capacity: 5,
        timeZone: 'America/New_York',
      }}
      onSubmit={onSubmit}
      onDismiss={onDismiss}
    />);

    // Type in a capacity into the box
    const input = component.find('.explore-set-capacity-modal-capacity-input input')
    input.simulate('focus');
    input.simulate('change', {target: {value: ''}});

    // Verify that the submit button is disabled
    assert.equal(component.find('Button').props().disabled, true);
  });
});
