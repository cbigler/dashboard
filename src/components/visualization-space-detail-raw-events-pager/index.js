import * as React from 'react';
import classnames from 'classnames';

import InputBox from '@density/ui-input-box';
import PagerButtonGroup from '@density/ui-pager-button-group';

export default class VisualizationSpaceDetailRawEventsPager extends React.Component {
  constructor(props) {
    super(props);
    this.state = { textPage: false };
  }
  render() {
    const {
      disabled,
      page,
      totalPages,
      totalEvents,
      onChange,
    } = this.props;

    return <div className={classnames('visualization-space-detail-raw-events-pager', {disabled})}>
      <div className="visualization-space-detail-raw-events-pager-total">
        {totalEvents || 0} Events...
      </div>
      <div className="visualization-space-detail-raw-events-pager-picker">
        <span>Page</span>
        <InputBox
          type="text"
          className="visualization-space-detail-raw-events-pager-picker-box"
          value={this.state.textPage === false ? page : this.state.textPage}

          // Disable the box when there are no pages to change to.
          disabled={totalPages === 0}

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
        <span>of {totalPages}</span>
      </div>
      <div className="visualization-space-detail-raw-events-pager-button-group">
        <PagerButtonGroup
          showFirstLastButtons

          disabledStart={totalPages === 0 || page === 1}
          disabledPrevious={totalPages === 0 || page === 1}
          disabledNext={totalPages === 0 || page === totalPages || totalPages === 1}
          disabledEnd={totalPages === 0 || page === totalPages || totalPages === 1}

          onClickStart={() => onChange(1)}
          onClickEnd={() => onChange(totalPages)}
          onClickNext={() => onChange(page + 1)}
          onClickPrevious={() => onChange(page - 1)}
        />
      </div>
    </div>;
  }
}
