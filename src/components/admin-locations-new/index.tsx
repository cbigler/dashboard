import React, { Component, Fragment } from 'react';
import styles from './styles.module.scss';
import GenericErrorState from '../generic-error-state/index';
import GenericLoadingState from '../generic-loading-state/index';
import { SpaceTypeForm } from '../admin-locations-edit/index';
import SpaceManagementStore, { AdminLocationsFormState, convertFormStateToSpaceFields } from '../../rx-stores/space-management';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import AdminLocationsDetailEmptyState from '../admin-locations-detail-empty-state/index';
import { showToast } from '../../rx-actions/toasts';
import collectionSpacesCreate from '../../rx-actions/collection/spaces-legacy/create';
import spaceManagementReset from '../../rx-actions/space-management/reset';
import spaceManagementFormUpdate from '../../rx-actions/space-management/form-update';
import spaceManagementFormDoorwayUpdate from '../../rx-actions/space-management/form-doorway-update';

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
import UserStore from '../../rx-stores/user';
import TagsStore, { TagsState } from '../../rx-stores/tags';
import AssignedTeamsStore, { AssignedTeamsState } from '../../rx-stores/assigned-teams';
import useRxDispatch from '../../helpers/use-rx-dispatch';

type AdminLocationsNewProps = {
  user: any,
  spaceManagement: any,
  tagsCollection: TagsState,
  assignedTeamsCollection: AssignedTeamsState,
  newSpaceParent: CoreSpace | undefined,
  newSpaceType: CoreSpace['space_type'],
  onChangeField: (string, any) => any,
  onSetDoorwayField: (doorway_id: string, key: string, value: any) => any,
  onSave: (spaceFields: any, spaceParentId: string | null) => any,
};

const SPACE_TYPE_TO_NAME = {
  campus: 'Campus',
  building: 'Building',
  floor: 'Floor',
  space: 'Space',
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
      formState.time_zone && formState.daily_reset && formState.operatingHours &&
      formState.operatingHours.filter(i => i.label === null).length === 0
    );
  }

  render() {
    const { spaceManagement, newSpaceType, newSpaceParent, onSetDoorwayField } = this.props;

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
              {!ALLOWED_SUB_SPACE_TYPES[newSpaceParent ? newSpaceParent.space_type : 'root'].includes(newSpaceType) ? (
                <AdminLocationsDetailEmptyState
                  text={`
                  A new ${SPACE_TYPE_TO_NAME[newSpaceType].toLowerCase()} cannot be placed within the
                  ${newSpaceParent ?
                    `${SPACE_TYPE_TO_NAME[newSpaceParent.space_type].toLowerCase()} ${newSpaceParent.name}` :
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
                    <ButtonGroup>
                      <Button
                        variant="underline"
                        disabled={spaceManagement.view.startsWith('LOADING')}
                        href={newSpaceParent ? `#/admin/locations/${newSpaceParent.id}` : '#/admin/locations'}
                      >Cancel</Button>
                      <Button
                        variant="filled"
                        type="primary"
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
                  space_type={newSpaceType}
                  spaces={this.props.spaceManagement.spaces.data}
                  spaceHierarchy={this.props.spaceManagement.spaceHierarchy}
                  formState={this.props.spaceManagement.formState}
                  tagsCollection={this.props.tagsCollection}
                  assignedTeamsCollection={this.props.assignedTeamsCollection}
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


const ConnectedAdminLocationsNew = () => {
  const dispatch = useRxDispatch();
  const user = useRxStore(UserStore);
  const spaceManagement = useRxStore(SpaceManagementStore);
  const tags = useRxStore(TagsStore);
  const assigned_teams = useRxStore(AssignedTeamsStore);

  // Figure out the type of the new space, and its parent
  const newSpaceType = spaceManagement.formSpaceType;
  const newSpaceParent = spaceManagement.spaces.data.find(s => s.id === spaceManagement.formParentSpaceId)

  const onSave = async (space, parentSpaceId) => {
    const newSpace = await collectionSpacesCreate(dispatch, space);
    if (!newSpace) {
      showToast(dispatch, { type: 'error', text: 'Error creating space' });
      dispatch(spaceManagementReset() as Any<FixInRefactor>);
      return false;
    }

    showToast(dispatch, { text: 'Space created!' });
    // FIXME: this seems like a bad idea to have this just chilling in this callback
    window.location.href = `#/admin/locations/${parentSpaceId || ''}`;
  }
  const onChangeField = (key, value) => {
    dispatch(spaceManagementFormUpdate(key, value) as Any<FixInRefactor>);
  }
  const onSetDoorwayField = (doorway_id, field, value) => {
    dispatch(spaceManagementFormDoorwayUpdate(doorway_id, field, value) as Any<FixInRefactor>);
  }

  return (
    <AdminLocationsNewUnconnected
      user={user}
      assignedTeamsCollection={assigned_teams}
      tagsCollection={tags}
      spaceManagement={spaceManagement}
      newSpaceType={newSpaceType}
      newSpaceParent={newSpaceParent}

      onSave={onSave}
      onChangeField={onChangeField}
      onSetDoorwayField={onSetDoorwayField}
    />
  )
}

export default ConnectedAdminLocationsNew;
