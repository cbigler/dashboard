import React, { Fragment } from 'react';
import classnames from 'classnames';
import { AppBarSection, InputBox } from '@density/ui';

import styles from './metadata.module.scss';

import { convertUnit, UNIT_DISPLAY_NAMES, SQUARE_FEET, SQUARE_METERS } from '@density/lib-helpers';

import FormLabel from '../form-label/index';
import AdminLocationsDetailModule from './index';

function MetadataFieldRenderer({fields}) {
  return (
    <div className={styles.spaceFieldRenderer}>
      {fields.reduce((acc, field, index) => {
        // Convert the field array into pairs of fields
        if (index % 2 === 0) {
          return [ ...acc, [field, fields[index+1]] ];
        } else {
          return acc;
        }
      }, []).reduce((acc, [field1, field2]) => (
        <Fragment>
          {acc}
          <div className={styles.spaceFieldRendererRow}>
            <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
              {field1}
            </div>
            {field2 ? (
              <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
                {field2}
              </div>
            ) : null}
          </div>
        </Fragment>
      ), null)}
    </div>
  );
}

export default function AdminLocationsDetailModulesMetadata({spaceType, formState, onChangeField}) {
  let controls = (
    <AppBarSection>
      Units:
      <span className={styles.dropdowns}>
        <InputBox
          type="select"
          choices={[
            {id: SQUARE_FEET, label: 'feet'},
            {id: SQUARE_METERS, label: 'meters'},
          ]}
          width={130}
          value={formState.sizeAreaUnit}
          disabled={spaceType === 'floor' || spaceType === 'space'}
          onChange={choice => {
            // Convert the sizeArea when the unit is changed.
            const sizeArea = parseFloat(formState.sizeArea);
            if (!isNaN(sizeArea)) {
              const converted = convertUnit(formState.sizeArea, formState.sizeAreaUnit, choice.id);
              onChangeField('sizeArea', `${converted}`);
            }

            onChangeField('sizeAreaUnit', choice.id);
          }}
        />
      </span>
      <span className={styles.dropdowns}>
        <InputBox
          type="select"
          choices={[
            {id: 'USD', label: 'USD ($)'},
          ]}
          disabled
          width={158}
          value={formState.currencyUnit}
          onChange={choice => onChangeField('currencyUnit', choice.id)}
        />
      </span>
    </AppBarSection>
  );

  const FIELDS = {
    ANNUAL_RENT: (
      <FormLabel
        label="Annual rent"
        htmlFor="admin-locations-detail-modules-general-info-rent-annual"
        input={
          <InputBox
            type="number"
            id="admin-locations-detail-modules-general-info-rent-annual"
            placeholder="ex. 48000"
            value={formState.annualRent}
            onChange={e => onChangeField('annualRent', e.target.value)}
            leftIcon={<span>$</span>}
            width="100%"
          />
        }
      />
    ),
    TARGET_CAPACITY: (
      <FormLabel
        label="Target capacity (people)"
        htmlFor="admin-locations-detail-modules-general-seat-assignments"
        input={
          <InputBox
            type="number"
            id="admin-locations-detail-modules-general-info-seat-assignments"
            placeholder="ex. 80"
            value={formState.targetCapacity}
            onChange={e => onChangeField('targetCapacity', e.target.value)}
            width="100%"
          />
        }
      />
    ),
    LEGAL_CAPACITY: (
      <FormLabel
        label="Legal capacity (people)"
        htmlFor="admin-locations-detail-modules-general-info-capacity"
        input={
          <InputBox
            type="number"
            id="admin-locations-detail-modules-general-info-capacity"
            placeholder="ex. 100"
            value={formState.capacity || ''}
            onChange={e => onChangeField('capacity', e.target.value)}
            width="100%"
          />
        }
      />
    ),
    SIZE: (
      <FormLabel
        label={`Size (${UNIT_DISPLAY_NAMES[formState.sizeAreaUnit || SQUARE_FEET]})`}
        htmlFor="admin-locations-detail-modules-general-info-size"
        input={
          <InputBox
            type="number"
            placeholder="ex. 24000"
            id="admin-locations-detail-modules-general-info-size"
            value={formState.sizeArea}
            onChange={e => onChangeField('sizeArea', e.target.value)}
            width="100%"
          />
        }
      />
    ),
  };

  const FIELDS_BY_SPACE_TYPE = {
    campus: [
      FIELDS.ANNUAL_RENT,
      FIELDS.TARGET_CAPACITY,
      FIELDS.LEGAL_CAPACITY,
    ],
    building: [
      FIELDS.ANNUAL_RENT,
      FIELDS.SIZE,
      FIELDS.TARGET_CAPACITY,
      FIELDS.LEGAL_CAPACITY,
    ],
    floor: [
      FIELDS.ANNUAL_RENT,
      FIELDS.SIZE,
      FIELDS.TARGET_CAPACITY,
      FIELDS.LEGAL_CAPACITY,
    ],
    space: [
      FIELDS.SIZE,
      FIELDS.TARGET_CAPACITY,
      FIELDS.LEGAL_CAPACITY,
    ],
  };

  const SPACE_FIELDS = FIELDS_BY_SPACE_TYPE[spaceType] || [];

  return (
    <AdminLocationsDetailModule title="Meta" actions={controls}>
      <MetadataFieldRenderer fields={SPACE_FIELDS} />
    </AdminLocationsDetailModule>
  );
}
