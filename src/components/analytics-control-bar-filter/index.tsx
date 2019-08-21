import React, { Fragment, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
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

type FilterProps = {
  text: React.ReactNode,
  children: React.ReactNode,
  open: boolean,
  onOpen: () => void,
  onClose: () => void,
  onMouseEnter?: (string) => void,
  onMouseLeave?: (string) => void,
};

export default function Filter(props: FilterProps) {
  const {
    text,
    children,
    open,
    onOpen,
    onClose,
    onMouseEnter,
    onMouseLeave,
  } = props;

  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  // When the filter is focused, focus the wrapper div
  useEffect(() => {
    if (!wrapperRef.current) { return; }

    if (open && !isElementInside(wrapperRef.current, document.activeElement)) {
      (wrapperRef.current as HTMLElement).focus()
    }
  }, [open]);

  return (
    <Fragment>
      {open ? (
        ReactDOM.createPortal(
          <div
            className={styles.backdrop}
            onClick={onClose}
          />
        , document.body)
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
          onMouseEnter={e => !open && onMouseEnter && onMouseEnter(e)}
          onMouseLeave={e => onMouseLeave && onMouseLeave(e)}
        >
          {text}
        </span>

        {/* Filter Popup */}
        <div className={classnames(styles.popup, {[styles.open]: open})} aria-hidden={!open}>
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
