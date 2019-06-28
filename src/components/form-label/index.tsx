import React from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

export default function FormLabel({
  label,
  infoLabel='',
  required=false,
  input,
  htmlFor,
  className='',
  editable=false
}) {
  // `editable` should default to true if unset.
  editable = typeof editable === 'undefined' ? true : editable;

  return (
    <div className={classnames(styles.formLabel, editable ? styles.formLabelEditable: null, className)}>
      <label className={styles.formLabelLabel} htmlFor={htmlFor}>
        {typeof label === 'string' ? <span className={styles.formLabelLabelText}>{label}</span> : label}
        {infoLabel ? <span className={styles.formLabelInfoIcon} title={infoLabel}>&#xe91e;</span> : null}
        {required ? <span className={styles.formLabelRequired}>* Required</span> : null}
      </label>
      {input}
    </div>
  );
}
