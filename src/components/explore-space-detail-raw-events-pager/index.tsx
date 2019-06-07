import React from 'react';
import classnames from 'classnames';

import styles from './styles.module.scss';

import { PagerButtonGroup } from '@density/ui';

export default class VisualizationSpaceDetailRawEventsPager extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = { textPage: false };
  }
  shouldComponentUpdate(props, state, context) {
    return !props.loading;
  }
  render() {
    const {
      disabled,
      page,
      totalPages,
      totalEvents,
      onChange,
    } = this.props;
    return <div className={classnames(styles.visualizationSpaceDetailRawEventsPager, {[styles.disabled]: disabled})}>
      <div className={styles.visualizationSpaceDetailRawEventsPagerTotal}>
        {totalEvents || 0} events...
      </div>
      <div className={styles.visualizationSpaceDetailRawEventsPagerPicker}>
        <span>Page</span>
        <input
          type="text"
          className={styles.visualizationSpaceDetailRawEventsPagerPickerBox}
          value={!totalPages ? '' : (this.state.textPage === false ? page : this.state.textPage)}

          // Disable the box when there are no pages to change to.
          disabled={!totalPages}

          // As the user types, update the internal representation
          onChange={e => this.setState({textPage: e.target.value})}

          // When the user is finished typing, clear the internal representation and emit the
          // changed value if the value was value.
          onBlur={() => {
            const parsedPage = parseInt(this.state.textPage, 10);
            if (!isNaN(parsedPage) && parsedPage > 0 && parsedPage <= totalPages) {
              onChange(parsedPage);
            }
            this.setState({textPage: false});
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
}
