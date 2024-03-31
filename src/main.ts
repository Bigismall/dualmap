import * as L from 'leaflet';
import { $ } from './dom.ts';


import 'leaflet/dist/leaflet.css';
import './style.css';

const DEFAULT_CENTER: [number, number] = [54.374705, 18.466730];
const DEFAULT_ZOOM: number = 14;
const GOOGLE_MAPS_API_KEY = 'AIzaSyD5tEvgJ-K0mjJ-4Nb18EKAEF3pGhVn27g'

const googleMapSrc = (latlong: L.LatLng, zoom: number) => `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${latlong.lat},${latlong.lng}&zoom=${zoom}&maptype=satellite`


const wikimapiaSrc = (latlong: L.LatLng, zoom: number) => `https://wikimapia.org/#lat=${latlong.lat}&lon=${latlong.lng}&z=${zoom}&l=&ifr=1&m=w`

// TODO - add comass to source code (check ts settings) 

window.addEventListener('load', function () {

  const $elements = new Map<string, Element | NodeListOf<HTMLElement> | null>([
    ['app', $('#app')],
    ['osm', $('.js-osm')],
    ['googlemaps', $('.js-googlemaps')],
    ['wikimapia', $('.js-wikimapia')],
  ]);

  const $somethingIsMissing = Array.from($elements.values()).some($element => $element === null);

  if ($somethingIsMissing) {
    window.alert(`Some elements are missing`);
    return;
  }

  const googlemaps = $elements.get('googlemaps') as HTMLIFrameElement;
  const wikimapia = $elements.get('wikimapia') as HTMLIFrameElement;

  const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  })

  var OpenStreetMap_DELayer = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  const humanitarianLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
  })

  const OpenTopoMapLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  const CyclOSMLayer = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
    attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  const Esri_WorldImageryLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  const osm = L.map($elements.get('osm') as HTMLDivElement, {
    layers: [osmLayer],
    zoom: DEFAULT_ZOOM,
    center: DEFAULT_CENTER,
  });

  L.control.layers({
    "OpenStreetMap": osmLayer,
    "OpenStreetMap DE": OpenStreetMap_DELayer,
    "Humanitarian": humanitarianLayer,
    "OpenTopoMap": OpenTopoMapLayer,
    "CyclOSM": CyclOSMLayer,
    "Esri World Imagery": Esri_WorldImageryLayer,
  }).addTo(osm);


  googlemaps.src = googleMapSrc(osm.getCenter(), osm.getZoom());
  wikimapia.src = wikimapiaSrc(osm.getCenter(), osm.getZoom());

  osm.on('moveend', () => {
    googlemaps.src = googleMapSrc(osm.getCenter(), osm.getZoom());
    wikimapia.src = wikimapiaSrc(osm.getCenter(), osm.getZoom());

    // wikimapia.contentWindow?.location.replace(wikimapiaSrc(osm.getCenter(), osm.getZoom()));
    // googlemaps.contentWindow?.location.replace(googleMapSrc(osm.getCenter(), osm.getZoom()));
  });

  osm.on('zoomend', () => {
    googlemaps.src = googleMapSrc(osm.getCenter(), osm.getZoom());
    wikimapia.src = wikimapiaSrc(osm.getCenter(), osm.getZoom());
  });


  const resizeObserver = new ResizeObserver(() => {
    osm.invalidateSize();
  });

  resizeObserver.observe($elements.get('osm') as HTMLDivElement);

});
