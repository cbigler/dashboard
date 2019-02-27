import React from 'react';
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
      className={classnames('dashboard-modal', {visible})}
      onClick={onBlur}
    >
      <div
        className="dashboard-modal-inner"
        style={inlineStyle}
        tabIndex={0}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => (e.keyCode === 27 && onEscape && onEscape()) || console.log(e.keyCode)}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
