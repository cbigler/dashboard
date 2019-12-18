import React, { Fragment, useRef, useEffect } from 'react';
import styles from './styles.module.scss';
import classnames from 'classnames';

function isElementInside(parentElement, element) {
  while (element) {
    if (element === parentElement) {
      return true;
    }
    element = element.parentElement;
  }
  return false;
}

export enum AnalyticsPopupPinCorner {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

type AnalyticsPopupProps = {
  target: React.ReactNode,
  children: React.ReactNode,
  open: boolean,
  onOpen: () => void,
  onClose: () => void,
  onMouseEnter?: (evt: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void,
  onMouseLeave?: (evt: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void,

  pinCorner?: AnalyticsPopupPinCorner,
};

const AnalyticsPopup: React.FunctionComponent<AnalyticsPopupProps> = function AnalyticsPopupProps(props) {
  const {
    target,
    children,
    pinCorner = AnalyticsPopupPinCorner.LEFT,
    open,
    onOpen,
    onClose,
    onMouseEnter,
    onMouseLeave,
  } = props;

  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  // When the popup is focused, focus the wrapper div
  useEffect(() => {
    if (!wrapperRef.current) { return; }

    if (open && !isElementInside(wrapperRef.current, document.activeElement)) {
      (wrapperRef.current as HTMLElement).focus();
    } else if (!open && document.activeElement === wrapperRef.current) {
      (wrapperRef.current as HTMLElement).blur();
    }
  }, [open]);

  return (
    <Fragment>
      {open ? (
        <div
          className={styles.backdrop}
          onClick={onClose}
        />
      ) : null}

      <span
        ref={wrapperRef}
        className={styles.wrapper}
        tabIndex={0}
        onFocus={e => {
          const focusedTarget = e.currentTarget;
          const bluredTarget = e.relatedTarget;
          if (
            isElementInside(wrapperRef.current, focusedTarget) &&
            !isElementInside(wrapperRef.current, bluredTarget)
          ) {
            onOpen();
          }
        }}
        onBlur={e => {
          const bluredTarget = e.currentTarget;
          const focusedTarget = e.relatedTarget;
          if (
            !isElementInside(wrapperRef.current, focusedTarget) &&
            isElementInside(wrapperRef.current, bluredTarget)
          ) {
            onClose();
          }
        }}
      >
        {/* Target */}
        <span
          role="button"
          className={styles.target}
          onClick={onOpen}
          onMouseEnter={e => !open && onMouseEnter && onMouseEnter(e)}
          onMouseLeave={e => onMouseLeave && onMouseLeave(e)}
        >
          {target}
        </span>

        {/* Popup */}
        <div
          className={classnames(styles.popup, {
            [styles.open]: open,
            [styles.pinLeft]: pinCorner === AnalyticsPopupPinCorner.LEFT,
            [styles.pinRight]: pinCorner === AnalyticsPopupPinCorner.RIGHT,
          })}
          aria-hidden={!open}
        >
          {children}
        </div>
      </span>
    </Fragment>
  );
}
export default AnalyticsPopup;


type ItemListChoice = { id: string, label: React.ReactNode, disabled?: boolean };
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
          tabIndex={!choice.disabled ? 0 : undefined}
          key={choice.id}
          className={classnames({[styles.disabled]: choice.disabled})}
          onClick={e => {
            if (choice.disabled !== true) {
              onClick(choice, e);
            }
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLLIElement>) => {
            switch (e.key) {
            // Enter will select the current item
            case 'Enter':
            case ' ':
              if (choice.disabled !== true) {
                e.preventDefault();
                onClick(choice, e);
              }
              return;
            // Arrow keys will move up and down
            case 'ArrowUp':
              let previousElement = e.currentTarget.previousElementSibling;
              if (previousElement) {
                // If the previous element is not selectable, then keep going backwards until a
                // selectable element it found.
                while (previousElement && previousElement.getAttribute('tabIndex') !== '0') {
                  previousElement = previousElement.previousElementSibling;
                }
                if (previousElement) {
                  e.preventDefault();
                  (previousElement as HTMLElement).focus();
                }
              }
              return;
            case 'ArrowDown':
              let nextElement = e.currentTarget.nextElementSibling;
              if (nextElement) {
                // If the next element is not selectable, then keep going backwards until a
                // selectable element it found.
                while (nextElement && nextElement.getAttribute('tabIndex') !== '0') {
                  nextElement = nextElement.nextElementSibling;
                }
                if (nextElement) {
                  e.preventDefault();
                  (nextElement as HTMLElement).focus();
                }
              }
              return;
            }
          }}
        >
          {template(choice)}
        </li>
      ))}
    </ul>
  );
}
