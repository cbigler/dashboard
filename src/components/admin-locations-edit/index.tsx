import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';

import Module, { SpaceFieldRenderer } from '../admin-locations-detail-modules/index';

import { InputBox } from '@density/ui';


function calculateEmptyFormState(props) {
  return {
    loaded: true,
    generalInformation: SPACE_TYPE_INFO_FIELDS[props.selectedSpace.spaceType].reduce((acc, value) => ({
      ...acc,
      [value.id]: value.initialValue(props.selectedSpace),
    }), {}),
    metadata: SPACE_TYPE_METADATA_FIELDS[props.selectedSpace.spaceType].reduce((acc, value) => ({
      ...acc,
      [value.id]: value.initialValue(props.selectedSpace),
    }), {}),
  };
}

const SPACE_FIELDS = {
  SPACE_NAME: {
    id: 'name',
    label: 'Name',
    initialValue: space => space.name,
    component: (id, value, onChangeValue) => (
      <InputBox
        type="text"
        id={id}
        value={value}
        onChange={e => onChangeValue(e.target.value)}
        width="100%"
      />
    ),
  },
  SPACE_TYPE: {
    id: 'spaceType',
    label: 'Space type',
    initialValue: space => space.spaceType,
    component: (id, value, onChangeValue) => (
      <InputBox
        type="select"
        choices={[
          {id: 'campus', label: 'Campus'},
          {id: 'building', label: 'Building'},
          {id: 'floor', label: 'Floor'},
          {id: 'space', label: 'Space'},
        ]}
        id={id}
        disabled={true}
        value={value}
        onChange={e => onChangeValue(e.target.value)}
        width="100%"
      />
    ),
  },
  SPACE_FUNCTION: {
    id: 'function',
    label: 'Space function',
    initialValue: space => space['function'],
    component: (id, value, onChangeValue) => (
      <InputBox
        type="select"
        choices={[
          {id: 'conference_room', label: 'Conference Room'},
          {id: 'meeting_room', label: 'Meeting Room'},
        ]}
        id={id}
        value={value}
        onChange={e => onChangeValue(e.id)}
        width="100%"
      />
    ),
  },
  LEVEL_NUMBER: {
    id: 'number',
    label: 'Level Number',
    initialValue: space => space.floorNumber,
    component: (id, value, onChangeValue) => (
      <InputBox
        type="number"
        leftIcon={<strong>Level</strong>}
        id={id}
        value={value}
        onChange={e => onChangeValue(e.id)}
        width="100%"
      />
    ),
  },
  RENT_ANNUAL: {
    id: 'rent',
    label: 'Rent (annual)',
    initialValue: space => space.capacity ? space.capacity.toString() : '',
    component: (id, value, onChangeValue) => (
      <InputBox
        type="number"
        id={id}
        value={value}
        onChange={e => onChangeValue(e.target.value)}
        leftIcon={<span>$</span>}
        width="100%"
      />
    ),
  },
  SIZE_SQ_FT: {
    id: 'size',
    label: 'Size (sq ft)',
    initialValue: space => 'HARDCODED',
    component: (id, value, onChangeValue) => (
      <InputBox
        type="number"
        id={id}
        value={value}
        onChange={e => onChangeValue(e.target.value)}
        width="100%"
      />
    ),
  },
  CAPACITY: {
    id: 'capacity',
    label: 'Capacity',
    initialValue: space => space.capacity ? space.capacity.toString() : '',
    component: (id, value, onChangeValue) => (
      <InputBox
        type="number"
        id={id}
        value={value}
        onChange={e => onChangeValue(e.target.value)}
        width="100%"
      />
    ),
  },
  SEAT_ASSIGNMENTS: {
    id: 'seatAssignments',
    label: 'Seat Assignments',
    initialValue: space => 'HARDCODED',
    component: (id, value, onChangeValue) => (
      <InputBox
        type="number"
        id={id}
        value={value}
        onChange={e => onChangeValue(e.target.value)}
        width="100%"
      />
    ),
  },
};

const SPACE_TYPE_INFO_FIELDS = {
  campus: [
    SPACE_FIELDS.SPACE_NAME,
    SPACE_FIELDS.SPACE_TYPE,
  ],
  building: [
    SPACE_FIELDS.SPACE_NAME,
    SPACE_FIELDS.SPACE_TYPE,
    SPACE_FIELDS.SPACE_FUNCTION,
  ],
  floor: [
    SPACE_FIELDS.LEVEL_NUMBER,
    SPACE_FIELDS.SPACE_TYPE,
    SPACE_FIELDS.SPACE_FUNCTION,
  ],
  space: [
    SPACE_FIELDS.SPACE_NAME,
    SPACE_FIELDS.SPACE_TYPE,
    SPACE_FIELDS.SPACE_FUNCTION,
  ],
};

const SPACE_TYPE_METADATA_FIELDS = {
  campus: [],
  building: [
    SPACE_FIELDS.RENT_ANNUAL,
    SPACE_FIELDS.SIZE_SQ_FT,
    SPACE_FIELDS.CAPACITY,
    SPACE_FIELDS.SEAT_ASSIGNMENTS,
  ],
  floor: [
    SPACE_FIELDS.SIZE_SQ_FT,
    SPACE_FIELDS.SEAT_ASSIGNMENTS,
    SPACE_FIELDS.CAPACITY,
  ],
  space: [
    SPACE_FIELDS.SIZE_SQ_FT,
    SPACE_FIELDS.SEAT_ASSIGNMENTS,
    SPACE_FIELDS.CAPACITY,
  ],
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

  render() {
    const { spaces, selectedSpace } = this.props;
    return (
      <div className={styles.adminLocationsEdit}>
        {spaces.view === 'LOADING' ? (
          <p>need to make a loading state</p>
        ) : null}
        {selectedSpace && spaces.view === 'VISIBLE' ? (
          <Fragment>
            <Module title="General Info">
              <SpaceFieldRenderer
                space={this.props.selectedSpace}
                displayedFields={SPACE_TYPE_INFO_FIELDS[selectedSpace.spaceType] || []}
                state={this.state.generalInformation}
                onChangeField={(key, value) => this.setState(s => ({
                  ...s,
                  generalInformation: { ...s.generalInformation, [key]: value },
                }))}
              />
            </Module>
            <Module title="Meta">
              <SpaceFieldRenderer
                space={this.props.selectedSpace}
                displayedFields={SPACE_TYPE_METADATA_FIELDS[selectedSpace.spaceType] || []}
                state={this.state.metadata}
                onChangeField={(key, value) => this.setState(s => ({
                  ...s,
                  metadata: { ...s.metadata, [key]: value },
                }))}
              />
            </Module>
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
})(AdminLocationsEdit);
