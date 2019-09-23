import React, { useState, Fragment } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

import { SpaceHierarchyDisplayItem } from '../../helpers/space-hierarchy-formatter';
import { DensitySpace } from '../../types';
import { DateRange } from '../../helpers/space-time-utilities';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import mixpanelTrack from '../../helpers/mixpanel-track';

import AnalyticsFocusedMetricSelector from '../analytics-control-bar-metric-filter';
import AnalyticsControlBarSpaceFilter, {
  AnalyticsSpaceFilter,
  EMPTY_FILTER,
} from '../analytics-control-bar-space-filter';
import AnalyticsControlBarDateRangeFilter from '../analytics-control-bar-date-range-filter';
import AnalyticsIntervalSelector from '../analytics-control-bar-interval-filter';
import AnalyticsPopup, { AnalyticsPopupPinCorner, ItemList } from '../analytics-popup';
import { QueryInterval, AnalyticsFocusedMetric } from '../../types/analytics';

// FIXME: The below should be switched to use the new rx-actinos based modal interface,
// point this out in a review!
import showModal from '../../actions/modal/show';

import { Button, Icons } from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

import { AddButton } from '../analytics-control-bar-utilities';

type AnalyticsControlBarProps = {
  metric: AnalyticsFocusedMetric,
  onChangeMetric: (metric: AnalyticsFocusedMetric) => void,

  filters: Array<AnalyticsSpaceFilter>,
  onChangeFilters: (filters: Array<AnalyticsSpaceFilter>) => void,

  interval: QueryInterval,
  onChangeInterval: (interval: QueryInterval) => void,

  dateRange: DateRange | null,
  onChangeDateRange: (dateRange: DateRange | null) => void,
  
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
  metric,
  onChangeMetric,

  filters,
  onChangeFilters,

  interval,
  onChangeInterval,

  dateRange,
  onChangeDateRange,

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
        <AnalyticsSpaceFilterBuilder
          filters={filters}
          onChange={onChangeFilters}
          spaces={spaces}
          formattedHierarchy={formattedHierarchy}
        />
        <AnalyticsControlBarDateRangeFilter
          value={dateRange}
          onChange={onChangeDateRange}
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
      <div className={styles.analyticsControlBarSection}>
        <AnalyticsControlBarButtons
          saveButtonState={saveButtonState}
          onSave={onSave}
          onUpdateReportName={onUpdateReportName}
          moreMenuVisible={moreMenuVisible}
        />
      </div>
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
                showModal('MODAL_PROMPT', {
                  title: `Rename Report`,
                  placeholder: 'Enter a new name',
                  confirmText: 'Save',
                  callback: onUpdateReportName,
                })(rxDispatch);
              }
            }}
          />
        </AnalyticsPopup>
      ) : null}
    </Fragment>
  );
};

type AnalyticsSpaceFilterBuilderProps = {
  filters: Array<AnalyticsSpaceFilter>,
  onChange: (filters: Array<AnalyticsSpaceFilter>) => void,

  spaces: Array<DensitySpace>,
  formattedHierarchy: Array<SpaceHierarchyDisplayItem>,
}

function AnalyticsSpaceFilterBuilder({
  filters,
  onChange,
  spaces,
  formattedHierarchy,
}: AnalyticsSpaceFilterBuilderProps) {
  const [ openedFilterIndex, setOpenedFilterIndex ] = useState(-1);

  const isAdding = openedFilterIndex > filters.length - 1;
  const emptyFilterVisible = filters.length === 0 || isAdding;

  const filtersIncludingEmpty = [ ...filters, ...(emptyFilterVisible ? [EMPTY_FILTER] : []) ];

  return (
    <Fragment>
      {filtersIncludingEmpty.map((filter, index) => (
        <div className={styles.listItem} aria-label="Space filter">
          <AnalyticsControlBarSpaceFilter
            filter={filter}
            deletable={filters.length > 1 || filter.field !== ''}
            onDelete={() => {
              const filtersCopy = filters.slice();
              filtersCopy.splice(index, 1);
              onChange(filtersCopy);
            }}
            open={openedFilterIndex === index}
            onOpen={() => setOpenedFilterIndex(index)}
            onClose={filter => {
              // Close the currently open filter
              setOpenedFilterIndex(-1);

              // Update the filter if its not the empty filter
              const fieldIsEmpty = filter.field === '' || filter.values.length === 0;
              if (!fieldIsEmpty && filters[index] !== filter) {
                const filtersCopy = filters.slice();
                filtersCopy[index] = filter;
                onChange(filtersCopy);
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
        let openedFilterIndex = filters.length;

        // Focus the last space filter that is visible, it is delayed so that it will happen on the
        // next render after the above onChange is processed ans so that the animation to open is
        // shown.
        setTimeout(() => {
          setOpenedFilterIndex(openedFilterIndex);
        }, 100);
      }} />
    </Fragment>
  );
}

export default AnalyticsControlBar;
