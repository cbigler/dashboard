import React, { ReactNode, Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import FormLabel from '../form-label/index';
import classnames from 'classnames';
import TIME_ZONE_CHOICES from '../../helpers/time-zone-choices/index';
import generateResetTimeChoices from '../../helpers/generate-reset-time-choices/index';

import showModal from '../../actions/modal/show';
import { DensitySpace } from '../../types';

import AdminLocationsSpaceMap from '../admin-locations-space-map/index';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  Button,
  ButtonContext,
  InputBox,
  Icons,
} from '@density/ui';

export function getAreaUnit(measurementUnit='ft') {
  return `sq ${measurementUnit}`;
}

const SPACE_FUNCTION_CHOICES = [
  { id: null, label: 'No function' },
  { id: 'break_room', label: 'Break Room' },
  { id: 'breakout', label: 'Breakout' },
  { id: 'cafeteria', label: 'Cafeteria' },
  { id: 'call_room', label: 'Call Room' },
  { id: 'classroom', label: 'Classroom' },
  { id: 'conference_room', label: 'Conference Room' },
  { id: 'event', label: 'Event' },
  { id: 'female_restroom', label: 'Female Restroom' },
  { id: 'fitness_gym', label: 'Fitness Gym' },
  { id: 'huddle', label: 'Huddle' },
  { id: 'interview_room', label: 'Interview Room' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'lab', label: 'Lab' },
  { id: 'lactation_room', label: 'Lactation Room' },
  { id: 'listening', label: 'Listening' },
  { id: 'lobby', label: 'Lobby' },
  { id: 'lounge', label: 'Lounge' },
  { id: 'male_restroom', label: 'Male Restroom' },
  { id: 'meeting_room', label: 'Meeting Room' },
  { id: 'office', label: 'Office' },
  { id: 'other', label: 'Other' },
  { id: 'parking', label: 'Parking' },
  { id: 'project', label: 'Project' },
  { id: 'restroom', label: 'Restroom' },
  { id: 'studio', label: 'Studio' },
  { id: 'study_room', label: 'Study Room' },
  { id: 'theater', label: 'Theater' },
  { id: 'utility_room', label: 'Utility Room' },
  { id: 'work_area', label: 'Work Area' },
];

export default function AdminLocationsDetailModule({title, error=false, actions=null, children}) {
  return (
    <div className={classnames(styles.module, {[styles.moduleError]: error})}>
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
          <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
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
      </div>
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
          <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
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
              label="Space Function"
              htmlFor="admin-locations-detail-modules-general-function"
              input={
                <InputBox
                  type="select"
                  id="admin-locations-detail-modules-general-function"
                  placeholder="No function"
                  value={formState['function']}
                  menuMaxHeight={300}
                  choices={SPACE_FUNCTION_CHOICES}
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
          <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
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
              label="Level Number"
              htmlFor="admin-locations-detail-modules-general-level-number"
              input={
                <InputBox
                  type="text"
                  id="admin-locations-detail-modules-general-level-number"
                  value={formState.levelNumber}
                  leftIcon={<span>Level</span>}
                  onChange={e => onChangeField('levelNumber', e.target.value)}
                  width="100%"
                />
              }
            />
          </div>
          <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
            <FormLabel
              label="Space Function"
              htmlFor="admin-locations-detail-modules-general-function"
              input={
                <InputBox
                  type="select"
                  id="admin-locations-detail-modules-general-function"
                  menuMaxHeight={300}
                  placeholder="No function"
                  value={formState['function']}
                  choices={SPACE_FUNCTION_CHOICES}
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
  case 'space':
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
          <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
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
              label="Space Function"
              htmlFor="admin-locations-detail-modules-general-function"
              input={
                <InputBox
                  type="select"
                  id="admin-locations-detail-modules-general-function"
                  placeholder="No function"
                  menuMaxHeight={300}
                  value={formState['function']}
                  choices={SPACE_FUNCTION_CHOICES}
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
  let content, controls;
  switch (space.spaceType) {
  case 'campus':
    controls = null;
    content = (
      <div className={styles.spaceFieldRenderer}>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Rent (annual)"
              htmlFor="admin-locations-detail-modules-general-info-rent-annual"
              input={
                <InputBox
                  type="number"
                  id="admin-locations-detail-modules-general-info-rent-annual"
                  placeholder="ex. 48000"
                  value={formState.rentAnnual}
                  onChange={e => onChangeField('rentAnnual', e.target.value)}
                  leftIcon={<span>$</span>}
                  width="100%"
                />
              }
            />
          </div>
          <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
            <FormLabel
              label="Target Capacity (people)"
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
          </div>
        </div>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Legal Capacity (people)"
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
          </div>
        </div>
      </div>
    );
    break;
  case 'building':
    controls = (
      <AppBarSection>
        Units:
        <span className={styles.modulesMetadataDropdowns}>
          <InputBox
            type="select"
            choices={[
              {id: 'feet', label: 'feet'},
              {id: 'meters', label: 'meters'},
            ]}
            width={138}
            value={formState.sizeUnit}
            onChange={choice => onChangeField('sizeUnit', choice.id)}
          />
        </span>
        <span className={styles.modulesMetadataDropdowns}>
          <InputBox
            type="select"
            choices={[
              {id: 'USD', label: 'USD ($)'},
            ]}
            disabled
            width={158}
            value={formState.currency}
            onChange={choice => onChangeField('currency', choice.id)}
          />
        </span>
      </AppBarSection>
    );
    content = (
      <div className={styles.spaceFieldRenderer}>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Rent (annual)"
              htmlFor="admin-locations-detail-modules-general-info-rent-annual"
              input={
                <InputBox
                  type="number"
                  id="admin-locations-detail-modules-general-info-rent-annual"
                  placeholder="ex. 48000"
                  value={formState.rentAnnual}
                  onChange={e => onChangeField('rentAnnual', e.target.value)}
                  leftIcon={<span>$</span>}
                  width="100%"
                />
              }
            />
          </div>
          <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
            <FormLabel
              label={`Size (${getAreaUnit(formState.sizeUnit)})`}
              htmlFor="admin-locations-detail-modules-general-info-size"
              input={
                <InputBox
                  type="number"
                  placeholder="ex. 24000"
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
              label="Target Capacity (people)"
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
          </div>
          <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
            <FormLabel
              label="Legal Capacity (people)"
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
          </div>
        </div>
      </div>
    );
    break;
  case 'floor':
    controls = null;
    content = (
      <div className={styles.spaceFieldRenderer}>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Rent (annual)"
              htmlFor="admin-locations-detail-modules-general-info-rent-annual"
              input={
                <InputBox
                  type="number"
                  id="admin-locations-detail-modules-general-info-rent-annual"
                  placeholder="ex. 48000"
                  value={formState.rentAnnual}
                  onChange={e => onChangeField('rentAnnual', e.target.value)}
                  leftIcon={<span>$</span>}
                  width="100%"
                />
              }
            />
          </div>
          <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
            <FormLabel
              label={`Size (${getAreaUnit(formState.sizeUnit)})`}
              htmlFor="admin-locations-detail-modules-general-info-size"
              input={
                <InputBox
                  type="number"
                  placeholder="ex. 24000"
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
                  placeholder="ex. 80"
                  value={formState.capacity || ''}
                  onChange={e => onChangeField('capacity', e.target.value)}
                  width="100%"
                />
              }
            />
          </div>
          <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
            <FormLabel
              label="Seat Assignments"
              htmlFor="admin-locations-detail-modules-general-seat-assignments"
              input={
                <InputBox
                  type="number"
                  id="admin-locations-detail-modules-general-info-seat-assignments"
                  placeholder="ex. 100"
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
  case 'space':
    controls = null;
    content = (
      <div className={styles.spaceFieldRenderer}>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label={`Size (${getAreaUnit(formState.sizeUnit)})`}
              htmlFor="admin-locations-detail-modules-general-info-size"
              input={
                <InputBox
                  type="number"
                  placeholder="ex. 24000"
                  id="admin-locations-detail-modules-general-info-size"
                  value={formState.size}
                  onChange={e => onChangeField('size', e.target.value)}
                  width="100%"
                />
              }
            />
          </div>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Target Capacity (people)"
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
          </div>
        </div>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Legal Capacity (people)"
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
          </div>
        </div>
      </div>
    );
    break;
  default:
    content = null;
    controls = null;
    break;
  }

  return (
    <AdminLocationsDetailModule title="Meta" actions={controls}>
      {content}
    </AdminLocationsDetailModule>
  );
}

// NOTE TO SELF AND TO ANY REVIEWERS: This component needs to be extracted out into its own file
// before merging.
export function AdminLocationsDetailModulesAddress({
  space,
  address,
  coordinates,
  onChangeAddress,
  onChangeCoordinates,
}) {
  return (
    <AdminLocationsDetailModule title="Address">
      <AdminLocationsSpaceMap
        space={space}
        address={address}
        onChangeAddress={onChangeAddress}
        coordinates={coordinates}
        onChangeCoordinates={onChangeCoordinates}
      />
    </AdminLocationsDetailModule>
  );
}



type AdminLocationsDetailModulesDangerZoneUnconnectedProps = {
  space: DensitySpace,
  onShowConfirm: () => any,
  onDeleteSpace: () => any,
};

function AdminLocationsDetailModulesDangerZoneUnconnected(
  {space, onShowConfirm, onDeleteSpace}: AdminLocationsDetailModulesDangerZoneUnconnectedProps
) {
  return (
    <AdminLocationsDetailModule error title="Danger Zone">
      <div className={styles.dangerZoneWrapper}>
        <div className={styles.dangerZoneLeft}>
          <h4>Delete this space</h4>
          <span>Once deleted, it will be gone forever. Please be certain.</span>
        </div>
        <div className={styles.dangerZoneRight}>
          <ButtonContext.Provider value="DELETE_BUTTON">
            <Button onClick={onShowConfirm}>Delete this Space</Button>
          </ButtonContext.Provider>
        </div>
      </div>
    </AdminLocationsDetailModule>
  );
}

export const AdminLocationsDetailModulesDangerZone = connect(
  state => ({}),
  (dispatch, props: {onDeleteSpace}) => ({
    onShowConfirm() {
      dispatch<any>(showModal('MODAL_CONFIRM', {
        prompt: 'Are you sure you want to delete this space?',
        confirmText: 'Delete',
        callback: () => props.onDeleteSpace(),
      }));
    },
  }),
)(AdminLocationsDetailModulesDangerZoneUnconnected);



export function AdminLocationsDetailModulesOperatingHours({space, formState, onChangeField}) {
  return (
    <AdminLocationsDetailModule title="Operating Hours">
      <div className={styles.operatingHoursWrapper}>
        <div className={styles.operatingHoursLeft}>
          <label htmlFor="admin-locations-detail-modules-operating-hours-time-zone">
            Time Zone:
          </label>
          <InputBox
            id="admin-locations-detail-modules-operating-hours-time-zone"
            type="select"
            choices={TIME_ZONE_CHOICES}
            value={formState.timeZone}
            onChange={choice => onChangeField('timeZone', choice.id)}
            width={350}
            menuMaxHeight={300}
          />
        </div>
        <div className={styles.operatingHoursRight}>
          <label htmlFor="admin-locations-detail-modules-operating-hours-time-zone">
            The day starts at:
          </label>
          <InputBox
            id="admin-locations-detail-modules-operating-hours-time-zone"
            type="select"
            choices={generateResetTimeChoices(space).map(i => ({ id: i.value, label: i.display }))}
            value={formState.dailyReset}
            onChange={choice => onChangeField('dailyReset', choice.id)}
            menuMaxHeight={300}
            width={114}
          />
        </div>
      </div>
    </AdminLocationsDetailModule>
  );
}
