import React, { Component } from 'react';
import styles from './styles.module.scss';
import FormLabel from '../form-label/index';
import classnames from 'classnames';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  InputBox,
  Icons,
} from '@density/ui';

export default function AdminLocationsDetailModule({title, actions=null, children}) {
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

export function AdminLocationsDetailModulesGeneralInfo({space, formState, onChangeField}) {
  let content;
  switch (space.spaceType) {
  case 'campus':
    content = (
      <p>TODO</p>
    );
    break;
  case 'building':
    content = (
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
          </div>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Space Type"
              htmlFor="admin-locations-detail-modules-general-info-space-type"
              input={
                <InputBox
                  type="select"
                  disabled
                  id="admin-locations-detail-modules-general-info-space-type"
                  value={formState.spaceType}
                  choices={[
                    {id: 'campus', label: 'Campus'},
                    {id: 'building', label: 'Building'},
                    {id: 'floor', label: 'Floor'},
                    {id: 'space', label: 'Space'},
                  ]}
                  onChange={e => onChangeField('spaceType', e.target.value)}
                  width="100%"
                />
              }
            />
          </div>
        </div>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Function"
              htmlFor="admin-locations-detail-modules-general-function"
              input={
                <InputBox
                  type="select"
                  id="admin-locations-detail-modules-general-function"
                  value={formState['function']}
                  choices={[
                    {id: 'conference_room', label: 'Conference Room'},
                    {id: 'meeting_room', label: 'Meeting Room'},
                  ]}
                  onChange={e => onChangeField('function', e.id)}
                  width="100%"
                />
              }
            />
          </div>
        </div>
      </div>
    );
    break;
  case 'floor':
    content = (
      <p>TODO</p>
    );
    break;
  case 'space':
    content = (
      <p>TODO</p>
    );
    break;
  default:
    content = null;
    break;
  }

  return (
    <AdminLocationsDetailModule title="General Info">
      {content}
    </AdminLocationsDetailModule>
  );
}

export function AdminLocationsDetailModulesMetadata({space, formState, onChangeField}) {
  let content;
  switch (space.spaceType) {
  case 'campus':
    content = (
      <p>TODO</p>
    );
    break;
  case 'building':
    content = (
      <div className={styles.spaceFieldRenderer}>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Rent (annual)"
              htmlFor="admin-locations-detail-modules-general-info-rent-annual"
              input={
                <InputBox
                  type="text"
                  id="admin-locations-detail-modules-general-info-rent-annual"
                  value={formState.rentAnnual}
                  onChange={e => onChangeField('rentAnnual', e.target.value)}
                  leftIcon={<span>$</span>}
                  width="100%"
                />
              }
            />
          </div>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Size (sq ft)"
              htmlFor="admin-locations-detail-modules-general-info-size"
              input={
                <InputBox
                  type="number"
                  id="admin-locations-detail-modules-general-info-size"
                  value={formState.size}
                  onChange={e => onChangeField('size', e.target.value)}
                  width="100%"
                />
              }
            />
          </div>
        </div>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Capacity"
              htmlFor="admin-locations-detail-modules-general-info-capacity"
              input={
                <InputBox
                  type="number"
                  id="admin-locations-detail-modules-general-info-capacity"
                  value={formState.capacity || ''}
                  onChange={e => onChangeField('capacity', e.target.value)}
                  width="100%"
                />
              }
            />
          </div>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Seat Assignments"
              htmlFor="admin-locations-detail-modules-general-seat-assignments"
              input={
                <InputBox
                  type="number"
                  id="admin-locations-detail-modules-general-info-seat-assignments"
                  value={formState.seatAssignments}
                  onChange={e => onChangeField('seatAssignments', e.target.value)}
                  width="100%"
                />
              }
            />
          </div>
        </div>
      </div>
    );
    break;
  case 'floor':
    content = (
      <p>TODO</p>
    );
    break;
  case 'space':
    content = (
      <p>TODO</p>
    );
    break;
  default:
    content = null;
    break;
  }

  return (
    <AdminLocationsDetailModule title="Meta">
      {content}
    </AdminLocationsDetailModule>
  );
}
