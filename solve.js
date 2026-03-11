const MAP_ANCHORS = [
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

function solve(anchors) {
    let sumX = 0, sumY = 0, sumLng = 0, sumLat = 0;
    let sumLng2 = 0, sumLat2 = 0, sumLngLat = 0;
    let sumXLng = 0, sumXLat = 0;
    let sumYLng = 0, sumYLat = 0;
    let n = anchors.length;

    for (let p of anchors) {
        sumX += p.x;
        sumY += p.y;
        sumLng += p.lng;
        sumLat += p.lat;
        sumLng2 += p.lng * p.lng;
        sumLat2 += p.lat * p.lat;
        sumLngLat += p.lng * p.lat;
        sumXLng += p.x * p.lng;
        sumXLat += p.x * p.lat;
        sumYLng += p.y * p.lng;
        sumYLat += p.y * p.lat;
    }

    // Solves normal equations for x = a*lng + b*lat + c
    // We can use math.js or just do Gaussian elimination. 
    // Here we just do something simpler:
    // Actually, x is mostly dependent on lng, y on lat. Let's just do two separate simple linear regressions.

    // 1. x = m1 * lng + c1
    const xDenom = (n * sumLng2 - sumLng * sumLng);
    const m1 = (n * sumXLng - sumLng * sumX) / xDenom;
    const c1 = (sumX - m1 * sumLng) / n;

    // 2. y = m2 * lat + c2
    const yDenom = (n * sumLat2 - sumLat * sumLat);
    const m2 = (n * sumYLat - sumLat * sumY) / yDenom;
    const c2 = (sumY - m2 * sumLat) / n;

    console.log(`x = ${m1} * lng + ${c1}`);
    console.log(`y = ${m2} * lat + ${c2}`);
}

solve(MAP_ANCHORS);
