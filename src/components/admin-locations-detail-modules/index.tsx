import React, { Fragment, ReactNode, Component } from 'react';
import uuid from 'uuid';
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
import hideModal from '../../actions/modal/hide';
import showToast from '../../actions/toasts';

import spaceHierarchyFormatterNew from '../../helpers/space-hierarchy-formatter/index';
import {
  getChildrenOfSpace,
  getParentsOfSpace,
  isParentSelected,
  searchHierarchy,
} from '../../helpers/filter-hierarchy/index';

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
  Modal,
} from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';
import DayOfWeekSelector from '../day-of-week-selector/index';

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
                  type="select"
                  disabled
                  id="admin-locations-detail-modules-general-info-space-type"
                  value={formState.spaceType}
                  choices={[
                    {id: 'campus', label: 'Campus'},
                    {id: 'building', label: 'Building'},
                    {id: 'floor', label: 'Level'},
                    {id: 'space', label: 'Room'},
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
                    {id: 'floor', label: 'Level'},
                    {id: 'space', label: 'Room'},
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
                  type="select"
                  disabled
                  id="admin-locations-detail-modules-general-info-space-type"
                  value={formState.spaceType}
                  choices={[
                    {id: 'campus', label: 'Campus'},
                    {id: 'building', label: 'Building'},
                    {id: 'floor', label: 'Level'},
                    {id: 'space', label: 'Room'},
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
const ONE_HOUR_IN_SECONDS = 60 * 60;

function formatDuration(duration, format) {
  return moment.utc()
    .startOf('day')
    .add(duration.as('milliseconds'), 'milliseconds')
    .format(format);
}

class AdminLocationsDetailModulesOperatingHoursSlider extends Component<any, any> {
  pressedButton: 'start' | 'end' | null = null;
  trackWidthInPx: number = 0;
  trackLeftPositionInPx: number = 0;

  constructor(props) {
    super(props);

    // Wait, wait - why are these values stored in the state? Well it turns out that treating this
    // component as "controlled" and calling `onChange` on every single update is super slow because
    // the AdminLocationsEdit component has to rerender and this takes a long time. So instead,
    // store tha values in the component's state and when the user finished dragging a handle, then
    // call onChange and update the parent component.
    this.state = {
      startTime: props.startTime,
      endTime: props.endTime,
    };
  }
  componentWillReceiveProps({startTime, endTime}) {
    this.setState({startTime, endTime});
  }

  onStart = (event, clientX) => {
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
      const cursorXOffsetWithinHandle = clientX - handleBbox.left - 12;
      if (this.pressedButton === 'start') {
        this.trackLeftPositionInPx += cursorXOffsetWithinHandle;
      } else {
        this.trackLeftPositionInPx -= cursorXOffsetWithinHandle;
      }
    }
  }
  onMouseDown = event => this.onStart(event, event.clientX);
  onTouchStart = event => this.onStart(event, event.touches[0].clientX);

  onDrag = (event, clientX) => {
    const { dayStartTime, onChange } = this.props;
    const { startTime, endTime } = this.state;
    const dayStartTimeSeconds = moment.duration(dayStartTime).as('seconds');

    const mouseX = clientX - this.trackLeftPositionInPx;
    const seconds = ((mouseX / this.trackWidthInPx) * UTC_DAY_LENGTH_IN_SECONDS) + dayStartTimeSeconds;

    function clampValue(timeValueInSec) {
      // Limit on the left hand side to the daily reset time
      if (timeValueInSec < dayStartTimeSeconds) {
        timeValueInSec = dayStartTimeSeconds;
      }
      // Limit on the right hand side to (the daily reset time + 24 hours)
      if (timeValueInSec > (UTC_DAY_LENGTH_IN_SECONDS + dayStartTimeSeconds)) {
        timeValueInSec = UTC_DAY_LENGTH_IN_SECONDS + dayStartTimeSeconds;
      }
      return Math.round(timeValueInSec / FIFTEEN_MINUTES_IN_SECONDS) * FIFTEEN_MINUTES_IN_SECONDS;
    }

    function testIfValuesOverlap(startTime, endTime) {
      const secondsBetweenStartAndEndTime = endTime - startTime;
      return secondsBetweenStartAndEndTime < ONE_HOUR_IN_SECONDS;
    }

    switch (this.pressedButton) {
    case 'start':
      let newStartTime = clampValue(seconds);
      if (testIfValuesOverlap(newStartTime, endTime)) {
        newStartTime = endTime - ONE_HOUR_IN_SECONDS;
      }
      this.setState({startTime: newStartTime, endTime});
      return;
    case 'end':
      let newEndTime = clampValue(seconds);
      if (testIfValuesOverlap(startTime, newEndTime)) {
        newEndTime = startTime + ONE_HOUR_IN_SECONDS;
      }
      this.setState({startTime, endTime: newEndTime});
      return;
    default:
      return;
    }
  }
  onTouchMove = event => this.onDrag(event, event.touches[0].clientX);
  onMouseMove = event => {
    if (!this.pressedButton || event.buttons !== 1 /* left button */) { return; }
    this.onDrag(event, event.clientX);
  }

  onMouseUp = event => {
    this.pressedButton = null;
    this.props.onChange(this.state.startTime, this.state.endTime);
  }

  render() {
    const { dayStartTime, timeZone } = this.props;
    const { startTime, endTime } = this.state;
    const dayStartTimeSeconds = moment.duration(dayStartTime).as('seconds');

    const startTimeDuration = moment.duration(startTime, 'seconds');
    const endTimeDuration = moment.duration(endTime, 'seconds');

    const sliderStartTimePercentage = (startTime - dayStartTimeSeconds) / UTC_DAY_LENGTH_IN_SECONDS * 100;
    const sliderEndTimePercentage = (endTime - dayStartTimeSeconds) / UTC_DAY_LENGTH_IN_SECONDS * 100;

    // Render all possible reset time choices underneath the slider, starting at the reset time and
    // working upwards in hours until that same reset time the next day.
    const resetTimeChoices = generateResetTimeChoices({timeZone});
    const splitPointIndex = resetTimeChoices.findIndex(choice => {
      const choiceSeconds = moment.duration(choice.value).as('seconds');
      return choiceSeconds === dayStartTimeSeconds;
    });
    const tickMarks = [
      ...resetTimeChoices.slice(splitPointIndex), // Everything after the split point
      ...resetTimeChoices.slice(0, splitPointIndex), // Everything before the split point
    ];

    return (
      <div
        className={styles.operatingHoursSliderWrapper}

        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}

        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onMouseUp}
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
            style={{left: `calc(${sliderStartTimePercentage}% - 12px)`}}
          />
          <div
            className={styles.operatingHoursSliderHead}
            id="end"
            style={{left: `calc(${sliderEndTimePercentage}% - 12px)`}}
          />
        </div>

        <div className={styles.operatingHoursLabelContainer}>
          {tickMarks.map((tickMark, index) => (
            <span
              className={styles.operatingHoursLabel}
              style={{left: `${index * (100 / tickMarks.length)}%`}}
              key={tickMark.value}
            >{tickMark.hourOnlyDisplay}</span>
          ))}
          <span
            className={styles.operatingHoursLabel}
            style={{left: '100%'}}
            key={tickMarks[0].value}
          >{tickMarks[0].hourOnlyDisplay}</span>
        </div>
      </div>
    );
  }
}

function AdminLocationsDetailModulesOperatingHoursUnconnected({
  formState,
  activeModal,
  spaceHierarchy,

  onChangeField,
  onClickAddLabel,
  onConfirmSegmentCanBeDeleted,
  onOpenCopyFromSpace,
  onCloseModal,
}) {
  return (
    <Fragment>
      {activeModal.name === 'OPERATING_HOURS_COPY_FROM_SPACE' ? (
        <Modal
          visible={activeModal.visible}
          width={486}
          height={636}
          onBlur={onCloseModal}
          onEscape={onCloseModal}
        >
          <AppBar>
            <AppBarTitle>Copy Operating Hours</AppBarTitle>
          </AppBar>

          <AppBar>
            <InputBox
              type="text"
              leftIcon={<Icons.Search />}
              placeholder="Search for space name"
              width="100%"
            />
          </AppBar>

          <pre>
            {JSON.stringify(spaceHierarchyFormatterNew(spaceHierarchy.data), null, 2)}
          </pre>
        </Modal>
      ) : null}

      <AdminLocationsDetailModule title="Operating Hours">
        <AppBar>
          <AppBarSection>
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
          </AppBarSection>
          <AppBarSection>
            <div className={styles.operatingHoursRight}>
              <label htmlFor="admin-locations-detail-modules-operating-hours-reset-time">
                The day starts at:
              </label>
              <InputBox
                id="admin-locations-detail-modules-operating-hours-reset-time"
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
          </AppBarSection>
        </AppBar>

        {formState.operatingHours.length === 0 ? (
          <div>TODO: EMPTY STATE NOT DESIGNED</div>
        ) : null}

        {formState.operatingHours.map((operatingHoursItem, index) => (
          <div key={operatingHoursItem.id} className={styles.operatingHoursTimeSegmentItem}>
            <div className={styles.operatingHoursTimeSegmentItemSection}>
              <AppBarContext.Provider value="TRANSPARENT">
                <AppBar>
                  <AppBarSection>
                    <InputBox
                      type="select"
                      value={operatingHoursItem.labelId}
                      onChange={async item => {
                        if (item.id === 'CREATE') {
                          item = await onClickAddLabel();
                          onChangeField('operatingHoursLabels', [
                            ...formState.operatingHoursLabels,
                            item,
                          ]);
                        }

                        const operatingHoursCopy = formState.operatingHours.slice();
                        operatingHoursCopy[index] = { ...operatingHoursCopy[index], labelId: item.id };
                        onChangeField('operatingHours', operatingHoursCopy);
                      }}
                      choices={[
                        {
                          id: 'CREATE',
                          label: (
                            <span className={styles.operatingHoursAddLabel}>
                              <Icons.Plus width={10} height={10} color={colorVariables.brandPrimary} />
                              <span>Add a label</span>
                            </span>
                          ),
                        },
                        ...formState.operatingHoursLabels.map(i => ({ id: i.id, label: i.name })),
                      ]}
                      placeholder="Select a label"
                    />
                  </AppBarSection>
                  <AppBarSection>
                    <span className={styles.operatingHoursDayOfWeekLabel}>Days Affected:</span>
                    <DayOfWeekSelector
                      daysOfWeek={operatingHoursItem.daysAffected}
                      onChange={daysAffected => {
                        const operatingHoursCopy = formState.operatingHours.slice();
                        operatingHoursCopy[index] = { ...operatingHoursCopy[index], daysAffected };
                        onChangeField('operatingHours', operatingHoursCopy);
                      }}
                    />
                  </AppBarSection>
                </AppBar>
              </AppBarContext.Provider>
            </div>
            <div className={styles.operatingHoursTimeSegmentItemSection}>
              <AdminLocationsDetailModulesOperatingHoursSlider
                timeZone={formState.timeZone}
                dayStartTime={formState.dailyReset}
                startTime={operatingHoursItem.startTimeSeconds}
                endTime={operatingHoursItem.endTimeSeconds}
                onChange={(startTimeSeconds, endTimeSeconds) => {
                  const operatingHoursCopy = formState.operatingHours.slice();
                  operatingHoursCopy[index] = {
                    ...operatingHoursCopy[index],
                    startTimeSeconds,
                    endTimeSeconds,
                  };
                  onChangeField('operatingHours', operatingHoursCopy);
                }}
              />
            </div>
            <AppBar>
              <AppBarSection>
                {formatDuration(
                  moment.duration(operatingHoursItem.startTimeSeconds, 'seconds'),
                  'h:mma',
                ).slice(0, -1)}
                {' to '}
                {formatDuration(
                  moment.duration(operatingHoursItem.endTimeSeconds, 'seconds'),
                  'h:mma',
                ).slice(0, -1)}
              </AppBarSection>
              <AppBarSection>
                <Button onClick={async () => {
                  onConfirmSegmentCanBeDeleted(() => {
                    const operatingHoursCopy = formState.operatingHours.slice();
                    operatingHoursCopy.splice(index, 1);
                    onChangeField('operatingHours', operatingHoursCopy);
                  });
                }}>Delete Segment</Button>
              </AppBarSection>
            </AppBar>
          </div>
        ))}

        <AppBar>
          <AppBarSection />
          <AppBarSection>
            <div className={styles.operatingHoursCopyFromSpaceButton}>
              <Button onClick={onOpenCopyFromSpace}>Copy from Space</Button>
            </div>
            <Button type="primary" onClick={() => {
              onChangeField('operatingHours', [
                ...formState.operatingHours,
                {
                  id: uuid.v4(),
                  labelId: null,
                  startTimeSeconds: moment.duration('9:00:00').as('seconds'),
                  endTimeSeconds: moment.duration('17:00:00').as('seconds'),
                  daysAffected: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  existsOnServer: false,
                },
              ]);
            }}>Add a Segment</Button>
          </AppBarSection>
        </AppBar>
      </AdminLocationsDetailModule>
    </Fragment>
  );
}

export const AdminLocationsDetailModulesOperatingHours = connect(
  (state: any) => ({
    activeModal: state.activeModal,
    spaceHierarchy: state.spaceHierarchy,
  }),
  (dispatch) => ({
    async onClickAddLabel() {
      const newLabelName = await (new Promise(resolve => {
        dispatch<any>(showModal('MODAL_PROMPT', {
          title: 'Add a label',
          prompt: 'Please enter a name for this label:',
          placeholder: 'ex. Breakfast hours',
          callback: data => resolve(data),
        }));
      }));

      console.log('New Label Name', newLabelName)
      // TODO: MAKE HTTP REQUEST TO CREATE TIME SEGMENT GROUP OR LABEL OR WHATEVER WE ARE CALLING
      // THESE THINGS
      return { id: Math.random().toString(), name: newLabelName };
    },
    async onConfirmSegmentCanBeDeleted(callback) {
      dispatch<any>(showModal('MODAL_CONFIRM', {
        prompt: 'Are you sure you want to delete this time segment?',
        callback,
      }));
    },
    onOpenCopyFromSpace() {
      dispatch<any>(showModal('OPERATING_HOURS_COPY_FROM_SPACE'))
    },
    onCloseModal() {
      dispatch<any>(hideModal());
    },
  }),
)(AdminLocationsDetailModulesOperatingHoursUnconnected);
