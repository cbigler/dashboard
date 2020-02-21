import React from 'react';

import { AppBar, AppBarContext, AppBarSection, Button, Modal } from '@density/ui/src';
import showModal from '../../rx-actions/modal/show'; 

import Report from '@density/reports';
import useRxDispatch from '../../helpers/use-rx-dispatch';

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

// FIXME: what external props are required?
const DashboardReport: React.FC<Any<FixInRefactor>> = (externalProps) => {

  const dispatch = useRxDispatch();

  // When a user clicks "expand" on a report, call this function to set the currently open modal.
  const onOpenReportExpandedModal = (report, reportData) => {
    showModal(dispatch, 'MODAL_REPORT_EXPANDED', {report, reportData});
  }
    
  return (
    <Report
      {...externalProps}
      onOpenReportExpandedModal={onOpenReportExpandedModal}
    />
  )
}

export default DashboardReport;