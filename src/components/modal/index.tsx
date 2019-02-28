import React, { useRef, useEffect, MutableRefObject } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';

type ModalProps = {
  visible: boolean,
  children: any,
  width?: string | number | undefined,
  height?: string | number | undefined,
  onBlur?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined,
  onEscape?: (() => void) | undefined,
}

export default function Modal({
  visible,
  width, 
  height,
  children,
  onBlur,
  onEscape,
}: ModalProps) {
  const dialog: any = useRef(null);
  useEffect(() => dialog.current.focus(), [visible]);

  const inlineStyle: any = {};
  if (width) {
    inlineStyle.width = '100%';
    inlineStyle.maxWidth = width;
  }
  if (height) {
    inlineStyle.height = height;
  }

  return ReactDOM.createPortal(
    <div
      tabIndex={0}
      className={classnames('dashboard-modal-backdrop', {visible})}
      onKeyDown={e => e.keyCode === 27 && onEscape && onEscape()}
      onMouseDown={onBlur}
    >
      <div
        ref={dialog}
        tabIndex={0}
        className="dashboard-modal-dialog"
        style={inlineStyle}
        onMouseDown={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
