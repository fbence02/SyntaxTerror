const map = L.map('map').setView([47.5316, 21.6273], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

function getColor(rating) {
    if (rating < 33) return 'green';
    if (rating < 66) return 'yellow';
    return 'red';
}

function renderBusStops(stopsData) {
    stopsData.forEach(stop => {
        L.circleMarker([stop.lat, stop.lng], {
            radius: 12, // Pötty mérete
            fillColor: getColor(stop.rating),
            color: '#000', // Pötty kerete
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        })
        .addTo(map)
        .bindPopup(`<b>${stop.name}</b><br>Szennyezettség: ${stop.rating}`);
    });
}

const mockBackendData = [
    { id: 1, name: "Nagyállomás", lat: 47.5218, lng: 21.6247, rating: 85 }, // Piros lesz
    { id: 2, name: "Csokonai Színház", lat: 47.5298, lng: 21.6253, rating: 45 }, // Sárga lesz
    { id: 3, name: "Egyetem tér", lat: 47.5539, lng: 21.6219, rating: 20 }   // Zöld lesz
];

renderBusStops(mockBackendData);