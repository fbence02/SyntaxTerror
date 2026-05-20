async function fetchSmartBusStopData() {
    try {
        const response = await fetch('/api/data');
        
        if (!response.ok) {
            throw new Error(`Szerver hiba: ${response.status}`);
        }
        const data = await response.json();

        if (Object.keys(data).length === 0) {
            console.log("Simi még nem küldött adatot a backendre.");
            return;
        }
        console.log("Sikeresen lekérve a backendről:", data);

    } catch (error) {
        console.error("Nem sikerült elérni a backendet:", error);
    }
}

fetchSmartBusStopData();