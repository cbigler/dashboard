import React from 'react';
import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter/index';

export default function AdminSpacePermissionsPicker({ spaces, selectedSpaceIds }) {
  return (
    <div className="admin-space-permissions-picker">
      <pre>
        {JSON.stringify(spaceHierarchyFormatter(spaces.data, {renderZeroItems: false}), null, 2)}
      </pre>
    </div>
  );
}
