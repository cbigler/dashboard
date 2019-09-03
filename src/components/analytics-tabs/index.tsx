import React, { useRef } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

import { Icons } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

import { AnalyticsReport } from '../../types/analytics';

function onHandleKeyboardFocus(e: React.KeyboardEvent, callback: () => void) {
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
      // Cancel mouse down events within the tab target as they trigger the focus state
      onMouseDown={e => e.preventDefault()}
      onKeyDown={e => onHandleKeyboardFocus(e, props.onClick)}
      tabIndex={0}
      aria-label={props.isSaved ? `${props.title} (Saved)` : props.title}
    >
      <div className={styles.tabTargetInner} tabIndex={-1}>
        <Icons.SaveOutline
          width={20}
          height={20}
          color={props.isSaved ? colorVariables.brandPrimary : colorVariables.grayDark}
        />
        <div className={styles.tabTargetTitle}>
          {props.title}
        </div>
        <button
          className={styles.tabTargetClose}
          onClick={e => {
            props.onClose();
            e.stopPropagation();
          }}
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
  onChangeActiveReport: (report: AnalyticsReport["id"] | null) => void,
  onCloseReport: (report: AnalyticsReport["id"]) => void,
  onAddNewReport: () => void,
}> = ({reports, activeReportId, onChangeActiveReport, onCloseReport, onAddNewReport}) => {
  const list = useRef<HTMLDivElement | null>(null);
  return (
    <div className={styles.tabTargetList} ref={list}>
      <div
        className={classnames(styles.tabTarget, styles.tabTargetHome, {[styles.tabTargetActive]: !activeReportId})}
        onClick={() => onChangeActiveReport(null)}
        // Cancel mouse down events within the tab target as they trigger the focus state
        onMouseDown={e => e.preventDefault()}
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
            onClick={() => {
              if (openQuery.id !== activeReportId) {
                onChangeActiveReport(openQuery.id)
              }
            }}
            onClose={() => onCloseReport(openQuery.id)}
            title={openQuery.name || 'Untitled Report'}
          />
        )
      })}
      <div
        role="button"
        className={styles.addReportButton}
        onClick={e => {
          onAddNewReport();
          (e.target as HTMLElement).blur();
        }}
        onKeyDown={(e: React.KeyboardEvent) => onHandleKeyboardFocus(e, onAddNewReport)}
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
