import React from 'react';
import { connect } from 'react-redux';

import { AppBar, AppBarContext, AppBarSection, Button, Modal } from '@density/ui';
import showModal from '../../actions/modal/show'; 

import Report from '@density/reports';

export function ExpandedReportModal({visible, report, reportData, onCloseModal}) {
  return <Modal
    visible={visible}
    onBlur={onCloseModal}
    onEscape={onCloseModal}
    width={1000}
  >
    <div style={{marginTop: -64}}>
      <AppBarContext.Provider value="TRANSPARENT">
        <AppBar padding="0">
          <AppBarSection></AppBarSection>
          <AppBarSection>
            <Button onClick={onCloseModal}>Close</Button>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </div>
    {report ? <Report
      report={report as any}
      reportData={reportData as any}
      expanded={true}
      hideBorder={true}
    /> : null}
  </Modal>
}

const ConnectedReport = connect(state => ({}), dispatch => {
  return {
    // When a user clicks "expand" on a report, call this function to set the currently open modal.
    onOpenReportExpandedModal(report, reportData) {
      dispatch<any>(showModal('MODAL_REPORT_EXPANDED', {report, reportData}));
    },
  };
})(Report);

export default (ConnectedReport as React.ComponentClass<any, any>);
