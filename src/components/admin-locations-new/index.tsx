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
import Toaster from '../toaster';
import showToast from '../../actions/toasts';
import collectionSpacesCreate from '../../actions/collection/spaces/create';
import { convertFormStateToSpaceFields } from '../admin-locations-edit/index';

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
  constructor(props) {
    super(props);
    this.state = calculateInitialFormState({
      parentId: props.newSpaceParent ? props.newSpaceParent.id : null,
      spaceType: props.newSpaceType,
    }, props.user);
  }

  onChangeField = (key, value) => {
    this.setState(s => ({...s, [key]: value}));
  }

  onSave = () => {
    const newSpaceFields = convertFormStateToSpaceFields(this.state, this.props.newSpaceType);
    this.props.onSave(newSpaceFields, this.props.newSpaceParent ? this.props.newSpaceParent.id : null);
  }


  render() {
    const { spaces, newSpaceType, newSpaceParent } = this.props;

    const FormComponent = {
      campus: AdminLocationsCampusForm,
      building: AdminLocationsBuildingForm,
      floor: AdminLocationsFloorForm,
      space: AdminLocationsSpaceForm,
    }[newSpaceType];

    // NOTE: there's no top level loading state in this component. This is because this view doesn't
    // have to load initially (there's no space data to display when making a new space) and when
    // saving the space at the end of the process, we have to show a different special loading state
    // anyway.

    if (spaces.view === 'ERROR') {
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
            <Dialogger />
            <Toaster />

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
                      disabled={spaces.view === 'LOADING'}
                      onClick={() => {
                        window.location.href = newSpaceParent ? `#/admin/locations/${newSpaceParent.id}` : '#/admin/locations';
                      }}
                    >Cancel</Button>
                  </ButtonContext.Provider>
                  <Button
                    type="primary"
                    disabled={spaces.view === 'LOADING'}
                    onClick={this.onSave}
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

    // Figure out the type of the new space, and its parent
    newSpaceType: state.miscellaneous.adminLocationsNewSpaceType,
    newSpaceParent: state.spaces.data.find(
      space => space.id === state.miscellaneous.adminLocationsNewSpaceParentId
    ),
  };
}, (dispatch: any) => {
  return {
    async onSave(space, parentSpaceId) {
      const ok = await dispatch(collectionSpacesCreate(space));
      if (ok) {
        dispatch(showToast({ text: 'Space created!' }));
      } else {
        dispatch(showToast({ type: 'error', text: 'Error creating space' }));
      }
      window.location.href = `#/admin/locations/${parentSpaceId || ''}`;
    }
  };
})(AdminLocationsNewUnconnected);
