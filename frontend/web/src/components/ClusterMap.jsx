import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker asset paths in React Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const centroidIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const citizenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [1, -26],
    shadowSize: [32, 32],
});

export default function ClusterMap({ cluster }) {
    if (!cluster || !cluster.centroid?.coordinates) {
        return <div className="map-placeholder">No valid GPS location available for this cluster.</div>;
    }

    // GeoJSON coordinates format is [longitude, latitude]
    const centerLat = cluster.centroid.coordinates[1];
    const centerLng = cluster.centroid.coordinates[0];

    return (
        <div style={{ height: '350px', width: '100%', borderRadius: '10px', overflow: 'hidden', marginTop: '12px' }}>
            <MapContainer
                center={[centerLat, centerLng]}
                zoom={14}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Cluster Centroid Marker */}
                <Marker position={[centerLat, centerLng]} icon={centroidIcon}>
                    <Popup>
                        <div>
                            <strong style={{ color: '#DC2626' }}>🚨 Cluster Centroid</strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                                Type: {cluster.hazardType}<br />
                                District: {cluster.district}<br />
                                Confidence Score: {cluster.confidenceScore}
                            </p>
                        </div>
                    </Popup>
                </Marker>

                {/* Bounding Radius representing hazard spread */}
                <Circle
                    center={[centerLat, centerLng]}
                    radius={500}
                    pathOptions={{ color: '#DC2626', fillColor: '#DC2626', fillOpacity: 0.2 }}
                />

                {/* Individual Citizen Report Markers */}
                {cluster.reports &&
                    cluster.reports.map((report, idx) => {
                        const coords = report.location?.coordinates || report.coordinates;
                        if (!coords) return null;

                        const rLat = coords[1];
                        const rLng = coords[0];

                        return (
                            <Marker key={report._id || idx} position={[rLat, rLng]} icon={citizenIcon}>
                                <Popup>
                                    <div style={{ maxWidth: '180px' }}>
                                        <strong style={{ fontSize: '12px', color: '#0284C7' }}>
                                            Report #{idx + 1} ({report.reporter?.fullName || 'Anonymous'})
                                        </strong>
                                        <p style={{ fontSize: '11px', margin: '4px 0' }}>
                                            {report.description || 'No description provided'}
                                        </p>
                                        {report.photoUrls && report.photoUrls.length > 0 && (
                                            <img
                                                src={report.photoUrls[0]}
                                                alt="Evidence"
                                                style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
            </MapContainer>
        </div>
    );
}