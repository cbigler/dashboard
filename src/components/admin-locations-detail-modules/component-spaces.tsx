import React from 'react';

import AdminLocationsDetailModule from './index';
import SpacePicker from '../space-picker';
import { DisplaySpaceHierarchyNode } from '@density/lib-space-helpers/types';

import colorVariables from '@density/ui/variables/colors.json';
import spacingVariables from '@density/ui/variables/spacing.json';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { AdminLocationsComponentSpaceList } from '../admin-locations-snippets';

export default function AdminLocationsDetailModulesComponentSpaces({
  spaces,
  selectedSpaces,
  formattedHierarchy,
  countingMode,
  onChange,
}: {
  spaces: ReadonlyMap<string, CoreSpace>,
  selectedSpaces: DisplaySpaceHierarchyNode[],
  formattedHierarchy: DisplaySpaceHierarchyNode[],
  countingMode: string,
  onChange: (items: DisplaySpaceHierarchyNode[]) => void,
}) {
  return (
    <AdminLocationsDetailModule backgroundColor={countingMode === 'composite' ? colorVariables.white : colorVariables.gray100} title="Component Spaces">
      <div style={{display: 'flex'}}>
        <SpacePicker
          cardPickerContext={true}
          disabled={countingMode !== 'composite'}
          canSelectMultiple={true}
          value={countingMode === 'composite' ? selectedSpaces : []}
          formattedHierarchy={formattedHierarchy}
          onChange={onChange}
        />
        <div style={{
          backgroundColor: colorVariables.gray100,
          border: `1px solid ${colorVariables.gray300}`,
          borderRadius: spacingVariables.borderRadiusBase,
          flexGrow: 1,
          padding: '18px 20px',
          marginLeft: 24,
          marginTop: 12,
        }}>
          <AdminLocationsComponentSpaceList
            spaces={spaces}
            spaceIds={selectedSpaces.map(x => x.space.id)}
          />
        </div>
      </div>
    </AdminLocationsDetailModule>
  );
}
