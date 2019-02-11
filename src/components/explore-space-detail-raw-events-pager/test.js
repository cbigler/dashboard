import React from 'react';
import { mount } from 'enzyme';
import assert from 'assert';
import sinon from 'sinon';

import RawEventsPager from './index';

describe('raw events pager', function() {
  it('allows paging by default', function() {
    const onChange = sinon.spy();
    const component = mount(<RawEventsPager
      disabled={false}
      page={5}
      totalPages={10}
      totalEvents={95} // First 9 pages are full, last page is partial
      onChange={onChange}
    />);

    // Ensure that the proper buttons are enabled / disabled on the pager
    assert.equal(component.find('PagerButtonGroup').props().disabledStart, false);
    assert.equal(component.find('PagerButtonGroup').props().disabledPrevious, false);
    assert.equal(component.find('PagerButtonGroup').props().disabledNext, false);
    assert.equal(component.find('PagerButtonGroup').props().disabledEnd, false);

    // Ensure the correct page is shown on the box
    assert.equal(component.find('.visualization-space-detail-raw-events-pager-picker-box').prop('value'), '5');

    // Ensure the correct number of events are displayed
    assert.equal(component.find('.visualization-space-detail-raw-events-pager-total').text(), '95 Events...');
  });
  it('on the first page, disables the start buttons', function() {
    const onChange = sinon.spy();
    const component = mount(<RawEventsPager
      disabled={false}
      page={1}
      totalPages={10}
      totalEvents={95} // First 9 pages are full, last page is partial
      onChange={onChange}
    />);

    // Ensure that the proper buttons are enabled / disabled on the pager
    assert.equal(component.find('PagerButtonGroup').props().disabledStart, true);
    assert.equal(component.find('PagerButtonGroup').props().disabledPrevious, true);
    assert.equal(component.find('PagerButtonGroup').props().disabledNext, false);
    assert.equal(component.find('PagerButtonGroup').props().disabledEnd, false);

    // Ensure the correct page is shown on the box
    assert.equal(component.find('.visualization-space-detail-raw-events-pager-picker-box').props().value, '1');

    // Ensure the correct number of events are displayed
    assert.equal(component.find('.visualization-space-detail-raw-events-pager-total').text(), '95 Events...');
  });
  it('on the last page, disables the end buttons', function() {
    const onChange = sinon.spy();
    const component = mount(<RawEventsPager
      disabled={false}
      page={10}
      totalPages={10}
      totalEvents={95} // First 9 pages are full, last page is partial
      onChange={onChange}
    />);

    // Ensure that the proper buttons are enabled / disabled on the pager
    assert.equal(component.find('PagerButtonGroup').props().disabledStart, false);
    assert.equal(component.find('PagerButtonGroup').props().disabledPrevious, false);
    assert.equal(component.find('PagerButtonGroup').props().disabledNext, true);
    assert.equal(component.find('PagerButtonGroup').props().disabledEnd, true);

    // Ensure the correct page is shown on the box
    assert.equal(component.find('.visualization-space-detail-raw-events-pager-picker-box').props().value, '10');

    // Ensure the correct number of events are displayed
    assert.equal(component.find('.visualization-space-detail-raw-events-pager-total').text(), '95 Events...');
  });
  it('disables the buttons when no pages of data exist', function() {
    const onChange = sinon.spy();
    const component = mount(<RawEventsPager
      disabled={false}
      page={0}
      totalPages={0}
      totalEvents={0}
      onChange={onChange}
    />);

    // Ensure that the proper buttons are enabled / disabled on the pager
    assert.equal(component.find('PagerButtonGroup').props().disabledStart, true);
    assert.equal(component.find('PagerButtonGroup').props().disabledPrevious, true);
    assert.equal(component.find('PagerButtonGroup').props().disabledNext, true);
    assert.equal(component.find('PagerButtonGroup').props().disabledEnd, true);

    // Ensure the correct page is shown on the box
    assert.equal(component.find('.visualization-space-detail-raw-events-pager-picker-box').props().value, '');

    // Ensure the correct number of events are displayed
    assert.equal(component.find('.visualization-space-detail-raw-events-pager-total').text(), '0 Events...');
  });

  it('should call onChange when the text box has a new valid value typed in it', function() {
    const onChange = sinon.spy();
    const component = mount(<RawEventsPager
      disabled={false}
      page={1}
      totalPages={10}
      totalEvents={95}
      onChange={onChange}
    />);

    // Update the contents of the picker box
    component.find('.visualization-space-detail-raw-events-pager-picker-box').simulate('change', {target: {value: '4'}});
    component.find('.visualization-space-detail-raw-events-pager-picker-box').simulate('blur');

    // Assert onChange called with new value
    assert.equal(onChange.firstCall.args[0], 4);
  });
  it('should not call onChange when the text box has an invalid value entered in it', function() {
    const onChange = sinon.spy();
    const component = mount(<RawEventsPager
      disabled={false}
      page={1}
      totalPages={10}
      totalEvents={95}
      onChange={onChange}
    />);

    // Update the contents of the picker box
    component.find('.visualization-space-detail-raw-events-pager-picker-box').simulate('change', {target: {value: 'abc'}});
    component.find('.visualization-space-detail-raw-events-pager-picker-box').simulate('blur');

    // Assert onChange was not called with new value
    assert.equal(onChange.called, false);

    // Assert the value in the box is still the original value
    component.find('.visualization-space-detail-raw-events-pager-picker-box').simulate('change', {target: {value: '1'}});
  });

  it('should call onChange when any of the arrows are clicked', function() {
    const onChange = sinon.spy();
    const component = mount(<RawEventsPager
      disabled={false}
      page={1}
      totalPages={10}
      totalEvents={95}
      onChange={onChange}
    />);

    // Click on one of the arrows
    component.find('PagerButtonGroup').props().onClickEnd();

    // Assert onChange called with new value
    assert.equal(onChange.firstCall.args[0], 10);
  });
});
