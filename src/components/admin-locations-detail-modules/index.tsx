import React, { Component } from 'react';
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

const DEFAULT_MAP_COORDINATES = [-81.5, 30];
const DEFAULT_MAP_ZOOM = 0.3;
const MAP_ZOOM_BY_SPACE_TYPE = {
  campus: 14,
  building: 14,
  floor: 14,
  space: 14,
};

export class AdminLocationsDetailModulesAddress extends Component<any, any> {
  map?: MapboxGL.Map;
  geocoderInstance?: any;
  initialMarker?: any;
  geocoder = React.createRef<HTMLDivElement>();
  container = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const { space, address, coordinates, onChangeAddress, onChangeCoordinates } = this.props;

    // The below is the mapbox "public token" for our mapbox account.
    (MapboxGL as any).accessToken = 'pk.eyJ1IjoiYnJpYW5kZW5zaXR5IiwiYSI6ImNqbnYwNWxqbTBodnYzcW14d3liMGczMGgifQ.tCIWM2RSxX1Qr3dFlPQ8wQ';

    if (this.container && this.container.current && this.geocoder && this.geocoder.current) {
      this.map = new MapboxGL.Map({
        container: this.container.current,
        style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        center: coordinates ? coordinates : DEFAULT_MAP_COORDINATES,
        zoom: coordinates ? (MAP_ZOOM_BY_SPACE_TYPE[space.type] || DEFAULT_MAP_ZOOM) : DEFAULT_MAP_ZOOM,
      });

      // If coordinates exist prior to typing into the geocoder, render an initital point on the
      // map. NOTE: This point is not generated by the geocoder.
      this.initialMarker = null;
      if (coordinates) {
        this.initialMarker = new MapboxGL.Marker({
          element: MARKER_ELEMENT,
          anchor: 'center',
          draggable: true,
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
      this.geocoderInstance = new MapboxGLGeocoder({
        accessToken: MapboxGL.accessToken,
        mapboxgl: MapboxGL,
        placeholder: 'Search for an address',
        marker: {
          // See: https://docs.mapbox.com/mapbox-gl-js/api/#marker
          element: MARKER_ELEMENT,
          anchor: 'center',
          draggable: true,
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
    const { coordinates, address } = this.props;
    return (
      <AdminLocationsDetailModule title="Address">
        <div className={styles.addressWrapper}>
          <div
            className={styles.addressMapGeocoder}
            ref={this.geocoder}
          />
          <div
            className={styles.addressMapContainer}
            ref={this.container}
          />
        </div>
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

