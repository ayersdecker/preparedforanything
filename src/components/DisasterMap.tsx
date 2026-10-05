import { useEffect, useState } from 'react';
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { LocateFixed, Globe } from 'lucide-react';
import type { Feature } from 'geojson';
import { getRisksForState } from '../lib/riskData';
import { HAZARD_COLORS, STATES, stateLocation, type VisitorLocation } from '../lib/visitorData';
import type { WeatherAlert } from '../lib/useWeatherAlerts';
import 'leaflet/dist/leaflet.css';

interface Props {
  location: VisitorLocation | null;
  hazard: string;
  layer: 'hazards' | 'alerts';
  alerts: WeatherAlert[];
  onSelect: (location: VisitorLocation) => void;
}

function MapPosition({ location }: { location: VisitorLocation | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.setView([location.latitude, location.longitude], 6);
  }, [location, map]);
  return (
    <div className="map-actions">
      <button type="button" title="Show all US states" aria-label="Show all US states" onClick={() => map.fitBounds([[18, -170], [72, -66]], { padding: [20, 20] })}><Globe size={19} /></button>
      <button type="button" title="Center on your area" aria-label="Center on your area" disabled={!location} onClick={() => location && map.setView([location.latitude, location.longitude], 6)}><LocateFixed size={19} /></button>
    </div>
  );
}

export default function DisasterMap({ location, hazard, layer, alerts, onSelect }: Props) {
  const [tileError, setTileError] = useState(false);
  return (
    <div className="disaster-map" aria-label="US disaster preparedness map">
      <MapContainer center={[39, -98]} zoom={4} minZoom={2} maxZoom={15} scrollWheelZoom={false}>
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Sources: Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), OpenStreetMap contributors, GIS User Community'
          eventHandlers={{ tileerror: () => setTileError(true) }} />
        <MapPosition location={location} />
        {layer === 'hazards' && STATES.map(([code, name, latitude, longitude]) => {
          const risks = getRisksForState(code);
          const risk = hazard === 'all' ? risks[0] : risks.find(item => item.type === hazard);
          if (!risk) return null;
          const color = HAZARD_COLORS[risk.type] || '#477947';
          return (
            <CircleMarker key={code} center={[latitude, longitude]} radius={location?.state === code ? 13 : 9}
              pathOptions={{ color: location?.state === code ? '#172b26' : '#fff', weight: location?.state === code ? 3 : 2, fillColor: color, fillOpacity: 0.9 }}
              eventHandlers={{ click: () => onSelect(stateLocation(code)) }}>
              <Popup><strong>{name}</strong><p>{risk.type} · {risk.severity} regional concern</p><p>{risk.description}</p><span>State overview, not an active incident or a precise risk boundary.</span></Popup>
            </CircleMarker>
          );
        })}
        {layer === 'alerts' && alerts.filter(alert => alert.geometry).map(alert => (
          <GeoJSON key={alert.id} data={{ type: 'Feature', geometry: alert.geometry!, properties: {} } as Feature}
            style={{ color: alert.properties.severity === 'Extreme' || alert.properties.severity === 'Severe' ? '#c93627' : '#b65b00', weight: 2, fillOpacity: 0.2 }}>
            <Popup><strong>{alert.properties.event}</strong><p>{alert.properties.headline}</p><span>{alert.properties.areaDesc}</span></Popup>
          </GeoJSON>
        ))}
        {location && <CircleMarker center={[location.latitude, location.longitude]} radius={4} pathOptions={{ color: '#fff', weight: 2, fillColor: '#172b26', fillOpacity: 1 }}><Popup>{location.label}</Popup></CircleMarker>}
      </MapContainer>
      {tileError && <p className="map-tile-warning" role="status">Base map tiles could not load. Regional markers and the area list remain available.</p>}
    </div>
  );
}