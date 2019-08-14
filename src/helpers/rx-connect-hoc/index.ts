import React from 'react';
import { BehaviorSubject } from 'rxjs';

import useRxStore from '../use-rx-store';
import useRxDispatch from '../use-rx-dispatch';
import { GlobalAction } from '../../interfaces';

export default function rxConnect<CP=any, SP=any, DP=any, S=any>(
  store: BehaviorSubject<S>,
  mapStateToProps: (state: S) => SP,
  mapDispatchToProps: (dispatch: (action: GlobalAction) => void) => DP
) {
  return function(Component: React.ComponentType<CP & SP & DP>) {
    return function(props: CP) {
      const storeProps = mapStateToProps(useRxStore(store));
      const dispatchProps = mapDispatchToProps(useRxDispatch());
      return React.createElement(
        Component,
        {...dispatchProps, ...storeProps, ...props}
      );
    };
  };
}
