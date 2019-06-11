import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import GenericErrorState from '../generic-error-state/index';
import GenericLoadingState from '../generic-loading-state/index';
import collectionSpacesUpdate from '../../actions/collection/spaces/update';
import showToast from '../../actions/toasts';
import spaceManagementReset from '../../actions/space-management/reset';
import spaceManagementFormUpdate from '../../actions/space-management/form-update';
import spaceManagementFormDoorwayUpdate from '../../actions/space-management/form-doorway-update';

import { DensitySpace, DensityTag, DensityAssignedTeam } from '../../types';
import { AdminLocationsFormState, convertFormStateToSpaceFields } from '../../reducers/space-management';

import {
  AdminLocationsDetailModulesGeneralInfo,
  AdminLocationsDetailModulesTags,
  AdminLocationsDetailModulesMetadata,
  AdminLocationsDetailModulesAddress,
  AdminLocationsDetailModulesDangerZone,
  AdminLocationsDetailModulesOperatingHours,
  AdminLocationsDetailModulesDoorways,
} from '../admin-locations-detail-modules/index';

import {
  AppFrame,
  AppPane,
  AppBar,
  AppBarTitle,
  AppBarSection,
  Button,
  ButtonGroup,
  Icons,
} from '@density/ui';

type AdminLocationsFormProps = {
  spaceType: DensitySpace["spaceType"],
  formState: { [key: string]: any },
  tagsCollection: { [key: string]: any },
  assignedTeamsCollection: { [key: string]: any },
  onChangeField: (string, any) => any,
  onSetDoorwayField?: (doorwayId: string, key: string, value: any) => any,
  operationType: 'CREATE' | 'UPDATE',
};

// A component that renders all the space management modules for the given space type
export function SpaceTypeForm({
  spaceType,
  formState,
  tagsCollection,
  assignedTeamsCollection,
  onChangeField,
  onSetDoorwayField,
  operationType,
}: AdminLocationsFormProps) {
  const MODULES = {
    generalInfo: (
      <AdminLocationsDetailModulesGeneralInfo
        spaceType={spaceType}
        formState={formState}
        onChangeField={onChangeField}
      />
    ),
    metadata: (
      <AdminLocationsDetailModulesMetadata
        spaceType={spaceType}
        formState={formState}
        onChangeField={onChangeField}
      />
    ),
    address: (
      <AdminLocationsDetailModulesAddress
        spaceType={spaceType}
        address={formState.address}
        coordinates={formState.coordinates}
        onChangeAddress={address => onChangeField('address', address)}
        onChangeCoordinates={coordinates => onChangeField('coordinates', coordinates)}
      />
    ),
    operatingHours: (
      <AdminLocationsDetailModulesOperatingHours
        formState={formState}
        onChangeField={onChangeField}
      />
    ),
    tags: (
      <AdminLocationsDetailModulesTags
        title="Tags"
        placeholder="Start typing to add a tag"
        processIntoSlug={true}
        emptyTagsPlaceholder="No tags have been added to this space yet"
        tags={formState.tags}
        tagsCollection={tagsCollection}
        onChangeTags={tags => onChangeField('tags', tags)}
      />
    ),
    teams: (
      <AdminLocationsDetailModulesTags
        title="Teams"
        placeholder="Start typing to assign a team"
        processIntoSlug={false}
        emptyTagsPlaceholder="No teams have been assigned to this space yet"
        tags={formState.assignedTeams}
        tagsCollection={assignedTeamsCollection}
        onChangeTags={assignedTeams => onChangeField('assignedTeams', assignedTeams)}
      />
    ),
    doorways: (
      <AdminLocationsDetailModulesDoorways
        formState={formState}
        onChangeField={onChangeField}
        onSetDoorwayField={onSetDoorwayField}
        onChangeDoorwaysFilter={filter => onChangeField('doorwaysFilter', filter)}
      />
    ),
    dangerZone: (
      <Fragment>
        {operationType === 'UPDATE' ? (
          <AdminLocationsDetailModulesDangerZone />
        ) : null}
      </Fragment>
    ),
  };

  const MODULES_BY_SPACE_TYPE = {
    campus: [
      MODULES.generalInfo,
      MODULES.address,
      MODULES.operatingHours,
      MODULES.tags,
      MODULES.teams,
      MODULES.dangerZone,
    ],
    building: [
      MODULES.generalInfo,
      MODULES.address,
      MODULES.doorways,
      MODULES.operatingHours,
      MODULES.metadata,
      MODULES.tags,
      MODULES.teams,
      MODULES.dangerZone,
    ],
    floor: [
      MODULES.generalInfo,
      MODULES.doorways,
      MODULES.operatingHours,
      MODULES.metadata,
      MODULES.tags,
      MODULES.teams,
      MODULES.dangerZone,
    ],
    space: [
      MODULES.generalInfo,
      MODULES.metadata,
      MODULES.doorways,
      MODULES.operatingHours,
      MODULES.tags,
      MODULES.teams,
      MODULES.dangerZone,
    ],
  };

  return (
    <div className={styles.moduleContainer}>
      <div className={styles.moduleInner}>
        {MODULES_BY_SPACE_TYPE[spaceType].map((mod, index) => (
          // Note: normally using the index would be not optimal as a key, but the order of these
          // modules in the array is stable / isn't going to change so I think it is preferrable to
          // adding an explicit key to each one.
          <div key={index} className={styles.moduleWrapper}>
            {mod}
          </div>
        ))}
      </div>
    </div>
  );
}

type AdminLocationsEditProps = {
  spaceManagement: any,
  selectedSpace: DensitySpace,

  tagsCollection: Array<DensityTag>,
  assignedTeamsCollection: Array<DensityAssignedTeam>,

  onChangeField: (string, any) => any,
  onSetDoorwayField: (doorwayId: string, key: string, value: any) => any,
  onSave: (spaceId: string, spaceFieldUpdate: any) => any,
};

const SPACE_TYPE_TO_NAME = {
  campus: 'Campus',
  building: 'Building',
  floor: 'Level',
  space: 'Room',
};

class AdminLocationsEdit extends Component<AdminLocationsEditProps, AdminLocationsFormState> {
  onSave = () => {
    const spaceFieldsToUpdate = {
      id: this.props.spaceManagement.spaces.selected,
      ...convertFormStateToSpaceFields(
        this.props.spaceManagement.formState,
        this.props.selectedSpace.spaceType,
      ),
    };
    this.props.onSave(
      this.props.spaceManagement.spaces.selected,
      spaceFieldsToUpdate,
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
    const {
      spaceManagement,
      selectedSpace,
      tagsCollection,
      assignedTeamsCollection,
      onChangeField,
      onSetDoorwayField,
    } = this.props;

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
              <div className={styles.appBarWrapper}>
                <AppBar>
                  <AppBarTitle>
                    <a
                      role="button"
                      className={styles.arrow}
                      href={`#/admin/locations/${selectedSpace.id}`}
                    >
                      <Icons.ArrowLeft />
                    </a>
                    Edit {SPACE_TYPE_TO_NAME[selectedSpace.spaceType]}
                  </AppBarTitle>
                  <AppBarSection>
                    <ButtonGroup>
                      <Button
                        variant="underline"
                        disabled={spaceManagement.view.startsWith('LOADING')}
                        onClick={() => {
                          window.location.href = `#/admin/locations/${selectedSpace.id}`;
                        }}
                      >Cancel</Button>
                      <Button
                        type="primary"
                        variant="filled"
                        onClick={this.onSave}
                        disabled={!this.isFormComplete() || spaceManagement.view.startsWith('LOADING')}
                      >Save</Button>
                    </ButtonGroup>
                  </AppBarSection>
                </AppBar>
              </div>

              {/* All the space type components take the same props */}
              {spaceManagement.view === 'VISIBLE' ? (
                <SpaceTypeForm
                  spaceType={selectedSpace.spaceType}
                  formState={spaceManagement.formState}
                  tagsCollection={tagsCollection}
                  assignedTeamsCollection={assignedTeamsCollection}
                  operationType="UPDATE"
                  onChangeField={onChangeField}
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
}

export default connect((state: any) => {
  const selectedSpace = state.spaceManagement.spaces.data.find(space => state.spaceManagement.spaces.selected === space.id);
  return {
    spaceManagement: state.spaceManagement,
    tagsCollection: state.tags,
    assignedTeamsCollection: state.assignedTeams,
    selectedSpace,
  };
}, (dispatch: any) => {
  return {
    async onSave(spaceId, spaceFieldUpdate) {
      const ok = await dispatch(collectionSpacesUpdate({
        ...spaceFieldUpdate,
        id: spaceId,
      }));
      if (!ok) {
        dispatch(showToast({ type: 'error', text: 'Error updating space' }));
        dispatch(spaceManagementReset());
        return false;
      }

      dispatch(showToast({ text: 'Space updated successfully' }));
      window.location.href = `#/admin/locations/${spaceId}`;
    },
    onChangeField(key, value) {
      dispatch(spaceManagementFormUpdate(key, value));
    },
    onSetDoorwayField(doorwayId, field, value) {
      dispatch(spaceManagementFormDoorwayUpdate(doorwayId, field, value));
    },
  };
})(AdminLocationsEdit);
