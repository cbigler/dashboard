import * as React from 'react';
import { mount } from 'enzyme';
import assert from 'assert';

import { Account, NORMAL, EDIT, PASSWORD_RESET } from './index';

const user = {
  firstName: 'foo',
  lastName: 'bar',
  email: 'foo@density.io',
  organization: {
    name: 'baz',
  },
};

describe('Accounts page', function() {
  it('by default shows the name, email, and password reset linke', function() {
    const component = mount(<Account
      initialUser={user}
    />);

    // Always show name and email inputs
    assert.notEqual(component.find('.account-first-name-container').length, 0);
    assert.notEqual(component.find('.account-last-name-container').length, 0);
    assert.notEqual(component.find('.account-email-container').length, 0);

    // Show change password link
    assert.notEqual(component.find('.account-change-password-value').length, 0);

    // Don't show change password form
    assert.equal(component.find('.account-change-password-form-container').length, 0);

    // Don't show submit user details button
    assert.equal(component.find('.account-submit-user-details button').length, 0);
  });
  it('shows the password reset form after clicking the password reset link', function() {
    const component = mount(<Account
      initialUser={user}
    />);

    // Click change password
    component.find('.account-change-password-value span').simulate('click');

    // Always show name and email inputs
    assert.notEqual(component.find('.account-first-name-container').length, 0);
    assert.notEqual(component.find('.account-last-name-container').length, 0);
    assert.notEqual(component.find('.account-email-container').length, 0);

    // Don't show change password link
    assert.equal(component.find('.account-change-password-value span').length, 0);

    // Show change password form
    assert.notEqual(component.find('.account-change-password-form-container').length, 0);

    // Don't show submit user details button
    assert.equal(component.find('.account-submit-user-details button').length, 0);
  });
  it('makes the name / email editable when the user clicks the edit button', function() {
    const component = mount(<Account
      initialUser={user}
    />);

    // Click change password
    component.find('.account-edit-button').simulate('click');

    // Always show name and email inputs
    assert.equal(component.find('.account-first-name-container input').prop('disabled'), false);
    assert.equal(component.find('.account-last-name-container input').prop('disabled'), false);
    assert.equal(component.find('.account-email-container input').prop('disabled'), false);

    // Don't show change password link
    assert.equal(component.find('.account-change-password-value span').length, 0);

    // Don't show change password form
    assert.equal(component.find('.account-change-password-form-container').length, 0);

    // Show submit user details button
    assert.notEqual(component.find('.account-submit-user-details button').length, 0);
  });
});
