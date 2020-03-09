import React from 'react';
import styles from './styles.module.scss';
import classnames from 'classnames';

import { Icons } from '@density/ui/src';

import { ServiceStatus } from '../../types/integrations';

const STATUS_TO_LABEL = {
  active: 'Active',
  error: 'Error',
  inactive: 'Inactive',
};

const Status: React.FunctionComponent<{
  includeLabel?: boolean,
  hideInactiveIcon?: boolean,
  status: ServiceStatus,
}> = ({includeLabel=false, hideInactiveIcon=false, status}) => {
  const statusIcon = (
    <div className={classnames(styles.statusIcon, {
      [styles.success]: status === 'active',
      [styles.empty]: !hideInactiveIcon && status === 'inactive',
      [styles.error]: status === 'error',
    })}>
      {status === 'active' ? (
        <Icons.Check color="currentColor" width={20} height={20} />
      ) : null}
      {status === 'error' ? (
        <Icons.Error color="currentColor" width={14} height={14} />
      ) : null}
      {status === 'inactive' && !hideInactiveIcon ? (
        <Icons.Minus color="currentColor" width={20} height={20} />
      ) : null}
    </div>
  );

  if (includeLabel) {
    return (
      <span className={classnames(styles.status, {
        [styles.success]: status === 'active',
        [styles.empty]: status === 'inactive',
        [styles.error]: status === 'error',
      })}>
        {STATUS_TO_LABEL[status]}
        {statusIcon}
      </span>
    );
  } else {
    return statusIcon;
  }
};

export default Status;
