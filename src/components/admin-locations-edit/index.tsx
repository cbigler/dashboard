import React, { ReactNode, Fragment, Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import styles from './styles.module.scss';
import GenericErrorState from '../generic-error-state/index';
import GenericLoadingState from '../generic-loading-state/index';

import Dialogger from '../dialogger';

import { DensityUser, DensitySpace } from '../../types';

import { SQUARE_FEET } from '../../helpers/convert-unit/index';

import {
  AdminLocationsDetailModulesGeneralInfo,
  AdminLocationsDetailModulesMetadata,
  AdminLocationsDetailModulesAddress,
  AdminLocationsDetailModulesDangerZone,
  AdminLocationsDetailModulesOperatingHours,
} from '../admin-locations-detail-modules/index';
import AdminLocationsDetailEmptyState from '../admin-locations-detail-empty-state/index';

import {
  AppBar,
  AppBarTitle,
  AppBarSection,
  InputBox,
  ButtonContext,
  Button,
  Icons,
} from '@density/ui';

// Given a space and the currently logged in user, return the initial state of eitehr the edit or
// new form.
export function calculateInitialFormState(space, user): AdminLocationsFormState {
  return {
    loaded: true,

    // General information module
    name: space.name,
    spaceType: space.spaceType,
    'function': space['function'] || null,

    // Metadata module
    annualRent: space.annualRent || '',
    sizeArea: space.sizeArea || '',
    sizeAreaUnit: space.sizeAreaUnit || user.data.sizeAreaUnitDefault || SQUARE_FEET,
    currencyUnit: space.currencyUnit || 'USD',
    capacity: space.capacity || '',
    targetCapacity: space.targetCapacity || '',
    levelNumber: space.levelNumber || '',

    // Address module
    address: space.address || '',
    coordinates: space.latitude && space.longitude ? (
      [space.latitude, space.longitude]
    ) : null,

    // Operating hours module
    timeZone: space.timeZone || moment.tz.guess(), // Guess the time zone
    dailyReset: space.dailyReset || '04:00',
  };
}

type AdminLocationsFormProps = {
  selectedSpace: DensitySpace,
  spaces: {
    view: string,
    spaces: Array<DensitySpace>,
  },
  user: {
    data: DensityUser,
  },
};

export type AdminLocationsFormState = {
  loaded: boolean,

  name?: string,
  spaceType?: string,
  'function'?: string,
  annualRent?: any,
  sizeArea?: any,
  sizeAreaUnit?: 'feet' | 'meters',
  currencyUnit?: 'USD',
  capacity?: string,
  targetCapacity?: string,
  levelNumber?: string,
  address?: string,
  coordinates?: [number, number] | null,
  timeZone?: string,
  dailyReset?: string | null,
};

const SPACE_TYPE_TO_NAME = {
  campus: 'Campus',
  building: 'Building',
  floor: 'Level',
  space: 'Room',
};

class AdminLocationsForm extends Component<AdminLocationsFormProps, AdminLocationsFormState> {
  constructor(props) {
    super(props);

    // There's a potential that the space is being loaded. If so, then wait for it to load.
    if (props.spaces.view === 'VISIBLE' && props.selectedSpace) {
      this.state = calculateInitialFormState(props.selectedSpace, props.user);
    } else {
      this.state = { loaded: false };
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // If the space had not been loaded and was just recently loaded, then figure out the initial
    // form state using the recently loaded space.
    if (nextProps.spaces.view === 'VISIBLE' && nextProps.selectedSpace && !prevState.loaded) {
      return calculateInitialFormState(nextProps.selectedSpace, nextProps.user);
    }
    return null;
  }

  onChangeField = (key, value) => {
    this.setState(s => ({...s, [key]: value}));
  }

  render() {
    const { spaces, selectedSpace } = this.props;

    const FormComponent = {
      campus: AdminLocationsCampusForm,
      building: AdminLocationsBuildingForm,
      floor: AdminLocationsFloorForm,
      space: AdminLocationsSpaceForm,
      unknown: AdminLocationsNoopForm,
    }[selectedSpace ? selectedSpace.spaceType : 'unknown'];

    return (
      <div className={styles.adminLocationsForm}>
        <Dialogger />

        {spaces.view === 'LOADING' ? (
          <p>need to make a loading state</p>
        ) : null}
        {selectedSpace && spaces.view === 'VISIBLE' ? (
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
                    <Button onClick={() => {
                      window.location.href = `#/admin/locations/${selectedSpace.id}`;
                    }}>Cancel</Button>
                  </ButtonContext.Provider>
                  <Button type="primary">Save</Button>
                </AppBarSection>
              </AppBar>
            </div>

            {/* All the space type components take the same props */}
            <FormComponent
              spaceType={selectedSpace.spaceType}
              formState={this.state}
              operationType="UPDATE"
              onChangeField={this.onChangeField}
            />
          </Fragment>
        ) : null}
      </div>
    );
  }
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    user: state.user,
    selectedSpace: state.spaces.data.find(space => state.spaces.selected === space.id),
  };
}, (dispatch: any) => {
  return {
  };
})(AdminLocationsForm);



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

// Props that all the below forms take
type AdminLocationsFormSpaceTypeProps = {
  spaceType: DensitySpace["spaceType"],
  formState: { [key: string]: any },
  onChangeField: (string, any) => any,
  operationType: 'CREATE' | 'UPDATE',
};

// NOTE: all the below forms are rendered both when creating a new instance and editing an
// existing instance of a space. Therefore, a space is not specified as when the form is rendered
// for the "new" state no space exists yet.
export function AdminLocationsNoopForm(props: AdminLocationsFormSpaceTypeProps) { return null; }

export function AdminLocationsCampusForm({
  spaceType,
  formState,
  onChangeField,
  operationType,
}: AdminLocationsFormSpaceTypeProps) {
  return (
    <div className={styles.moduleContainer}>
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
        <AdminLocationsDetailModulesMetadata
          spaceType={spaceType}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      {operationType === 'UPDATE' ? (
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesDangerZone
            onDeleteSpace={() => console.log('TODO: ADD DELETE LOGIC')}
          />
        </div>
      ) : null}
    </div>
  );
}

export function AdminLocationsBuildingForm({
  spaceType,
  formState,
  onChangeField,
  operationType,
}: AdminLocationsFormSpaceTypeProps) {
  return (
    <div className={styles.moduleContainer}>
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
        <AdminLocationsDetailModulesMetadata
          spaceType={spaceType}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      {operationType === 'UPDATE' ? (
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesDangerZone
            onDeleteSpace={() => console.log('TODO: ADD DELETE LOGIC')}
          />
        </div>
      ) : null}
    </div>
  );
}

export function AdminLocationsFloorForm({
  spaceType,
  formState,
  onChangeField,
  operationType,
}: AdminLocationsFormSpaceTypeProps) {
  return (
    <div className={styles.moduleContainer}>
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
      {operationType === 'UPDATE' ? (
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesDangerZone
            onDeleteSpace={() => console.log('TODO: ADD DELETE LOGIC')}
          />
        </div>
      ) : null}
    </div>
  );
}

export function AdminLocationsSpaceForm({
  spaceType,
  formState,
  onChangeField,
  operationType,
}: AdminLocationsFormSpaceTypeProps) {
  return (
    <div className={styles.moduleContainer}>
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
      {operationType === 'UPDATE' ? (
        <div className={styles.moduleWrapper}>
          <AdminLocationsDetailModulesDangerZone
            onDeleteSpace={() => console.log('TODO: ADD DELETE LOGIC')}
          />
        </div>
      ) : null}
    </div>
  );
}
