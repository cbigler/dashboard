import React from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

export default function ModalHeaderActionButton({onClick, children, className}) {
  return <div
    onClick={onClick}
    className={classnames(styles.modalHeaderActionButton, className)}
  >{children}</div>;
}
