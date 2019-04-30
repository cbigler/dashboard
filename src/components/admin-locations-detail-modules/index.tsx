import React, { Fragment, ReactNode, Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import FormLabel from '../form-label/index';
import classnames from 'classnames';
import TIME_ZONE_CHOICES from '../../helpers/time-zone-choices/index';
import generateResetTimeChoices from '../../helpers/generate-reset-time-choices/index';
import { UNIT_NAMES, SQUARE_FEET, SQUARE_METERS } from '../../helpers/convert-unit/index';
import collectionSpacesDestroy from '../../actions/collection/spaces/destroy';
import ListView, { ListViewColumn } from '../list-view/index';

import showModal from '../../actions/modal/show';
import showToast from '../../actions/toasts';

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
import colorVariables from '@density/ui/variables/colors.json';

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

export default function AdminLocationsDetailModule({
  title,
  error=false,
  actions=null,
  children,
}) {
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
      {children}
    </div>
  );
}

export function AdminLocationsDetailModuleBody({includePadding=true, children}) {
  return (
    <div className={classnames(styles.moduleBody, {[styles.padding]: includePadding})}>
      {children}
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
      <AdminLocationsDetailModuleBody>
        {content}
      </AdminLocationsDetailModuleBody>
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
      <AdminLocationsDetailModuleBody>
        {content}
      </AdminLocationsDetailModuleBody>
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
      <AdminLocationsDetailModuleBody>
        <AdminLocationsSpaceMap
          spaceType={spaceType}
          address={address}
          onChangeAddress={onChangeAddress}
          coordinates={coordinates}
          onChangeCoordinates={onChangeCoordinates}
        />
      </AdminLocationsDetailModuleBody>
    </AdminLocationsDetailModule>
  );
}



function AdminLocationsDetailModulesDangerZoneUnconnected({selectedSpace, onShowConfirm}) {
  return (
    <AdminLocationsDetailModule error title="Danger Zone">
      <AdminLocationsDetailModuleBody>
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
      </AdminLocationsDetailModuleBody>
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


const UTC_DAY_LENGTH_IN_SECONDS = 24 * 60 * 60;
const FIFTEEN_MINUTES_IN_SECONDS = 15 * 60;

class AdminLocationsDetailModulesOperatingHoursSlider extends Component<any, any> {
  pressedButton: 'start' | 'end' | null = null;
  trackWidthInPx: number = 0;
  trackLeftPositionInPx: number = 0;

  onMouseDown = event => {
    // Dragging must be done on the slider control heads
    if (event.target.id.indexOf('start') === -1 && event.target.id.indexOf('end') === -1) {
      return;
    }

    // Find the track div that is a parent of the handle
    let track = event.target;
    while (track && track.id.indexOf('track') === -1) {
      track = track.parentElement;
    }

    if (track) {
      this.pressedButton = event.target.id.indexOf('start') >= 0 ? 'start' : 'end';

      const trackBbox = track.getBoundingClientRect();
      this.trackWidthInPx = trackBbox.width;
      this.trackLeftPositionInPx = trackBbox.left;

      // Add or subtract a small offset from the track left position. This effectively ensures that
      // further handle movments are relative to the original cursor position so that the handle
      // doesn't "jump" to the original cursor positino when it is first moved.
      const handleBbox = event.target.getBoundingClientRect();
      const cursorXOffsetWithinHandle = event.clientX - handleBbox.left;
      if (this.pressedButton === 'start') {
        this.trackLeftPositionInPx += cursorXOffsetWithinHandle;
      } else {
        this.trackLeftPositionInPx -= cursorXOffsetWithinHandle;
      }
    }
  }
  onMouseMove = event => {
    const { startTime, endTime, onChange } = this.props;
    if (!this.pressedButton || event.buttons !== 1 /* left button */) { return; }

    const mouseX = event.clientX - this.trackLeftPositionInPx;
    const seconds = (mouseX / this.trackWidthInPx) * UTC_DAY_LENGTH_IN_SECONDS;

    function processValue(timeValueInSec) {
      // Limit on the left hand side to 12:00am
      if (timeValueInSec < 0) {
        timeValueInSec = 0;
      }
      // Limit on the right hand side to 11:59am
      if (timeValueInSec > UTC_DAY_LENGTH_IN_SECONDS) {
        timeValueInSec = UTC_DAY_LENGTH_IN_SECONDS;
      }
      return Math.round(timeValueInSec / FIFTEEN_MINUTES_IN_SECONDS) * FIFTEEN_MINUTES_IN_SECONDS;
    }

    switch (this.pressedButton) {
    case 'start':
      onChange(processValue(seconds), endTime);
      return;
    case 'end':
      onChange(startTime, processValue(seconds));
      return;
    default:
      return;
    }
  }
  onMouseUp = event => {
    this.pressedButton = null;
  }

  formatDuration = (duration, format) => {
		return moment.utc()
      .startOf('day')
			.add(duration.as('milliseconds'), 'milliseconds')
			.format(format);
  }

  render() {
    const { startTime, endTime } = this.props;

    const startTimeDuration = moment.duration(startTime, 'seconds');
    const endTimeDuration = moment.duration(endTime, 'seconds');

    const sliderStartTimePercentage = startTime / UTC_DAY_LENGTH_IN_SECONDS * 100;
    const sliderEndTimePercentage = endTime / UTC_DAY_LENGTH_IN_SECONDS * 100;

    return (
      <div
        className={styles.operatingHoursSliderWrapper}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
      >
        <div className={styles.operatingHoursSliderTrack} id="track">
          <div
            className={styles.operatingHoursSliderTrackFilledSection}
            style={{
              left: `${sliderStartTimePercentage}%`,
              width: `${sliderEndTimePercentage - sliderStartTimePercentage}%`,
            }}
          />
          <div
            className={styles.operatingHoursSliderHead}
            id="start"
            style={{left: `${sliderStartTimePercentage}%`}}
          />
          <div
            className={styles.operatingHoursSliderHead}
            id="end"
            style={{left: `calc(${sliderEndTimePercentage}% - 24px)`}}
          />
        </div>

        <pre>
          start: {this.formatDuration(startTimeDuration, 'h:mma')}<br/>
          end: {this.formatDuration(endTimeDuration, 'h:mma')}
        </pre>
      </div>
    );
  }
}

export function AdminLocationsDetailModulesOperatingHours({formState, onChangeField}) {
  return (
    <AdminLocationsDetailModule title="Operating Hours">
      <AdminLocationsDetailModuleBody>
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

        <AdminLocationsDetailModulesOperatingHoursSlider
          dayStartTime={formState.dailyReset}
          startTime={formState.startTime}
          endTime={formState.endTime}
          onChange={(startTime, endTime) => {
            onChangeField('startTime', startTime);
            onChangeField('endTime', endTime);
          }}
        />
      </AdminLocationsDetailModuleBody>
    </AdminLocationsDetailModule>
  );
}
