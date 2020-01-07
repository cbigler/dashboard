import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import moment from 'moment';
import Selector, { QueryTextBold } from '../analytics-control-bar-selector';
import { DATE_RANGES, DateRange, RangeType } from '../../helpers/space-time-utilities';

import {
  AppBar,
  AppBarTitle,
  AppBarContext,
  InputBox,
  DateRangePicker,
  DatePicker,
} from '@density/ui/src';
import {
  ItemList,
  ARROW_TEMPLATE,
  BackButton,
  SubmitButton,
} from '../analytics-control-bar-utilities';


enum AnalyticsDateSelectorPages {
  LIST = 'LIST',
  CUSTOM = 'CUSTOM',
}

enum AnalyticsCustomDateRangeChoices {
  BETWEEN = 'between',
  ON = 'on',
}

const BETWEEN_DEFAULT_RANGE: DateRange = {
  type: RangeType.ABSOLUTE,
  startDate: moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD'),
  endDate: moment().subtract(1, 'week').endOf('week').format('YYYY-MM-DD'),
};

const ON_DEFAULT_RANGE: DateRange = {
  type: RangeType.ABSOLUTE,
  startDate: moment().format('YYYY-MM-DD'),
  endDate: moment().format('YYYY-MM-DD'),
};

function DateSelectorCustom({ workingDateRange, setWorkingDateRange, onSubmit }) {
  const [ dateRangeFocused, setDateRangeFocused ] = useState('startDate');
  const [ customDateRangeType, setCustomDateRangeType ] = useState(AnalyticsCustomDateRangeChoices.BETWEEN);

  useEffect(() => {
    // Figure out the custom date range type if the custom page is visible
    if (workingDateRange && workingDateRange.type === RangeType.ABSOLUTE) {
      if (workingDateRange.startDate === workingDateRange.endDate) {
        setCustomDateRangeType(AnalyticsCustomDateRangeChoices.ON);
      } else {
        setCustomDateRangeType(AnalyticsCustomDateRangeChoices.BETWEEN);
      }
    }
  }, [ workingDateRange ]);

  return (
    <div className={styles.dateSelectorCustomWrapper}>
      <div className={styles.header}>
        <AppBarContext.Provider value="CARD_HEADER">
          <AppBar>
            <AppBarTitle>
              <div className={styles.back}>
                <BackButton onClick={() => setWorkingDateRange(null)} />
              </div>
              Select a Custom Date Range
            </AppBarTitle>
          </AppBar>
        </AppBarContext.Provider>
      </div>
      <div className={styles.dateSelectorCustomBody}>
        <div className={styles.dateSelectorCustomBodyItem}>
          <InputBox
            type="select"
            value={customDateRangeType}
            choices={[
              { id: AnalyticsCustomDateRangeChoices.BETWEEN, label: 'Between' },
              { id: AnalyticsCustomDateRangeChoices.ON, label: 'On' },
            ]}
            onChange={choice => {
              setCustomDateRangeType(choice.id);

              switch (choice.id) {
              case AnalyticsCustomDateRangeChoices.BETWEEN:
                setWorkingDateRange(BETWEEN_DEFAULT_RANGE);
                break;
              case AnalyticsCustomDateRangeChoices.ON:
                setWorkingDateRange(ON_DEFAULT_RANGE);
                break;
              }
            }}
            width="100%"
          />
        </div>
        <div
          className={styles.dateSelectorCustomBodyItem}
          style={{flexGrow: 1, flexShrink: 1}}

          // Block focus / blur events from effecting the filter popup logic
          onFocus={e => e.stopPropagation()}
          onBlur={e => e.stopPropagation()}
        >
          {customDateRangeType === AnalyticsCustomDateRangeChoices.BETWEEN ? (
            <DateRangePicker
              focusedInput={dateRangeFocused}
              onFocusChange={focus => {
                if (focus !== null) {
                  setDateRangeFocused(focus);
                }
              }}
              startDate={workingDateRange.startDate ? moment(workingDateRange.startDate, 'YYYY-MM-DD') : null}
              endDate={workingDateRange.endDate ? moment(workingDateRange.endDate, 'YYYY-MM-DD') : null}
              onChange={range => {
                if (!range.endDate) {
                  // A date before the start of the selected range was clicked, so use the date
                  // that was selected 
                  setWorkingDateRange({
                    ...workingDateRange,
                    startDate: range.startDate.format('YYYY-MM-DD'),
                    endDate: '',
                  });
                } else {
                  setWorkingDateRange({
                    ...workingDateRange,
                    startDate: range.startDate.format('YYYY-MM-DD'),
                    endDate: range.endDate.format('YYYY-MM-DD'),
                  });
                }
              }}
              numberOfMonths={1}
              isOutsideRange={day => day.clone().startOf('day').isAfter(moment().startOf('day'))}
            />
          ) : null}
          {customDateRangeType === AnalyticsCustomDateRangeChoices.ON ? (
            <DatePicker
              focused
              onFocusChange={() => {}}
              date={workingDateRange.startDate ? moment(workingDateRange.startDate, 'YYYY-MM-DD') : null}
              onChange={date => {
                setWorkingDateRange({
                  ...workingDateRange,
                  startDate: date.format('YYYY-MM-DD'),
                  endDate: date.format('YYYY-MM-DD'),
                });
              }}
              numberOfMonths={1}
              isOutsideRange={day => day.clone().startOf('day').isAfter(moment().startOf('day'))}
            />
          ) : null}
        </div>
      </div>
      <SubmitButton
        onClick={() => onSubmit(workingDateRange)}
        disabled={!workingDateRange.startDate || !workingDateRange.endDate}
      >
        Select date range
      </SubmitButton>
    </div>
  );
}

const TIMEFRAME_CHOICES = [
  DATE_RANGES.TODAY,
  DATE_RANGES.WEEK_TO_DATE,
  DATE_RANGES.MONTH_TO_DATE,
  DATE_RANGES.LAST_WEEK,
  DATE_RANGES.LAST_MONTH,
  DATE_RANGES.LAST_7_DAYS,
  DATE_RANGES.LAST_30_DAYS,
  DATE_RANGES.LAST_90_DAYS,
];

type DateRangeFilterProps = {
  value: DateRange | null,
  onChange: (DateRange) => void,
};

const AnalyticsControlBarDateRangeFilter: React.FunctionComponent<DateRangeFilterProps> = function AnalyticsControlBarDateRangeFilter({ value, onChange }) {
  const [ open, setOpen ] = useState(false);

  let text = 'No date range selected';
  if (value) {
    switch (value.type) {
    case RangeType.RELATIVE:
      text = value.label || '(unlabeled relative date range)';
      break;
    case RangeType.ABSOLUTE:
      const start = moment.utc(value.startDate).format('MM/DD/YYYY');
      const end = moment.utc(value.endDate).format('MM/DD/YYYY');
      if (start === end) {
        text = start;
      } else {
        text = `${start} - ${end}`;
      }
      break;
    }
  }

  const [ workingDateRange, setWorkingDateRange ] = useState<DateRange>(TIMEFRAME_CHOICES[0]);

  let activePage;
  if (workingDateRange && workingDateRange.type === RangeType.ABSOLUTE) {
    activePage = AnalyticsDateSelectorPages.CUSTOM;
  } else {
    activePage = AnalyticsDateSelectorPages.LIST;
  }

  return (
    <div className={styles.dateSelector}>
      <span className={styles.dateSelectorLabel}>
        {value && value.type === RangeType.ABSOLUTE ? (
          value.startDate === value.endDate ? 'on' : 'from'
        ) : (
          value && value.label && value.label.startsWith('Last') ? 'in the' : 'from'
        )}
      </span>
      <Selector
        open={open}
        onOpen={() => {
          if (open) { return; }
          if (value) {
            setWorkingDateRange(value);
          }
          setOpen(true);
        }}
        onClose={() => setOpen(false)}
        text={<QueryTextBold>{text}</QueryTextBold>}
      >
        {activePage === AnalyticsDateSelectorPages.LIST ? (
          <ItemList
            template={choice => choice.id === 'ABSOLUTE' ? ARROW_TEMPLATE(choice) : choice.label}
            choices={[
              ...(
                TIMEFRAME_CHOICES
                  .filter(i => typeof i.label !== 'undefined')
                  .map(choice => ({
                    id: choice.label || '(no id)',
                    label: choice.label || '(no label)',
                  }))
              ),
              {id: 'ABSOLUTE', label: 'Custom Date Range'},
            ]}
            onClick={choice => {
              const timeRange = TIMEFRAME_CHOICES.find(c => c.label === choice.id);
              if (timeRange) {
                // An item in the regular list was picked
                onChange(timeRange);
                setOpen(false);
              } else if (choice.id === 'ABSOLUTE') {
                // The "custom date range" choice was picked
                setWorkingDateRange({
                  type: RangeType.ABSOLUTE,
                  startDate: moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD'),
                  endDate: moment().subtract(1, 'week').endOf('week').format('YYYY-MM-DD'),
                });
              }
            }}
          />
        ) : null}
        {activePage === AnalyticsDateSelectorPages.CUSTOM ? (
          <DateSelectorCustom
            workingDateRange={workingDateRange}
            setWorkingDateRange={setWorkingDateRange}
            onSubmit={dateRange => {
              onChange(dateRange);
              setOpen(false);
            }}
          />
        ) : null}
      </Selector>
    </div>
  );
}

export default AnalyticsControlBarDateRangeFilter;
