import React from 'react';

import AdminLocationsDetailModule from './index';
import SpacePicker from '../space-picker';
import { connect } from 'react-redux';
import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter/index';

export function AdminLocationsDetailModulesParent({
  formState,
  onChangeField,
  spaceHierarchy
}) {
  const formattedHierarchy = spaceHierarchyFormatter(spaceHierarchy.data);
  return (
    <AdminLocationsDetailModule title="General Info">
      <SpacePicker
        value={formState.parentId}
        onChange={space => onChangeField('parentId', space.id)}
        formattedHierarchy={formattedHierarchy}
      />
    </AdminLocationsDetailModule>
  );
}

export default connect((state: any) => ({
  spaceHierarchy: state.spaceHierarchy
}));
