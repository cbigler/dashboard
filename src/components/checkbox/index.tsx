import React, { useState } from 'react';
import uuid from 'uuid';
import styles from './styles.module.scss';
import colorVariables from '@density/ui/variables/colors.json';

type CheckboxProps = {
  id?: string,
  color: string
  checked: boolean,
  disabled: boolean,
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
  label?: React.ReactNode,
};

export default function Checkbox({ id, color, checked, disabled=false, onChange, label="" }: CheckboxProps) {
  const [idProp] = useState(id || `checkbox-${uuid.v4()}`);
  return (
    <div
      // Required so that clicking on the checkbox doesn't produce an `onClick` event in parent
      // elements, only an `onChange`.
      onClick={e => e.stopPropagation()}
    >
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
        style={checked && !disabled ? {
          color: color,
          backgroundColor: color,
          borderColor: color,
        } : {}}
      >{label}</label>
    </div>
  );
}

Checkbox.defaultProps = {
  id: null,
  checked: false,
  disabled: false,
  color: colorVariables.brandPrimary,
};
