import React from 'react';
import classNames from 'classnames';

import { descending } from '../../helpers/natural-sorting';
import { AnalyticsFocusedMetric } from '../../types/analytics';
import analyticsColorScale from '../../helpers/analytics-color-scale';
import styles from './styles.module.scss';
import { findLeast } from '../../helpers/array-utilities';


type TooltipEntry = {
  title: string,
  color: string,
  value: number,
  displayValue: string,
}

/**
 * **TooltipEntries**
 * Responsible for smartly limiting the tooltip to `maxEntries` entries
 */
const TooltipEntries: React.FunctionComponent<{
  entries: TooltipEntry[],
  targetValue: number,
  maxEntries?: number,
}> = function TooltipEntries({
  entries,
  targetValue,
  maxEntries = 5,
}) {

  const distance = (entry: TooltipEntry) => Math.abs(entry.value - targetValue);
  const nearestValue = findLeast(entries, distance).value;


  // make a copy of the entries list
  let displayedEntries = entries.slice();

  // while there are more than the max allowed, the furthest from `targetValue` gets voted off the island
  while (displayedEntries.length > maxEntries) {
    displayedEntries = displayedEntries.sort((a, b) => descending(distance(a), distance(b)))
    displayedEntries.shift()
  }

  // NOTE: special case
  // if there are more highlighted items than `maxEntries`, drop an additional entry
  // and replace it with a label showing the number of highlighted entries that are hidden
  const numHighlightedEntries = entries.reduce(
    (total, entry) => entry.value === nearestValue ? total + 1 : total,
    0
  )
  let overflowCount = numHighlightedEntries - maxEntries;

  if (overflowCount > 0) {
    displayedEntries.pop()
    // then the overflowCount goes up by one more...
    overflowCount += 1
  }

  // finally, sort descending by value for display
  displayedEntries = displayedEntries.sort((a, b) => descending(a.value, b.value))

  return (
    <div className={styles.hoverOverlaySpaceList}>
      {displayedEntries.map((d, i) => (
        <div className={styles.hoverOverlaySpaceListItem} key={i}>
          <div className={styles.hoverOverlayColorIndicator} style={{ backgroundColor: d.color }}></div>
          <div className={classNames(styles.hoverOverlaySpaceName, { [styles.active]: d.value === nearestValue })}>{d.title}</div>
          <div className={classNames(styles.hoverOverlayMetric, { [styles.active]: d.value === nearestValue })}>{d.displayValue}</div>
        </div>
      ))}
      {overflowCount > 0 ? (
        <div className={styles.hoverOverlaySpaceListOverflowLabel}>
          {`+ ${overflowCount} additional spaces`}
        </div>
      ) : null}
    </div>
  )
}

type TooltipDatapoint = {
  spaceId: string,
  spaceName: string,
  value: number
}

const AnalyticsLineChartTooltip: React.FunctionComponent<{
  datetimeLabel: string,
  datapoints: TooltipDatapoint[],
  selectedMetric: AnalyticsFocusedMetric,
  targetValue: number,
}> = function AnalyticsLineChartTooltip({
  datetimeLabel,
  datapoints,
  selectedMetric,
  targetValue,
}) {

  // scoped helper functions
  const formatMetricValue = (value: number) => {
    const rounded = Math.round(value);
    if (selectedMetric === AnalyticsFocusedMetric.UTILIZATION) {
      return `${rounded}%`;
    }
    return rounded.toString(10);
  }

  const entries: TooltipEntry[] = datapoints.map(datapoint => {
    return {
      title: datapoint.spaceName,
      color: analyticsColorScale(datapoint.spaceId),
      value: datapoint.value,
      displayValue: formatMetricValue(datapoint.value),
    }
  })

  // render
  return (
    <div className={styles.hoverOverlay}>
      <div className={styles.hoverOverlayHeader}>
        <div className={styles.hoverOverlayDatetimeLabel}>{datetimeLabel}</div>
      </div>

      <TooltipEntries
        entries={entries}
        targetValue={targetValue}
      />
    </div>
  );
}

export default AnalyticsLineChartTooltip;
