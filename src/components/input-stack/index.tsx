import React from 'react';
import classnames from 'classnames';

import styles from './styles.module.scss';

export function InputStackGroup(props) {
  return <div
    {...props}
    className={classnames(styles.inputStackGroupContainer, props.className)}
  >
    {props.children}
  </div>;
}

export class InputStackItem extends React.Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value || '',
      focused: false
    };
  }

  render() {
    // Append correct container classes
    const containerClassName = classnames({
      [styles.inputStackItemContainer]: true,
      [styles.inputStackItemPendingError]: this.state.focused && this.props.invalid,
      [styles.inputStackItemPendingValid]: this.state.focused && !this.props.invalid,
      [styles.inputStackItemError]: !this.state.focused && this.props.invalid,
      [styles.inputStackItemValid]: !this.state.focused && !this.props.invalid && this.props.value
    }, this.props.className);

    // Sanitize props to pass through to input
    const inputProps: any = Object.assign({}, this.props);
    delete inputProps.invalid;
    delete inputProps.focused;
    delete inputProps.className;

    // Intercept focus and blur events
    inputProps.onFocus = event => {
      this.setState({ focused: true });
      this.props.onFocus && this.props.onFocus(event);
    }
    inputProps.onBlur = event => {
      this.setState({ focused: false });
      this.props.onBlur && this.props.onBlur(event);
    }

    // Render container and input
    return <div className={containerClassName}>
      <input className={styles.inputStackItemInput} {...inputProps} />
    </div>;
  }
}
