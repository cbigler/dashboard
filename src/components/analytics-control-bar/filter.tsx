import React, { Fragment, useState, useRef } from 'react';
import styles from './filter.module.scss';
import classnames from 'classnames';

export default function Filter({text, children, open, onOpen, onClose}) {
  const wrapperRef = useRef();

  // This `focusCount` value is used to keep track of if each focus event has a corresponding blur
  // event within the popup. If not, the popup is closed.
  const focusCount = useRef();

  function onResetAndClose() {
    focusCount.current = 1;
    onClose();
  }

  return (
    <Fragment>
      {open ? (
        <div
          className={styles.backdrop}
          onClick={onResetAndClose}
        />
      ) : null}

      <span
        ref={wrapperRef}
        className={styles.wrapper}
        tabIndex={0}
        onFocus={e => {
          onOpen();

          focusCount.current = focusCount.current || 0;
          if (focusCount.current >= 1 && e.target === wrapperRef.current) { return; }

          // For each focus event, add one to the focus count.
          focusCount.current += 1;
        }}
        onBlur={e => {
          // There's a bit of trickyness going on here. Delay this blur event slightly so that it
          // fires after the corresponding focus event.
          let target = e.target;
          setTimeout(() => {

            // If the focus count is odd, there was a focus that happened outside of the popup.
            // Close the popup.
            if (focusCount.current % 2 === 1) {
              onResetAndClose();
              return;
            } else {
              // For each blur event, remove one from the focus count. If each focus has a correspondign
              // blue event, then the focus count should be 0.
              focusCount.current -= 1;
            }
          }, 50)
        }}
      >
        {/* Filter Label */}
        <span
          role="button"
          className={styles.filter}
          onClick={onOpen}
        >
          {text}
        </span>

        {/* Filter Popup */}
        <div className={classnames(styles.popup, {[styles.open]: open})}>
          {children}
        </div>
      </span>
    </Fragment>
  );
}

export function FilterBold({children}) {
  return (
    <span className={styles.filterBold}>{children}</span>
  );
}
