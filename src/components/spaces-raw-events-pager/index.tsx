import React, { useState, useRef } from 'react';
import classnames from 'classnames';

import styles from './styles.module.scss';

import { PagerButtonGroup } from '@density/ui/src';
import { useAutoWidth } from '../../helpers/use-auto-width';

export default function SpacesRawEventsPager({
  disabled,
  page,
  totalPages,
  totalEvents,
  onChange,
}) {
  const [textPage, setTextPage] = useState(1);
  const ref = useRef(null);
  const width = useAutoWidth(ref);

  return <div ref={ref} className={classnames(styles.visualizationSpaceDetailRawEventsPager, {[styles.disabled]: disabled})}>
    {width < 640 ? null : <div className={styles.visualizationSpaceDetailRawEventsPagerTotal}>
      {totalEvents || 0} events...
    </div>}
    <div className={styles.visualizationSpaceDetailRawEventsPagerPicker} style={{alignItems: width < 480 ? 'left' : undefined}}>
      {width < 480 ? null : <span>Page</span>}
      <input
        type="text"
        className={styles.visualizationSpaceDetailRawEventsPagerPickerBox}
        style={{marginLeft: width < 480 ? '0px' : undefined}}
        value={!totalPages ? '' : textPage}

        // Disable the box when there are no pages to change to.
        disabled={!totalPages}

        // As the user types, update the internal representation
        onChange={e => setTextPage(parseInt(e.target.value, 10))}

        // When the user is finished typing, clear the internal representation and emit the
        // changed value if the value was value.
        onBlur={() => {
          if (!isNaN(textPage) && textPage > 0 && textPage <= totalPages) {
            onChange(textPage);
          }
          setTextPage(1);
        }}
      />
      {isNaN(totalPages) ? null : <span>of {totalPages}</span>}
    </div>
    <div className={styles.visualizationSpaceDetailRawEventsPagerButtonGroup}>
      <PagerButtonGroup
        showFirstLastButtons

        disabledStart={!totalPages || page === 1}
        disabledPrevious={!totalPages || page === 1}
        disabledNext={!totalPages || page === totalPages || totalPages === 1}
        disabledEnd={!totalPages || page === totalPages || totalPages === 1}

        onClickStart={() => onChange(1)}
        onClickEnd={() => onChange(totalPages)}
        onClickNext={() => onChange(page + 1)}
        onClickPrevious={() => onChange(page - 1)}
      />
    </div>
  </div>;
}
