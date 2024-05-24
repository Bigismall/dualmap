import { $, $$ } from './dom.ts';

import 'leaflet/dist/leaflet.css';
import { DEFAULT_CENTER, DEFAULT_ZOOM, GOOGLE_MAPS_API_KEY } from './constants.ts';
import './style.css';
import { GoogleMapsFrame, OsmFrame, WikimapiaFrame } from './Map.class.ts';
import { MapOptions } from './types.ts';
import { checkUrlParams, parseGoogleMapsUrl } from './url.ts';

// TODO - Add columns visibility to URL

window.addEventListener('load', () => {
  const $elements = new Map<string, Element | NodeListOf<HTMLElement> | null>([
    ['app', $('#app')],
    ['osm', $('.js-osm')],
    ['googlemaps', $('.js-googlemaps')],
    ['wikimapia', $('.js-wikimapia')],
    ['axis', $$('.axis')],
  ]);

  const $somethingIsMissing = Array.from($elements.values()).some(($element) => $element === null);

  if ($somethingIsMissing) {
    window.alert('Some elements are missing');
    // display elements that are missing
    Array.from($elements.entries()).map(([key, $element]) => {
      if ($element === null) {
        console.log(key);
      }
    });
    return;
  }

  const axis = $elements.get('axis') as NodeListOf<HTMLElement>;
  const urlParams = checkUrlParams();

  const googleMaps = new GoogleMapsFrame(
    $elements.get('googlemaps') as HTMLIFrameElement,
    {
      lat: DEFAULT_CENTER[0],
      lng: DEFAULT_CENTER[1],
      zoom: DEFAULT_ZOOM,
    },
    {
      apiKey: GOOGLE_MAPS_API_KEY,
      key: 'l',
    },
  );
  const wikiMapia = new WikimapiaFrame(
    $elements.get('wikimapia') as HTMLIFrameElement,
    {
      lat: DEFAULT_CENTER[0],
      lng: DEFAULT_CENTER[1],
      zoom: DEFAULT_ZOOM,
    },
    {
      key: 'r',
    },
  );

  const mapOptions: MapOptions = urlParams
    ? {
        zoom: urlParams.zoom,
        lat: urlParams.lat,
        lng: urlParams.lng,
      }
    : {
        zoom: DEFAULT_ZOOM,
        lat: DEFAULT_CENTER[0],
        lng: DEFAULT_CENTER[1],
      };

  // if (urlParams?.layer) {
  // currentLayer = urlParams.layer;
  // }
  // mapOptions.layers = [osmLayers[currentLayer]];
  // mapOptions.maxZoom = MAX_ZOOM;

  const osm = new OsmFrame($elements.get('osm') as HTMLIFrameElement, mapOptions, {});

  osm.subscribe(googleMaps);
  osm.subscribe(wikiMapia);

  googleMaps.render();
  wikiMapia.render();

  const resizeObserver = new ResizeObserver(() => {
    osm.getInstance().invalidateSize();
  });

  // When a key is pressed, turn on/off axis
  window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === wikiMapia.config.key) {
      wikiMapia.toggle();
      return;
    }

    if (event.key.toLowerCase() === googleMaps.config.key) {
      googleMaps.toggle();
      return;
    }

    if (event.key.toLowerCase() === 'a') {
      Array.from(axis).map(($element) => {
        $element.classList.toggle('hidden');
      });
      return;
    }

    if (event.key.toLowerCase() === 'i') {
      const url = prompt('Enter Google Maps URL');
      if (url) {
        osm.setMapOptions(parseGoogleMapsUrl(url));
      }
    }
  });

  resizeObserver.observe(osm.$element);
});
