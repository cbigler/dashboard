import React from 'react';
import ReactDOM from 'react-dom';

import { hideToast } from '../../rx-actions/toasts';

import { Toast } from '@density/ui';

import styles from './styles.module.scss';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import useRxStore from '../../helpers/use-rx-store';
import ToastsStore from '../../rx-stores/toasts';

// FIXME: does anything import this (unconnected) component directly?
export function Toaster({
  toasts,
  onDismiss,
}) {
  return ReactDOM.createPortal(
    <div className={styles.toaster}>
      {toasts.map((toast, index) => {
        const type = toast.type || 'default';
        return <div key={index} style={{marginBottom: 10}}>
          <Toast type={type} visible={toast.visible} onDismiss={() => onDismiss(toast.id)}>
            {toast.text}
          </Toast>
        </div>;
      })}
    </div>,
    document.body,
  );
}

// FIXME: this is just a direct conversion of "connect", can probably be removed soon
export default () => {
  const toasts = useRxStore(ToastsStore)
  const dispatch = useRxDispatch();

  return (
    <Toaster
      toasts={toasts}
      onDismiss={id => { hideToast(dispatch, id); }}
    />
  )
}
