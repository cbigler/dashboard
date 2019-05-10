import React from 'react';
import styles from './styles.module.scss';

import { Button } from '@density/ui';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function DayOfWeekSelector({ daysOfWeek, disabled=false, onChange }) {
  return (
    <div className={styles.wrapper}>
      {DAYS_OF_WEEK.map(dayName => (
        <div key={dayName} className={styles.item}>
          <Button
            type={daysOfWeek.includes(dayName) ? 'primary' : 'default'}
            size="small"
            disabled={disabled}
            width={24}
            height={24}
            onClick={() => {
              if (!daysOfWeek.includes(dayName)) {
                // Add day
                onChange([...daysOfWeek, dayName]);
              } else {
                // Ensure the user doesn't deselect the last day
                if (daysOfWeek.length <= 1) { return; }

                // Remove day
                onChange(daysOfWeek.filter(day => day !== dayName));
              }
            }}
          >
            {dayName[0].toUpperCase()}
          </Button>
        </div>
      ))}
    </div>
  );
}
