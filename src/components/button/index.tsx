import React from 'react';
import classnames from 'classnames';
import propTypes from 'prop-types';

const BUTTON_SIZE_STYLES = {
  small: 'button-small',
  large: 'button-large',
};

const BUTTON_TYPE_STYLES = {
  default: '',
  primary: 'button-primary',
};

type ButtonProps = {
  context?: string,
  type?: string,
  size?: string,
  children: any,
  disabled?: boolean,

  [key: string]: any,
}

export default function Button({
  type,
  size,
  children,
  disabled,
  width,
  height,

  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={classnames(
        'button',
        size ? BUTTON_SIZE_STYLES[size] : '',
        type ? BUTTON_TYPE_STYLES[type] : '',
      )}
      style={{width, height}}
    >
      {children}
    </button>
  );
}
Button.defaultProps = {
  type: 'default',
  size: 'medium',
  disabled: false,
};
