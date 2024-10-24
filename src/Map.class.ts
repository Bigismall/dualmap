import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { Message, MessageState } from './Message.type.ts';
import { Observer } from './Observer.interface.ts';
import { Publisher } from './Publisher.interface.ts';
import { HIDDEN_CLASS, KEY_IMPORT_URL, LayerName } from './constants';
import { osmLayers } from './layers.ts';
import { MapConfig, MapOptions } from './types';
import { parseGoogleMapsUrl, setUrlParams } from './url.ts';
import { log } from './utils/console.ts';

abstract class MapFrame {
  public $parent: HTMLElement | null = null;

  public constructor(
    public $element: HTMLElement,
    public mapOptions: MapOptions,
    public config: MapConfig,
  ) {
    this.$parent = $element.parentElement;
    this.destroy();

    if (config.frame) {
      this.$element.appendChild(this.generateIFrameElement());
    }
  }
  private generateIFrameElement(): HTMLIFrameElement {
    const $frame = document.createElement('iframe');
    $frame.src = '';
    $frame.width = '100%';
    $frame.height = '100%';
    $frame.loading = 'lazy';
    $frame.classList.add('layout__frame');
    $frame.title = 'Map';

    if (this.config.type === 'rail') {
      // Very custom solution for OpenRailwayMap
      $frame.style.marginLeft = '-300px';
      $frame.style.width = `calc(100% + 300px)`;
    }

    return $frame;
  }

  abstract getUrl(): string;

  public render(): void {
    (this.$element.firstChild as HTMLIFrameElement).src = this.getUrl();
  }

  public hide(): void {
    this.$parent?.classList.add(HIDDEN_CLASS);
  }
  public toggle(): void {
    this.$parent?.classList.toggle(HIDDEN_CLASS);
  }
  public setOptions(options: MapOptions): void {
    this.mapOptions = { ...options };
  }

  public destroy(): void {
    this.$element.innerText = '';
  }
}

export class MapObserver extends MapFrame implements Observer {
  getUrl(): string {
    throw new Error('Method not implemented.');
  }

  public update(publication: Message) {
    log('Publication:', publication, 'Observer:', this.$element.title);
    if (publication.state === MessageState.MoveMap) {
      this.setOptions(publication.data);
      this.render();
    }

    // if (publication.state === MessageState.KeyPressed) {
    //   if (publication.data.key.toLowerCase() === this.config.key) {
    //     this.toggle();
    //   }
    // }
  }
}

class MapPublisherObserver extends MapFrame implements Publisher, Observer {
  public subscribers: Observer[] = [];

  getUrl(): string {
    throw new Error('Method not implemented.');
  }

  update(_publication: Message): void {
    throw new Error('Method not implemented.');
  }

  subscribe(callback: Observer) {
    this.subscribers.push(callback);
  }

  unsubscribe(subscriber: Observer) {
    this.subscribers = this.subscribers.filter((s) => s !== subscriber);
  }

  publish(publication: Message) {
    this.subscribers.map((s) => {
      s.update(publication);
      return s;
    });
  }
}

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

//Open Railway Map
export class OpenRailwayMapFrame extends MapObserver {
  getUrl() {
    return `https://www.openrailwaymap.org/?style=standard&lat=${this.mapOptions.lat}&lon=${this.mapOptions.lng}&zoom=${this.mapOptions.zoom}`;
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
      layers: [osmLayers[this.currentLayer]],
      maxZoom: this.config.maxZoom,
    });
    const provider = new OpenStreetMapProvider();
    // @ts-ignore
    const search: L.Control = new GeoSearchControl({ provider: provider }) as L.Control;

    L.control.layers(osmLayers).addTo(this.instance);

    this.instance.addControl(search);

    this.instance.on('moveend', this.updatePosition);
    this.instance.on('baselayerchange', (event: L.LayersControlEvent) => {
      this.currentLayer = event.name as LayerName;
      setUrlParams(this.getMapOptions(), this.currentLayer);
    });
  }

  private readonly instance: L.Map;
  private currentLayer: LayerName = this.config.layer as LayerName;

  private updatePosition = () => {
    this.publish({
      state: MessageState.MoveMap,
      data: this.getMapOptions(),
    });
    setUrlParams(this.getMapOptions(), this.currentLayer);
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
