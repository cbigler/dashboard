import React, { Fragment } from 'react';
import { InputBox } from '@density/ui';
import classnames from 'classnames';

import styles from './general-info.module.scss';

import FormLabel from '../form-label/index';
import AdminLocationsImageUpload from '../admin-locations-image-upload/index';
import { fileToDataURI } from '../../helpers/media-files';

import AdminLocationsDetailModule from './index';
import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter';
import { SpacePickerDropdown } from '../space-picker';

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

function getSpaceParentHierarchy(spaceHierarchy, formState) {
  return spaceHierarchyFormatter(spaceHierarchy).filter(item => {
    return formState.id !== item.space.id &&
      (formState.spaceType !== 'building' || item.space.spaceType === 'campus') &&
      (formState.spaceType !== 'floor' || item.space.spaceType === 'building');
  });
}

function getSpaceTypeLabel(spaceType) {
  return {
    campus: 'Campus',
    building: 'Building',
    floor: 'Level',
    space: 'Room',
  }[spaceType] || 'Unknown';
}

export default function AdminLocationsDetailModulesGeneralInfo({
  spaceType,
  spaceHierarchy,
  formState,
  onChangeField
}) {

  const formattedHierarchy = spaceType !== 'campus' ?
    getSpaceParentHierarchy(spaceHierarchy, formState) : [];

  return (
    <AdminLocationsDetailModule title="General Info">
      <div className={styles.spaceFieldRenderer}>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
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
            {spaceType !== 'campus' ? (
              <Fragment>
                <FormLabel
                  label="Parent"
                  htmlFor="admin-locations-detail-modules-general-parent"
                  input={
                    <SpacePickerDropdown
                      value={formattedHierarchy.find(i => i.space.id === formState.parentId) || null}
                      onChange={hierarchyItem => onChangeField('parentId', hierarchyItem.space.id)}
                      formattedHierarchy={formattedHierarchy}
                      searchBoxPlaceholder="Search for space name"
                      width="100%"
                      dropdownWidth="100%"
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
              
            ) : null}
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
