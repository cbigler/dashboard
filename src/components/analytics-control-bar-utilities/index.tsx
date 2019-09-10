import React, { Fragment } from 'react';
import styles from './styles.module.scss';
import Checkbox from '../checkbox';
import { Icons } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';



export const ARROW_TEMPLATE = choice => {
  return <div className={styles.itemListDefaultTemplateRow}>
    {choice.label}
    <Icons.ChevronRight />
  </div>
};

type ItemListChoice = { id: string, label: React.ReactNode };
type ItemListProps = {
  choices: Array<ItemListChoice>,
  template?: (choice: ItemListChoice) => React.ReactNode,
  onClick: (choice: ItemListChoice, event: React.SyntheticEvent<HTMLLIElement>) => void,
};

const DEFAULT_TEMPLATE = choice => choice.label;
export const ItemList: React.FunctionComponent<ItemListProps> = function ItemList(props) {
  const { choices, template = DEFAULT_TEMPLATE, onClick } = props;
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
              const previousElementSibling = (e.target as HTMLLIElement).previousElementSibling;
              if (previousElementSibling) {
                e.preventDefault();
                (previousElementSibling as HTMLElement).focus();
              }
              return;
            case 'ArrowDown':
              const nextElementSibling = (e.target as HTMLLIElement).nextElementSibling;
              if (nextElementSibling) {
                e.preventDefault();
                (nextElementSibling as HTMLElement).focus();
              }
              return;
            }
          }}
        >
          {template(choice)}
        </li>
      ))}
    </ul>
  )
}



type MultipleSelectItemListProps = {
  choices: Array<ItemListChoice>,
  value: Array<ItemListChoice["id"]>,
  onChange: (choices: Array<ItemListChoice["id"]>) => void,
};

export const MultipleSelectItemList: React.FunctionComponent<MultipleSelectItemListProps> = function MultipleSelectItemList({ choices, value, onChange }) {
  return (
    <ItemList
      choices={choices}
      template={choice => (
        <Fragment>
          <Checkbox
            id={choice.id as string}
            checked={value.includes(choice.id)}
            onChange={(e) => {
              if ((e.target as HTMLInputElement).checked) {
                onChange([ ...value, choice.id ]);
              } else {
                onChange(value.filter(i => i !== choice.id));
              }
            }}
          />
          <span className={styles.multipleSelectListItem}>{choice.label}</span>
        </Fragment>
      )}
      onClick={(choice, e) => {
        const tagName = (e.target as HTMLElement).tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'label') { return; }

        if (value.includes(choice.id)) {
          onChange(value.filter(i => i !== choice.id));
        } else {
          onChange([ ...value, choice.id ]);
        }
      }}
    />
  );
}

export const BackButton: React.FC<{
  onClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void, 
}> = function BackButton({ onClick }) {
  return (
    <button className={styles.backButton} onClick={onClick} aria-label="Back to filter list">
      <Icons.ArrowLeft />
    </button>
  );
}

export const AddButton: React.FC<{
  onClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void,
}> = function AddButton({ onClick }) {
  return (
    <button className={styles.addButton} onClick={onClick} aria-label="Add new filter">
      <Icons.Plus />
    </button>
  );
}

export const FilterDeleteButton: React.FC<{
  onClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void,
  onFocus?: (evt: React.FocusEvent<HTMLButtonElement>) => void,
  onBlur?: (evt: React.FocusEvent<HTMLButtonElement>) => void,
}> = function FilterDeleteButton({ onClick, onFocus, onBlur }) {
  return (
    <button
      className={styles.deleteButton}
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <Icons.Close
        color={colorVariables.brandDanger}
        width={16}
        height={16}
      />
    </button>
  );
}

export const SubmitButton: React.FC<{
  onClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void,
  disabled?: boolean
}> = function SubmitButton({ onClick, disabled, children }) {
  return (
    <button className={styles.submitButton} onClick={onClick} disabled={disabled}>
      {/* hack so that focus styles only show when keyboard focuses the control:
          see https://stackoverflow.com/a/45191208/4115328 */}
      <span tabIndex={-1} className={styles.inner}>
        {children}
      </span>
    </button>
  );
}
