import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { MapObserver, MapPublisherObserver } from './Map.class.ts';
import { DEFAULT_MAP_TYPE, KEY_IMPORT_URL } from './constants.ts';
import { osmLayers } from './layers.ts';
import { LayerName, MapConfig, MapOptions, Message, MessageState } from './types.ts';
import { getUrlParams, parseGoogleMapsUrl, setUrlParams } from './url.ts';
import { log } from './utils/console.ts';
import { rootFontSize } from './utils/dom.ts';

export class GoogleMapsFrame extends MapObserver {
  public getUrl() {
    return `https://www.google.com/maps/embed/v1/view?key=${this.config.apiKey}&center=${this.mapOptions.lat},${this.mapOptions.lng}&zoom=${this.mapOptions.zoom}&maptype=satellite`;
  }
}

export class WikiMapiaFrame extends MapObserver {
  getUrl() {
    return `https://wikimapia.org/#lat=${this.mapOptions.lat}&lon=${this.mapOptions.lng}&z=${this.mapOptions.zoom}&l=&ifr=1&m=w`;
  }
}

export class BingMapsFrame extends MapObserver {
  getUrl() {
    const width = window.innerWidth / 2;
    const height = window.innerHeight - 2 * rootFontSize; //-2rem
    return `https://www.bing.com/maps/embed?h=${height}&w=${width}&cp=${this.mapOptions.lat}~${this.mapOptions.lng}&lvl=${this.mapOptions.zoom}&typ=MapType`;
  }
}

export class ADSBExchangeFrame extends MapObserver {
  getUrl() {
    return `https://globe.adsbexchange.com/?lat=${this.mapOptions.lat}&lon=${this.mapOptions.lng}&zoom=${this.mapOptions.zoom}&hideSidebar&enableLabels&extendedLabels=2`;
  }
}

export class OsmFrame extends MapPublisherObserver {
  constructor(
    public $element: HTMLIFrameElement,
    public mapOptions: MapOptions,
    public config: MapConfig,
  ) {
    super($element, mapOptions, config);

    this.instance = L.map($element as HTMLDivElement, {
      center: [this.mapOptions.lat, this.mapOptions.lng],
      zoom: this.mapOptions.zoom,
      layers: [osmLayers[this.currentLayer][0]],
      maxZoom: this.config.maxZoom,
    });
    const provider = new OpenStreetMapProvider();
    // @ts-ignore
    const search: L.Control = new GeoSearchControl({ provider: provider }) as L.Control;

    this.instance.addControl(search);
    this.instance.on('moveend', this.updatePosition);
  }

  private readonly instance: L.Map;
  private currentLayer: LayerName = this.config.layer as LayerName;

  private updatePosition = () => {
    this.publish({
      state: MessageState.MoveMap,
      data: this.getMapOptions(),
    });
    const params = getUrlParams();
    const type = params?.type ?? DEFAULT_MAP_TYPE;

    setUrlParams(this.getMapOptions(), this.currentLayer, type);
  };

  update(publication: Message) {
    log('Publication:', publication, 'Observer: OSM');

    if (publication.state === MessageState.KeyPressed) {
      if (publication.data.key.toLowerCase() === KEY_IMPORT_URL) {
        const url = prompt('Enter Google Maps URL');
        if (url) {
          this.setMapOptions(parseGoogleMapsUrl(url));
        }
      }
    }
  }

  getUrl = () => '';

  getInstance() {
    return this.instance;
  }

  getLayer() {
    return this.currentLayer;
  }

  switchLayerTo(layer: LayerName) {
    // FIXME - remove all layers, and add all layers
    // this.instance.removeLayer(osmLayers[this.currentLayer][0]);
    this.instance.eachLayer((layer) => {
      this.instance.removeLayer(layer);
    });
    // this.instance.addLayer(osmLayers[layer][0]);
    osmLayers[layer].forEach((layer) => {
      this.instance.addLayer(layer);
    });

    this.currentLayer = layer;

    const { type } = getUrlParams();
    setUrlParams(this.getMapOptions(), layer, type);
  }

  getMapOptions = (): MapOptions => ({
    lat: this.instance.getCenter().lat,
    lng: this.instance.getCenter().lng,
    zoom: this.instance.getZoom(),
  });

  setMapOptions = (options: MapOptions) => {
    this.instance.setView([options.lat, options.lng], options.zoom);
    this.updatePosition();
  };
}
