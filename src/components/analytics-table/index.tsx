import React, { useEffect } from 'react';
import classNames from 'classnames';
import styles from './styles.module.scss';
import { DensitySpaceTypes, DensitySpace, DensitySpaceFunction } from '../../types';

import {
  ResourceStatus,
  QueryInterval,
  AnalyticsReport,
  TableColumn,
  TableColumnSort,
  SortDirection,
} from '../../types/analytics';

import {
  Icons,
} from '@density/ui/src';
import colorVariables from '@density/ui/variables/colors.json';
import Checkbox from '../checkbox';
import { commaFormat } from '../../helpers/format-number';
import startCase from 'lodash/startCase';
import { useRxObservable } from '../../helpers/use-rx-store';
import { activeReportDataStream } from '../../rx-stores/analytics';


function formatIntervalForTableDisplay(interval: QueryInterval): string {
  switch (interval) {
    case QueryInterval.FIVE_MINUTES:
      return '5 min';
    case QueryInterval.FIFTEEN_MINUTES:
      return '15 min';
    case QueryInterval.ONE_HOUR:
      return 'hour';
    case QueryInterval.ONE_DAY:
      return 'day';
    case QueryInterval.ONE_WEEK:
      return 'week';
  }
}

const TableCell: React.FC<{
  text: string,
  column: TableColumn,
  interval: QueryInterval,
}> = function TableCell({
  text,
  column,
  interval,
}) {
  switch (column) {
    case TableColumn.METRIC_AVERAGE_ENTRANCES:
    case TableColumn.METRIC_AVERAGE_EXITS:
    case TableColumn.METRIC_AVERAGE_EVENTS:
    case TableColumn.METRIC_MAXIMUM_ENTRANCES:
    case TableColumn.METRIC_MAXIMUM_EXITS:
    case TableColumn.METRIC_MAXIMUM_EVENTS:
      return (
        <span>{text} <span className={styles.metricInterval}>{`/ ${formatIntervalForTableDisplay(interval)}`}</span></span>
      )
    default:
      return (
        <span>{text}</span>
      )
  }
}

function formatTableValue(value: number | string | null | undefined, column: TableColumn) {
  if (value == null) return '--';
  if (typeof value === 'string') {
    return value;
  }
  // at this point, typeof value === 'number', but it could still be NaN
  if (isNaN(value)) return '--';

  const roundedNumericValue = Math.ceil(value);
  const formattedValue = commaFormat(roundedNumericValue);

  switch (column) {
    case TableColumn.METRIC_PEAK_UTILIZATION:
    case TableColumn.METRIC_AVERAGE_UTILIZATION:
      return `${formattedValue}%`;
    case TableColumn.METRIC_OPPORTUNITY_COST:
    case TableColumn.METRIC_AVERAGE_OPPORTUNITY_COST:
      return `$${formattedValue}`;
    default:
      return formattedValue;
  }
}

function getTableColumnHeaderText(tableColumn: TableColumn): string {
  switch (tableColumn) {
    case TableColumn.METRIC_OPPORTUNITY:
      return 'Min. Avail. Capacity';
    case TableColumn.METRIC_AVERAGE_OPPORTUNITY:
      return 'Avg. Avail. Capacity';
    case TableColumn.METRIC_OPPORTUNITY_COST:
      return 'Min. Monthly Pot. Savings';
    case TableColumn.METRIC_AVERAGE_OPPORTUNITY_COST:
      return 'Avg. Monthly Pot. Savings';
    default:
      // for now, the enum value will be used as the header text in most cases
      return String(tableColumn);
  }
}

// must be some kind of react node (text or element), but not null or undefined
type ColumnInfoText = Exclude<React.ReactNode, null | undefined>

function formatIntervalForInfoPopup(interval: QueryInterval): string {
  switch (interval) {
    case QueryInterval.FIVE_MINUTES:
      return '5-minute';
    case QueryInterval.FIFTEEN_MINUTES:
      return '15-minute';
    case QueryInterval.ONE_HOUR:
      return '1-hour';
    case QueryInterval.ONE_DAY:
      return '1-day';
    case QueryInterval.ONE_WEEK:
      return '1-week';
  }
}

function getTableColumnInfoText(tableColumn: TableColumn, interval: QueryInterval): ColumnInfoText {

  const intervalText = formatIntervalForInfoPopup(interval);

  switch (tableColumn) {
    case TableColumn.SPACE_NAME:
      return 'The name of the space';
    case TableColumn.SPACE_LOCATION:
      return 'Where the space is located';
    case TableColumn.SPACE_TYPE:
      return 'What type of space is this';
    case TableColumn.SPACE_FUNCTION:
      return 'What is the function of this space';
    case TableColumn.SPACE_CAPACITY:
      return 'How many people is this space designed for';
    // OCCUPANCY
    case TableColumn.METRIC_PEAK_OCCUPANCY:
      return 'The maximum number of people ever occupying the space during the selected time period';
    case TableColumn.METRIC_AVERAGE_OCCUPANCY:
      return 'The average number of people occupying the space during the selected time period';
    // UTILIZATION
    case TableColumn.METRIC_PEAK_UTILIZATION:
      return 'The maximum percentage of space capacity used during the selected time period';
    case TableColumn.METRIC_AVERAGE_UTILIZATION:
      return 'The average percentage of space capacity used during the selected time period';
    // ENTRANCES
    case TableColumn.METRIC_MAXIMUM_ENTRANCES:
      return `The maximum number of entrances during any ${intervalText} interval during the selected time period`;
    case TableColumn.METRIC_AVERAGE_ENTRANCES:
      return `The average number of entrances during each ${intervalText} interval of the selected time period`;
    case TableColumn.METRIC_TOTAL_ENTRANCES:
      return 'The total number of entrances that occurred during the selected time period';
    // EXITS  
    case TableColumn.METRIC_MAXIMUM_EXITS:
      return `The maximum number of exits during any ${intervalText} interval during the selected time period`;
    case TableColumn.METRIC_AVERAGE_EXITS:
      return `The average number of exits during each ${intervalText} interval of the selected time period`;
    case TableColumn.METRIC_TOTAL_EXITS:
      return 'The total number of exits that occurred during the selected time period';
    // EVENTS  
    case TableColumn.METRIC_MAXIMUM_EVENTS:
      return `The maximum number of events during any ${intervalText} interval during the selected time period`;
    case TableColumn.METRIC_AVERAGE_EVENTS:
      return `The average number of events during each ${intervalText} interval of the selected time period`;
    case TableColumn.METRIC_TOTAL_EVENTS:
      return 'The total number of events that occurred during the selected time period';
    // AVAILABLE CAPACITY  
    case TableColumn.METRIC_OPPORTUNITY:
      return `The minimum number of available seats during any ${intervalText} interval during the selected time period`;
    case TableColumn.METRIC_AVERAGE_OPPORTUNITY:
      return `The average number of available seats during each ${intervalText} interval of the selected time period`;
    case TableColumn.METRIC_OPPORTUNITY_COST:
      return `The minimum potential monthly savings during any ${intervalText} interval during the selected time period`;
    case TableColumn.METRIC_AVERAGE_OPPORTUNITY_COST:
      return `The average potential monthly savings during each ${intervalText} interval of the selected time period`;
  }
}


const SortIcon: React.FC<{
  column: TableColumn,
  columnSort: TableColumnSort,
}> = function SortIcon({
  column,
  columnSort,
}) {
  const isSortEnabled = columnSort.column === column && columnSort.direction !== SortDirection.NONE;
  const sortIconColor = isSortEnabled ? ACTIVE_CHEVRON_COLOR : INACTIVE_CHEVRON_COLOR;
  return columnSort.direction === SortDirection.DESCENDING || !isSortEnabled ? (
    <Icons.ChevronDown color={sortIconColor} />
  ) : (
    <Icons.ChevronUp color={sortIconColor} />
  )
}

const ACTIVE_CHEVRON_COLOR = colorVariables.grayCinder;
const INACTIVE_CHEVRON_COLOR = colorVariables.gray;

export function formatSpaceType(spaceType: DensitySpaceTypes) {
  switch (spaceType) {
  case DensitySpaceTypes.BUILDING:
    return 'Building';
  case DensitySpaceTypes.CAMPUS:
    return 'Campus';
  case DensitySpaceTypes.FLOOR:
    return 'Floor';
  case DensitySpaceTypes.SPACE:
    return 'Space';
  default:
    return spaceType;
  }
}

export function formatSpaceFunction(spaceFunction: DensitySpaceFunction | null) {
  if (spaceFunction == null) return '--';
  return startCase(spaceFunction);
}


export function getHighestAncestorName(space: DensitySpace): string {
  if (space.ancestry.length > 0) {
    return space.ancestry[space.ancestry.length-1].name;
  } else {
    // Highest ancestor is the space itself
    return space.name;
  }
}

const ColumnInfo: React.FC<{
  column: TableColumn,
  interval: QueryInterval,
}> = function ColumnInfo({
  column,
  interval
}) {
  switch (column) {
    default:
      return (
        <div className={styles.columnInfoPopup}>
          <div className={styles.columnInfoPopupHeader}>{getTableColumnHeaderText(column)}</div>
          <div className={styles.columnInfoPopupBody}>{getTableColumnInfoText(column, interval)}</div>
        </div>
      )
  }
}

function useWindowWidth() {
  const [width, setWidth] = React.useState<number>(window.innerWidth);
  useEffect(() => {
    const onResize = () => {
      setWidth(window.innerWidth);
    }
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, [])
  return width;
}


type ColumnHeaderHoverState = {
  active: false,
} | {
  active: true,
  column: TableColumn,
  elemBoundingBox: DOMRect,
  pageX: number,
  pageY: number,
}

const InfoPop: React.FC<{
  hoverState: ColumnHeaderHoverState,
  windowWidth: number,
}> = function InfoPop({
  hoverState,
  windowWidth,
  children,
}) {
  const OPEN_DELAY = 350; // ms
  const [visible, setVisible] = React.useState<boolean>(false);
  React.useEffect(() => {
    setTimeout(() => {
      setVisible(true);
    }, OPEN_DELAY);
  }, [])
  if (!hoverState.active || !visible) return null;
  const horizontalAnchor = hoverState.elemBoundingBox.left + COLUMN_HEADER_POPUP_WIDTH > windowWidth ? 'RIGHT' : 'LEFT';
  return (
    <div style={{
      position: 'fixed',
      top: hoverState.elemBoundingBox.top,
      height: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: horizontalAnchor === 'LEFT' ? hoverState.elemBoundingBox.left : undefined,
        right: horizontalAnchor === 'RIGHT' ? windowWidth - hoverState.elemBoundingBox.right : undefined,
        width: COLUMN_HEADER_POPUP_WIDTH,
      }}>
        {children}
      </div>
    </div>
  )
}

const TOGGLE_COLUMN_WIDTH = 18 + 24 //width of checkbox + padding;
const COLUMN_HEADER_POPUP_WIDTH = 240;

const AnalyticsTable: React.FC<{
  spaces: DensitySpace[],
  analyticsReport: AnalyticsReport,
  onClickColumnHeader: (column: TableColumn) => void,
  onChangeHiddenSpaceIds: (spaceIds: string[]) => void,
  onChangeHighlightedSpaceId: (spaceId: string | null) => void,
}> = function AnalyticsTable({
  spaces,
  analyticsReport,
  onClickColumnHeader,
  onChangeHiddenSpaceIds,
  onChangeHighlightedSpaceId,
}) {

  const [columnHeaderHoverState, setColumnHeaderHoverState] = React.useState<ColumnHeaderHoverState>({ active: false });
  const container = React.useRef<HTMLDivElement>(null);
  const windowWidth = useWindowWidth();

  const reportData = useRxObservable(activeReportDataStream);

  if (!reportData) return null;

  if (analyticsReport.queryResult.status !== ResourceStatus.COMPLETE) return null;

  const padding = {
    left: 0,
    right: 0,
  }

  const { columnSort } = analyticsReport;

  const isColumnSorted = (column: TableColumn) => {
    return columnSort.column === column && columnSort.direction !== SortDirection.NONE;
  }

  const selectedSpaces = analyticsReport.queryResult.data.selectedSpaceIds
    .map(id => spaces.find(space => space.id === id))
    .filter(space => Boolean(space)) as Array<DensitySpace>

  // Compute the table from the report
  // const tableData = computeTableData(analyticsReport, selectedSpaces, columnSort);
  const { tableData, colorMap } = reportData;
  
  // Render nothing if the data is not ready or invalid
  if (tableData === null) return null;

  const allSpacesEnabled = tableData.rows.every(i => i.isChecked);

  const tableWidth = windowWidth - padding.left - padding.right;

  function getColumnWidth(column: TableColumn) {
    if (!tableData) return 0;

    // TODO: This could be better
    // For now, we set minimum widths and divvy up the remaining space equally

    const numDataColumns = tableData.columnHeaders.filter(c => c !== TableColumn.SPACE_NAME).length;
    const minNameColumnWidth = 260;
    const minDataColumnWidth = 120;
    let nameColumnWidth = minNameColumnWidth;
    let dataColumnWidth = minDataColumnWidth;
    let remainingSpace = tableWidth - ((numDataColumns * dataColumnWidth) + nameColumnWidth) - TOGGLE_COLUMN_WIDTH;
    if (remainingSpace <= 0) {
      return column === TableColumn.SPACE_NAME ? nameColumnWidth : dataColumnWidth;
    }

    // divvy up remaining space
    const additionalSpace = remainingSpace / tableData.columnHeaders.length;
    nameColumnWidth += additionalSpace;
    dataColumnWidth += additionalSpace;

    return column === TableColumn.SPACE_NAME ? nameColumnWidth : dataColumnWidth;

  }

  return (
    <React.Fragment>
      <div 
        ref={container}
        className={styles.analyticsTableContainer}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          paddingLeft: padding.left,
          paddingRight: padding.right,
        }}
      >
        <table
          className={styles.analyticsTable}
          style={{
            width: tableWidth,
            tableLayout: 'fixed',
          }}
        >
          <colgroup>
            <col key={'toggle'} width={TOGGLE_COLUMN_WIDTH} />
            {tableData.columnHeaders.map(column => {
              return (
                <col key={column} width={getColumnWidth(column)} />
              )
            })}
          </colgroup>
          <thead>
            {/* Header Row */}
            <tr>
              <th
                key={'toggle'}
                className={classNames(styles.cellWithCheckbox, {[styles.columnSortActive]: isColumnSorted(TableColumn.SPACE_NAME)})}
              >
                <Checkbox
                  checked={allSpacesEnabled}
                  color={'#333'}
                  onChange={evt => {
                    if (evt.currentTarget.checked) {
                      onChangeHiddenSpaceIds([])
                    } else {
                      onChangeHiddenSpaceIds(selectedSpaces.map(s => s.id))
                    }
                  }}
                />
              </th>
            {tableData.columnHeaders.map(column => {
              return (
                <th
                  key={column}
                  className={classNames({[styles.columnSortActive]: isColumnSorted(column)})}
                  onClick={() => onClickColumnHeader(column)}
                >
                  <div className={styles.columnSortHeaderInner}>
                    <div className={styles.columnSortHeaderText}
                      onMouseEnter={(evt) => {
                        const { pageX, pageY } = evt;
                        const bbox = evt.currentTarget.getBoundingClientRect();
                        setColumnHeaderHoverState({
                          active: true,
                          column: column,
                          elemBoundingBox: bbox,
                          pageX,
                          pageY,
                        });
                      }}
                      onMouseLeave={() => {
                        setColumnHeaderHoverState({
                          active: false
                        });
                      }}
                    >{getTableColumnHeaderText(column)}</div>
                    <div className={styles.columnSortHeaderIcon}>
                      <SortIcon column={column} columnSort={columnSort} />
                    </div>
                  </div>      
                </th>
              )
            })}
            </tr>
          </thead>
          <tbody>
            {/* Summary Row */}
            <tr key={'summary'} className={styles.summaryRow}>
              <td
                key={'toggle'}
                className={classNames(styles.cellWithCheckbox, {[styles.columnSortActive]: isColumnSorted(TableColumn.SPACE_NAME)})}
              ></td>
              {tableData.columnHeaders.map(column => {
                return column === TableColumn.SPACE_NAME ? (
                  <td
                    key={column}
                    className={classNames(styles.summaryRowSpaceName, {[styles.columnSortActive]: isColumnSorted(column)})}
                  >
                    <TableCell
                      text={formatTableValue(tableData.headerRow[column], column)}
                      column={column}
                      interval={analyticsReport.query.interval}
                    />
                  </td>
                ) : (
                  <td
                    key={column}
                    className={classNames({[styles.columnSortActive]: isColumnSorted(column)})}
                  >
                    <TableCell
                      text={formatTableValue(tableData.headerRow[column], column)}
                      column={column}
                      interval={analyticsReport.query.interval}
                    />
                  </td>
                )
              })}
            </tr>
            {/* Space Rows */}
            {tableData.rows.map((row, index) => {
              return (
                <tr
                  key={index}
                  onMouseEnter={() => {
                    onChangeHighlightedSpaceId(row.spaceId);
                  }}
                  onMouseLeave={() => {
                    onChangeHighlightedSpaceId(null);
                  }}
                  className={classNames({[styles.highlightedSpaceRow]: analyticsReport.highlightedSpaceId === row.spaceId})}
                >
                  <td
                    key={'toggle'}
                    className={classNames(styles.cellWithCheckbox, {[styles.columnSortActive]: isColumnSorted(TableColumn.SPACE_NAME)})}
                  >
                    <Checkbox
                      color={colorMap.get(row.spaceId)}
                      checked={!analyticsReport.hiddenSpaceIds.includes(row.spaceId)}
                      onChange={evt => {
                        if (evt.currentTarget.checked) {
                          onChangeHiddenSpaceIds(analyticsReport.hiddenSpaceIds.filter(i => i !== row.spaceId))
                        } else {
                          onChangeHiddenSpaceIds(analyticsReport.hiddenSpaceIds.concat([row.spaceId]))
                        }
                      }}
                    />
                  </td>
                  {tableData.columnHeaders.map(column => {
                    return column === TableColumn.SPACE_NAME ? (
                      <td
                        key={column}
                        style={{
                          color: colorMap.get(row.spaceId),
                          fontWeight: 500
                        }}
                        className={classNames(styles.spaceName, {[styles.columnSortActive]: isColumnSorted(column)})}
                        onClick={() => {
                          if (row.isChecked) {
                            onChangeHiddenSpaceIds(analyticsReport.hiddenSpaceIds.concat([row.spaceId]))
                          } else {
                            onChangeHiddenSpaceIds(analyticsReport.hiddenSpaceIds.filter(i => i !== row.spaceId))
                          }
                        }}
                      >
                        <TableCell
                          text={formatTableValue(row[column], column)}
                          column={column}
                          interval={analyticsReport.query.interval}
                        />
                      </td>
                    ) : (
                      <td
                        key={column}
                        className={classNames({[styles.columnSortActive]: isColumnSorted(column)})}
                      >
                        <TableCell
                          text={formatTableValue(row[column], column)}
                          column={column}
                          interval={analyticsReport.query.interval}
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
        {columnHeaderHoverState.active ? (
          <InfoPop
            hoverState={columnHeaderHoverState}
            windowWidth={windowWidth}
          >
            <ColumnInfo
              column={columnHeaderHoverState.column}
              interval={analyticsReport.query.interval}
            />
          </InfoPop>
        ) : null}
      </div>
    </React.Fragment>
  )
}

export default AnalyticsTable;