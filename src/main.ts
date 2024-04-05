import L from 'leaflet';
import { $ } from './dom.ts';


import 'leaflet/dist/leaflet.css';
import { osmLayers } from './layers.ts';
import './style.css';

const DEFAULT_CENTER: [number, number] = [54.374705, 18.466730];
const DEFAULT_ZOOM: number = 14;
const GOOGLE_MAPS_API_KEY = 'AIzaSyD5tEvgJ-K0mjJ-4Nb18EKAEF3pGhVn27g';

const googleMapSrc = (latlong: L.LatLng, zoom: number) => `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${latlong.lat},${latlong.lng}&zoom=${zoom}&maptype=satellite`


const wikimapiaSrc = (latlong: L.LatLng, zoom: number) => `https://wikimapia.org/#lat=${latlong.lat}&lon=${latlong.lng}&z=${zoom}&l=&ifr=1&m=w`

// TODO add options to toggle axis 

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


  const osm = L.map($elements.get('osm') as HTMLDivElement, {
    layers: [osmLayers['OSM']],
    zoom: DEFAULT_ZOOM,
    maxZoom: 20,
    center: DEFAULT_CENTER,
  });

  L.control.layers(osmLayers).addTo(osm);

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
