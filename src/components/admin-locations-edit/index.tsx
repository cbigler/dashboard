import React, { ReactNode, Fragment, Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import styles from './styles.module.scss';

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


function calculateEmptyFormState(props): AdminLocationsEditState {
  return {
    loaded: true,

    // General information module
    name: props.selectedSpace.name,
    spaceType: props.selectedSpace.spaceType,
    'function': props.selectedSpace['function'] || null,

    // Metadata module
    rentAnnual: props.selectedSpace.rentAnnual || '',
    size: props.selectedSpace.size || '',
    sizeUnit: props.selectedSpace.sizeUnit || 'feet',
    currency: props.selectedSpace.currency || 'USD',
    capacity: props.selectedSpace.capacity || '',
    targetCapacity: props.selectedSpace.targetCapacity || '',
    levelNumber: props.selectedSpace.levelNumber || '',

    // Address module
    address: props.selectedSpace.address || '',
    coordinates: props.selectedSpace.latitude && props.selectedSpace.longitude ? (
      [props.selectedSpace.latitude, props.selectedSpace.longitude]
    ) : null,

    // Operating hours module
    timeZone: props.selectedSpace.timeZone || moment.tz.guess(), // Guess the time zone
    dailyReset: props.selectedSpace.dailyReset || '04:00',
  };
}

type AdminLocationsEditProps = {
  selectedSpace: DensitySpace,
  spaces: {
    view: string,
    spaces: Array<DensitySpace>,
  },
};

type AdminLocationsEditState = {
  loaded: boolean,

  name: string,
  spaceType: string,
  'function': string,
  rentAnnual: any,
  size: any,
  sizeUnit: 'feet' | 'meters',
  currency: 'USD',
  capacity: string,
  targetCapacity: string,
  levelNumber: string,
  address: string,
  coordinates: [number, number] | null,
  timeZone: string,
  dailyReset: string | null,
};

class AdminLocationsEdit extends Component<any, any> {
  constructor(props) {
    super(props);
    

    // There's a potential that the spaces are being loaded. If so, then wait for it to load.
    if (this.props.spaces.view === 'VISIBLE' && this.props.selectedSpace) {
      this.state = calculateEmptyFormState(props);
    } else {
      this.state = { loaded: false };
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // If the form has not been loaded
    if (nextProps.spaces.view === 'VISIBLE' && nextProps.selectedSpace && !prevState.loaded) {
      return calculateEmptyFormState(nextProps);
    }
    return null;
  }

  onChangeField = (key, value) => {
    this.setState({[key]: value});
  }

  render() {
    const { spaces, selectedSpace } = this.props;

    const EditComponent = {
      campus: AdminLocationsCampusEdit,
      building: AdminLocationsBuildingEdit,
      floor: AdminLocationsFloorEdit,
      space: AdminLocationsSpaceEdit,
      [null as any]: AdminLocationsNoopEdit,
    }[selectedSpace ? selectedSpace.spaceType : null];

    return (
      <div className={styles.adminLocationsEdit}>
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
            <EditComponent
              space={selectedSpace}
              formState={this.state}
              onChangeField={this.onChangeField}
            />
          </Fragment>
        ) : null}
      </div>
    );
  }
}

// Props that all the below "edit pages" take
type AdminLocationsEditSpaceTypeProps = {
  space: DensitySpace,
  formState: { [key: string]: any },
  onChangeField: (string, any) => any,
};

function AdminLocationsNoopEdit(props: AdminLocationsEditSpaceTypeProps) { return null; }

function AdminLocationsCampusEdit({space, formState, onChangeField}: AdminLocationsEditSpaceTypeProps) {
  return (
    <div className={styles.moduleContainer}>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesGeneralInfo
          space={space}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesMetadata
          space={space}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesOperatingHours
          space={space}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesDangerZone
          space={space}
          onDeleteSpace={() => console.log('TODO: ADD DELETE LOGIC')}
        />
      </div>
    </div>
  );
}

function AdminLocationsBuildingEdit({space, formState, onChangeField}: AdminLocationsEditSpaceTypeProps) {
  return (
    <div className={styles.moduleContainer}>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesGeneralInfo
          space={space}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesAddress
          space={space}
          address={formState.address}
          coordinates={formState.coordinates}
          onChangeAddress={address => onChangeField('address', address)}
          onChangeCoordinates={coordinates => onChangeField('coordinates', coordinates)}
        />
      </div>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesMetadata
          space={space}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesOperatingHours
          space={space}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesDangerZone
          space={space}
          onDeleteSpace={() => console.log('TODO: ADD DELETE LOGIC')}
        />
      </div>
    </div>
  );
}

function AdminLocationsFloorEdit({space, formState, onChangeField}: AdminLocationsEditSpaceTypeProps) {
  return (
    <div className={styles.moduleContainer}>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesGeneralInfo
          space={space}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesMetadata
          space={space}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesOperatingHours
          space={space}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesDangerZone
          space={space}
          onDeleteSpace={() => console.log('TODO: ADD DELETE LOGIC')}
        />
      </div>
    </div>
  );
}

function AdminLocationsSpaceEdit({space, formState, onChangeField}: AdminLocationsEditSpaceTypeProps) {
  return (
    <div className={styles.moduleContainer}>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesGeneralInfo
          space={space}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesMetadata
          space={space}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesOperatingHours
          space={space}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesDangerZone
          space={space}
          onDeleteSpace={() => console.log('TODO: ADD DELETE LOGIC')}
        />
      </div>
    </div>
  );
}


export default connect((state: any) => {
  return {
    spaces: state.spaces,
    selectedSpace: state.spaces.data.find(space => state.spaces.selected === space.id),
  };
}, (dispatch: any) => {
  return {
  };
})(AdminLocationsEdit);
