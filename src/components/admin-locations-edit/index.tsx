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
  ButtonContext,
  Button,
  Icons,
} from '@density/ui';

import { AdminLocationsFormState } from '../../reducers/space-management';

// Given the state of the form, convert that state back into fields that can be sent in the body of
// a PUT to the space.
export function convertFormStateToSpaceFields(formState: AdminLocationsFormState, spaceType: DensitySpace["spaceType"]) {
  function parseIntOrNull(string) {
    const result = parseInt(string, 10);
    if (isNaN(result)) {
      return null;
    } else {
      return result;
    }
  }
  return {
    name: formState.name,
    spaceType: formState.spaceType,
    'function': formState['function'],
    parentId: formState.parentId,
    floorLevel: spaceType === 'floor' ? parseIntOrNull(formState.floorLevel) : undefined,

    newTags: formState.tags,
    newAssignedTeams: formState.assignedTeams,

    annualRent: spaceType === 'building' ? parseIntOrNull(formState.annualRent) : undefined,
    sizeArea: spaceType !== 'campus' ? parseIntOrNull(formState.sizeArea) : undefined,
    sizeAreaUnit: spaceType === 'building' ? formState.sizeAreaUnit : undefined,
    currencyUnit: formState.currencyUnit,
    capacity: spaceType !== 'campus' ? parseIntOrNull(formState.capacity) : undefined,
    targetCapacity: spaceType !== 'campus' ? parseIntOrNull(formState.targetCapacity) : undefined,

    address: formState.address && formState.address.length > 0 ? formState.address : null,
    latitude: formState.coordinates ? formState.coordinates[0] : null,
    longitude: formState.coordinates ? formState.coordinates[1] : null,

    dailyReset: formState.dailyReset,
    timeZone: formState.timeZone,

    newImageFile: formState.newImageFile,
    operatingHours: formState.operatingHours,

    inheritsTimeSegments: !formState.overrideDefault,
  };
}

type AdminLocationsEditProps = {
  spaceManagement: any,
  selectedSpace: DensitySpace,
  tagsCollection: Array<DensityTag>,
  assignedTeamsCollection: Array<DensityAssignedTeam>,

  onSave: (id: string, spaceFieldUpdate: any) => any,
  onChangeField: (key: string, value: string) => any,
  onSetDoorwaySelected: (string, boolean) => any,
};

export type AdminLocationsFormState = {
  loaded: boolean,

  name?: string,
  spaceType?: string,
  'function'?: string,
  tags?: Array<{
    name: string,
    operationToPerform: 'CREATE' | 'DELETE' | null,
  }>,
  assignedTeams?: Array<{
    id: string,
    name: string,
    operationToPerform: 'CREATE' | 'DELETE' | null,
  }>,
  annualRent?: any,
  sizeArea?: any,
  sizeAreaUnit?: 'feet' | 'meters',
  currencyUnit?: 'USD',
  capacity?: string,
  targetCapacity?: string,
  floorLevel?: string,
  address?: string,
  coordinates?: [number, number] | null,
  timeZone?: string,
  dailyReset?: string | null,
  parentId?: string | null,
  imageUrl?: string,
  newImageFile?: any,
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
      onSetDoorwaySelected
    } = this.props;

    const FormComponent = {
      campus: AdminLocationsCampusForm,
      building: AdminLocationsBuildingForm,
      floor: AdminLocationsFloorForm,
      space: AdminLocationsSpaceForm,
      unknown: AdminLocationsNoopForm,
    }[selectedSpace ? selectedSpace.spaceType : 'unknown'];

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
                    <ButtonContext.Provider value="CANCEL_BUTTON">
                      <Button
                        disabled={spaceManagement.view.startsWith('LOADING')}
                        onClick={() => {
                          window.location.href = `#/admin/locations/${selectedSpace.id}`;
                        }}>Cancel</Button>
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
                  spaceType={selectedSpace.spaceType}
                  formState={spaceManagement.formState}
                  tagsCollection={tagsCollection}
                  assignedTeamsCollection={assignedTeamsCollection}
                  operationType="UPDATE"
                  onChangeField={onChangeField}
                  onSetDoorwaySelected={onSetDoorwaySelected}
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
    onSetDoorwaySelected(doorwayId, value) {
      dispatch(spaceManagementFormDoorwayUpdate(doorwayId, 'selected', value));
    },
  };
})(AdminLocationsEdit);

// Props that all the below forms take
type AdminLocationsFormSpaceTypeProps = {
  spaceType: DensitySpace["spaceType"],
  formState: { [key: string]: any },
  tagsCollection: { [key: string]: any },
  assignedTeamsCollection: { [key: string]: any },
  onChangeField: (string, any) => any,
  onSetDoorwaySelected?: (string, boolean) => any,
  operationType: 'CREATE' | 'UPDATE',
};

// NOTE: all the below forms are rendered both when creating a new instance and editing an
// existing instance of a space. Therefore, a space is not specified as when the form is rendered
// for the "new" state no space exists yet.
export function AdminLocationsNoopForm(props: AdminLocationsFormSpaceTypeProps) { return null; }

export function AdminLocationsCampusForm({
  spaceType,
  formState,
  tagsCollection,
  assignedTeamsCollection,
  onChangeField,
  operationType,
}: AdminLocationsFormSpaceTypeProps) {
  return (
    <div className={styles.moduleContainer}>
      <div className={styles.moduleInner}>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesGeneralInfo
            spaceType={spaceType}
            formState={formState}
            onChangeField={onChangeField}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesAddress
            spaceType={spaceType}
            address={formState.address}
            coordinates={formState.coordinates}
            onChangeAddress={address => onChangeField('address', address)}
            onChangeCoordinates={coordinates => onChangeField('coordinates', coordinates)}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesOperatingHours
            formState={formState}
            onChangeField={onChangeField}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesTags
            title="Tags"
            placeholder="Start typing to add a tag"
            processIntoSlug={true}
            emptyTagsPlaceholder="No tags have been added to this space yet"
            tags={formState.tags}
            tagsCollection={tagsCollection}
            onChangeTags={tags => onChangeField('tags', tags)}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesTags
            title="Teams"
            placeholder="Start typing to assign a team"
            processIntoSlug={false}
            emptyTagsPlaceholder="No teams have been assigned to this space yet"
            tags={formState.assignedTeams}
            tagsCollection={assignedTeamsCollection}
            onChangeTags={assignedTeams => onChangeField('assignedTeams', assignedTeams)}
          />
        </div>
        {operationType === 'UPDATE' ? (
          <div className={styles.moduleWrapper}>
            <AdminLocationsDetailModulesDangerZone />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AdminLocationsBuildingForm({
  spaceType,
  formState,
  tagsCollection,
  assignedTeamsCollection,
  onChangeField,
  onSetDoorwaySelected,
  operationType,
}: AdminLocationsFormSpaceTypeProps) {
  return (
    <div className={styles.moduleContainer}>
      <div className={styles.moduleInner}>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesGeneralInfo
            spaceType={spaceType}
            formState={formState}
            onChangeField={onChangeField}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesAddress
            spaceType={spaceType}
            address={formState.address}
            coordinates={formState.coordinates}
            onChangeAddress={address => onChangeField('address', address)}
            onChangeCoordinates={coordinates => onChangeField('coordinates', coordinates)}
          />
        </div>
        {/* <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesDoorways
            formState={formState}
            onToggleDoorway={item => onSetDoorwaySelected && onSetDoorwaySelected(item.id, !item._formState.selected)}
            onChangeDoorwaysFilter={filter => onChangeField('doorwaysFilter', filter)}
          />
        </div> */}
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesOperatingHours
            formState={formState}
            onChangeField={onChangeField}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesMetadata
            spaceType={spaceType}
            formState={formState}
            onChangeField={onChangeField}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesTags
            title="Tags"
            placeholder="Start typing to add a tag"
            processIntoSlug={true}
            emptyTagsPlaceholder="No tags have been added to this space yet"
            tags={formState.tags}
            tagsCollection={tagsCollection}
            onChangeTags={tags => onChangeField('tags', tags)}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesTags
            title="Teams"
            placeholder="Start typing to assign a team"
            processIntoSlug={false}
            emptyTagsPlaceholder="No teams have been assigned to this space yet"
            tags={formState.assignedTeams}
            tagsCollection={assignedTeamsCollection}
            onChangeTags={assignedTeams => onChangeField('assignedTeams', assignedTeams)}
          />
        </div>
        {operationType === 'UPDATE' ? (
          <div className={styles.moduleWrapper}>
            <AdminLocationsDetailModulesDangerZone />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AdminLocationsFloorForm({
  spaceType,
  formState,
  tagsCollection,
  assignedTeamsCollection,
  onChangeField,
  operationType,
}: AdminLocationsFormSpaceTypeProps) {
  return (
    <div className={styles.moduleContainer}>
      <div className={styles.moduleInner}>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesGeneralInfo
            spaceType={spaceType}
            formState={formState}
            onChangeField={onChangeField}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesOperatingHours
            formState={formState}
            onChangeField={onChangeField}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesMetadata
            spaceType={spaceType}
            formState={formState}
            onChangeField={onChangeField}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesTags
            title="Tags"
            placeholder="Start typing to add a tag"
            processIntoSlug={true}
            emptyTagsPlaceholder="No tags have been added to this space yet"
            tags={formState.tags}
            tagsCollection={tagsCollection}
            onChangeTags={tags => onChangeField('tags', tags)}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesTags
            title="Teams"
            placeholder="Start typing to assign a team"
            processIntoSlug={false}
            emptyTagsPlaceholder="No teams have been assigned to this space yet"
            tags={formState.assignedTeams}
            tagsCollection={assignedTeamsCollection}
            onChangeTags={assignedTeams => onChangeField('assignedTeams', assignedTeams)}
          />
        </div>
        {operationType === 'UPDATE' ? (
          <div className={styles.moduleWrapper}>
            <AdminLocationsDetailModulesDangerZone />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AdminLocationsSpaceForm({
  spaceType,
  formState,
  tagsCollection,
  assignedTeamsCollection,
  onChangeField,
  operationType,
}: AdminLocationsFormSpaceTypeProps) {
  return (
    <div className={styles.moduleContainer}>
      <div className={styles.moduleInner}>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesGeneralInfo
            spaceType={spaceType}
            formState={formState}
            onChangeField={onChangeField}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesMetadata
            spaceType={spaceType}
            formState={formState}
            onChangeField={onChangeField}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesOperatingHours
            formState={formState}
            onChangeField={onChangeField}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesTags
            title="Tags"
            placeholder="Start typing to add a tag"
            processIntoSlug={true}
            emptyTagsPlaceholder="No tags have been added to this space yet"
            tags={formState.tags}
            tagsCollection={tagsCollection}
            onChangeTags={tags => onChangeField('tags', tags)}
          />
        </div>
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesTags
            title="Teams"
            placeholder="Start typing to assign a team"
            processIntoSlug={false}
            emptyTagsPlaceholder="No teams have been assigned to this space yet"
            tags={formState.assignedTeams}
            tagsCollection={assignedTeamsCollection}
            onChangeTags={assignedTeams => onChangeField('assignedTeams', assignedTeams)}
          />
        </div>
        {operationType === 'UPDATE' ? (
          <div className={styles.moduleWrapper}>
            <AdminLocationsDetailModulesDangerZone />
          </div>
        ) : null}
      </div>
    </div>
  );
}
