import React, { Fragment } from 'react';
import styles from './styles.module.scss';

import { DensitySpace } from '../../types';

import { connect } from 'react-redux';

function AdminLocations({selectedSpace, spaces}) {
  // Find the type of space that this page should use as headers
  let headerSpaceType;
  if (selectedSpace) {
    switch (selectedSpace.type) {
    case 'campus':
      headerSpaceType = 'building';
      break;
    case 'building':
      headerSpaceType = 'floor';
      break;
    case 'floor':
      headerSpaceType = 'space';
      break;
    default:
      headerSpaceType = null;
      break;
    }
  } else {
    // We are on the root page, and the space groups should be made up of campuses
    headerSpaceType = 'campus';
  }
  console.log('HEADER', headerSpaceType);

  // Group the complete list of spaces into subgroups, where each subgroup is a list of spaces that
  // has a parent space equal to the space in the header of the subgroup.
  const headerSpaces = spaces.data.filter(space => space.spaceType === headerSpaceType);
  const spaceSubGroups: { [key: string]: Array<DensitySpace> } = {};
  headerSpaces.map(headerSpace => {
    const spacesInSubgroup = spaces.data.filter(space => space.parentId === headerSpace.id);
    spaceSubGroups[headerSpace.id] = spacesInSubgroup;
  });
  const uncategorizedSpaces = spaces.data.filter(
    space => !Object.keys(spaceSubGroups).includes(space.parentId)
  );

  console.log('GROUPS', spaceSubGroups);
  console.log('UNCATAGORIZED', uncategorizedSpaces);

  return (
    <div className={styles.adminLocations}>
      {spaces.view === 'LOADING' ? <span>Loading</span> : null}
      {spaces.view === 'VISIBLE' ? (
        <Fragment>
          {Object.entries(spaceSubGroups).map(([spaceHeaderId, childSpaces]) => {
            const spaceHeader = spaces.data.find(space => space.id === spaceHeaderId);
            return (
              <div key={spaceHeader.id}>
                <h2>{spaceHeader.name}</h2>
                <ul>
                  {childSpaces.map(space => (
                    <li key={space.id}>
                      <a href={`#/admin/locations/${[...space.ancestry.map(s => s.id).reverse(), space.id].join('/')}`}>
                        {space.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </Fragment>
      ) : null}
    </div>
  );
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    selectedSpace: state.spaces.data.find(space => state.spaces.selected === space.id),
  };
}, (dispatch: any) => {
  return {
  };
})(AdminLocations);
