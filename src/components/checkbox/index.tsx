import React, { useState } from 'react';
import uuid from 'uuid';
import styles from './styles.module.scss';

export default function Checkbox({ id=null, checked, disabled=false, onChange }) {
  const [idProp] = useState(id || `checkbox-${uuid.v4()}`);
  return (
    <div>
      <input
        type="checkbox"
        disabled={disabled}
        checked={checked}
        className={styles.checkbox}
        id={idProp}
        onChange={onChange}
      />
      <label
        className={styles.label}
        htmlFor={idProp}
      />
    </div>
  );
}
