import React, { useState } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

import { Icons } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

import { AnalyticsReport } from '../components/analytics-table';

function onHandleKeyboardFocus(e: React.KeyboardEvent, callback: (event: React.KeyboardEvent) => void) {
  switch (e.key) {
  case 'Enter':
  case ' ':
    e.preventDefault();
    e.stopPropagation();
    callback();
    break;
  }
}

const TabTarget: React.FunctionComponent<{
  isActive: boolean,
  isSaved: boolean,
  onClick: () => void,
  onClose: () => void,
  title: string,
}> = (props) => {
  return (
    <div
      className={classnames(styles.tabTarget, {[styles.tabTargetActive]: props.isActive})}
      onClick={() => props.onClick()}
      onKeyDown={e => onHandleKeyboardFocus(e, props.onClick)}
      tabIndex={0}
      aria-label={props.isSaved ? `${props.title} (Saved)` : props.title}
    >
      <div className={styles.tabTargetInner} tabIndex={-1}>
        <Icons.SaveOutline
          width={20}
          height={20}
          color={colorVariables.brandPrimary}
        />
        <div className={styles.tabTargetTitle}>
          {props.title}
        </div>
        <button
          className={styles.tabTargetClose}
          onClick={() => props.onClose()}
          aria-label={`Delete ${props.title}`}
          onKeyDown={e => onHandleKeyboardFocus(e, props.onClose)}
        >
          <div className={styles.tabTargetCloseInner} tabIndex={-1}>
            <Icons.Close color="currentColor" />
          </div>
        </button>
      </div>
    </div>
  );
}
TabTarget.defaultProps = {
  onClick: () => {},
  onClose: () => {},
};

const QueryTabList: React.FunctionComponent<{
  reports: AnalyticsReport[],
  activeReportId: string | null,
  onChangeActiveReport: (report: AnalyticsReport) => void,
  onCloseReport: (report: AnalyticsReport) => void,
  onAddNewReport: () => void,
}> = ({reports, activeReportId, onChangeActiveReport, onCloseReport, onAddNewReport}) => {

  return (
    <div className={styles.tabTargetList}>
      <div
        className={classnames(styles.tabTarget, styles.tabTargetHome, {[styles.tabTargetActive]: !activeReportId})}
        onClick={() => onChangeActiveReport(null)}
        onKeyDown={e => onHandleKeyboardFocus(e, () => onChangeActiveReport(null))}
        role="button"
        tabIndex={0}
      >
        <div className={styles.tabTargetInner} tabIndex={-1}>
          <Icons.LightningFill color="currentColor" />
        </div>
      </div>
      {reports.map(openQuery => {
        return (
          <TabTarget
            key={openQuery.id}
            isActive={openQuery.id === activeReportId}
            isSaved={openQuery.isSaved}
            onClick={() => onChangeActiveReport(openQuery.id)}
            onClose={() => onCloseReport(openQuery.id)}
            title={openQuery.title || 'Untitled Report'}
          />
        )
      })}
      <div
        role="button"
        className={styles.addReportButton}
        onClick={e => {
          onAddNewReport();
          e.target.blur();
        }}
        onKeyDown={(e: React.KeyboardEvent) => onHandleKeyboardFocus(e, () => {
          onAddNewReport();
          const target = e.target;
          setTimeout(() => {
            target.previousElementSibling.focus();
          }, 100);
        })}
        tabIndex={0}
      >
        <div className={styles.addReportButtonIcon}>
          <Icons.Plus color={colorVariables.brandPrimary} />
        </div>
        New Report
      </div>
    </div>
  );
}

export default QueryTabList;
