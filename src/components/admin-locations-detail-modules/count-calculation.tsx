import React from 'react';

import AdminLocationsDetailModule from './index';
import { RadioButton, RadioButtonContext } from '@density/ui';

export enum SpaceCountingMode {
  NONE = 'none',
  DOORWAYS = 'doorways',
  SUM_EXPLICIT = 'sum_explicit',
  SUM_CHILDREN = 'sum_children',
}

export default function AdminLocationsDetailModulesCountCalculation({
  value,
  onChange,
}) {
  return (
    <AdminLocationsDetailModule title="Count Calculation">
      <p>You can learn more about count calculation <a href="#/faq">here</a>.</p>
      <RadioButtonContext.Provider value='USER_FORM'>
        <br />
        <RadioButton
          name="admin-location-management-count-calculation-mode"
          checked={value === SpaceCountingMode.NONE}
          onChange={e => onChange(SpaceCountingMode.NONE)}
          value={SpaceCountingMode.NONE}
          text={<strong>Disable count data for this space</strong>} />
        <br />
        <RadioButton
          name="admin-location-management-count-calculation-mode"
          checked={value === SpaceCountingMode.DOORWAYS}
          onChange={e => onChange(SpaceCountingMode.DOORWAYS)}
          value={SpaceCountingMode.DOORWAYS}
          text={<strong>Calculate count based on doorway events</strong>} />
        <br />
        <RadioButton
          name="admin-location-management-count-calculation-mode"
          checked={value === SpaceCountingMode.SUM_EXPLICIT}
          onChange={e => onChange(SpaceCountingMode.SUM_EXPLICIT)}
          value={SpaceCountingMode.SUM_EXPLICIT}
          text={<strong>Calculate count based on the sum of selected spaces</strong>} />
      </RadioButtonContext.Provider>
    </AdminLocationsDetailModule>
  );
}
