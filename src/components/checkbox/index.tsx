import React, { useState } from 'react';
import uuid from 'uuid';
import styles from './styles.module.scss';

type CheckboxProps = {
  id?: string,
  checked: boolean,
  disabled?: boolean,
  onChange: (event: React.SyntheticEvent) => void,
}

export default function Checkbox({ id, checked, disabled=false, onChange }: CheckboxProps) {
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
