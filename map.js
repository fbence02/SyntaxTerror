const map = L.map('map').setView([47.5316, 21.6273], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const markersLayer = L.layerGroup().addTo(map);
let allStops = [];
let currentFilters = {
    accessible: false,
    sheltered: false,
    problematic: false
};
let currentSort = 'asc';

function getColor(score) {
    if (score >= 66) return '#2ed573';
    if (score >= 33) return '#ffa502';
    return '#ff4757';
}

function calculateRating(stop) {
    let score = 100;

    if (stop["Covered"] === "No") {
        score -= 30;
    }
    if (stop["Wheelchair accessible"] === "No") {
        score -= 25;
    }
    if (stop["Lightning"] === "No") {
        score -= 15;
    }

    if (stop["Spaces available"] && stop["Spaces available"].includes("0")) {
        score -= 10;
    }
    if (stop["Bus bay available"] === "No") {
        score -= 10;
    }

    if (stop["Temperature"] && stop["Temperature"] > 30) {
        score -= 5;
    }

    return Math.max(0, score);
}

function initControls(jsonData) {
    const listParent = document.querySelector('#bus-stop-list');

    if (listParent && !document.querySelector('#controls-container')) {
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'controls-container';
        controlsContainer.style.marginBottom = '15px';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.flexDirection = 'column';
        controlsContainer.style.gap = '10px';
        controlsContainer.style.backgroundColor = 'rgba(0,0,0,0.2)';
        controlsContainer.style.padding = '15px';
        controlsContainer.style.borderRadius = '8px';

        controlsContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <span style="font-weight: bold; font-size: 1.1rem; color: #fff;">Filter by:</span>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <label style="color: #fff; display: flex; align-items: center; cursor: pointer;"><input type="checkbox" id="filter-accessible" style="margin-right: 5px; cursor: pointer;"> Wheelchair Accessible</label>
                        <label style="color: #fff; display: flex; align-items: center; cursor: pointer;"><input type="checkbox" id="filter-sheltered" style="margin-right: 5px; cursor: pointer;"> Rain Shelter</label>
                        <label style="color: #fff; display: flex; align-items: center; cursor: pointer;"><input type="checkbox" id="filter-problematic" style="margin-right: 5px; cursor: pointer;"> Has Problems</label>
                    </div>
                </div>
                <div style="display: flex; align-items: center;">
                    <label for="sort-select" style="margin-right: 10px; font-weight: bold; font-size: 1.1rem; color: #fff;">Sort by:</label>
                    <select id="sort-select" style="padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(0, 0, 0, 0.5); color: #fff; cursor: pointer; outline: none;">
                        <option value="asc">Rating (Low to High)</option>
                        <option value="desc">Rating (High to Low)</option>
                        <option value="name_asc">Name (A-Z)</option>
                        <option value="name_desc">Name (Z-A)</option>
                    </select>
                </div>
            </div>
        `;

        const ul = listParent.querySelector('ul');
        listParent.insertBefore(controlsContainer, ul);

        document.getElementById('filter-accessible').addEventListener('change', (e) => {
            currentFilters.accessible = e.target.checked;
            applyFiltersAndRender();
        });

        document.getElementById('filter-sheltered').addEventListener('change', (e) => {
            currentFilters.sheltered = e.target.checked;
            applyFiltersAndRender();
        });

        document.getElementById('filter-problematic').addEventListener('change', (e) => {
            currentFilters.problematic = e.target.checked;
            applyFiltersAndRender();
        });

        document.getElementById('sort-select').addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFiltersAndRender();
        });
    }

    allStops = jsonData.map(stop => {
        const coords = stop["Coordinates"].split(", ");
        const lat = parseFloat(coords[1]);
        const lng = parseFloat(coords[0]);

        return {
            ...stop,
            lat: lat,
            lng: lng,
            score: calculateRating(stop)
        };
    });

    applyFiltersAndRender();
}

function applyFiltersAndRender() {
    let filteredStops = [...allStops];

    if (currentFilters.accessible) {
        filteredStops = filteredStops.filter(stop => stop["Wheelchair accessible"] === "Yes");
    }
    if (currentFilters.sheltered) {
        filteredStops = filteredStops.filter(stop => stop["Covered"] === "Yes");
    }
    if (currentFilters.problematic) {
        filteredStops = filteredStops.filter(stop => stop["Problems"] && stop["Problems"] !== "None" && stop["Problems"] !== "Nincs észlelt probléma" && stop["Problems"] !== "");
    }

    if (currentSort === 'asc') {
        filteredStops.sort((a, b) => a.score - b.score);
    } else if (currentSort === 'desc') {
        filteredStops.sort((a, b) => b.score - a.score);
    } else if (currentSort === 'name_asc') {
        filteredStops.sort((a, b) => a["Bus stop"].localeCompare(b["Bus stop"], 'hu'));
    } else if (currentSort === 'name_desc') {
        filteredStops.sort((a, b) => b["Bus stop"].localeCompare(a["Bus stop"], 'hu'));
    }

    renderFilteredStops(filteredStops);
}

function renderFilteredStops(stops) {
    const listContainer = document.querySelector('#bus-stop-list ul');
    listContainer.innerHTML = '';
    markersLayer.clearLayers();

    stops.forEach(stop => {
        const color = getColor(stop.score);

        L.circleMarker([stop.lat, stop.lng], {
            radius: 12,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        })
        .addTo(markersLayer)
        .bindPopup(`
            <b style="font-size:1.1rem;">${stop["Bus stop"]}</b><br>
            <hr style="margin:5px 0;">
            <b>Index:</b> <span style="color:${color}; font-weight:bold; font-size:1.1rem;">${stop.score}/100</span><br>
            <b>Temperature:</b> ${stop.Temperature} °C<br>
            <i>${stop.Problems && stop.Problems !== "None" && stop.Problems !== "Nincs észlelt probléma" && stop.Problems !== "" ? "Issues: " + stop.Problems : "No issues reported"}</i>
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
                <span>${stop["Wheelchair accessible"] === "Yes" ? "Accessible by wheelchair" : "Not accessible"}</span> | 
                <span>${stop["Covered"] === "Yes" ? "Available rain shelter" : "No Rain shelter"}</span>
            </div>
            <div style="font-size: 0.85rem; color: #ff6b81;">
                <i>${stop.Problems && stop.Problems !== "None" && stop.Problems !== "Nincs észlelt probléma" && stop.Problems !== "" ? "Issues: " + stop.Problems : "There are no issues"}</i>
            </div>
        `;
        listContainer.appendChild(li);
    });
}

fetch('BusStops_FELTOLTOTT.json')
    .then(response => response.json())
    .then(data => initControls(data))
    .catch(error => console.error(error));