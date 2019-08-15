import React, { Fragment } from 'react';
import styles from './styles.module.scss';
import Checkbox from '../checkbox';

export function ItemList({choices, template, onClick}) {
  return (
    <ul className={styles.itemList}>
      {choices.map(choice => (
        <li
          tabIndex={0}
          key={choice.id}
          onClick={e => onClick(choice, e)}
          onKeyDown={e => {
            switch (e.key) {
            // Enter will select the current item
            case 'Enter':
            case ' ':
              e.preventDefault();
              onClick(choice, e);
              return;
            // Arrow keys will move up and down
            case 'ArrowUp':
              if (e.target.previousElementSibling) {
                e.preventDefault();
                e.target.previousElementSibling.focus();
              }
              return;
            case 'ArrowDown':
              if (e.target.nextElementSibling) {
                e.preventDefault();
                e.target.nextElementSibling.focus();
              }
              return;
            }
          }}
        >
          {template ? template(choice) : choice.label}
        </li>
      ))}
    </ul>
  )
}

export function MultipleSelectItemList({choices, value, onChange}) {
  return (
    <ItemList
      choices={choices}
      template={choice => (
        <Fragment>
          <Checkbox
            id={choice.id}
            checked={value.includes(choice.id)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([ ...value, choice.id ]);
              } else {
                onChange(value.filter(i => i !== choice.id));
              }
            }}
          />
          {choice.label}
        </Fragment>
      )}
      onClick={(choice, e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') { return; }
        if (value.includes(choice.id)) {
          onChange(value.filter(i => i !== choice.id));
        } else {
          onChange([ ...value, choice.id ]);
        }
      }}
    />
  );
}

export function CircleIconButton({ children, onClick }) {
  return (
    <button className={styles.circleIconButton} onClick={onClick}>
      {children}
    </button>
  );
}
