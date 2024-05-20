import { GOOGLE_MAPS_API_KEY } from "./constants";
import { MapOptions } from "./types";

abstract class MapFrame {
    constructor(public $element: HTMLElement, public options: MapOptions) {
    }
    abstract getUrl(): string;
}


export class GoogleMapsFrame extends MapFrame {
    getUrl() {
        return `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${this.options.lat},${this.options.lng}&zoom=${this.options.zoom}&maptype=satellite`;
    }
}

export class WikimapiaFrame extends MapFrame {
    getUrl() {
        return `https://wikimapia.org/#lat=${this.options.lat}&lon=${this.options.lng}&z=${this.options.zoom}&l=&ifr=1&m=w`;
    }
}