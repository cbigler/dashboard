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
import spaceManagementFormUpdate from '../../actions/space-management/form-update';
import spaceManagementFormDoorwayUpdate from '../../actions/space-management/form-doorway-update';

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
  onSetDoorwayField: (doorwayId: string, key: string, value: any) => any,
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

  isFormComplete = () => {
    const formState = this.props.spaceManagement.formState;
    return (
      formState &&
      formState.name &&

      // Operating hours module valid
      formState.timeZone && formState.dailyReset && formState.operatingHours &&
      formState.operatingHours.filter(i => i.label === null).length === 0
    );
  }


  render() {
    const { spaceManagement, newSpaceType, newSpaceParent, onSetDoorwayField } = this.props;

    const FormComponent = {
      campus: AdminLocationsCampusForm,
      building: AdminLocationsBuildingForm,
      floor: AdminLocationsFloorForm,
      space: AdminLocationsSpaceForm,
    }[newSpaceType];

    return (
      <AppFrame>
        <AppPane>
          {spaceManagement.view === 'ERROR' ? (
            <div className={styles.centered}>
              <GenericErrorState />
            </div>
          ) : null}

          {spaceManagement.view === 'LOADING_INITIAL' ? (
            <div className={styles.centered}>
              <GenericLoadingState />
            </div>
          ) : null}

          {/* Show when: */}
          {/* 1. Space and time segment groups have both loaded */}
          {/* 2. Space is in the process of being updated */}
          {spaceManagement.view === 'VISIBLE' || spaceManagement.view === 'LOADING_SEND_TO_SERVER' ? (
            <Fragment>
              {!ALLOWED_SUB_SPACE_TYPES[newSpaceParent ? newSpaceParent.spaceType : 'root'].includes(newSpaceType) ? (
                <AdminLocationsDetailEmptyState
                  text={`
                  A new ${SPACE_TYPE_TO_NAME[newSpaceType].toLowerCase()} cannot be placed within the
                  ${newSpaceParent ?
                    `${SPACE_TYPE_TO_NAME[newSpaceParent.spaceType].toLowerCase()} ${newSpaceParent.name}` :
                    'root'}.`}
                />
              ) : null}

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
                      disabled={!this.isFormComplete() || spaceManagement.view.startsWith('LOADING')}
                    >Save</Button>
                  </AppBarSection>
                </AppBar>
              </div>

              {/* All the space type components take the same props */}
              {spaceManagement.view === 'VISIBLE' ? (
                <FormComponent
                  spaceType={newSpaceType}
                  formState={this.props.spaceManagement.formState}
                  operationType="CREATE"
                  onChangeField={this.props.onChangeField}
                  onSetDoorwayField={onSetDoorwayField}
                />
              ) : (
                // When loading
                <div className={styles.centered}>
                  <GenericLoadingState />
                </div>
              )}
            </Fragment>
          ) : null}
        </AppPane>
      </AppFrame>
    );
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
      dispatch(spaceManagementFormUpdate(key, value));
    },
    onSetDoorwayField(doorwayId, field, value) {
      dispatch(spaceManagementFormDoorwayUpdate(doorwayId, field, value));
    },
  };
})(AdminLocationsNewUnconnected);
