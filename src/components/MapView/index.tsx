import { MapContainer, TileLayer, Marker, Polyline, Circle, Tooltip, useMapEvents, LayersControl } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useMissionStore, extractAllGroups, extractTriggerZones, type GroupEntry } from '../../store/missionStore';
import { dcsToLatLng } from '../../utils/dcsCoords';
import { getUnitByType } from '../../utils/dcsUnits';

const COALITION_COLORS = {
  blue: '#3b82f6',
  red: '#ef4444',
  neutrals: '#9ca3af',
};

const CATEGORY_SYMBOLS: Record<string, string> = {
  plane: '✈',
  helicopter: '🚁',
  vehicle: '▣',
  ship: '⚓',
  static: '▲',
};

const COALITION_BG: Record<string, string> = {
  blue: '#1e3a5f',
  red: '#5f1e1e',
  neutrals: '#2d2d2d',
};

function makeIcon(coalition: string, category: string, selected: boolean) {
  const color = COALITION_COLORS[coalition as keyof typeof COALITION_COLORS] ?? '#888';
  const symbol = CATEGORY_SYMBOLS[category] ?? '•';
  const border = selected ? '3px solid #fbbf24' : `2px solid ${color}`;
  const bg = selected ? '#1e293b' : (COALITION_BG[coalition] ?? '#1e293b');
  const size = selected ? 34 : 28;
  const html = `<div style="
    width:${size}px;height:${size}px;border-radius:50%;
    background:${bg};border:${border};
    display:flex;align-items:center;justify-content:center;
    font-size:${selected ? 17 : 14}px;cursor:pointer;
    box-shadow:0 2px 8px rgba(0,0,0,0.7);
    transition:all 0.15s;
  ">${symbol}</div>`;
  return divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

function GroupMarker({ entry }: { entry: GroupEntry }) {
  const { selectEntity, selectedEntity } = useMissionStore();
  const { group, coalition, countryIdx, category, groupIdx } = entry;

  const isSelected =
    selectedEntity?.type === 'group' &&
    selectedEntity.coalition === coalition &&
    selectedEntity.countryIdx === countryIdx &&
    selectedEntity.category === category &&
    selectedEntity.groupIdx === groupIdx;

  // Utiliser la position du groupe (ou de la première unité si le groupe n'a pas de x/y direct)
  const gx = group.x ?? group.units?.[0]?.x ?? 0;
  const gy = group.y ?? group.units?.[0]?.y ?? 0;
  const pos = dcsToLatLng(gx, gy);
  const icon = makeIcon(coalition, category, isSelected);

  // Waypoints polyline
  const waypoints = (group.route?.points ?? [])
    .filter(wp => wp.x != null && wp.y != null)
    .map(wp => dcsToLatLng(wp.x, wp.y));

  return (
    <>
      {isSelected && waypoints.length > 1 && (
        <Polyline
          positions={waypoints}
          pathOptions={{ color: COALITION_COLORS[coalition as keyof typeof COALITION_COLORS], weight: 2.5, dashArray: '8 5', opacity: 0.85 }}
        />
      )}
      <Marker
        position={pos}
        icon={icon}
        eventHandlers={{
          click: (e) => {
            e.originalEvent.stopPropagation();
            selectEntity({ type: 'group', coalition, countryIdx, category, groupIdx });
          },
        }}
      >
        <Tooltip direction="top" offset={[0, -18]} opacity={0.95}>
          <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 'bold', color: COALITION_COLORS[coalition as keyof typeof COALITION_COLORS] }}>
              {group.name}
            </div>
            <div style={{ color: '#94a3b8' }}>
              {group.units?.length ?? 0} unité(s) · {category}
            </div>
            {group.units?.[0] && (
              <div style={{ color: '#cbd5e1' }}>
                {getUnitByType(group.units[0].type)?.name ?? group.units[0].type}
              </div>
            )}
          </div>
        </Tooltip>
      </Marker>
    </>
  );
}

function ClickToDeselect() {
  const { selectEntity } = useMissionStore();
  useMapEvents({ click: () => selectEntity(null) });
  return null;
}

export default function MapView() {
  const { miz } = useMissionStore();

  const groups = miz ? extractAllGroups(miz) : [];
  const zones = miz ? extractTriggerZones(miz) : [];

  // Centre exact du théâtre Caucase DCS
  const center: [number, number] = [43.0, 40.5];

  return (
    <MapContainer
      center={center}
      zoom={7}
      style={{ height: '100%', width: '100%', background: '#1a2332' }}
      zoomControl={true}
    >
      <LayersControl position="topright">
        {/* Fond satellite ESRI — le plus proche visuellement de DCS */}
        <LayersControl.BaseLayer checked name="Satellite (ESRI)">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP"
            maxZoom={18}
          />
        </LayersControl.BaseLayer>

        {/* OpenStreetMap en overlay optionnel */}
        <LayersControl.BaseLayer name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            maxZoom={19}
          />
        </LayersControl.BaseLayer>

        {/* Terrain topographique */}
        <LayersControl.BaseLayer name="Topographie">
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
            maxZoom={17}
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <ClickToDeselect />

      {/* Zones de trigger */}
      {zones.map((zone, i) => {
        if (!zone.x || !zone.y) return null;
        const pos = dcsToLatLng(zone.x, zone.y);
        return (
          <Circle
            key={i}
            center={pos}
            radius={zone.radius ?? 1000}
            pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.1, weight: 1.5, dashArray: '6 4' }}
          >
            <Tooltip permanent direction="center" opacity={0.85}>
              <span style={{ fontSize: 11, color: '#fbbf24', fontFamily: 'monospace' }}>{zone.name}</span>
            </Tooltip>
          </Circle>
        );
      })}

      {/* Groupes */}
      {groups.map((entry, i) => (
        <GroupMarker key={`${entry.coalition}-${entry.category}-${entry.groupIdx}-${i}`} entry={entry} />
      ))}
    </MapContainer>
  );
}
