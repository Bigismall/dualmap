import { DEFAULT_LAYER, DEFAULT_ZOOM, LayerName, MAX_ZOOM } from "./constants";

export const setUrlParams = (latlong: L.LatLng, zoom: number, layer: LayerName) => {
    const url = new URL(window.location.href);
    url.searchParams.set('lat', latlong.lat.toString());
    url.searchParams.set('lon', latlong.lng.toString());
    url.searchParams.set('zoom', zoom.toString());
    url.searchParams.set('layer', layer);
    window.history.pushState({}, '', url.toString());
}


export const checkUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lon = urlParams.get('lon');
    const zoom = parseFloat(urlParams.get('zoom') ?? DEFAULT_ZOOM.toString());
    const layer = urlParams.get('layer') as LayerName | null;
    if (lat && lon) {
        return {
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            zoom: zoom > MAX_ZOOM ? MAX_ZOOM : zoom,
            layer: layer ?? DEFAULT_LAYER
        }
    }
    return null;
};