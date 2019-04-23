import React, { ReactNode, Fragment, Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import styles from './styles.module.scss';
import GenericErrorState from '../generic-error-state/index';
import GenericLoadingState from '../generic-loading-state/index';

import Dialogger from '../dialogger';

import { DensitySpace } from '../../types';

import {
  AdminLocationsDetailModulesGeneralInfo,
  AdminLocationsDetailModulesMetadata,
  AdminLocationsDetailModulesAddress,
  AdminLocationsDetailModulesDangerZone,
  AdminLocationsDetailModulesOperatingHours,
} from '../admin-locations-detail-modules/index';

import {
  AppBar,
  AppBarTitle,
  AppBarSection,
  InputBox,
  ButtonContext,
  Button,
  Icons,
} from '@density/ui';


function calculateEmptyFormState(space): AdminLocationsFormState {
  return {
    loaded: true,

    // General information module
    name: space.name,
    spaceType: space.spaceType,
    'function': space['function'] || null,

    // Metadata module
    annualRent: space.annualRent || '',
    sizeArea: space.sizeArea || '',
    sizeAreaUnit: space.sizeAreaUnit || 'feet',
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
};

type AdminLocationsFormState = {
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

class AdminLocationsForm extends Component<AdminLocationsFormProps, AdminLocationsFormState> {
  constructor(props) {
    super(props);

    // There's a potential that the spaces are being loaded. If so, then wait for it to load.
    if (props.spaces.view === 'VISIBLE' && props.selectedSpace) {
      this.state = calculateEmptyFormState(props.selectedSpace);
    } else {
      this.state = { loaded: false };
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // If the form has not been loaded
    if (nextProps.spaces.view === 'VISIBLE' && nextProps.selectedSpace && !prevState.loaded) {
      return calculateEmptyFormState(nextProps.selectedSpace);
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
                  Edit {{
                    campus: 'Campus',
                    building: 'Building',
                    floor: 'Level',
                    space: 'Room',
                  }[selectedSpace.spaceType]}
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
    selectedSpace: state.spaces.data.find(space => state.spaces.selected === space.id),
  };
}, (dispatch: any) => {
  return {
  };
})(AdminLocationsForm);



type AdminLocationsNewProps = {
  newSpaceParent: DensitySpace,
  newSpaceType: DensitySpace["spaceType"],
  spaces: {
    view: string,
    spaces: Array<DensitySpace>,
  },
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
    this.state = calculateEmptyFormState({spaceType: props.newSpaceType});
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
          <p>Need better state here: this space type is not allowed to be made within the selected space</p>
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
                New {{
                  campus: 'Campus',
                  building: 'Building',
                  floor: 'Level',
                  space: 'Room',
                }[newSpaceType]}
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
}

export const AdminLocationsNew = connect((state: any) => {
  return {
    spaces: state.spaces,
    newSpaceType: state.miscellaneous.adminLocationsNewSpaceType,
    newSpaceParent: state.spaces.data.find(
      space => space.id === state.miscellaneous.adminLocationsNewSpaceParentId
    ),
  };
}, (dispatch: any) => {
  return {
  };
})(AdminLocationsNewUnconnected);


// Props that all the below "edit pages" take
type AdminLocationsFormSpaceTypeProps = {
  spaceType: DensitySpace["spaceType"],
  formState: { [key: string]: any },
  onChangeField: (string, any) => any,
  operationType: 'CREATE' | 'UPDATE',
};

function AdminLocationsNoopForm(props: AdminLocationsFormSpaceTypeProps) { return null; }

function AdminLocationsCampusForm({spaceType, formState, onChangeField, operationType}: AdminLocationsFormSpaceTypeProps) {
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

function AdminLocationsBuildingForm({spaceType, formState, onChangeField, operationType}: AdminLocationsFormSpaceTypeProps) {
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

function AdminLocationsFloorForm({spaceType, formState, onChangeField, operationType}: AdminLocationsFormSpaceTypeProps) {
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

function AdminLocationsSpaceForm({spaceType, formState, onChangeField, operationType}: AdminLocationsFormSpaceTypeProps) {
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
