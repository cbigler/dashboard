import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import GenericErrorState from '../generic-error-state/index';
import GenericLoadingState from '../generic-loading-state/index';
import {
  convertFormStateToSpaceFields,

  AdminLocationsNoopForm,
  AdminLocationsCampusForm,
  AdminLocationsBuildingForm,
  AdminLocationsFloorForm,
  AdminLocationsSpaceForm,
} from '../admin-locations-edit/index';
import { AdminLocationsFormState } from '../../reducers/space-management';
import { DensityUser, DensitySpace } from '../../types';
import AdminLocationsDetailEmptyState from '../admin-locations-detail-empty-state/index';
import showToast from '../../actions/toasts';
import collectionSpacesCreate from '../../actions/collection/spaces/create';
import spaceManagementUpdateFormState from '../../actions/space-management/update-form-state';

import {
  AppFrame,
  AppPane,
  AppBar,
  AppBarTitle,
  AppBarSection,
  InputBox,
  ButtonContext,
  Button,
  Icons,
} from '@density/ui';

type AdminLocationsNewProps = {
  user: any,
  spaceManagement: any,
  newSpaceParent: DensitySpace,
  newSpaceType: DensitySpace["spaceType"],
  onChangeField: (string, any) => any,
  onSave: (spaceFields: any, spaceParentId: string | null) => any,
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
  onSave = () => {
    const newSpaceFields = convertFormStateToSpaceFields(
      this.props.spaceManagement.formState,
      this.props.newSpaceType,
    );
    this.props.onSave(
      newSpaceFields,
      this.props.newSpaceParent ? this.props.newSpaceParent.id : null,
    );
  }

  render() {
    const { spaceManagement, newSpaceType, newSpaceParent } = this.props;

    const FormComponent = {
      campus: AdminLocationsCampusForm,
      building: AdminLocationsBuildingForm,
      floor: AdminLocationsFloorForm,
      space: AdminLocationsSpaceForm,
    }[newSpaceType];

    if (spaceManagement.view === 'ERROR') {
      return (
        <div className={styles.centered}>
          <GenericLoadingState />
        </div>
      );

    } else if (spaceManagement.view === 'LOADING_INITIAL') {
      return (
        <div className={styles.centered}>
          <GenericLoadingState />
        </div>
      );

    } else {
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
        <AppFrame>
          <AppPane>
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
                    <Button
                      disabled={spaceManagement.view.startsWith('LOADING')}
                      onClick={() => {
                        window.location.href = newSpaceParent ? `#/admin/locations/${newSpaceParent.id}` : '#/admin/locations';
                      }}
                    >Cancel</Button>
                  </ButtonContext.Provider>
                  <Button
                    type="primary"
                    onClick={this.onSave}
                    disabled={spaceManagement.view === 'LOADING'}
                  >Save</Button>
                </AppBarSection>
              </AppBar>
            </div>

            {/* All the space type components take the same props */}
            <FormComponent
              spaceType={newSpaceType}
              formState={this.props.spaceManagement.formState}
              operationType="CREATE"
              onChangeField={this.props.onChangeField}
            />
          </AppPane>
        </AppFrame>
      );
    }
  }
};

export default connect((state: any) => {
  return {
    user: state.user,
    spaceManagement: state.spaceManagement,

    // Figure out the type of the new space, and its parent
    newSpaceType: state.spaceManagement.formSpaceType,
    newSpaceParent: state.spaceManagement.spaces.data.find(
      space => space.id === state.spaceManagement.formParentSpaceId
    ),
  };
}, (dispatch: any) => {
  return {
    async onSave(space, parentSpaceId) {
      const newSpace = await dispatch(collectionSpacesCreate(space));
      if (!newSpace) {
        dispatch(showToast({ type: 'error', text: 'Error creating space' }));
        return false;
      }

      dispatch(showToast({ text: 'Space created!' }));
      window.location.href = `#/admin/locations/${parentSpaceId || ''}`;
    },
    onChangeField(key, value) {
      dispatch(spaceManagementUpdateFormState(key, value));
    },
  };
})(AdminLocationsNewUnconnected);
