const map = L.map('map').setView([47.5316, 21.6273], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

function getColor(score) {
    if (score >= 66) return '#2ed573';
    if (score >= 33) return '#ffa502';
    return '#ff4757';
}

function calculateRating(stop) {
    let score = 100;

    if (stop["Covered"] === "No") score -= 20;
    if (stop["Wheelchair accessible"] === "No") score -= 20;
    if (stop["Lightning"] === "No") score -= 10;
    if (stop["Bus bay available"] === "No") score -= 10;
    if (stop["Spaces available"] && stop["Spaces available"].includes("0")) score -= 10;
    
    if (stop["Temperature"] && stop["Temperature"] > 30) score -= 10;

    if (stop["Problems"] && stop["Problems"] !== "None" && stop["Problems"] !== "") {
        const problemsCount = stop["Problems"].split(",").length;
        score -= (problemsCount * 10);
    }

    return Math.max(0, score);
}

function renderBusStops(jsonData) {
    const listContainer = document.querySelector('#bus-stop-list ul');
    listContainer.innerHTML = '';
    listContainer.style.padding = "0";

    const processedStops = jsonData.map(stop => {
        const coords = stop["Coordinates"].split(", ");
        const lng = parseFloat(coords[0]);
        const lat = parseFloat(coords[1]);

        return {
            ...stop,
            lat: lat,
            lng: lng,
            score: calculateRating(stop)
        };
    });

    processedStops.sort((a, b) => a.score - b.score);

    processedStops.forEach(stop => {
        const color = getColor(stop.score);

        L.circleMarker([stop.lat, stop.lng], {
            radius: 12,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        })
        .addTo(map)
        .bindPopup(`
            <b style="font-size:1.1rem;">${stop["Bus stop"]}</b><br>
            <hr style="margin:5px 0;">
            <b>Index:</b> <span style="color:${color}; font-weight:bold; font-size:1.1rem;">${stop.score}/100</span><br>
            <b>Temperature:</b> ${stop.Temperature} °C<br>
            <b>Problems:</b> ${stop.Problems || "Not recorded"}
        `);

        const li = document.createElement('li');
        li.style.marginBottom = "15px";
        li.style.padding = "15px";
        li.style.backgroundColor = "rgba(0,0,0,0.2)";
        li.style.borderRadius = "8px";
        li.style.borderLeft = `6px solid ${color}`;
        li.style.listStyle = "none";
        
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong style="font-size: 1.1rem;">${stop["Bus stop"]}</strong>
                <span style="background:${color}; color:${stop.score > 60 ? '#000' : '#fff'}; padding:3px 8px; border-radius:12px; font-weight:bold; font-size:0.9rem;">
                    ${stop.score}/100
                </span>
            </div>
            <div style="font-size: 0.85rem; color: #ccc; margin-bottom: 5px;">
                <span>${stop["Wheelchair accessible"] === "Yes" ? "Accessible" : "Not accessible"}</span> | 
                <span>${stop["Covered"] === "Yes" ? "Available rain shelter" : "No Rain shelter"}</span>
            </div>
            <div style="font-size: 0.85rem; color: #ff6b81;">
                <i>${stop.Problems && stop.Problems !== "None" ? "Issues: " + stop.Problems : "There is no issues"}</i>
            </div>
        `;
        listContainer.appendChild(li);
    });
}

fetch('BusStops_FELTOLTOTT.json')
    .then(response => response.json())
    .then(data => renderBusStops(data))
    .catch(error => console.error(error));