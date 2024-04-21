import L from 'leaflet';
import { $ } from './dom.ts';

import 'leaflet/dist/leaflet.css';
import { DEFAULT_CENTER, DEFAULT_LAYER, DEFAULT_ZOOM, GOOGLE_MAPS_API_KEY, LayerName, MAX_ZOOM } from './constants.ts';
import { osmLayers } from './layers.ts';
import './style.css';
import { checkUrlParams, setUrlParams } from './url.ts';

const googleMapSrc = (latlong: L.LatLng, zoom: number) => `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${latlong.lat},${latlong.lng}&zoom=${zoom}&maptype=satellite`
const wikimapiaSrc = (latlong: L.LatLng, zoom: number) => `https://wikimapia.org/#lat=${latlong.lat}&lon=${latlong.lng}&z=${zoom}&l=&ifr=1&m=w`

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


  let currentLayer: LayerName = DEFAULT_LAYER
  const googlemaps = $elements.get('googlemaps') as HTMLIFrameElement;
  const wikimapia = $elements.get('wikimapia') as HTMLIFrameElement;
  const urlParams = checkUrlParams();

  if (urlParams?.layer) {
    currentLayer = urlParams.layer;
  }

  const mapOptions: L.MapOptions = urlParams ? {
    zoom: urlParams.zoom,
    center: [urlParams.lat, urlParams.lon] as [number, number],
  } : {
    zoom: DEFAULT_ZOOM,
    center: DEFAULT_CENTER,
  }
  mapOptions.layers = [osmLayers[currentLayer]];
  mapOptions.maxZoom = MAX_ZOOM;

  const osm = L.map($elements.get('osm') as HTMLDivElement, mapOptions);

  L.control.layers(osmLayers).addTo(osm);

  googlemaps.src = googleMapSrc(osm.getCenter(), osm.getZoom());
  wikimapia.src = wikimapiaSrc(osm.getCenter(), osm.getZoom());

  osm.on('baselayerchange', (event) => {
    currentLayer = event.name as LayerName;
    setUrlParams(osm.getCenter(), osm.getZoom(), currentLayer);
  });

  osm.on('moveend', () => {
    googlemaps.src = googleMapSrc(osm.getCenter(), osm.getZoom());
    wikimapia.src = wikimapiaSrc(osm.getCenter(), osm.getZoom());
    setUrlParams(osm.getCenter(), osm.getZoom(), currentLayer);
  });

  osm.on('zoomend', () => {
    googlemaps.src = googleMapSrc(osm.getCenter(), osm.getZoom());
    wikimapia.src = wikimapiaSrc(osm.getCenter(), osm.getZoom());
    setUrlParams(osm.getCenter(), osm.getZoom(), currentLayer);
  });




  const resizeObserver = new ResizeObserver(() => {
    osm.invalidateSize();
  });

  resizeObserver.observe($elements.get('osm') as HTMLDivElement);

});
