import React from 'react';
import { connect } from 'react-redux';

import showModal from '../../actions/modal/show'; 

import Report from '@density/reports';

const ConnectedReport = connect(state => ({}), dispatch => {
  return {
    // When a user clicks "expand" on a report, call this function to set the currently open modal.
    onOpenReportExpandedModal(report) {
      dispatch(showModal('MODAL_REPORT_EXPANDED', {report}));
    },
  };
})(Report);

export default (ConnectedReport as React.ComponentClass<any, any>);
