import React, { useState, Fragment } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

import { SpaceHierarchyDisplayItem } from '../../helpers/space-hierarchy-formatter';
import { DensitySpace } from '../../types';
import { DateRange } from '../../helpers/space-time-utilities';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import mixpanelTrack from '../../helpers/tracking/mixpanel-track';

import AnalyticsFocusedMetricSelector from '../analytics-control-bar-metric-selector';
import AnalyticsControlBarSpaceSelector, {
  AnalyticsSpaceSelection,
  EMPTY_SELECTION,
} from '../analytics-control-bar-space-selector';
import AnalyticsControlBarDateRangeFilter from '../analytics-control-bar-date-range-selector';
import AnalyticsIntervalSelector from '../analytics-control-bar-interval-selector';
import AnalyticsPopup, { AnalyticsPopupPinCorner, ItemList } from '../analytics-popup';
import { QueryInterval, AnalyticsFocusedMetric } from '../../types/analytics';

// FIXME: The below should be switched to use the new rx-actinos based modal interface,
// point this out in a review!
import showModal from '../../rx-actions/modal/show';

import { Button, Icons } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

import { AddButton } from '../analytics-control-bar-utilities';
import can, { PERMISSION_CODES } from '../../helpers/permissions';
import { UserState } from '../../rx-stores/user';
import AnalyticsControlBarTimeFilter from '../analytics-control-bar-time-filter';
import { TimeFilter } from '../../types/datetime';

type AnalyticsControlBarProps = {
  userState: UserState,
  metric: AnalyticsFocusedMetric,
  onChangeMetric: (metric: AnalyticsFocusedMetric) => void,

  selections: Array<AnalyticsSpaceSelection>,
  onChangeSelections: (filters: Array<AnalyticsSpaceSelection>) => void,

  interval: QueryInterval,
  onChangeInterval: (interval: QueryInterval) => void,

  dateRange: DateRange | null,
  onChangeDateRange: (dateRange: DateRange | null) => void,

  timeFilter?: TimeFilter,
  onChangeTimeFilter: (timeFilter: TimeFilter) => void,
  
  spaces: Array<DensitySpace>,
  formattedHierarchy: Array<SpaceHierarchyDisplayItem>,
  saveButtonState: AnalyticsControlBarSaveButtonState,
  onSave?: () => void,
  onUpdateReportName?: (name: string) => void,
  refreshEnabled: boolean,
  moreMenuVisible: boolean,
  onRefresh: () => void,
}

const AnalyticsControlBar: React.FunctionComponent<AnalyticsControlBarProps> = function AnalyticsControlBar({
  userState,

  metric,
  onChangeMetric,

  selections,
  onChangeSelections,

  interval,
  onChangeInterval,

  dateRange,
  onChangeDateRange,

  timeFilter,
  onChangeTimeFilter,

  spaces,
  formattedHierarchy,

  saveButtonState,
  onSave,
  onUpdateReportName,
  onRefresh,
  refreshEnabled,
  moreMenuVisible,
}) {
  return (
    <div className={styles.analyticsControlBar}>
      <div className={styles.analyticsControlBarSectionWrap}>
        <AnalyticsFocusedMetricSelector
          value={metric}
          onChange={onChangeMetric}
        />
        <AnalyticsSpaceSelectionBuilder
          selections={selections}
          onChange={onChangeSelections}
          spaces={spaces}
          formattedHierarchy={formattedHierarchy}
        />
        <AnalyticsControlBarDateRangeFilter
          value={dateRange}
          onChange={onChangeDateRange}
        />
        <AnalyticsControlBarTimeFilter
          timeFilter={timeFilter}
          onApply={onChangeTimeFilter}
        />
        <AnalyticsIntervalSelector
          value={interval}
          onChange={onChangeInterval}
        />
        <button
          className={classnames(styles.refreshButton, {[styles.disabled]: !refreshEnabled})}
          onClick={() => {
            if (refreshEnabled) {
              onRefresh();
            }
          }}
        >
          <Icons.Refresh color={refreshEnabled ? colorVariables.brandPrimary : colorVariables.gray} />
        </button>
      </div>
      {can(userState, PERMISSION_CODES.coreWrite) ?
        <div className={styles.analyticsControlBarSection}>
          <AnalyticsControlBarButtons
            saveButtonState={saveButtonState}
            onSave={onSave}
            onUpdateReportName={onUpdateReportName}
            moreMenuVisible={moreMenuVisible}
          />
        </div>
      : null}
    </div>
  );
}


export enum AnalyticsControlBarSaveButtonState {
  NORMAL = 'NORMAL',
  DISABLED = 'DISABLED',
  LOADING = 'LOADING',
}
type AnalyticsControlBarButtonsProps = {
  saveButtonState: AnalyticsControlBarSaveButtonState,
  onSave?: () => void,
  moreMenuVisible: boolean,
  onUpdateReportName?: (name: string) => void,
}
export const AnalyticsControlBarButtons: React.FunctionComponent<AnalyticsControlBarButtonsProps> = ({ saveButtonState, onSave, moreMenuVisible, onUpdateReportName }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const rxDispatch = useRxDispatch();
  return (
    <Fragment>
      <Button
        disabled={saveButtonState !== AnalyticsControlBarSaveButtonState.NORMAL}
        variant="filled"
        onClick={() => onSave ? onSave() : null}
      >
        {saveButtonState === AnalyticsControlBarSaveButtonState.LOADING ? (
          <div className={styles.saveButtonWrapper}>
            Loading...
          </div>
        ) : (
          <div className={styles.saveButtonWrapper}>
            <Icons.Save color="currentColor" />
            <span className={styles.saveButtonText}>Save</span>
          </div>
        )}
      </Button>
      {moreMenuVisible ? (
        <AnalyticsPopup
          target={<button className={styles.iconButton}><Icons.More /></button>}
          open={moreOpen}
          onOpen={() => setMoreOpen(true)}
          onClose={() => setMoreOpen(false)}
          pinCorner={AnalyticsPopupPinCorner.RIGHT}
        >
          <ItemList
            choices={[{ id: '', label: 'Rename' }]}
            onClick={choice => {
              setMoreOpen(false);

              if (onUpdateReportName) {
                mixpanelTrack('Analytics Report Rename', {
                  'Location': 'Control Bar',
                });
                // FIXME: The below should be switched to use the new rx-actinos based modal interface,
                // point this out in a review!
                showModal(rxDispatch, 'MODAL_PROMPT', {
                  title: `Rename Report`,
                  placeholder: 'Enter a new name',
                  confirmText: 'Save',
                  callback: onUpdateReportName,
                });
              }
            }}
          />
        </AnalyticsPopup>
      ) : null}
    </Fragment>
  );
};

type AnalyticsSpaceSelectionBuilderProps = {
  selections: Array<AnalyticsSpaceSelection>,
  onChange: (filters: Array<AnalyticsSpaceSelection>) => void,

  spaces: Array<DensitySpace>,
  formattedHierarchy: Array<SpaceHierarchyDisplayItem>,
}

function AnalyticsSpaceSelectionBuilder({
  selections,
  onChange,
  spaces,
  formattedHierarchy,
}: AnalyticsSpaceSelectionBuilderProps) {
  const [ openedSelectionIndex, setOpenedSelectionIndex ] = useState(-1);

  const isAdding = openedSelectionIndex > selections.length - 1;
  const emptySelectionVisible = selections.length === 0 || isAdding;

  const selectionsIncludingEmpty = [ ...selections, ...(emptySelectionVisible ? [EMPTY_SELECTION] : []) ];

  return (
    <Fragment>
      {selectionsIncludingEmpty.map((selection, index) => (
        <div className={styles.listItem} aria-label="Space selection">
          <AnalyticsControlBarSpaceSelector
            selection={selection}
            deletable={selections.length > 1 || selection.field !== ''}
            onDelete={() => {
              const selectionsCopy = selections.slice();
              selectionsCopy.splice(index, 1);
              onChange(selectionsCopy);
            }}
            open={openedSelectionIndex === index}
            onOpen={() => setOpenedSelectionIndex(index)}
            onClose={selection => {
              // Close the currently open selection
              setOpenedSelectionIndex(-1);

              // Update the selection if its not the empty selection
              const fieldIsEmpty = selection.field === '' || selection.values.length === 0;
              if (!fieldIsEmpty && selections[index] !== selection) {
                const selectionsCopy = selections.slice();
                selectionsCopy[index] = selection;
                onChange(selectionsCopy);
              }
            }}
            spaces={spaces}
            formattedHierarchy={formattedHierarchy}
          />
        </div>
      )).reduce((acc: React.ReactNode, i) => {
        if (acc) {
          return (
            <Fragment>
              {acc}
              <div className={styles.listItemWrapper}>
                <div>or</div> {i}
              </div>
            </Fragment>
          );
        } else {
          return i;
        }
      }, null)}
      <AddButton onClick={() => {
        // FIXME: why is this symbol being overridden in this scope?
        let openedSelectionIndex = selections.length;

        // Focus the last space filter that is visible, it is delayed so that it will happen on the
        // next render after the above onChange is processed ans so that the animation to open is
        // shown.
        setTimeout(() => {
          setOpenedSelectionIndex(openedSelectionIndex);
        }, 100);
      }} />
    </Fragment>
  );
}

export default AnalyticsControlBar;
