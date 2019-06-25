import React from 'react';

import AdminLocationsDetailModule from './index';
import SpacePicker from '../space-picker';
import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter/index';

export default function AdminLocationsDetailModulesParent({
  formState,
  spaceHierarchy,
  onChangeParent,
}) {
  const formattedHierarchy = spaceHierarchyFormatter(spaceHierarchy).filter(item => {
    return formState.id !== item.space.id &&
      (formState.spaceType !== 'building' || item.space.spaceType === 'campus') &&
      (formState.spaceType !== 'floor' || item.space.spaceType === 'building');
  });
  return (
    <AdminLocationsDetailModule title="Change Parent" includePadding={false}>
      <SpacePicker
        value={formattedHierarchy.find(item => item.space.id === formState.parentId) || null}
        onChange={item => onChangeParent(item.space.id)}

        formattedHierarchy={formattedHierarchy}
        searchBoxPlaceholder="Search for space name"
        height={288}
      />
    </AdminLocationsDetailModule>
  );
}
