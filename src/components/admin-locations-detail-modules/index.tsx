import React from 'react';
import styles from './styles.module.scss';
import FormLabel from '../form-label/index';
import classnames from 'classnames';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  InputBox,
} from '@density/ui';

function Module({title, actions=null, children}) {
  return (
    <div className={styles.module}>
      <div className={styles.moduleHeader}>
        <AppBarContext.Provider value="ADMIN_LOCATIONS_EDIT_MODULE_HEADER">
          <AppBar>
            <AppBarTitle>{title}</AppBarTitle>
            {actions}
          </AppBar>
        </AppBarContext.Provider>
      </div>
      <div className={styles.moduleBody}>
        {children}
      </div>
    </div>
  );
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
    initialValue: space => space.capacity.toString(),
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
    initialValue: space => space.capacity.toString(),
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

function SpaceFieldRenderer({space, displayedFields, state, onChangeField}) {
  // split array into pairs: https://stackoverflow.com/a/44996257/4115328
  const pairs = displayedFields.reduce((acc, item, index) => {
    if (index % 2 === 0) {
      return [ ...acc, displayedFields.slice(index, index+2) ];
    }
    return acc;
  }, []);


  return (
    <div className={styles.metadata}>
      {pairs.map(([field1, field2]) => {
        const field1Id = `admin-locations-field-${field1.id}`;
        const field2Id = field2 ? `admin-locations-field-${field2.id}` : '';
        return (
          <div className={styles.metadataRow} key={`${field1Id}-${field2Id}`}>
            <div className={classnames(styles.metadataCell, styles.left)}>
              <FormLabel
                label={field1.label}
                htmlFor={field1Id}
                input={field1.component(field1Id, state[field1.id], value => onChangeField(field1.id, value))}
              />
            </div>
            {field2 ? (
              <div className={classnames(styles.metadataCell, styles.right)}>
                <FormLabel
                  label={field2.label}
                  htmlFor={field2Id}
                  input={field2.component(field2Id, state[field2.id], value => onChangeField(field2.id, value))}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------------- */
/* GENERAL INFORMATION MODULE */
/* ---------------------------------------------------------------------------- */

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

export function AdminLocationsGeneralInformationModule({space, state, onChangeField}) {
  const infoFields = SPACE_TYPE_INFO_FIELDS[space.spaceType] || [];

  return (
    <Module title="Meta">
      <SpaceFieldRenderer
        space={space}
        displayedFields={infoFields}
        state={state}
        onChangeField={onChangeField}
      />
    </Module>
  );
}


/* ---------------------------------------------------------------------------- */
/* METADATA MODULE */
/* ---------------------------------------------------------------------------- */

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

export function AdminLocationsMetadataModule({space, state, onChangeField}) {
  const metadataFields = SPACE_TYPE_METADATA_FIELDS[space.spaceType] || [];

  return (
    <Module title="Meta">
      <SpaceFieldRenderer
        space={space}
        displayedFields={metadataFields}
        state={state}
        onChangeField={onChangeField}
      />
    </Module>
  );
}
