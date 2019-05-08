import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import GenericErrorState from '../generic-error-state/index';
import GenericLoadingState from '../generic-loading-state/index';
import {
  calculateInitialFormState,
  convertFormStateToSpaceFields,
  AdminLocationsFormState,

  AdminLocationsNoopForm,
  AdminLocationsCampusForm,
  AdminLocationsBuildingForm,
  AdminLocationsFloorForm,
  AdminLocationsSpaceForm,
} from '../admin-locations-edit/index';
import { DensityUser, DensitySpace } from '../../types';
import AdminLocationsDetailEmptyState from '../admin-locations-detail-empty-state/index';
import showToast from '../../actions/toasts';
import collectionSpacesCreate from '../../actions/collection/spaces/create';
import spaceManagementCreate from '../../actions/space-management/create';

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
  newSpaceParent: DensitySpace,
  newSpaceType: DensitySpace["spaceType"],
  spaces: {
    view: string,
    spaces: Array<DensitySpace>,
  },
  onSave: (
    spaceFields: any,
    spaceParentId: string | null,
    operatingHoursLog: Array<{action: string, [key: string]: any}>,
  ) => any,
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

    // There's a potential that the time segment groups are being loaded. If so, then wait for it to
    // load.
    if (AdminLocationsNewUnconnected.isReadyToCalculateFormState(props)) {
      this.state = calculateInitialFormState({
        parentId: props.newSpaceParent ? props.newSpaceParent.id : null,
        spaceType: props.newSpaceType,
      }, props.user, props.timeSegmentGroups.data);
    } else {
      this.state = { loaded: false };
    }
  }

  static isReadyToCalculateFormState(props) {
    return (
      props.timeSegmentGroups.view === 'VISIBLE' &&
      props.spaces.view === 'VISIBLE'
    );
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Once all data has been loaded, the determine the initial form state.
    if (!prevState.loaded && AdminLocationsNewUnconnected.isReadyToCalculateFormState(nextProps)) {
      return calculateInitialFormState({
        parentId: nextProps.newSpaceParent ? nextProps.newSpaceParent.id : null,
        spaceType: nextProps.newSpaceType,
      }, nextProps.user, nextProps.timeSegmentGroups.data);
    }
    return null;
  }

  onChangeField = (key, value) => {
    this.setState(s => ({...s, [key]: value}));
  }

  onSave = () => {
    const newSpaceFields = convertFormStateToSpaceFields(this.state, this.props.newSpaceType);
    this.props.onSave(
      newSpaceFields,
      this.props.newSpaceParent ? this.props.newSpaceParent.id : null,
      this.state.operatingHoursLog || [],
    );
  }


  render() {
    const { spaces, newSpaceType, newSpaceParent } = this.props;

    const FormComponent = {
      campus: AdminLocationsCampusForm,
      building: AdminLocationsBuildingForm,
      floor: AdminLocationsFloorForm,
      space: AdminLocationsSpaceForm,
    }[newSpaceType];

    if (!this.state.loaded) {
      return (
        <div className={styles.centered}>
          <GenericLoadingState />
        </div>
      );

    } else if (spaces.view === 'ERROR') {
      return (
        <div className={styles.centered}>
          <GenericErrorState />
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
                    <Button onClick={() => {
                      window.location.href = newSpaceParent ? `#/admin/locations/${newSpaceParent.id}` : '#/admin/locations';
                    }}>Cancel</Button>
                  </ButtonContext.Provider>
                  <Button
                    type="primary"
                    onClick={this.onSave}
                    disabled={spaces.view === 'LOADING'}
                  >Save</Button>
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
          </AppPane>
        </AppFrame>
      );
    }
  }
};

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    user: state.user,
    timeSegmentGroups: state.timeSegmentGroups,

    // Figure out the type of the new space, and its parent
    newSpaceType: state.miscellaneous.adminLocationsNewSpaceType,
    newSpaceParent: state.spaces.data.find(
      space => space.id === state.miscellaneous.adminLocationsNewSpaceParentId
    ),
  };
}, (dispatch: any) => {
  return {
    async onSave(space, parentSpaceId, operatingHoursLog) {
      const ok = await dispatch(spaceManagementCreate(space, operatingHoursLog));
      if (ok) {
        window.location.href = `#/admin/locations/${parentSpaceId || ''}`;
      }
    }
  };
})(AdminLocationsNewUnconnected);
