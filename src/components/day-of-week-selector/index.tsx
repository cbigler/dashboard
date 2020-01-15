import React from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function DayOfWeekSelector({ days_of_week, disabled=false, onChange }) {
  return (
    <div className={styles.wrapper}>
      {DAYS_OF_WEEK.map(dayName => (
        <div key={dayName} className={styles.item}>
         <div
            className={classnames(styles.button, {
              [styles.active]: days_of_week.includes(dayName),
              [styles.disabled]: disabled,
            })}
            onClick={() => {
              if (!days_of_week.includes(dayName)) {
                // Add day
                onChange([...days_of_week, dayName]);
              } else {
                // Ensure the user doesn't deselect the last day
                if (days_of_week.length <= 1) { return; }

                // Remove day
                onChange(days_of_week.filter(day => day !== dayName));
              }
            }}
            tabIndex={0}
          >
            {dayName[0].toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  );
}
