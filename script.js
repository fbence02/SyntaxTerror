const map = L.map('map').setView([47.5316, 21.6273], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

function getColor(rating) {
    if (rating < 33) return 'green';
    if (rating < 66) return 'yellow';
    return 'red';
}

function renderBusStops(stopsData) {
    stopsData.forEach(stop => {
        L.circleMarker([stop.lat, stop.lng], {
            radius: 12,
            fillColor: getColor(stop.rating),
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        })
        .addTo(map)
        .bindPopup(`<b>${stop.name}</b><br>Szennyezettség: ${stop.rating}`);
    });
}

async function fetchBusStops() {
    try {
        const response = await fetch('https://sajat-api.hu/api/megallok');
        
        if (!response.ok) throw new Error(`Szerverhiba: ${response.status}`);
        
        const data = await response.json();
        renderBusStops(data);

    } catch (error) {
        console.error('Hiba az adatok betöltésekor:', error);
    }
}

fetchBusStops();