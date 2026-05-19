function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active-view');
    });

    document.getElementById(tabId).classList.add('active-view');

    document.querySelectorAll('.menu li').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

const interventions = [
    { stopName: "Kálvin tér", issue: "Nincs esőbeálló, magas utasszám", cost: "Magas prioritás", color: "#ff4757" },
    { stopName: "Egyetem sugárút", issue: "Nem akadálymentesített", cost: "Közepes prioritás", color: "#ffa502" },
    { stopName: "Nagyállomás", issue: "Utastájékoztató tábla olvashatatlan", cost: "Közepes prioritás", color: "#ffa502" },
    { stopName: "Füredi út", issue: "Várakozó felület sérült", cost: "Alacsony prioritás", color: "#2ed573" }
];

function loadInterventions() {
    const list = document.getElementById('intervention-list');
    interventions.forEach(item => {
        const li = document.createElement('li');
        li.style.borderLeftColor = item.color;
        li.innerHTML = `
            <div>
                <strong>${item.stopName}</strong>
                <p style="font-size: 0.8rem; color: #94a3b8;">${item.issue}</p>
            </div>
            <span style="font-size: 0.8rem; color: ${item.color};">${item.cost}</span>
        `;
        list.appendChild(li);
    });
}

function initChart() {
    const ctx = document.getElementById('trafficChart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
            datasets: [
                {
                    label: 'Átlagos Utasszám (Kálvin tér)',
                    data: [120, 450, 200, 250, 300, 480, 220, 90],
                    borderColor: '#00e5ff',
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Komfort Kapacitás Limit',
                    data: [250, 250, 250, 250, 250, 250, 250, 250],
                    borderColor: '#ff4757',
                    borderDash: [5, 5],
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#f8fafc' } }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadInterventions();
    initChart();
});