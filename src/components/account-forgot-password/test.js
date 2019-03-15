import * as React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';
import assert from 'assert';

import { AccountForgotPassword } from './index';

function timeout(delay) {
  return new Promise(r => setTimeout(r, delay));
}

describe('forgot-password', function() {
  it('should not allow the user to submit the form when it is invalid', async function() {
    const onUserLoggedIn = sinon.spy();
    const component = mount(<AccountForgotPassword
      forgotPasswordToken="rpd_XXX"
      onUserLoggedIn={onUserLoggedIn}
    />);

    // Empty form: invalid
    assert.equal(component.find('.account-forgot-password-submit-button Button').prop('disabled'), true);

    // Only enter a password into the first box: invalid
    component.find('.account-forgot-password-form input').first().simulate('change', {target: {value: 'p@ssw0rd'}});
    component.find('.account-forgot-password-form input').last().simulate('change', {target: {value: ''}});
    assert.equal(component.find('.account-forgot-password-submit-button Button').prop('disabled'), true);

    // Only enter a password into the last box: invalid
    component.find('.account-forgot-password-form input').first().simulate('change', {target: {value: ''}});
    component.find('.account-forgot-password-form input').last().simulate('change', {target: {value: 'p@ssw0rd'}});
    assert.equal(component.find('.account-forgot-password-submit-button Button').prop('disabled'), true);

    // Enter different passwords in both boxes: invalid
    component.find('.account-forgot-password-form input').first().simulate('change', {target: {value: 'not password'}});
    component.find('.account-forgot-password-form input').last().simulate('change', {target: {value: 'p@ssw0rd'}});
    assert.equal(component.find('.account-forgot-password-submit-button Button').prop('disabled'), true);

    // Enter same password into both boxes: valid
    component.find('.account-forgot-password-form input').first().simulate('change', {target: {value: 'p@ssw0rd'}});
    component.find('.account-forgot-password-form input').last().simulate('change', {target: {value: 'p@ssw0rd'}});
    assert.equal(component.find('.account-forgot-password-submit-button Button').prop('disabled'), false);
  });
  it('should make a request to accounts api when a password is successfully reset', async function() {
    const onUserLoggedIn = sinon.spy();
    const component = mount(<AccountForgotPassword
      forgotPasswordToken="rpd_XXX"
      onUserLoggedIn={onUserLoggedIn}
    />);

    // Enter a new password into both password boxes
    component.find('.account-forgot-password-form input').first().simulate('change', {target: {value: 'p@ssw0rd'}});
    component.find('.account-forgot-password-form input').last().simulate('change', {target: {value: 'p@ssw0rd'}});

    // Verify the submit button is enabled
    assert.equal(component.find('.account-forgot-password-submit-button Button').prop('disabled'), false);

    // Mock the impending request that is going to be made to accounts api
    global.fetch = sinon.stub().resolves({
      ok: true,
      status: 200,
      clone() { return this; },
      json: () => Promise.resolve({}),
    });

    // Click the submit button
    component.find('.account-forgot-password-submit-button Button').simulate('click');

    // Wait a bit for the promises to settle. FIXME: Not ideal.
    await timeout(100);

    // Verify that onUserLoggedIn was called when the password reset has completed.
    assert.equal(onUserLoggedIn.callCount, 1);

    // Verify that the request to accounts api had the correct payload
    assert.equal(
      global.fetch.firstCall.args[1].body, 
      '{"password_reset_token":"rpd_XXX","new_password":"p@ssw0rd","confirm_password":"p@ssw0rd"}'
    );
  });
});
