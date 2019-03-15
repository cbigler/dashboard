import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Icons, Toast } from '@density/ui';

const DEFAULT_ICONS = {
  primary: <Icons.Check />,
  danger: <Icons.Error />,
};

export function Toaster({
  toasts,
}) {
  return ReactDOM.createPortal(
    <div className="toaster">
      {toasts.map((toast, index) => {
        const type = toast.type || 'primary';
        const icon = toast.icon || DEFAULT_ICONS[type];
        return <div key={index} style={{marginBottom: 10}}>
          <Toast
            type={type}
            title={toast.title}
            icon={React.cloneElement(icon, {color: 'white'})}
          >
            {toast.text}
          </Toast>
        </div>;
      })}
    </div>,
    document.body
  );
}

export default connect((state: any) => ({
  toasts: state.toasts,
}), dispatch => {
  return {};
})(Toaster);
