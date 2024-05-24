import { $, $$ } from './dom.ts';

import 'leaflet/dist/leaflet.css';
import { DEFAULT_CENTER, DEFAULT_ZOOM, GOOGLE_MAPS_API_KEY } from './constants.ts';
import './style.css';
import { GoogleMapsFrame, OsmFrame, WikimapiaFrame } from './Map.class.ts';
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

  const osm = new OsmFrame(
    $elements.get('osm') as HTMLIFrameElement,
    {
      lat: DEFAULT_CENTER[0],
      lng: DEFAULT_CENTER[1],
      zoom: DEFAULT_ZOOM,
    },
    {},
  );

  osm.subscribe(googleMaps);
  osm.subscribe(wikiMapia);

  const axis = $elements.get('axis') as NodeListOf<HTMLElement>;
  const urlParams = checkUrlParams();

  if (urlParams?.layer) {
    // currentLayer = urlParams.layer;
  }

  // const mapOptions: L.MapOptions = urlParams
  //   ? {
  //       zoom: urlParams.zoom,
  //       center: [urlParams.lat, urlParams.lon] as [number, number],
  //     }
  //   : {
  //       zoom: DEFAULT_ZOOM,
  //       center: DEFAULT_CENTER,
  //     };
  // mapOptions.layers = [osmLayers[currentLayer]];
  // mapOptions.maxZoom = MAX_ZOOM;

  googleMaps.render();
  wikiMapia.render();

  const resizeObserver = new ResizeObserver(() => {
    osm.getInstance().invalidateSize();
  });

  // When a key is pressed, turn on/off axis
  window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'a') {
      Array.from(axis).map(($element) => {
        $element.classList.toggle('hidden');
      });
    }

    if (event.key.toLowerCase() === 'r') {
      // wikimapia.parentElement?.classList.toggle('hidden');
    }

    if (event.key.toLowerCase() === 'l') {
      // googlemaps.parentElement?.classList.toggle('hidden');
    }

    if (event.key.toLowerCase() === 'i') {
      const url = prompt('Enter Google Maps URL');
      if (url) {
        const { lat, lon, zoom } = parseGoogleMapsUrl(url);
        osm.getInstance().setView([lat, lon], zoom);
        // osm.setView([lat, lon], zoom);

        // googlemaps.src = googleMapSrc(osm.getCenter(), osm.getZoom());
        // wikimapia.src = wikimapiaSrc(osm.getCenter(), osm.getZoom());
        // setUrlParams(osm.getInstance().getCenter(), osm.getInstance().getZoom(), currentLayer);
      }
    }
  });

  resizeObserver.observe(osm.$element);
});
