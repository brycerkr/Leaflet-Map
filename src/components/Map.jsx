import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = () => {
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        const fetchOSMData = async () => {
            const overpassQuery = `
            [out:json];
            node["amenity"="drinking_water"](31.8,36.55,31.95,36.6);
            out;
            `;

            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                console.log(data.elements);
                setLocations(data.elements);
            } catch (error) {
                console.error("Error fetching Overpass data:", error);
            }
        };

        fetchOSMData();
    }, []);

    return (
        <MapContainer center={[31.905, 36.581]} zoom={15} style={{ height: "800px", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <LayersControl>
                <LayersControl.Overlay name="Water Taps">
                    <LayerGroup>
                    {locations.map((location) => (
                        <Marker position={[location.lat, location.lon]}>
                            <Popup>Water Tap</Popup>
                        </Marker>
                    ))}
                    </LayerGroup>
                </LayersControl.Overlay>
            </LayersControl>
        </MapContainer>
    );
};

export default Map;
