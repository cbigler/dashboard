import React, { Fragment, useRef, useEffect } from 'react';
import styles from './styles.module.scss';
import classnames from 'classnames';

function isElementInside(parentElement: Element, element: Element) {
  let currentElement: Element | null = element;
  while (currentElement) {
    if (currentElement === parentElement) {
      return true;
    }
    currentElement = currentElement.parentElement;
  }
  return false;
}

type SelectorProps = {
  text: React.ReactNode,
  children: React.ReactNode,
  open: boolean,
  onOpen: () => void,
  onClose: () => void,
  onMouseEnter?: (string) => void,
  onMouseLeave?: (string) => void,
};

const Selector: React.FunctionComponent<SelectorProps> = function Selector(props) {
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

  // When the selector is focused, focus the wrapper div
  useEffect(() => {
    if (!wrapperRef.current) { return; }
    if (!document.activeElement) { return; }

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
          const focusedTarget = e.target as Element | null;
          const bluredTarget  = e.relatedTarget as Element | null;
          if (wrapperRef.current === null || focusedTarget === null || bluredTarget === null) { return; }
          if (
            isElementInside(wrapperRef.current, focusedTarget) &&
            !isElementInside(wrapperRef.current, bluredTarget)
          ) {
            onOpen();
          }
        }}
        onBlur={e => {
          const bluredTarget = e.target as Element | null;
          const focusedTarget = e.relatedTarget as Element | null;
          if (wrapperRef.current === null || focusedTarget === null || bluredTarget === null) { return; }
          if (
            !isElementInside(wrapperRef.current, focusedTarget) &&
            isElementInside(wrapperRef.current, bluredTarget)
          ) {
            onClose();
          }
        }}
      >
        {/* Selector Label */}
        <span
          role="button"
          className={styles.selector}
          onClick={onOpen}
          onMouseEnter={e => !open && onMouseEnter && onMouseEnter(e)}
          onMouseLeave={e => onMouseLeave && onMouseLeave(e)}
        >
          {text}
        </span>

        {/* Selector Popup */}
        <div className={classnames(styles.popup, {[styles.open]: open})} aria-hidden={!open}>
          {children}
        </div>
      </span>
    </Fragment>
  );
}

export function QueryTextBold({children}) {
  return (
    <span className={styles.queryTextBold}>{children}</span>
  );
}

export default Selector;
