export const MAP_ANCHORS = [
    { lat: 14.5995, lng: 120.9842, x: 248, y: 308 },  // NCR
    { lat: 16.41, lng: 120.60, x: 240, y: 220 },  // CAR
    { lat: 16.08, lng: 120.39, x: 210, y: 248 },  // Region I
    { lat: 17.64, lng: 121.73, x: 275, y: 235 },  // Region II
    { lat: 15.03, lng: 120.69, x: 235, y: 285 },  // Region III
    { lat: 14.10, lng: 121.30, x: 260, y: 335 },  // Region IV-A
    { lat: 12.00, lng: 121.00, x: 195, y: 380 },  // Region IV-B
    { lat: 13.42, lng: 123.41, x: 305, y: 370 },  // Region V
    { lat: 10.72, lng: 122.56, x: 225, y: 450 },  // Region VI
    { lat: 10.32, lng: 123.89, x: 290, y: 460 },  // Region VII
    { lat: 11.25, lng: 124.96, x: 340, y: 440 },  // Region VIII
    { lat: 7.83, lng: 123.13, x: 195, y: 560 },  // Region IX
    { lat: 8.02, lng: 124.69, x: 270, y: 530 },  // Region X
    { lat: 7.07, lng: 125.61, x: 310, y: 570 },  // Region XI
    { lat: 6.50, lng: 124.85, x: 270, y: 580 },  // Region XII
    { lat: 8.95, lng: 125.97, x: 330, y: 520 },  // Region XIII
    { lat: 7.21, lng: 124.25, x: 235, y: 540 },  // BARMM
];

/** Convert geographic lat/lng to SVG coordinates using inverse distance weighting. */
export function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    for (const anchor of MAP_ANCHORS) {
        const dLat = lat - anchor.lat;
        const dLng = lng - anchor.lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);

        if (dist < 0.001) {
            return { x: anchor.x, y: anchor.y };
        }

        const weight = 1 / (dist * dist);
        totalWeight += weight;
        weightedX += anchor.x * weight;
        weightedY += anchor.y * weight;
    }

    return {
        x: Math.round(weightedX / totalWeight),
        y: Math.round(weightedY / totalWeight),
    };
}

/** Convert SVG coordinates (viewBox="0 0 500 700") back to geographic lat/lng using inverse distance weighting. */
export function svgToLatLng(x: number, y: number): { lat: number; lng: number } {
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;

    for (const anchor of MAP_ANCHORS) {
        const dx = x - anchor.x;
        const dy = y - anchor.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1) {
            return { lat: anchor.lat, lng: anchor.lng };
        }

        const weight = 1 / (dist * dist);
        totalWeight += weight;
        weightedLat += anchor.lat * weight;
        weightedLng += anchor.lng * weight;
    }

    return {
        lat: Number((weightedLat / totalWeight).toFixed(6)),
        lng: Number((weightedLng / totalWeight).toFixed(6)),
    };
}
