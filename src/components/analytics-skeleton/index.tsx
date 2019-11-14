import React from 'react';
import styles from './styles.module.scss';

import AnalyticsTabs from '../analytics-tabs';
import { AnalyticsHomeSkeleton } from '../analytics-home';

export default function AnalyticsSkeleton() {
  return (
    <div className={styles.wrapper}>
      <AnalyticsTabSkeleton />
      {/* <AnalyticsControlBarSkeleton /> */}
      <AnalyticsHomeSkeleton />
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

// function AnalyticsControlBarSkeleton() {
//   return (
//     <div className={styles.controlBar}>
//       <div className={styles.controlBarSection}>
//         <div className={styles.controlBarItem}><Skeleton width={43} height={6} /></div>
//         <div className={styles.controlBarItem}><Skeleton width={175} height={6} /></div>
//         <div className={styles.controlBarItem}>
//           <Skeleton width={32} height={32} borderRadius={16} />
//         </div>
//         <div className={styles.controlBarItem}><Skeleton width={38} height={6} /></div>
//         <div className={styles.controlBarItem}><Skeleton width={92} height={6} /></div>
//         <div className={styles.controlBarItem}><Skeleton width={72} height={6} /></div>
//       </div>
//       <div className={styles.controlBarSection}>
//         <AnalyticsControlBarButtons
//           saveButtonState={AnalyticsControlBarSaveButtonState.DISABLED}
//           onSave={() => {}}
//           moreMenuVisible={false}
//         />
//       </div>
//     </div>
//   );
// }
