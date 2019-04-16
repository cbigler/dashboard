import React, { ReactNode, Fragment, Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';

import { DensitySpace } from '../../types';

import {
  AdminLocationsDetailModulesGeneralInfo,
  AdminLocationsDetailModulesMetadata,
  AdminLocationsDetailModulesAddress,
} from '../admin-locations-detail-modules/index';

import {
  AppBar,
  AppBarTitle,
  AppBarSection,
  InputBox,
  ButtonContext,
  Button,
} from '@density/ui';


function calculateEmptyFormState(props) {
  return {
    loaded: true,
    name: props.selectedSpace.name,
    spaceType: props.selectedSpace.spaceType,
    'function': props.selectedSpace['function'],
    rentAnnual: props.selectedSpace.rentAnnual,
    size: props.selectedSpace.size,
    capacity: props.selectedSpace.capacity,
    seatAssignments: props.selectedSpace.seatAssignments,
  };
}

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

    let EditComponent = {
      campus: AdminLocationsCampusEdit,
      building: AdminLocationsBuildingEdit,
      floor: AdminLocationsFloorEdit,
      space: AdminLocationsSpaceEdit,
      [null as any]: AdminLocationsNoopEdit,
    }[selectedSpace ? selectedSpace.spaceType : null];

    return (
      <div className={styles.adminLocationsEdit}>
        {spaces.view === 'LOADING' ? (
          <p>need to make a loading state</p>
        ) : null}
        {selectedSpace && spaces.view === 'VISIBLE' ? (
          <Fragment>
            <div className={styles.appBarWrapper}>
              <AppBar>
                <AppBarTitle>
                  Edit {selectedSpace.spaceType[0].toUpperCase()}{selectedSpace.spaceType.slice(1)}
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
        TODO: add campus modules
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
        <AdminLocationsDetailModulesMetadata
          space={space}
          formState={formState}
          onChangeField={onChangeField}
        />
      </div>
      <div className={styles.moduleWrapper}>
        <AdminLocationsDetailModulesAddress
          address={formState.address}
          coordinates={formState.coordinates}
          onChangeAddress={address => onChangeField('address', address)}
          onChangeCoordinates={coordinates => onChangeField('coordinates', coordinates)}
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
        TODO: add floor modules
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
        TODO: add space modules
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
