import React, { ReactNode, Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import FormLabel from '../form-label/index';
import classnames from 'classnames';
import TIME_ZONE_CHOICES from '../../helpers/time-zone-choices/index';
import generateResetTimeChoices from '../../helpers/generate-reset-time-choices/index';
import { UNIT_NAMES, SQUARE_FEET, SQUARE_METERS } from '../../helpers/convert-unit/index';

import showModal from '../../actions/modal/show';
import showToast from '../../actions/toasts';
import collectionSpacesDestroy from '../../actions/collection/spaces/destroy';

import AdminLocationsSpaceMap from '../admin-locations-space-map/index';
import { DensitySpace } from '../../types';

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

const SPACE_FUNCTION_CHOICES = [
  {id: null, label: 'No function'},
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
];

export default function AdminLocationsDetailModule({title, error=false, actions=null, children}) {
  return (
    <div className={classnames(styles.module, {[styles.moduleError]: error})}>
      <div className={styles.moduleHeader}>
        <AppBarContext.Provider value="CARD_HEADER">
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

export function AdminLocationsDetailModulesGeneralInfo({spaceType, formState, onChangeField}) {
  let content;
  switch (spaceType) {
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
                  type="text"
                  disabled
                  id="admin-locations-detail-modules-general-info-space-type"
                  value={
                    ({
                      campus: 'Campus',
                      building: 'Building',
                      floor: 'Level',
                      space: 'Room',
                    })[formState.spaceType] || 'Unknown'
                  }
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
                  type="text"
                  disabled
                  id="admin-locations-detail-modules-general-info-space-type"
                  value={
                    ({
                      campus: 'Campus',
                      building: 'Building',
                      floor: 'Level',
                      space: 'Room',
                    })[formState.spaceType] || 'Unknown'
                  }
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
                  type="text"
                  disabled
                  id="admin-locations-detail-modules-general-info-space-type"
                  value={
                    ({
                      campus: 'Campus',
                      building: 'Building',
                      floor: 'Level',
                      space: 'Room',
                    })[formState.spaceType] || 'Unknown'
                  }
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
                  value={formState.floorLevel}
                  leftIcon={<span>Level</span>}
                  placeholder="01"
                  onChange={e => onChangeField('floorLevel', e.target.value)}
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
                  type="text"
                  disabled
                  id="admin-locations-detail-modules-general-info-space-type"
                  value={
                    ({
                      campus: 'Campus',
                      building: 'Building',
                      floor: 'Level',
                      space: 'Room',
                    })[formState.spaceType] || 'Unknown'
                  }
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

export function AdminLocationsDetailModulesMetadata({spaceType, formState, onChangeField}) {
  let content, controls;
  controls = (
    <AppBarSection>
      Units:
      <span className={styles.modulesMetadataDropdowns}>
        <InputBox
          type="select"
          choices={[
            {id: SQUARE_FEET, label: 'feet'},
            {id: SQUARE_METERS, label: 'meters'},
          ]}
          width={138}
          value={formState.sizeAreaUnit}
          disabled={spaceType === 'floor' || spaceType === 'space'}
          onChange={choice => onChangeField('sizeAreaUnit', choice.id)}
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
          value={formState.currencyUnit}
          onChange={choice => onChangeField('currencyUnit', choice.id)}
        />
      </span>
    </AppBarSection>
  );

  switch (spaceType) {
  case 'campus':
    controls = null;
    content = (
      <div className={styles.spaceFieldRenderer}>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Annual Rent"
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
    content = (
      <div className={styles.spaceFieldRenderer}>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Annual Rent"
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
          </div>
          <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
            <FormLabel
              label={`Size (${UNIT_NAMES[formState.sizeAreaUnit]})`}
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
    content = (
      <div className={styles.spaceFieldRenderer}>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Annual Rent"
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
          </div>
          <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
            <FormLabel
              label={`Size (${UNIT_NAMES[formState.sizeAreaUnit]})`}
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
          </div>
        </div>
        <div className={styles.spaceFieldRendererRow}>
          <div className={classnames(styles.spaceFieldRendererCell, styles.left)}>
            <FormLabel
              label="Target Capacity"
              htmlFor="admin-locations-detail-modules-general-target-capacity"
              input={
                <InputBox
                  type="number"
                  id="admin-locations-detail-modules-general-info-target-capacity"
                  placeholder="ex. 100"
                  value={formState.targetCapacity}
                  onChange={e => onChangeField('targetCapacity', e.target.value)}
                  width="100%"
                />
              }
            />
          </div>
          <div className={classnames(styles.spaceFieldRendererCell, styles.right)}>
            <FormLabel
              label="Legal Capacity"
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
              label={`Size (${UNIT_NAMES[formState.sizeAreaUnit]})`}
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
    break;
  }

  return (
    <AdminLocationsDetailModule title="Meta" actions={controls}>
      {content}
    </AdminLocationsDetailModule>
  );
}

export function AdminLocationsDetailModulesAddress({
  spaceType,
  address,
  coordinates,
  onChangeAddress,
  onChangeCoordinates,
}) {
  return (
    <AdminLocationsDetailModule title="Address">
      <AdminLocationsSpaceMap
        spaceType={spaceType}
        address={address}
        onChangeAddress={onChangeAddress}
        coordinates={coordinates}
        onChangeCoordinates={onChangeCoordinates}
      />
    </AdminLocationsDetailModule>
  );
}



function AdminLocationsDetailModulesDangerZoneUnconnected({selectedSpace, onShowConfirm}) {
  return (
    <AdminLocationsDetailModule error title="Danger Zone">
      <div className={styles.dangerZoneWrapper}>
        <div className={styles.dangerZoneLeft}>
          <h4>Delete this space</h4>
          <span>Once deleted, it will be gone forever. Please be certain.</span>
        </div>
        <div className={styles.dangerZoneRight}>
          <ButtonContext.Provider value="DELETE_BUTTON">
            <Button onClick={() => onShowConfirm(selectedSpace)}>Delete this Space</Button>
          </ButtonContext.Provider>
        </div>
      </div>
    </AdminLocationsDetailModule>
  );
}

export const AdminLocationsDetailModulesDangerZone = connect(
  (state: any) => ({
    selectedSpace: state.spaces.data.find(s => s.id === state.spaces.selected),
  }),
  (dispatch) => ({
    onShowConfirm(space) {
      dispatch<any>(showModal('MODAL_CONFIRM', {
        prompt: 'Are you sure you want to delete this space?',
        confirmText: 'Delete',
        callback: async () => {
          const ok = await dispatch<any>(collectionSpacesDestroy(space));
          if (ok) {
            dispatch<any>(showToast({ text: 'Space deleted successfully' }));
          } else {
            dispatch<any>(showToast({ type: 'error', text: 'Error deleting space' }));
          }
          window.location.href = `#/admin/locations/${space.parentId}`;
        }
      }));
    },
  }),
)(AdminLocationsDetailModulesDangerZoneUnconnected);



export function AdminLocationsDetailModulesOperatingHours({formState, onChangeField}) {
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
            choices={
              generateResetTimeChoices({timeZone: formState.timeZone})
              .map(i => ({ id: i.value, label: i.display }))
            }
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
