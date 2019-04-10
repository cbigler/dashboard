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

/* ---------------------------------------------------------------------------- */
/* GENERAL INFORMATION MODULE */
/* ---------------------------------------------------------------------------- */

export function AdminLocationsGeneralInformationModule({
  name,
  spaceFunction,

  onChangeName,
  onChangeSpaceFunction,
}) {
  return (
    <Module title="General Info">
      <div className={styles.generalInfo}>
        <div className={classnames(styles.generalInfoColumn, styles.left)}>
          <FormLabel
            label="Photo"
            htmlFor="photos"
            input={<div>todo</div>}
          />
        </div>
        <div className={classnames(styles.generalInfoColumn, styles.right)}>
          <FormLabel
            label="Name"
            htmlFor="admin-locations-general-information-module-name"
            input={
              <InputBox
                id="admin-locations-general-information-module-name"
                type="text"
                value={name}
                width="100%"
                onChange={e => onChangeName(e.target.value)}
              />
            }
          />
          <FormLabel
            label="Space Function"
            htmlFor="admin-locations-general-information-module-space-function"
            input={
              <InputBox
                id="admin-locations-general-information-module-space-function"
                type="select"
                width="100%"
                choices={[
                  {id: 'example-space-function', label: 'Example Space Function'},
                ]}
                value={name}
                onChange={e => onChangeSpaceFunction(e.id)}
              />
            }
          />
        </div>
      </div>
    </Module>
  );
}


/* ---------------------------------------------------------------------------- */
/* METADATA MODULE */
/* ---------------------------------------------------------------------------- */

const SPACE_METADATA_FIELDS = {
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

const SPACE_TYPE_METADATA_FIELDS = {
  campus: [],
  building: [
    SPACE_METADATA_FIELDS.RENT_ANNUAL,
    SPACE_METADATA_FIELDS.SIZE_SQ_FT,
    SPACE_METADATA_FIELDS.CAPACITY,
    SPACE_METADATA_FIELDS.SEAT_ASSIGNMENTS,
  ],
  floor: [
    SPACE_METADATA_FIELDS.SIZE_SQ_FT,
    SPACE_METADATA_FIELDS.SEAT_ASSIGNMENTS,
    SPACE_METADATA_FIELDS.CAPACITY,
  ],
  space: [
    SPACE_METADATA_FIELDS.SIZE_SQ_FT,
    SPACE_METADATA_FIELDS.SEAT_ASSIGNMENTS,
    SPACE_METADATA_FIELDS.CAPACITY,
  ],
};

export function AdminLocationsMetadataModule({space, state, onChangeField}) {
  const metadataFields = SPACE_TYPE_METADATA_FIELDS[space.spaceType] || [];

  // split array into pairs: https://stackoverflow.com/a/44996257/4115328
  const metadataFieldPairs = metadataFields.reduce((acc, item, index) => {
    if (index % 2 === 0) {
      return [ ...acc, metadataFields.slice(index, index+2) ];
    }
    return acc;
  }, []);

  return (
    <Module title="Meta">
      <div className={styles.metadata}>
        {metadataFieldPairs.map(([field1, field2]) => {
          const field1Id = `admin-locations-metadata-${field1.id}`;
          const field2Id = field2 ? `admin-locations-metadata-${field2.id}` : '';
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
    </Module>
  );
}
