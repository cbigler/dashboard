import React, { Fragment, useState, useRef, useEffect } from 'react';
import styles from './filter.module.scss';
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

export default function Filter({text, children, open, onOpen, onClose}) {
  const wrapperRef = useRef();

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
          const focusedTarget = e.target;
          const bluredTarget = e.relatedTarget;
          if (
            isElementInside(wrapperRef.current, focusedTarget) &&
            !isElementInside(wrapperRef.current, bluredTarget)
          ) {
            onOpen();
          }
        }}
        onBlur={e => {
          const bluredTarget = e.target;
          const focusedTarget = e.relatedTarget;
          if (
            !isElementInside(wrapperRef.current, focusedTarget) &&
            isElementInside(wrapperRef.current, bluredTarget)
          ) {
            onClose();
          }
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
