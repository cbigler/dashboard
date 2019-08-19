import React, { Fragment, useRef } from 'react';
import ReactDOM from 'react-dom';
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

type FilterProps = {
  text: React.ReactNode,
  children: React.ReactNode,
  open: boolean,
  onOpen: () => void,
  onClose: () => void,
  onMouseEnter?: (string) => void,
  onMouseLeave?: (string) => void,
};

const Filter = React.forwardRef((props: FilterProps, forwardedRef: React.Ref<HTMLSpanElement> | null) => {
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
        ref={ref => {
          wrapperRef.current = ref;
          if (forwardedRef) {
            if (typeof forwardedRef === 'function') {
              forwardedRef(ref);
            } else {
              (forwardedRef.current as any) = ref;
            }
          }
        }}
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
});
export default Filter;

export function FilterBold({children}) {
  return (
    <span className={styles.filterBold}>{children}</span>
  );
}
