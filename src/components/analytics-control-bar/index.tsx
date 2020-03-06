import React, { useState, Fragment } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { DisplaySpaceHierarchyNode } from '@density/lib-space-helpers/types';
import { DateRange } from '@density/lib-time-helpers/date-range';
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
import { QueryInterval, AnalyticsFocusedMetric, AnalyticsDataExportType } from '../../types/analytics';

// FIXME: The below should be switched to use the new rx-actinos based modal interface,
// point this out in a review!
import showModal from '../../rx-actions/modal/show';

import { Button, Icons, InputBox } from '@density/ui/src';
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

  opportunityCostPerPerson: number,
  onChangeOpportunityCostPerPerson: (cost: number) => void,

  selections: Array<AnalyticsSpaceSelection>,
  onChangeSelections: (filters: Array<AnalyticsSpaceSelection>) => void,

  interval: QueryInterval,
  onChangeInterval: (interval: QueryInterval) => void,

  dateRange: DateRange | null,
  onChangeDateRange: (dateRange: DateRange | null) => void,

  timeFilter?: TimeFilter,
  onChangeTimeFilter: (timeFilter: TimeFilter) => void,
  
  spaces: Array<CoreSpace>,
  formattedHierarchy: Array<DisplaySpaceHierarchyNode>,

  onRequestDataExport: (exportType: AnalyticsDataExportType) => void,

  saveButtonState: AnalyticsControlBarSaveButtonState,
  onSave?: () => void,

  reportName: string,
  onUpdateReportName?: (name: string) => void,

  refreshEnabled: boolean,
  moreMenuVisible: boolean,
  onRefresh: () => void,
}

const AnalyticsControlBar: React.FunctionComponent<AnalyticsControlBarProps> = function AnalyticsControlBar({
  userState,

  metric,
  onChangeMetric,

  opportunityCostPerPerson,
  onChangeOpportunityCostPerPerson,

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

  onRequestDataExport,

  saveButtonState,
  onSave,

  reportName,
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
        {metric === AnalyticsFocusedMetric.OPPORTUNITY ? (
          <OpportunityParametersMenu
            opportunityCostPerPerson={opportunityCostPerPerson}
            onChangeOpportunityCostPerPerson={onChangeOpportunityCostPerPerson}
          />
        ): null}
        <span className={styles.label}>for</span> 
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
          <Icons.Refresh color={refreshEnabled ? colorVariables.midnight : colorVariables.gray400} />
        </button>

      </div>
      <div className={styles.analyticsControlBarSection}>
        <AnalyticsControlBarButtons
          userHasWritePermissions={can(userState, PERMISSION_CODES.coreWrite)}
          onRequestDataExport={onRequestDataExport}
          saveButtonState={saveButtonState}
          onSave={onSave}
          reportName={reportName}
          onUpdateReportName={onUpdateReportName}
          moreMenuVisible={moreMenuVisible}
        />
      </div>
    </div>
  );
}

export const OpportunityParametersMenu: React.FC<{
  opportunityCostPerPerson: number,
  onChangeOpportunityCostPerPerson: (cost: number) => void,
}> = function OpportunityParametersMenu({
  opportunityCostPerPerson,
  onChangeOpportunityCostPerPerson,
}) {

  const [selectedCostPerPerson, setSelectedCostPerPerson] = useState<number>(opportunityCostPerPerson)
  const [isOpen, setIsOpen] = useState<boolean>(false);


  return (
    <div className={styles.opportunityParameters}>
      <AnalyticsPopup
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        target={(
          <button className={classnames(styles.iconButton, styles.opportunityParametersButton, {[styles.active]: isOpen})}>
            <Icons.Money />
          </button>
        )}
      >
        <div className={styles.opportunityPopupInner}>

          <label className={styles.opportunityUnitInputLabel}>
            <Icons.Money height={20} width={20}/> Person/Desk (Monthly)
          </label>
          <InputBox
            type="number"
            value={selectedCostPerPerson}
            label="Foo"
            onChange={evt => {
              setSelectedCostPerPerson(evt.currentTarget.value)
            }}
          />
          <p className={styles.opportunityUnitInputDescription}>
            Edit the dollar amount you spend (per person, per month) to estimate potential savings.
          </p>
          <div
            className={styles.opportunityUnitApplyButton}
            onClick={() => {
              onChangeOpportunityCostPerPerson(selectedCostPerPerson);
              setIsOpen(false);
            }}
          >Apply</div>
        </div>
      </AnalyticsPopup>
    </div>
  )
}


export enum AnalyticsControlBarSaveButtonState {
  NORMAL = 'NORMAL',
  DISABLED = 'DISABLED',
  LOADING = 'LOADING',
}
type AnalyticsControlBarButtonsProps = {
  userHasWritePermissions: boolean,
  onRequestDataExport: (exportType: AnalyticsDataExportType) => void,
  saveButtonState: AnalyticsControlBarSaveButtonState,
  onSave?: () => void,
  moreMenuVisible: boolean,
  reportName: string,
  onUpdateReportName?: (name: string) => void,
}
export const AnalyticsControlBarButtons: React.FunctionComponent<AnalyticsControlBarButtonsProps> = ({
  userHasWritePermissions,
  onRequestDataExport,
  saveButtonState,
  onSave,
  moreMenuVisible,
  reportName,
  onUpdateReportName,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const rxDispatch = useRxDispatch();
  return (
    <Fragment>
      {userHasWritePermissions ? (
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
        <AnalyticsPopup
          target={<button className={classnames(styles.iconButton, styles.exportButton, {[styles.active]: exportOpen})}><Icons.Download /></button>}
          open={exportOpen}
          onOpen={() => setExportOpen(true)}
          onClose={() => setExportOpen(false)}
          pinCorner={AnalyticsPopupPinCorner.RIGHT}
        >
          <div className={styles.exportPopoverInner}>
            <div className={styles.popoverHeader}>Export CSV</div>
            <ItemList
              choices={[
                { id: AnalyticsDataExportType.TIME_SERIES, label: 'Time-series' },
                { id: AnalyticsDataExportType.SUMMARY, label: 'Summary' },
                { id: AnalyticsDataExportType.BOTH, label: 'Both' },
              ]}
              onClick={(choice) => {
                // FIXME: typing of ItemList choices is broken
                onRequestDataExport(choice.id as AnalyticsDataExportType);
                setExportOpen(false);
              }}
            />
          </div>
        </AnalyticsPopup>
        {moreMenuVisible ? (
          <AnalyticsPopup
            target={<button className={classnames(styles.iconButton, {[styles.active]: moreOpen})}><Icons.More /></button>}
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
                    text: reportName,
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
    ) : null}
    </Fragment>
  );
};

type AnalyticsSpaceSelectionBuilderProps = {
  selections: Array<AnalyticsSpaceSelection>,
  onChange: (filters: Array<AnalyticsSpaceSelection>) => void,

  spaces: Array<CoreSpace>,
  formattedHierarchy: Array<DisplaySpaceHierarchyNode>,
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
        <div aria-label="Space selection">
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
