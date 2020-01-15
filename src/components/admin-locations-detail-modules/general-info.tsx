import React, { Fragment } from 'react';
import { InputBox } from '@density/ui/src';
import classnames from 'classnames';

import styles from './general-info.module.scss';

import FormLabel from '../form-label/index';
import AdminLocationsImageUpload from '../admin-locations-image-upload/index';
import { fileToDataURI } from '../../helpers/media-files';

import AdminLocationsDetailModule from './index';
import { spaceHierarchyFormatter } from '@density/lib-space-helpers';
import { SpacePickerDropdown } from '../space-picker';

import { SPACE_FUNCTION_CHOICES } from '@density/lib-space-helpers';

function getSpaceParentHierarchy(spaceHierarchy, formState) {
  return spaceHierarchyFormatter(spaceHierarchy).filter(item => {
    return formState.id !== item.space.id &&
      (formState.space_type !== 'building' || item.space.space_type === 'campus') &&
      (formState.space_type !== 'floor' || item.space.space_type === 'building');
  });
}

function getSpaceTypeLabel(space_type) {
  return {
    campus: 'Campus',
    building: 'Building',
    floor: 'Floor',
    space: 'Space',
  }[space_type] || 'Unknown';
}

export default function AdminLocationsDetailModulesGeneralInfo({
  space_type,
  spaceHierarchy,
  formState,
  onChangeField
}) {

  const formattedHierarchy = space_type !== 'campus' ?
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
                  value={getSpaceTypeLabel(formState.space_type)}
                  width="100%"
                />
              }
            />
            {space_type !== 'campus' ? (
              <Fragment>
                <FormLabel
                  label="Parent"
                  htmlFor="admin-locations-detail-modules-general-parent"
                  input={
                    <SpacePickerDropdown
                      value={formattedHierarchy.find(i => i.space.id === formState.parent_id) || null}
                      onChange={hierarchyItem => onChangeField('parent_id', hierarchyItem.space.id)}
                      formattedHierarchy={formattedHierarchy}
                      placeholder="Select a campus" // Only navigable buildings will show this empty state
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
              value={formState.newImageData || formState.image_url}
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
