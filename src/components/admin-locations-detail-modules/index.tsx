import React, { ReactNode, Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import styles from './styles.module.scss';
import FormLabel from '../form-label/index';
import classnames from 'classnames';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import * as MapboxGL from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as MapboxGLGeocoder from '@mapbox/mapbox-gl-geocoder';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
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

export class AdminLocationsDetailModulesAddress extends Component<any, any> {
  map?: MapboxGL.Map;
  geocoderInstance?: any;
  geocoder = React.createRef<HTMLDivElement>();
  container = React.createRef<HTMLDivElement>();

  componentDidMount() {
    // NOTE: the below is a demo token found on mapbox's website, we need to swap this out with a
    // real token
    (MapboxGL as any).accessToken = 'pk.eyJ1IjoicmdhdXNuZXQiLCJhIjoiY2pxcXdrdWgxMGd2djQybXRpdzU5d2hwcCJ9.DI6bxqLm09Nv5ue6f7Zhow';

    if (this.container && this.container.current && this.geocoder && this.geocoder.current) {
      this.map = new MapboxGL.Map({
        container: this.container.current,
        style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        center: [-74.50, 40], // starting position [lng, lat]
        zoom: 9 // starting zoom
      });

      // If coordinates exist, render a point on the map.
      let marker;
      if (this.props.formState && this.props.formState.coordinates) {
        marker = new MapboxGL.Marker(MARKER_ELEMENT)
          .setLatLng(this.props.formState.coordinates)
          .addTo(this.map);
      }

      // See:
      // - https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-outside-the-map/
      // - https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-geocoder-custom-render/
      // - https://docs.mapbox.com/mapbox-gl-js/example/point-from-geocoder-result/
      this.geocoderInstance = new MapboxGLGeocoder({
        accessToken: MapboxGL.accessToken,
        mapboxgl: MapboxGL,
        placeholder: 'Search for an address',
        marker: {
          // See: https://docs.mapbox.com/mapbox-gl-js/api/#marker
          element: MARKER_ELEMENT,
          anchor: 'center',
        },
        render(item) {
          return ReactDOMServer.renderToStaticMarkup(
            <span>
              <Icons.Locate />
              {item.place_name}
            </span>
          );
        },
      });

      // See: https://gis.stackexchange.com/questions/148985/mapbox-geocoding-and-markers
      this.geocoderInstance.on('result', o => {
        marker.remove();
        const object = objectSnakeToCamel(o);
        this.props.onChangeCoordinates(object.result.geometry.coordinates);
        this.props.onChangeAddress(object.result.placeName);
      });

      const geocoderDomElement = this.geocoderInstance.onAdd(this.map);
      this.geocoder.current.appendChild(geocoderDomElement);
    }
  }
  componentWillUnmount() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  render() {
    const { coordinates, address } = this.props;
    return (
      <AdminLocationsDetailModule title="Address">
        Coordinates: {coordinates ? coordinates.join(', ') : ''}
        Address: {address}
        <div
          className={styles.addressMapGeocoder}
          ref={this.geocoder}
        />
        <div
          className={styles.addressMapContainer}
          ref={this.container}
        />
      </AdminLocationsDetailModule>
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

