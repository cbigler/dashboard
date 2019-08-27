import React, { useState, Fragment } from 'react';
import styles from './styles.module.scss';

import { SpaceHierarchyDisplayItem } from '../../helpers/space-hierarchy-formatter';
import { DensitySpace } from '../../types';
import { DateRange } from '../../helpers/space-time-utilities';

import AnalyticsControlBarSpaceFilter, {
  AnalyticsSpaceFilter,
  EMPTY_FILTER,
} from '../analytics-control-bar-space-filter';
import AnalyticsControlBarDateRangeFilter from '../analytics-control-bar-date-range-filter';
import AnalyticsIntervalSelector, { AnalyticsInterval } from '../analytics-control-bar-interval-filter';
import { AddButton } from './utilities';

import { Icons } from '@density/ui';

export {
  ARROW_TEMPLATE,
  ItemList,
  MultipleSelectItemList,
  BackButton,
  AddButton,
  FilterDeleteButton,
  SubmitButton,
} from './utilities';

type AnalyticsControlBarProps = {
  filters: Array<AnalyticsSpaceFilter>,
  onChangeFilters: (filters: Array<AnalyticsSpaceFilter>) => void,

  interval: AnalyticsInterval,
  onChangeInterval: (AnalyticsInterval) => void,

  dateRange: DateRange | null,
  onChangeDateRange: (dateRange: DateRange | null) => void,

  spaces: Array<DensitySpace>,
  formattedHierarchy: Array<SpaceHierarchyDisplayItem>,
}

export default function AnalyticsControlBar({
  filters,
  onChangeFilters,

  interval,
  onChangeInterval,

  dateRange,
  onChangeDateRange,

  spaces,
  formattedHierarchy,
}: AnalyticsControlBarProps) {
  return (
    <div className={styles.analyticsControlBar}>
      <div className={styles.analyticsControlBarSectionWrap}>
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
      </div>
      <div className={styles.analyticsControlBarSection}>
        {/* FIXME: put actual icons and  buttons here, point this out in a review! */}
        <span style={{marginRight: 8}}><Icons.Star /></span>
        <span style={{marginLeft: 8, marginRight: 8}}><Icons.AddReport /></span>
        <span style={{marginLeft: 8, marginRight: 8}}><Icons.Download /></span>
        <span style={{marginLeft: 8, marginRight: 8}}><Icons.Share /></span>
        <span style={{marginLeft: 8}}><Icons.Code /></span>
      </div>
    </div>
  );
}

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
  const [ emptyFilterVisible, setEmptyFilterVisible ] = useState(filters.length === 0);

  const filtersIncludingEmpty = [ ...filters, ...(emptyFilterVisible ? [EMPTY_FILTER] : []) ];

  return (
    <Fragment>
      {filtersIncludingEmpty.map((filter, index) => (
        <div className={styles.listItem} aria-label="Space filter">
          <AnalyticsControlBarSpaceFilter
            filter={filter}
            deletable={filters.length > 1 || filter.field !== ''}
            onDelete={() => {
              if (filters.length === 1) {
                // If the last filter is being deleted, then replace it with an empty filter.
                setEmptyFilterVisible(true);
              }

              const filtersCopy = filters.slice();
              filtersCopy.splice(index, 1);
              onChange(filtersCopy);
            }}
            open={openedFilterIndex === index}
            onOpen={() => setOpenedFilterIndex(index)}
            onClose={filter => {
              // Close the currently open filter
              setOpenedFilterIndex(-1);

              const fieldIsEmpty = filter.field === '' || filter.values.length === 0;
              if (!fieldIsEmpty) {
                const filtersCopy = filters.slice();
                filtersCopy[index] = filter;
                onChange(filtersCopy);
                setEmptyFilterVisible(false);
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
                <div>and</div> {i}
              </div>
            </Fragment>
          );
        } else {
          return i;
        }
      }, null)}
      <AddButton onClick={() => {
        let openedFilterIndex = filters.length;
        setEmptyFilterVisible(true);

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
