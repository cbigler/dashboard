/* eslint-disable import/first */
import React, { Fragment, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import uuid from 'uuid';

import AnalyticsTabs from './index';

function State({ initialState, children }) {
  const [state, setState] = useState(initialState);
  return (
    <Fragment>
      {children(state, setState)}
      <br />
      <br />
      <strong>State:</strong>
      <br />
      <pre style={{height: 100, overflow: 'auto', padding: 8, background: '#eee'}}>
        {JSON.stringify(state, null, 2)}
      </pre>
    </Fragment>
  )
}


function handleCloseReport(state, id) {
  const newReports = state.reports.filter(r => r.id !== id)
  let newActiveId = state.activeId;
  if (id === state.activeId) {
    // Closing the active tab, so focus the previous tab
    const reportBeingDeletedIndex = state.reports.findIndex(r => r.id === id);
    const previousReportIndex = reportBeingDeletedIndex - 1;
    newActiveId = newReports[previousReportIndex] ? newReports[previousReportIndex].id : null;
  }
  return {activeId: newActiveId, reports: newReports};
}

function handleAddNewReport(state) {
  const newReport = {id: uuid.v4(), name: 'Untitled Report', isSaved: false};
  return {
    ...state,
    activeId: newReport.id,
    reports: [ ...state.reports, newReport ],
  };
}

storiesOf('Analytics Tabs', module)
  .add('Default', () => (
    <State initialState={{activeId: 'rpt_xxx', reports: [{ id: 'rpt_xxx', name: 'Foo', isSaved: false }]}}>
      {(state, setState) => (
      <AnalyticsTabs
        reports={state.reports}
        activeReportId={state.activeId}
        onChangeActiveReport={activeId => setState({...state, activeId})}
        onCloseReport={id => setState(handleCloseReport(state, id))}
        onAddNewReport={() => setState(handleAddNewReport(state))}
      />
      )}
    </State>
  ))
  .add('No tabs visible', () => (
    <State initialState={{activeId: null, reports: []}}>
      {(state, setState) => (
      <AnalyticsTabs
        reports={state.reports}
        activeReportId={state.activeId}
        onChangeActiveReport={activeId => setState({...state, activeId})}
        onCloseReport={id => setState(handleCloseReport(state, id))}
        onAddNewReport={() => setState(handleAddNewReport(state))}
      />
      )}
    </State>
  ))
  .add('Lots tabs visible, tab bar scrolls', () => (
    <State initialState={{
      activeId: 'rpt_xxx',
      reports: [
        { id: 'rpt_1', name: 'Really really long saved name', isSaved: true },
        { id: 'rpt_2', name: 'Saved', isSaved: true },
        { id: 'rpt_3', name: 'Saved', isSaved: true },
        { id: 'rpt_4', name: 'Saved', isSaved: true },
        { id: 'rpt_5', name: 'Unsaved', isSaved: false },
        { id: 'rpt_6', name: 'Unsaved', isSaved: false },
        { id: 'rpt_7', name: 'Unsaved', isSaved: false },
        { id: 'rpt_8', name: 'Unsaved', isSaved: false },
        { id: 'rpt_9', name: 'Unsaved', isSaved: false },
        { id: 'rpt_10', name: 'Foo', isSaved: false },
        { id: 'rpt_11', name: 'Foo', isSaved: false },
        { id: 'rpt_12', name: 'Foo', isSaved: false },
      ],
    }}>
      {(state, setState) => (
      <AnalyticsTabs
        reports={state.reports}
        activeReportId={state.activeId}
        onChangeActiveReport={activeId => setState({...state, activeId})}
        onCloseReport={id => setState(handleCloseReport(state, id))}
        onAddNewReport={() => setState(handleAddNewReport(state))}
      />
      )}
    </State>
  ))
