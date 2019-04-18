import React, { ReactNode, Component } from 'react';
import { connect } from 'react-redux';
import ReactDOMServer from 'react-dom/server';
import styles from './styles.module.scss';
import FormLabel from '../form-label/index';
import classnames from 'classnames';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import TIME_ZONE_CHOICES from '../../helpers/time-zone-choices/index';
import generateResetTimeChoices from '../../helpers/generate-reset-time-choices/index';

import showModal from '../../actions/modal/show';
import { DensitySpace } from '../../types';

import * as MapboxGL from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as MapboxGLGeocoder from '@mapbox/mapbox-gl-geocoder';

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

function getAreaUnit(measurementUnit) {
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

const DEFAULT_MAP_COORDINATES = [-81.5, 30];
const DEFAULT_MAP_ZOOM = 0.3;
const MAP_ZOOM_BY_SPACE_TYPE = {
  campus: 14,
  building: 14,
  floor: 14,
  space: 14,
};

// NOTE TO SELF AND TO ANY REVIEWERS: This component needs to be extracted out into its own file
// before merging.
export class Map extends Component<any, any> {
  map?: MapboxGL.Map;
  geocoderInstance?: any;
  initialMarker?: any;
  geocoder = React.createRef<HTMLDivElement>();
  container = React.createRef<HTMLDivElement>();

  static defaultProps = { readonly: false };

  componentDidMount() {
    const {
      space,
      address,
      coordinates,
      readonly,
      onChangeAddress,
      onChangeCoordinates,
    } = this.props;

    // The below is the mapbox "public token" for our mapbox account.
    (MapboxGL as any).accessToken = 'pk.eyJ1IjoiYnJpYW5kZW5zaXR5IiwiYSI6ImNqbnYwNWxqbTBodnYzcW14d3liMGczMGgifQ.tCIWM2RSxX1Qr3dFlPQ8wQ';

    if (this.container && this.container.current && this.geocoder && this.geocoder.current) {
      this.map = new MapboxGL.Map({
        container: this.container.current,
        style: 'mapbox://styles/mapbox/dark-v10', // stylesheet location
        center: coordinates ? coordinates : DEFAULT_MAP_COORDINATES,
        zoom: coordinates ? (MAP_ZOOM_BY_SPACE_TYPE[space.type] || DEFAULT_MAP_ZOOM) : DEFAULT_MAP_ZOOM,
        interactive: readonly ? false : true,
      });

      // If coordinates exist prior to typing into the geocoder, render an initital point on the
      // map. NOTE: This point is not generated by the geocoder.
      this.initialMarker = null;
      if (coordinates) {
        this.initialMarker = new MapboxGL.Marker({
          element: MARKER_ELEMENT,
          anchor: 'center',
          draggable: readonly ? false : true,
        });
        this.initialMarker.setLngLat(coordinates);
        this.initialMarker.addTo(this.map);
        this.initialMarker.on('dragend', this.onMapPointDragged);
        this.map.setCenter(coordinates);
      }

      // See:
      // - https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-outside-the-map/
      // - https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-custom-render/
      // - https://docs.mapbox.com/mapbox-gl-js/example/point-from-geocoder-result/
      if (!readonly) {
        this.geocoderInstance = new MapboxGLGeocoder({
          accessToken: MapboxGL.accessToken,
          mapboxgl: MapboxGL,
          placeholder: 'Search for an address',
          marker: {
            // See: https://docs.mapbox.com/mapbox-gl-js/api/#marker
            element: MARKER_ELEMENT,
            anchor: 'center',
            draggable: readonly ? false : true,
          },
          render(item) {
            return ReactDOMServer.renderToStaticMarkup(
              <div className={styles.addressMapItem}>
                <div className={styles.addressMapItemIcon}>
                  <Icons.Locate />
                </div>
                <div className={styles.addressMapItemText}>
                  {item.place_name}
                </div>
              </div>
            );
          },
          // Adjust transition speed when zooming in / out
          // See https://docs.mapbox.com/mapbox-gl-js/api/#map#flyto
          flyTo: {
            speed: 5.0,
            maxDuration: 5000,
          },
        });
        // Called when geocoder "x" icon clicked / pressed. Clear the map.
        this.geocoderInstance.on('clear', () => {
          onChangeCoordinates(null);
          onChangeAddress(null);
        });

        // See: https://gis.stackexchange.com/questions/148985/mapbox-geocoding-and-markers
        this.geocoderInstance.on('result', this.onGeocoderResult);

        // Add geocoder to dom
        const geocoderDomElement = this.geocoderInstance.onAdd(this.map);
        this.geocoder.current.appendChild(geocoderDomElement);
      }
    }
  }
  componentWillUnmount() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  // When the geocoder generate a result, remove the initially placed marker and update the state to
  // match the location that was selected.
  onGeocoderResult = o => {
    const { onChangeCoordinates, onChangeAddress } = this.props;
    const object = objectSnakeToCamel(o);

    onChangeCoordinates(object.result.geometry.coordinates);
    onChangeAddress(object.result.placeName);

    this.geocoderInstance.mapMarker.on('dragend', this.onMapPointDragged);
  }

  // If a point on the map is dragged, then adjust the coordinates that are saved
  onMapPointDragged = point => {
    const { onChangeCoordinates } = this.props;
    const {lat, lng} = point.target.getLngLat();
    onChangeCoordinates([lat, lng]);
  }

  render() {
    const { readonly, address } = this.props;
    return (
      <div className={styles.addressWrapper}>
        <div
          className={styles.addressMapGeocoder}
          ref={this.geocoder}
        />
        <div
          className={styles.addressMapContainer}
          ref={this.container}
        />
        {readonly ? (
          <div className={styles.addressMapTooltipWrapper}>
            <div className={styles.addressMapTooltip}>
              {address}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

const MARKER_ELEMENT = document.createElement('svg');
MARKER_ELEMENT.innerHTML = `
<svg width="40px" height="40px" viewBox="0 0 40 40" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <circle id="path-1" cx="10" cy="10" r="10"></circle>
        <filter x="-95.0%" y="-55.0%" width="290.0%" height="290.0%" filterUnits="objectBoundingBox" id="filter-2">
            <feOffset dx="0" dy="8" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.08 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
    </defs>
    <g id="⌞-Admin:-Locations-(release)" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="org.locations.campus.new" transform="translate(-687.000000, -624.000000)">
            <g id="info" transform="translate(297.000000, 365.000000)">
                <g id="map" transform="translate(23.000000, 165.000000)">
                    <g id="marker" transform="translate(377.000000, 96.000000)">
                        <g id="Oval">
                            <use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"></use>
                            <circle stroke="#DADADA" stroke-width="1" stroke-linejoin="square" fill="#FFFFFF" fill-rule="evenodd" cx="10" cy="10" r="9.5"></circle>
                        </g>
                        <circle id="Oval" fill="#2E51B6" cx="10" cy="10" r="6"></circle>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>
`;

export function AdminLocationsDetailModulesAddress({
  space,
  address,
  coordinates,
  onChangeAddress,
  onChangeCoordinates,
}) {
  return (
    <AdminLocationsDetailModule title="Address">
      <Map
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
