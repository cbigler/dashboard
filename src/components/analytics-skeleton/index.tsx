import React from 'react';
import styles from './styles.module.scss';
import { Icons } from '@density/ui';

import colorVariables from '@density/ui/variables/colors.json';

export default function AnalyticsSkeleton() {
  return (
    <div className={styles.wrapper}>
      <AnalyticsTabSkeleton />
    </div>
  );
}

function AnalyticsTabSkeleton() {
  return (
    <div className={styles.tabWrapper}>
      <div className={styles.homeTab}>
        <Icons.LightningFill color={colorVariables.reportYellow} />
      </div>
    </div>
  )
}
