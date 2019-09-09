import React from 'react';
import styles from './styles.module.scss';
import { Skeleton, Icons } from '@density/ui';

import colorVariables from '@density/ui/variables/colors.json';

import AnalyticsTabs from '../analytics-tabs';
import { AnalyticsControlBarButtons } from '../analytics-control-bar';

export default function AnalyticsSkeleton() {
  return (
    <div className={styles.wrapper}>
      <AnalyticsTabSkeleton />
      <AnalyticsControlBarSkeleton />
    </div>
  );
}

function AnalyticsTabSkeleton() {
  return (
    <AnalyticsTabs
      reports={[]}
      activeReportId={null}
      onChangeActiveReport={reportId => {}}
      onCloseReport={reportId => {}}
      onAddNewReport={() => {}}
    />
  );
}

function AnalyticsControlBarSkeleton() {
  return (
    <div className={styles.controlBar}>
      <div className={styles.controlBarSection}>
        <div className={styles.controlBarItem}><Skeleton width={43} height={6} /></div>
        <div className={styles.controlBarItem}><Skeleton width={175} height={6} /></div>

        {/* FIXME:this one needs a border radius, point this out in a code review! */}
        <div className={styles.controlBarItem}><Skeleton width={32} height={32} /></div>

        <div className={styles.controlBarItem}><Skeleton width={38} height={6} /></div>
        <div className={styles.controlBarItem}><Skeleton width={92} height={6} /></div>
        <div className={styles.controlBarItem}><Skeleton width={72} height={6} /></div>
      </div>
      <div className={styles.controlBarSection}>
        <AnalyticsControlBarButtons disabled />
      </div>
    </div>
  );
}
