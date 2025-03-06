import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup, Circle, GeoJSON, useMapEvents } from 'react-leaflet';
import osmtogeojson from 'osmtogeojson';
import 'leaflet/dist/leaflet.css';

const defaultStyle = {
    weight: 0,
    fillColor: 'blue',
    fillOpacity: 0.2,
};

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: (e) => {
            e.target.setStyle({
                fillOpacity: 0.4,
            });
        },
        mouseout: (e) => {
            e.target.setStyle(defaultStyle);
        },
    });

    layer.bindTooltip("Replace me with data");
}

function ClickHandler({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        }
    });
    return null;
}

const Map = () => {

    const [tapLocations, setTapLocations] = useState([]);
    const [neighbourhoodLocations, setNeighbourhoodLocations] = useState(null);
    const [customTents, setCustomTents] = useState([]);


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

        const fetchNeighbourhoodData = async () => {
            const neighbourhoodQuery = `
            [out:json];
            (
            way["place"="neighbourhood"](31.8,36.55,31.95,36.6);
            );
            out geom;
            `;

            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(neighbourhoodQuery)}`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                const geoJSON = osmtogeojson(data);

                setNeighbourhoodLocations(geoJSON);
            } catch (error) {
                console.error("Error fetching Overpass data:", error);
            }
        };

        fetchTapData();
        fetchNeighbourhoodData();
    }, []);

    const handleMapClick = (latlng) => {
        setCustomTents((prev) => [...prev, latlng]);
    };

    return (
        <MapContainer center={[31.905, 36.581]} zoom={15} style={{ height: "800px", width: "100%" }}>
            <ClickHandler onMapClick={handleMapClick} />
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="OpenStreetMap">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Google Maps">
                    <TileLayer
                        url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                        subdomains={["mt0", "mt1", "mt2", "mt3"]}
                        attribution="&copy; Google"
                    />
                </LayersControl.BaseLayer>
                <LayersControl.Overlay name="Water Taps">
                    <LayerGroup>
                        {tapLocations.map((location) => (
                            <Circle center={[location.lat, location.lon]} pathOptions={{ stroke: false }} radius={200} />
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>
                <LayersControl.Overlay name="Neighbourhood data">
                    <LayerGroup>
                        {neighbourhoodLocations &&
                            <GeoJSON
                                data={neighbourhoodLocations}
                                style={defaultStyle}
                                onEachFeature={(feature, layer) => {
                                    onEachFeature(feature, layer);
                                }}
                            />
                        }
                    </LayerGroup>
                </LayersControl.Overlay>
                <LayersControl.Overlay name="Add/View custom tents">
                    <LayerGroup>
                        {customTents.map((pos, idx) => (
                            <Marker key={idx} position={pos}>
                                <Popup>
                                    <p>You clicked at {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}</p>
                                </Popup>
                            </Marker>
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>
            </LayersControl>

        </MapContainer>
    );
};

export default Map;
