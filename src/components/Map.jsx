import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup, Circle, GeoJSON } from 'react-leaflet';
import osmtogeojson from 'osmtogeojson';
import 'leaflet/dist/leaflet.css';

const Map = () => {
    const [tapLocations, setTapLocations] = useState([]);
    const [houseLocations, setHouseLocations] = useState(null);


    useEffect(() => {
        const fetchTapData = async () => {
            const tapQuery = `
            [out:json];
            node["amenity"="drinking_water"](31.8,36.55,31.95,36.6);
            out;
            `;

            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(tapQuery)}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                console.log(data.elements);
                setTapLocations(data.elements);
            } catch (error) {
                console.error("Error fetching Overpass data:", error);
            }
        };

        const fetchHouseData = async () => {
            const houseQuery = `
            [out:json];
            (
            way["building"="house"](31.8,36.55,31.95,36.6);
            );
            out geom;
            `;

            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(houseQuery)}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                const geoJSON = osmtogeojson(data);

                setHouseLocations(geoJSON);
            } catch (error) {
                console.error("Error fetching Overpass data:", error);
            }
        };

        fetchTapData();
        fetchHouseData();
    }, []);

    return (
        <MapContainer center={[31.905, 36.581]} zoom={15} style={{ height: "800px", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            

            <LayersControl position="topright">
                <LayersControl.Overlay name="Water Taps">
                    <LayerGroup>
                        {tapLocations.map((location) => (
                            <Circle center={[location.lat, location.lon]} pathOptions={{ stroke: false }} radius={200} />
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>
                <LayersControl.Overlay name="Shelter Occupancy">
                    <LayerGroup>
                        {houseLocations && <GeoJSON data={houseLocations} style={() => ({ color: 'red', weight: 0, fillOpacity: 0.3 })}/>}
                        
                    </LayerGroup>
                </LayersControl.Overlay>
            </LayersControl>
        </MapContainer>
    );
};

export default Map;
