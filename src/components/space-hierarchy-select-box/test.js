import React from 'react';
import { mount } from 'enzyme';
import assert from 'assert';
import sinon from 'sinon';

import SpaceHierarchySelectBox from './index';

describe('Space hierarchy select box', function() {

  it('should open when focused, and close when an item is clicked', function() {
    const onChange = sinon.spy();

    const component = mount(<SpaceHierarchySelectBox
      choices={[
        {id: 0, parentId: null, spaceType: 'floor', name: 'foo'},
        {id: 1, parentId: null, spaceType: 'floor', name: 'bar'},
        {id: 2, parentId: null, spaceType: 'floor', name: 'baz'},
      ]}
      onChange={onChange}
    />);

    // User focuses the select box, which causes it to open
    const selectBoxValue = component.find('.space-hierarchy-select-box-value');
    selectBoxValue.simulate('focus');

    // Verify that select box opened
    assert.equal(component.state().opened, true);

    // and menu is now visible
    assert.equal(component.find('.space-hierarchy-select-box-menu.opened').length, 1);

    // Unfocus the value and focus the 3rd item in the select box
    const lastItem = component.find('.space-hierarchy-select-box-menu ul li.enabled').at(3);
    selectBoxValue.simulate('blur');
    lastItem.simulate('focus');
    lastItem.simulate('click');

    // Verify that the item was emitted via the `onChange` callback
    assert.equal(onChange.callCount, 1);
    assert.deepEqual(onChange.firstCall.args, [{id: 2, parentId: null, spaceType: 'floor', name: 'baz'}]);
  });
  it('should open when focused, and close when blurred', function() {
    const onChange = sinon.spy();

    const component = mount(<SpaceHierarchySelectBox
      choices={[
        {id: 0, parentId: null, spaceType: 'floor', name: 'foo'},
        {id: 1, parentId: null, spaceType: 'floor', name: 'bar'},
        {id: 2, parentId: null, spaceType: 'floor', name: 'baz'},
      ]}
      onChange={onChange}
    />);

    // User focuses the select box, which causes it to open
    const selectBoxValue = component.find('.space-hierarchy-select-box-value');
    selectBoxValue.simulate('focus');

    // Verify that select box opened
    assert.equal(component.state().opened, true);

    // and menu is now visible
    assert.equal(component.find('.space-hierarchy-select-box-menu.opened').length, 1);

    // User clicks outside the select box, causing the select box value to blur.
    selectBoxValue.simulate('blur');

    // Select box is no longer visible
    assert.equal(component.find('.space-hierarchy-select-box-menu.opened').length, 0);
  });
  it('should open when focused, and let tab to move focus', function() {
    const onChange = sinon.spy();

    const component = mount(<SpaceHierarchySelectBox
      choices={[
        {id: 0, parentId: null, spaceType: 'floor', name: 'foo'},
        {id: 1, parentId: null, spaceType: 'floor', name: 'bar'},
        {id: 2, parentId: null, spaceType: 'floor', name: 'baz'},
      ]}
      onChange={onChange}
    />);

    // Rough implmentation of tab functionality. If something's going to break in this test, it's
    // probably this. :)
    // - Pressing tab increases the selected item's index, ie 0 -> 1 -> 2
    // - Shift tab decreses the selected item's index, ie 2 -> 1 -> 0
    let selectedItemIndex = 0;
    function pressTab() {
      selectedItemIndex += 1;
      const selected = component.find('[tabIndex=0]').at(selectedItemIndex);
      selected.simulate('focus');
      return selected;
    }
    function pressShiftTab() {
      selectedItemIndex -= 1;
      const selected = component.find('[tabIndex=0]').at(selectedItemIndex);
      selected.simulate('focus');
      return selected;
    }

    // User focuses the select box, which causes it to open
    const selectBoxValue = component.find('.space-hierarchy-select-box-value');
    selectBoxValue.simulate('focus');

    // Verify that select box opened
    assert.equal(component.state().opened, true);

    // and menu is now visible
    assert.equal(component.find('.space-hierarchy-select-box-menu.opened').length, 1);

    // User presses tab, which focuses the next element with a `tabindex` of zero
    pressTab(); /* first item */
    pressTab(); /* second item */
    pressTab(); /* third item */
    const selected = pressShiftTab(); /* back to second item */

    // User presses enter to accept selection
    selected.simulate('keydown', {keyCode: 13});

    // onChange should be called with the first item in the select box
    assert.equal(onChange.callCount, 1);
    assert.deepEqual(onChange.firstCall.args, [{id: 0, parentId: null, spaceType: 'floor', name: 'foo'}]);

    // And after selection, the select box should not be open.
    assert.equal(component.state().opened, false);
    assert.equal(component.find('.space-hierarchy-select-box-menu.opened').length, 0);
  });
  it('should open when focused, and close when escape is pressed with focus on the value', function() {
    const onChange = sinon.spy();

    const component = mount(<SpaceHierarchySelectBox
      choices={[
        {id: 0, parentId: null, spaceType: 'floor', name: 'foo'},
        {id: 1, parentId: null, spaceType: 'floor', name: 'bar'},
        {id: 2, parentId: null, spaceType: 'floor', name: 'baz'},
      ]}
      onChange={onChange}
    />);

    // User focuses the select box, which causes it to open
    const selectBoxValue = component.find('.space-hierarchy-select-box-value');
    selectBoxValue.simulate('focus');

    // Verify that select box opened
    assert.equal(component.state().opened, true);

    // and menu is now visible
    assert.equal(component.find('.space-hierarchy-select-box-menu.opened').length, 1);

    // User presses escape to close select box
    selectBoxValue.simulate('keydown', { keyCode: 27 });

    // And after, the select box should not be open.
    assert.equal(component.state().opened, false);
    assert.equal(component.find('.space-hierarchy-select-box-menu.opened').length, 0);
  });
  it('should open when focused, and close when escape is pressed with focus on an item', function() {
    const onChange = sinon.spy();

    const component = mount(<SpaceHierarchySelectBox
      choices={[
        {id: 0, parentId: null, spaceType: 'floor', name: 'foo'},
        {id: 1, parentId: null, spaceType: 'floor', name: 'bar'},
        {id: 2, parentId: null, spaceType: 'floor', name: 'baz'},
      ]}
      onChange={onChange}
    />);

    // User focuses the select box, which causes it to open
    const selectBoxValue = component.find('.space-hierarchy-select-box-value');
    selectBoxValue.simulate('focus');

    // Verify that select box opened
    assert.equal(component.state().opened, true);

    // User focuses an item in the select box
    component.find('.space-hierarchy-select-box-menu-item').first().simulate('focus');

    // User presses escape to close select box
    selectBoxValue.simulate('keydown', { keyCode: 27 });

    // And after, the select box should not be open.
    assert.equal(component.state().opened, false);
    assert.equal(component.find('.space-hierarchy-select-box-menu.opened').length, 0);
  });

  it('should display the value passed in as a prop', function() {
    // Render the component with a value prop
    const component = mount(<SpaceHierarchySelectBox
      choices={[
        {id: 0, parentId: null, spaceType: 'floor', name: 'foo'},
        {id: 1, parentId: null, spaceType: 'floor', name: 'bar'},
        {id: 2, parentId: null, spaceType: 'floor', name: 'baz'},
      ]}
      value={{id: 2, parentId: null, spaceType: 'floor', name: 'baz'}}
    />);
    const selectBoxValue = component.find('.space-hierarchy-select-box-value');

    // Check that the value prop and value name match expected results
    assert.deepEqual(component.prop('value'), {id: 2, parentId: null, spaceType: 'floor', name: 'baz'});
    assert.notEqual(
      selectBoxValue.find('span').first().html().indexOf('baz'),
      -1
    );

    // Programmatically reset the value prop
    component.setProps({value: {id: 1, parentId: null, spaceType: 'floor', name: 'bar'}});

    // Check that value prop and displayed name match the new expected values
    assert.deepEqual(component.prop('value'), {id: 1, parentId: null, spaceType: 'floor', name: 'bar'});
    assert.notEqual(
      selectBoxValue.find('span').first().html().indexOf('bar'),
      -1
    );

    // Focus, programmatically reset the value prop, and blur
    selectBoxValue.simulate('focus');
    component.setProps({value: {id: 0, parentId: null, spaceType: 'floor', name: 'foo'}});
    selectBoxValue.simulate('blur');

    // Check that value prop and displayed name match the new expected values
    assert.deepEqual(component.prop('value'), {id: 0, parentId: null, spaceType: 'floor', name: 'foo'});
    assert.notEqual(
      selectBoxValue.find('span').first().html().indexOf('foo'),
      -1
    );
  });

  it('should close when the value box is clicked', function() {
    const component = mount(<SpaceHierarchySelectBox
      choices={[
        {id: 0, parentId: null, spaceType: 'floor', name: 'foo'},
        {id: 1, parentId: null, spaceType: 'floor', name: 'bar'},
        {id: 2, parentId: null, spaceType: 'floor', name: 'baz'},
      ]}
    />);
    const selectBoxValue = component.find('.space-hierarchy-select-box-value');

    // Focusing the select box opens it, mousedown closes it
    selectBoxValue.simulate('focus');
    assert.equal(component.state().opened, true);
    assert.equal(component.find('.space-hierarchy-select-box-menu.opened').length, 1);
    selectBoxValue.simulate('mousedown');
    assert.equal(component.state().opened, false);
    assert.equal(component.find('.space-hierarchy-select-box-menu.opened').length, 0);

    // mousedown on any internal span inside the select box also closes it
    selectBoxValue.simulate('focus');
    selectBoxValue.find('span').first().simulate('mousedown');
    assert.equal(component.state().opened, false);
    assert.equal(component.find('.space-hierarchy-select-box-menu.opened').length, 0);
  });

  it('should ignore clicks on disabled options', function() {
    const component = mount(<SpaceHierarchySelectBox
      choices={[
        {id: 0, parentId: null, spaceType: 'floor', name: 'foo'},
        {id: 1, parentId: null, spaceType: 'floor', name: 'bar'},
        {id: 2, parentId: null, spaceType: 'floor', name: 'baz', disabled: true},
      ]}
    />);
    const selectBoxValue = component.find('.space-hierarchy-select-box-value');

    // Focusing the select box opens it, click selects an item
    selectBoxValue.simulate('focus');
    component.find('.space-hierarchy-select-box-menu li').first().simulate('click');
    assert.equal(component.state().opened, false);
    assert.equal(component.find('.space-hierarchy-select-box-menu.opened').length, 0);

    // Clicking on a disabled item does nothing
    selectBoxValue.simulate('focus');
    component.find('.space-hierarchy-select-box-menu li').last().simulate('click');
    assert.equal(component.state().opened, true);
    assert.equal(component.find('.space-hierarchy-select-box-menu.opened').length, 1);
  });

  // it('should open when focused by tabbing onto the component', function() {
  //   const component = mount(<div>
  //     <input type="text" className="test-input" tabIndex="0"></input>
  //     <SpaceHierarchySelectBox
  //       choices={[
  //         {id: 0, parentId: null, spaceType: 'floor', name: 'foo'},
  //         {id: 1, parentId: null, spaceType: 'floor', name: 'bar'},
  //         {id: 2, parentId: null, spaceType: 'floor', name: 'baz'},
  //       ]}
  //     />
  //   </div>);

  //   // Tabbing onto the select box focuses it
  //   component.find('.test-input').simulate('focus');
  //   component.find('.test-input').simulate('keydown', { key: 'Tab', keyCode: 9, which: 9 });
  //   assert.equal(component.find('.space-hierarchy-select-box-menu.opened').length, 1);
  // });
});
