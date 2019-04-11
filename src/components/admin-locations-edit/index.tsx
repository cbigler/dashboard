import React, { ReactNode, Fragment, Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';

import Module, { SpaceFieldRenderer } from '../admin-locations-detail-modules/index';

import {
  AppBar,
  AppBarTitle,
  AppBarSection,
  InputBox,
  ButtonContext,
  Button,
} from '@density/ui';


function calculateEmptyFormState(props) {
  const formState = {};
  for (let key in SPACE_FIELDS) {
    formState[SPACE_FIELDS[key].id] = SPACE_FIELDS[key].initialValue(props.selectedSpace);
  }
  return { loaded: true, ...formState };
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
    initialValue: space => 99999999,
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
    initialValue: space => 99999999,
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
    initialValue: space => 99999999,
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

    let content: ReactNode = null;
    switch (selectedSpace ? selectedSpace.spaceType : null) {
    case 'campus':
      content = (
        null
      );
      break;
    case 'building':
      content = (
        <AdminLocationsBuildingEdit
          space={selectedSpace}
          formState={this.state}
          onChangeField={this.onChangeField}
        />
      );
      break;
    case 'floor':
      content = (
        null
      );
      break;
    case 'space':
      content = (
        null
      );
      break;
    case null:
    default:
      content = (
        null
      );
      break;
    }

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
            {content}
          </Fragment>
        ) : null}
      </div>
    );
  }
}

function AdminLocationsBuildingEdit({space, formState, onChangeField}) {
  return (
    <div className={styles.moduleContainer}>
      <div className={styles.moduleWrapper}>
        <Module title="General Info">
          <SpaceFieldRenderer
            space={space}
            displayedFields={[
              SPACE_FIELDS.SPACE_NAME,
              SPACE_FIELDS.SPACE_TYPE,
              SPACE_FIELDS.SPACE_FUNCTION,
            ]}
            state={formState}
            onChangeField={onChangeField}
          />
        </Module>
      </div>
      <div className={styles.moduleWrapper}>
        <Module title="Meta">
          <SpaceFieldRenderer
            space={space}
            displayedFields={[
              SPACE_FIELDS.RENT_ANNUAL,
              SPACE_FIELDS.SIZE_SQ_FT,
              SPACE_FIELDS.CAPACITY,
              SPACE_FIELDS.SEAT_ASSIGNMENTS,
            ]}
            state={formState}
            onChangeField={onChangeField}
          />
        </Module>
      </div>
      <div className={styles.moduleWrapper}>
        <Module title="One more module">
          Goes here
        </Module>
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
