import React, { Fragment, Component, useState } from 'react';
import styles from './styles.module.scss';
import GenericErrorState from '../generic-error-state/index';
import GenericLoadingState from '../generic-loading-state/index';
import collectionSpacesUpdate from '../../rx-actions/collection/spaces-legacy/update';
import { showToast } from '../../rx-actions/toasts';
import spaceManagementReset from '../../rx-actions/space-management/reset';
import spaceManagementFormUpdate from '../../rx-actions/space-management/form-update';
import spaceManagementFormDoorwayUpdate from '../../rx-actions/space-management/form-doorway-update';

import colorVariables from '@density/ui/variables/colors.json';
import { CoreSpace, CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces';
import SpaceManagementStore, { AdminLocationsFormState, convertFormStateToSpaceFields, SpaceManagementState } from '../../rx-stores/space-management';

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
} from '@density/ui/src';
import useRxStore from '../../helpers/use-rx-store';
import TagsStore, { TagsState } from '../../rx-stores/tags';
import AssignedTeamsStore, { AssignedTeamsState } from '../../rx-stores/assigned-teams';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import AdminLocationsDetailModulesComponentSpaces from '../admin-locations-detail-modules/component-spaces';
import { spaceHierarchyFormatter } from '@density/lib-space-helpers';
import { DisplaySpaceHierarchyNode } from '@density/lib-space-helpers/types';
import AdminLocationsDetailModulesCountCalculation from '../admin-locations-detail-modules/count-calculation';


type AdminLocationsFormProps = {
  space_type: CoreSpace["space_type"],
  spaceHierarchy: Array<CoreSpaceHierarchyNode>,
  spaces: CoreSpace[],
  formState: AdminLocationsFormState,
  tagsCollection: { [key: string]: any },
  assignedTeamsCollection: { [key: string]: any },
  onChangeField: (string, any) => any,
  onSetDoorwayField?: (doorway_id: string, key: string, value: any) => any,
  operationType: 'CREATE' | 'UPDATE',
};

function RecursiveBreadcrumb({ spaces, id }: { spaces: CoreSpace[], id: string }) {
  const space = spaces.find(x => x.id === id);
  const parent = space ? spaces.find(x => x.id === space.parent_id) : null;
  return <Fragment>
    {parent ? <Fragment><RecursiveBreadcrumb spaces={spaces} id={parent.id} />&nbsp;{'>'}&nbsp;</Fragment> : null}
    {space ? space.name : null}
  </Fragment>
}

// A component that renders all the space management modules for the given space type
export function SpaceTypeForm({
  space_type,
  spaces,
  spaceHierarchy,
  formState,
  tagsCollection,
  assignedTeamsCollection,
  onChangeField,
  onSetDoorwayField,
  operationType,
}: AdminLocationsFormProps) {
  const [currentSection, setCurrentSection] = useState('General');
  const formattedHierarchy = spaceHierarchyFormatter(spaceHierarchy);

  // TODO: make space management use the new spaces collection
  const spacesMap = new Map<string, CoreSpace>(spaces.map(x => [x.id, x]));

  const MODULES = {
    generalInfo: (
      <AdminLocationsDetailModulesGeneralInfo
        space_type={space_type}
        formattedHierarchy={formattedHierarchy}
        formState={formState}
        onChangeField={onChangeField}
      />
    ),
    metadata: (
      <AdminLocationsDetailModulesMetadata
        space_type={space_type}
        formState={formState}
        onChangeField={onChangeField}
      />
    ),
    address: (
      <AdminLocationsDetailModulesAddress
        space_type={space_type}
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
        tags={formState.assigned_teams}
        tagsCollection={assignedTeamsCollection}
        onChangeTags={assigned_teams => onChangeField('assigned_teams', assigned_teams)}
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
    countCalculation: (
      <AdminLocationsDetailModulesCountCalculation
        value={formState.counting_mode}
        onChange={value => onChangeField('counting_mode', value)}
      />
    ),
    componentSpaces: (
      <AdminLocationsDetailModulesComponentSpaces
        countingMode={formState.counting_mode}
        spaces={spacesMap}
        formattedHierarchy={formattedHierarchy}
        selectedSpaces={formattedHierarchy.filter(x => formState.component_spaces.indexOf(x.space.id) > -1)}
        onChange={(items: DisplaySpaceHierarchyNode[]) => {
          onChangeField('component_spaces', items.map(x => x.space.id));
        }}
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
    campus: {
      'General': [
        MODULES.generalInfo,
        MODULES.dangerZone,
      ],
      'Operating Hours': [
        MODULES.operatingHours,
      ],
      'Doorway Mappings': [
        MODULES.doorways,
      ],
      'Address': [
        MODULES.address,
      ],
      'Tags and Teams': [
        MODULES.tags,
        MODULES.teams,
      ],
      'Data Settings': [
        MODULES.countCalculation,
        MODULES.componentSpaces,
      ],
    },
    building: {
      'General': [
        MODULES.generalInfo,
        MODULES.metadata,
        MODULES.dangerZone,
      ],
      'Operating Hours': [
        MODULES.operatingHours,
      ],
      'Doorway Mappings': [
        MODULES.doorways,
      ],
      'Address': [
        MODULES.address,
      ],
      'Tags and Teams': [
        MODULES.tags,
        MODULES.teams,
      ],
      'Data Settings': [
        MODULES.countCalculation,
        MODULES.componentSpaces,
      ],
    },
    floor: {
      'General': [
        MODULES.generalInfo,
        MODULES.dangerZone,
      ],
      'Operating Hours': [
        MODULES.operatingHours,
      ],
      'Doorway Mappings': [
        MODULES.doorways,
      ],
      'Tags and Teams': [
        MODULES.tags,
        MODULES.teams,
      ],
      'Data Settings': [
        MODULES.countCalculation,
        MODULES.componentSpaces,
      ],
    },
    space: {
      'General': [
        MODULES.generalInfo,
        MODULES.metadata,
        MODULES.dangerZone,
      ],
      'Operating Hours': [
        MODULES.operatingHours,
      ],
      'Doorway Mappings': [
        MODULES.doorways,
      ],
      'Tags and Teams': [
        MODULES.tags,
        MODULES.teams,
      ],
      'Data Settings': [
        MODULES.countCalculation,
        MODULES.componentSpaces,
      ],
    },
  };

  return (
    <div className={styles.moduleContainer}>
      <div className={styles.moduleLeftNav}>
        <div className={styles.moduleLeftNavHeader}>
          <div className={styles.moduleLeftNavTitle}>
            {formState.name || <span style={{color: colorVariables.gray400}}>New {SPACE_TYPE_TO_NAME[formState.space_type]}</span>}
          </div>
          {formState.parent_id ? 
            <div className={styles.moduleLeftNavBreadcrumb}>
              <RecursiveBreadcrumb spaces={spaces} id={formState.parent_id}/>
            </div> : null}
        </div>
        {Object.keys(MODULES_BY_SPACE_TYPE[space_type]).map((key, index) => (
          <div
            key={key}
            className={styles.moduleLink}
            style={{fontWeight: currentSection === key ? 'bold' : undefined}}
            onClick={() => setCurrentSection(key)}
          >
            {key}
            {currentSection === key ? <div className={styles.itemSelectedIndicator}></div> : undefined}
          </div>
        ))}
      </div>
      <div className={styles.moduleMainSection}>
        {Object.keys(MODULES_BY_SPACE_TYPE[space_type]).map((key, index) => (
          // Note: normally using the index would be not optimal as a key, but the order of these
          // modules in the array is stable / isn't going to change so I think it is preferrable to
          // adding an explicit key to each one.
          currentSection === key ? 
            <div key={key}>
              {MODULES_BY_SPACE_TYPE[space_type][key].map((module, index) => (
                <div key={index} className={styles.moduleWrapper}>
                  {module}
                </div>
              ))}
            </div> : null
        ))}
      </div>
    </div>
  );
}

type AdminLocationsEditProps = {
  spaceManagement: SpaceManagementState,
  selectedSpace: CoreSpace | undefined,

  tagsCollection: TagsState,
  assignedTeamsCollection: AssignedTeamsState,

  onChangeField: (string, any) => any,
  onSetDoorwayField: (doorway_id: string, key: string, value: any) => any,
  onSave: (space_id: string, spaceFieldUpdate: any) => any,
};

const SPACE_TYPE_TO_NAME = {
  campus: 'Campus',
  building: 'Building',
  floor: 'Floor',
  space: 'Space',
};

class AdminLocationsEdit extends Component<AdminLocationsEditProps, AdminLocationsFormState> {
  onSave = () => {
    if (this.props.selectedSpace && this.props.spaceManagement.spaces.selected) {
      const spaceFieldsToUpdate = {
        id: this.props.spaceManagement.spaces.selected,
        ...convertFormStateToSpaceFields(
          this.props.spaceManagement.formState,
          this.props.selectedSpace.space_type,
        ),
      };
      this.props.onSave(
        this.props.spaceManagement.spaces.selected,
        spaceFieldsToUpdate,
      );
    } else {
      throw new Error('No space is selected, cannot save space.');
    }
  }

  isFormComplete = () => {
    const formState = this.props.spaceManagement.formState;
    return (
      formState &&
      formState.name &&

      // Operating hours module valid
      formState.time_zone && formState.daily_reset && formState.operatingHours &&
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

    return selectedSpace ? (
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
                    Edit {SPACE_TYPE_TO_NAME[selectedSpace.space_type]}
                  </AppBarTitle>
                  <AppBarSection>
                    <ButtonGroup>
                      <Button
                        variant="underline"
                        disabled={spaceManagement.view.startsWith('LOADING')}
                        href={`#/admin/locations/${selectedSpace.id}`}
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
                  space_type={selectedSpace.space_type}
                  spaceHierarchy={spaceManagement.spaceHierarchy}
                  spaces={spaceManagement.spaces.data}
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
    ) : null;
  }
}

const ConnectedAdminLocationsEdit = () => {
  const dispatch = useRxDispatch();
  const spaceManagement = useRxStore(SpaceManagementStore);
  const tags = useRxStore(TagsStore);
  const assigned_teams = useRxStore(AssignedTeamsStore);

  const selectedSpace = spaceManagement.spaces.data.find(s => s.id === spaceManagement.spaces.selected)

  const onSave = async (space_id, spaceFieldUpdate) => {
    const ok = await collectionSpacesUpdate(dispatch, {
      ...spaceFieldUpdate,
      id: space_id,
    });

    dispatch(spaceManagementReset() as Any<FixInRefactor>);

    if (!ok) {
      showToast(dispatch, { type: 'error', text: 'Error updating space' });
      return false;
    }

    showToast(dispatch, { text: 'Space updated successfully' });
    // FIXME: just a little inline url swapping, what could go wrong...
    window.location.href = `#/admin/locations/${space_id}`;
  }
  const onChangeField = (key, value) => {
    dispatch(spaceManagementFormUpdate(key, value) as Any<FixInRefactor>);
  }
  const onSetDoorwayField = (doorway_id, field, value) => {
    dispatch(spaceManagementFormDoorwayUpdate(doorway_id, field, value) as Any<FixInRefactor>);
  }

  return (
    <AdminLocationsEdit
      tagsCollection={tags}
      assignedTeamsCollection={assigned_teams}
      spaceManagement={spaceManagement}
      selectedSpace={selectedSpace}

      onSave={onSave}
      onChangeField={onChangeField}
      onSetDoorwayField={onSetDoorwayField}
    />
  )
}

export default ConnectedAdminLocationsEdit;
