import * as React from 'react';
import { mount } from 'enzyme';
import assert from 'assert';
import sinon from 'sinon';

import { Login, LOGIN, FORGOT_PASSWORD } from './index';

describe('Login page', function() {
  it('should switch to forgot password page when the forgot password link is clicked, and back again', function() {
    const component = mount(<Login />);

    // We start on the login page
    assert.equal(component.state().view, LOGIN);

    // Click the forgot password link
    component.find('.login-forgot-password-link').simulate('click');

    // Now we're on the forgot password page
    assert.equal(component.state().view, FORGOT_PASSWORD);

    // Click the back link
    component.find('.login-forgot-password-back-link').simulate('click');

    // Now we're back on the login page
    assert.equal(component.state().view, LOGIN);
  });

  it('should only allow submission when the login form is valid', async function() {
    const component = mount(<Login />);

    // No email or password: invalid.
    component.find('input[type="email"]').simulate('change', {target: {value: ''}});
    component.find('input[type="password"]').simulate('change', {target: {value: ''}});
    assert.equal(component.find('.login-submit-button Button').prop('disabled'), true);

    // Valid email, but no password: invalid.
    component.find('input[type="email"]').simulate('change', {target: {value: 'foo@example.com'}});
    component.find('input[type="password"]').simulate('change', {target: {value: ''}});
    assert.equal(component.find('.login-submit-button Button').prop('disabled'), true);

    // Valid password, but no email: invalid.
    component.find('input[type="email"]').simulate('change', {target: {value: ''}});
    component.find('input[type="password"]').simulate('change', {target: {value: 'bar'}});
    assert.equal(component.find('.login-submit-button Button').prop('disabled'), true);

    // Valid password, but invalid email: invalid.
    component.find('input[type="email"]').simulate('change', {target: {value: 'not an email'}});
    component.find('input[type="password"]').simulate('change', {target: {value: 'bar'}});
    assert.equal(component.find('.login-submit-button Button').prop('disabled'), true);

    // Valid email and password: valid.
    component.find('input[type="email"]').simulate('change', {target: {value: 'a@a'}});
    component.find('input[type="password"]').simulate('change', {target: {value: 'a'}});
    assert.equal(component.find('.login-submit-button Button').prop('disabled'), false);
  });

  it('should only allow submission when the password change request form is valid', async function() {
    const component = mount(<Login />);
    component.setState({view: FORGOT_PASSWORD});

    // No email: invalid.
    component.find('input[type="email"]').simulate('change', {target: {value: ''}});
    assert.equal(component.find('.login-submit-button Button').prop('disabled'), true);

    // Malformed email: invalid (just checking for the presence of @)
    component.find('input[type="email"]').simulate('change', {target: {value: 'not an email'}});
    assert.equal(component.find('.login-submit-button Button').prop('disabled'), true);

    // Valid email: valid.
    component.find('input[type="email"]').simulate('change', {target: {value: 'a@a'}});
    assert.equal(component.find('.login-submit-button Button').prop('disabled'), false);
  });

  it('should submit login form via enter when that page is focused', async function() {
    const component = mount(<Login />);


    // Set email and password to both be empty. Submitting the form should fail.
    component.find('input[type="email"]').simulate('change', {target: {value: ''}});
    component.find('input[type="password"]').simulate('change', {target: {value: ''}});
    global.fetch = sinon.spy();
    component.find('input[type="email"]').simulate('keyPress', {key: 'Enter', keyCode: 13, which: 13});
    assert.equal(global.fetch.callCount, 0);

    // Set email to a valid email and password to be empty. Submitting the form should fail.
    component.find('input[type="email"]').simulate('change', {target: {value: 'foo@example.com'}});
    component.find('input[type="password"]').simulate('change', {target: {value: ''}});
    global.fetch = sinon.spy();
    component.find('input[type="email"]').simulate('keyPress', {key: 'Enter', keyCode: 13, which: 13});
    assert.equal(global.fetch.callCount, 0);

    // Set email to be empty and password to valid. Submitting the form should fail.
    component.find('input[type="email"]').simulate('change', {target: {value: ''}});
    component.find('input[type="password"]').simulate('change', {target: {value: 'bar'}});
    global.fetch = sinon.spy();
    component.find('input[type="email"]').simulate('keyPress', {key: 'Enter', keyCode: 13, which: 13});
    assert.equal(global.fetch.callCount, 0);

    // Set email and password to both be valid.
    component.find('input[type="email"]').simulate('change', {target: {value: 'foo@example.com'}});
    component.find('input[type="password"]').simulate('change', {target: {value: 'bar'}});

    // Try to submit the form, which finally, should work.
    global.fetch = sinon.stub().resolves({
      ok: true,
      status: 201,
      clone() { return this; },
      json: () => Promise.resolve({message: 'it worked!'}),
    });
    component.find('input[type="email"]').simulate('keyPress', {key: 'Enter', keyCode: 13, which: 13});
    assert.equal(global.fetch.callCount, 1);
  });

  it('should submit password change form via enter when that page is focused', async function() {
    const component = mount(<Login />);
    component.setState({view: FORGOT_PASSWORD});


    // Set email to an empty string.
    component.find('input[type="email"]').simulate('change', {target: {value: ''}});

    // Try to submit - should fail.
    global.fetch = sinon.spy();
    component.find('input[type="email"]').simulate('keyPress', {key: 'Enter', keyCode: 13, which: 13});
    assert.equal(global.fetch.callCount, 0);


    // Set email to an invalid email.
    component.find('input[type="email"]').simulate('change', {target: {value: 'not an email'}});

    // Try to submit - should fail again.
    global.fetch = sinon.spy();
    component.find('input[type="email"]').simulate('keyPress', {key: 'Enter', keyCode: 13, which: 13});
    assert.equal(global.fetch.callCount, 0);


    // Set email to valid email.
    component.find('input[type="email"]').simulate('change', {target: {value: 'foo@example.com'}});

    // Try to submit - finally, should work.
    global.fetch = sinon.stub().resolves({
      ok: true,
      status: 201,
      clone() { return this; },
      json: () => Promise.resolve({message: 'it worked!'}),
    });
    component.find('input[type="email"]').simulate('keyPress', {key: 'Enter', keyCode: 13, which: 13});
    assert.equal(global.fetch.callCount, 1);
  });

  it('shows a error bar when there is an error', function() {
    const component = mount(<Login />);

    // Set an error.
    component.setState({error: 'boom!'});

    // Make sure an error toast is visible.
    const toast = component.find('.login-toast Toast');
    assert.equal(toast.length, 1);
    assert.equal(toast.props().type, 'danger');
  });

  it('shows a toast when referred to from the forgot password page', function() {
    // Set a global flag in localstorage. This would be set in the previous page by the
    // `ForgotPassword` component prior to redirecting to the login page.
    window.localStorage = {referredFromForgotPassword: 'true'};

    const component = mount(<Login />);

    // Make sure a forgot password success toast is visible.
    assert.equal(component.find('.login-toast-forgot-password').length, 1);
  });
});
