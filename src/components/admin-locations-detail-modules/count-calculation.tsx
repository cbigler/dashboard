import React from 'react';

import AdminLocationsDetailModule from './index';
import SpacePicker from '../space-picker';
import { DisplaySpaceHierarchyNode } from '@density/lib-space-helpers/types';

import colorVariables from '@density/ui/variables/colors.json';
import spacingVariables from '@density/ui/variables/spacing.json';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { Switch, RadioButton, RadioButtonContext } from '@density/ui';

export default function AdminLocationsDetailModulesCountCalculation({
  value,
  onChange,
}) {
  return (
    <AdminLocationsDetailModule title="Count Calculation">
      <p>You can learn more about count calculation <a href="#">here</a>.</p>
      <RadioButtonContext.Provider value='USER_FORM'>
        <br />
        <RadioButton
          name="admin-location-management-count-calculation-mode"
          checked={value === 'no-count'}
          onChange={e => onChange('no-count')}
          value={'no-count'}
          text={<strong>Disable count data for this space</strong>} />
        <br />
        <RadioButton
          name="admin-location-management-count-calculation-mode"
          checked={value === 'doorways'}
          onChange={e => onChange('doorways')}
          value={'doorways'}
          text={<strong>Calculate count based on doorway events</strong>} />
        <br />
        <RadioButton
          name="admin-location-management-count-calculation-mode"
          checked={value === 'composite'}
          onChange={e => onChange('composite')}
          value={'composite'}
          text={<strong>Calculate count based on the sum of selected spaces</strong>} />
      </RadioButtonContext.Provider>
    </AdminLocationsDetailModule>
  );
}
