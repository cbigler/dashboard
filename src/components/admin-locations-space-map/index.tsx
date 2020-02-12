import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import styles from './styles.module.scss';

import { Icons } from '@density/ui/src';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';

import * as MapboxGL from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as MapboxGLGeocoder from '@mapbox/mapbox-gl-geocoder';

// What to show if a space does not have a position yet
const DEFAULT_MAP_COORDINATES = [-81.5, 30];
const DEFAULT_MAP_ZOOM = 0.3;

const MAP_ZOOM_BY_SPACE_TYPE = {
  campus: 14,
  building: 14,
  floor: 14,
  space: 14,
};

type AdminLocationsSpaceMapProps = {
  readonly: boolean,
  space_type: CoreSpace["space_type"],
  address: string,
  coordinates: [number, number] | null,
  onChangeAddress?: any,
  onChangeCoordinates?: any,
};

export default class AdminLocationsSpaceMap extends Component<AdminLocationsSpaceMapProps, {}> {
  map?: MapboxGL.Map;
  geocoderInstance?: any;
  initialMarker?: any;
  geocoder = React.createRef<HTMLDivElement>();
  container = React.createRef<HTMLDivElement>();

  static defaultProps = { readonly: false };

  componentDidMount() {
    const {
      space_type,
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
        center: coordinates ? {lat: coordinates[0], lng: coordinates[1]} : DEFAULT_MAP_COORDINATES,
        zoom: coordinates ? (MAP_ZOOM_BY_SPACE_TYPE[space_type] || DEFAULT_MAP_ZOOM) : DEFAULT_MAP_ZOOM,
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
        this.initialMarker.setLngLat({lat: coordinates[0], lng: coordinates[1]});
        this.initialMarker.addTo(this.map);
        this.initialMarker.on('dragend', this.onMapPointDragged);
        this.map.setCenter({lat: coordinates[0], lng: coordinates[1]});
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

        // Set the contents of the geocoder to be the address if the geocoder is visible. This isn't
        // supported officialyl by the geocoder and I'm using what look to be private instance
        // values on the geocoder to "hack around" this.
        if (coordinates) {
          this.geocoderInstance._inputEl.value = address;
          this.geocoderInstance._clearEl.style.display = 'block';
        }
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
  onGeocoderResult = object => {
    const { onChangeCoordinates, onChangeAddress } = this.props;

    const [lng, lat] = object.result.geometry.coordinates;
    onChangeCoordinates([lat, lng]);
    onChangeAddress(object.result.place_name);

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

