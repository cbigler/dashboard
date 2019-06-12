import React, { Fragment } from 'react';
import { InputBox } from '@density/ui';
import classnames from 'classnames';

import styles from './general-info.module.scss';

import FormLabel from '../form-label/index';
import AdminLocationsImageUpload from '../admin-locations-image-upload/index';
import { fileToDataURI } from '../../helpers/media-files';

import AdminLocationsDetailModule from './index';

const SPACE_FUNCTION_CHOICES = [
  {id: 'breakout', label: 'Breakout'},
  {id: 'cafe', label: 'Cafe'},
  {id: 'conference_room', label: 'Conference Room'},
  {id: 'event_space', label: 'Event Space'},
  {id: 'gym', label: 'Gym'},
  {id: 'kitchen', label: 'Kitchen'},
  {id: 'lounge', label: 'Lounge'},
  {id: 'meeting_room', label: 'Meeting Room'},
  {id: 'office', label: 'Office'},
  {id: 'restroom', label: 'Restroom'},
  {id: 'theater', label: 'Theater'},
  {id: null, label: 'Other'},
];

export default function AdminLocationsDetailModulesGeneralInfo({spaceType, formState, onChangeField}) {
  let inputs;

  function getSpaceTypeLabel(spaceType) {
    return {
      campus: 'Campus',
      building: 'Building',
      floor: 'Level',
      space: 'Room',
    }[spaceType] || 'Unknown';
  }

  switch (spaceType) {
  case 'campus':
    inputs = (
      <Fragment>
        <FormLabel
          label="Name"
          htmlFor="admin-locations-detail-modules-general-info-name"
          input={
            <InputBox
              type="text"
              id="admin-locations-detail-modules-general-info-name"
              value={formState.name}
              onChange={e => onChangeField('name', e.target.value)}
              width="100%"
            />
          }
        />
        <FormLabel
          label="Space type"
          htmlFor="admin-locations-detail-modules-general-info-space-type"
          input={
            <InputBox
              type="text"
              disabled
              id="admin-locations-detail-modules-general-info-space-type"
              value={getSpaceTypeLabel(formState.spaceType)}
              width="100%"
            />
          }
        />
      </Fragment>
    );
    break;
  case 'building':
    inputs = (
      <Fragment>
        <FormLabel
          label="Name"
          htmlFor="admin-locations-detail-modules-general-info-name"
          input={
            <InputBox
              type="text"
              id="admin-locations-detail-modules-general-info-name"
              value={formState.name}
              onChange={e => onChangeField('name', e.target.value)}
              width="100%"
            />
          }
        />
        <FormLabel
          label="Space type"
          htmlFor="admin-locations-detail-modules-general-info-space-type"
          input={
            <InputBox
              type="text"
              disabled
              id="admin-locations-detail-modules-general-info-space-type"
              value={getSpaceTypeLabel(formState.spaceType)}
              width="100%"
            />
          }
        />
        <FormLabel
          label="Space function"
          htmlFor="admin-locations-detail-modules-general-function"
          input={
            <InputBox
              type="select"
              id="admin-locations-detail-modules-general-function"
              placeholder="No function assigned"
              value={formState['function']}
              menuMaxHeight={300}
              choices={SPACE_FUNCTION_CHOICES}
              onChange={e => onChangeField('function', e.id)}
              width="100%"
            />
          }
        />
      </Fragment>
    );
    break;
  case 'floor':
    inputs = (
      <Fragment>
        <FormLabel
          label="Name"
          htmlFor="admin-locations-detail-modules-general-info-name"
          input={
            <InputBox
              type="text"
              id="admin-locations-detail-modules-general-info-name"
              value={formState.name}
              onChange={e => onChangeField('name', e.target.value)}
              width="100%"
            />
          }
        />
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <FormLabel
            label="Space type"
            htmlFor="admin-locations-detail-modules-general-info-space-type"
            className={styles.moduleFormFieldHalfWidth}
            input={
              <InputBox
                type="text"
                disabled
                id="admin-locations-detail-modules-general-info-space-type"
                value={getSpaceTypeLabel(formState.spaceType)}
                width="100%"
              />
            }
          />
          <FormLabel
            label="Level number"
            htmlFor="admin-locations-detail-modules-general-level-number"
            className={styles.moduleFormFieldHalfWidth}
            input={
              <InputBox
                type="text"
                id="admin-locations-detail-modules-general-level-number"
                value={formState.floorLevel}
                leftIcon={<span>Level</span>}
                placeholder="01"
                onChange={e => onChangeField('floorLevel', e.target.value)}
                width="100%"
              />
            }
          />
        </div>
        <FormLabel
          label="Space function"
          htmlFor="admin-locations-detail-modules-general-function"
          input={
            <InputBox
              type="select"
              id="admin-locations-detail-modules-general-function"
              menuMaxHeight={300}
              placeholder="No function assigned"
              value={formState['function']}
              choices={SPACE_FUNCTION_CHOICES}
              onChange={e => onChangeField('function', e.id)}
              width="100%"
            />
          }
        />
      </Fragment>
    );
    break;
  case 'space':
    inputs = (
      <Fragment>
        <FormLabel
          label="Name"
          htmlFor="admin-locations-detail-modules-general-info-name"
          input={
            <InputBox
              type="text"
              id="admin-locations-detail-modules-general-info-name"
              value={formState.name}
              onChange={e => onChangeField('name', e.target.value)}
              width="100%"
            />
          }
        />
        <FormLabel
          label="Space type"
          htmlFor="admin-locations-detail-modules-general-info-space-type"
          input={
            <InputBox
              type="text"
              disabled
              id="admin-locations-detail-modules-general-info-space-type"
              value={getSpaceTypeLabel(formState.spaceType)}
              width="100%"
            />
          }
        />
        <FormLabel
          label="Space function"
          htmlFor="admin-locations-detail-modules-general-function"
          input={
            <InputBox
              type="select"
              id="admin-locations-detail-modules-general-function"
              placeholder="No function assigned"
              menuMaxHeight={300}
              value={formState['function']}
              choices={SPACE_FUNCTION_CHOICES}
              onChange={e => onChangeField('function', e.id)}
              width="100%"
            />
          }
        />
      </Fragment>
    );
    break;
  default:
    inputs = null;
    break;
  }

  return (
    <AdminLocationsDetailModule title="General Info">
      <div className={styles.spaceFieldRenderer}>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            {inputs}
          </div>
          <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
            <AdminLocationsImageUpload
              label="Photo"
              value={formState.newImageData || formState.imageUrl}
              onChange={async file => {
                if (file) {
                  const result = await fileToDataURI(file);
                  onChangeField('newImageData', result);
                  onChangeField('newImageFile', file);
                } else {
                  onChangeField('newImageData', null);
                  onChangeField('newImageFile', null);
                }
              }}
            />
          </div>
        </div>
      </div>
    </AdminLocationsDetailModule>
  );
}
