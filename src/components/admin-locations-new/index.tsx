import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import GenericErrorState from '../generic-error-state/index';
import GenericLoadingState from '../generic-loading-state/index';
import {
  calculateInitialFormState,
  AdminLocationsFormState,

  AdminLocationsNoopForm,
  AdminLocationsCampusForm,
  AdminLocationsBuildingForm,
  AdminLocationsFloorForm,
  AdminLocationsSpaceForm,
} from '../admin-locations-edit/index';
import { DensityUser, DensitySpace } from '../../types';
import AdminLocationsDetailEmptyState from '../admin-locations-detail-empty-state/index';
import Dialogger from '../dialogger';

import {
  AppBar,
  AppBarTitle,
  AppBarSection,
  InputBox,
  ButtonContext,
  Button,
  Icons,
} from '@density/ui';

type AdminLocationsNewProps = {
  newSpaceParent: DensitySpace,
  newSpaceType: DensitySpace["spaceType"],
  spaces: {
    view: string,
    spaces: Array<DensitySpace>,
  },
};

const SPACE_TYPE_TO_NAME = {
  campus: 'Campus',
  building: 'Building',
  floor: 'Level',
  space: 'Room',
};

// This datastructure contains all space types that can be created if a specified space type is
// selected. This ensures that we are not giving the user the ability to create a space type that
// would make the hierarchy invalid.
const ALLOWED_SUB_SPACE_TYPES = {
  root: ['campus', 'building'],
  campus: ['building'],
  building: ['floor', 'space'],
  floor: ['space'],
  space: ['space'],
};


class AdminLocationsNewUnconnected extends Component<AdminLocationsNewProps, AdminLocationsFormState> {
  constructor(props) {
    super(props);
    this.state = calculateInitialFormState({spaceType: props.newSpaceType}, props.user);
  }

  onChangeField = (key, value) => {
    this.setState(s => ({...s, [key]: value}));
  }

  render() {
    const { spaces, newSpaceType, newSpaceParent } = this.props;

    const FormComponent = {
      campus: AdminLocationsCampusForm,
      building: AdminLocationsBuildingForm,
      floor: AdminLocationsFloorForm,
      space: AdminLocationsSpaceForm,
    }[newSpaceType];

    switch (spaces.view) {
    case 'LOADING':
      return (
        <div className={styles.centered}>
          <GenericLoadingState />
        </div>
      );
    case 'ERROR':
      return (
        <div className={styles.centered}>
          <GenericErrorState />
        </div>
      );
    case 'VISIBLE':
      if (!ALLOWED_SUB_SPACE_TYPES[newSpaceParent ? newSpaceParent.spaceType : 'root'].includes(newSpaceType)) {
        return (
          <AdminLocationsDetailEmptyState
            text={`
            A new ${SPACE_TYPE_TO_NAME[newSpaceType].toLowerCase()} cannot be placed within the
            ${newSpaceParent ?
              `${SPACE_TYPE_TO_NAME[newSpaceParent.spaceType].toLowerCase()} ${newSpaceParent.name}` :
              'root'}.`}
          />
        );
      }

      return (
        <div className={styles.adminLocationsForm}>
          <Dialogger />

          <div className={styles.appBarWrapper}>
            <AppBar>
              <AppBarTitle>
                <a
                  role="button"
                  className={styles.arrow}
                  href={newSpaceParent ? `#/admin/locations/${newSpaceParent.id}` : '#/admin/locations'}
                >
                  <Icons.ArrowLeft />
                </a>
                New {SPACE_TYPE_TO_NAME[newSpaceType]}
              </AppBarTitle>
              <AppBarSection>
                <ButtonContext.Provider value="CANCEL_BUTTON">
                  <Button onClick={() => {
                    window.location.href = newSpaceParent ? `#/admin/locations/${newSpaceParent.id}` : '#/admin/locations';
                  }}>Cancel</Button>
                </ButtonContext.Provider>
                <Button type="primary">Save</Button>
              </AppBarSection>
            </AppBar>
          </div>

          {/* All the space type components take the same props */}
          <FormComponent
            spaceType={newSpaceType}
            formState={this.state}
            operationType="CREATE"
            onChangeField={this.onChangeField}
          />
        </div>
      );
    default:
      return null;
    }
  }
};

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    user: state.user,

    // Figure out the type of the new space, and its parent
    newSpaceType: state.miscellaneous.adminLocationsNewSpaceType,
    newSpaceParent: state.spaces.data.find(
      space => space.id === state.miscellaneous.adminLocationsNewSpaceParentId
    ),
  };
}, (dispatch: any) => {
  return {
  };
})(AdminLocationsNewUnconnected);
