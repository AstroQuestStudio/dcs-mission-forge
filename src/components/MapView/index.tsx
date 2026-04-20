import { MapContainer, TileLayer, Marker, Polyline, Circle, Tooltip, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useMissionStore, extractAllGroups, extractTriggerZones, type GroupEntry } from '../../store/missionStore';
import { dcsToLatLng } from '../../utils/dcsCoords';
import { getUnitByType } from '../../utils/dcsUnits';

const COALITION_COLORS = {
  blue: '#3b82f6',
  red: '#ef4444',
  neutrals: '#a3a3a3',
};

const CATEGORY_SYMBOLS: Record<string, string> = {
  plane: '✈',
  helicopter: '🚁',
  vehicle: '⬛',
  ship: '⚓',
  static: '▲',
};

function makeIcon(coalition: string, category: string, selected: boolean) {
  const color = COALITION_COLORS[coalition as keyof typeof COALITION_COLORS] ?? '#888';
  const symbol = CATEGORY_SYMBOLS[category] ?? '•';
  const border = selected ? '3px solid #fbbf24' : `2px solid ${color}`;
  const bg = selected ? '#1e293b' : '#0f172a';
  const html = `<div style="
    width:28px;height:28px;border-radius:50%;
    background:${bg};border:${border};
    display:flex;align-items:center;justify-content:center;
    font-size:14px;cursor:pointer;
    box-shadow:0 2px 6px rgba(0,0,0,0.5);
  ">${symbol}</div>`;
  return divIcon({ html, className: '', iconSize: [28, 28], iconAnchor: [14, 14] });
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

  const pos = dcsToLatLng(group.x, group.y);
  const icon = makeIcon(coalition, category, isSelected);

  // Waypoints polyline
  const waypoints = group.route?.points?.map(wp => dcsToLatLng(wp.x, wp.y)) ?? [];

  return (
    <>
      {isSelected && waypoints.length > 1 && (
        <Polyline
          positions={waypoints}
          pathOptions={{ color: COALITION_COLORS[coalition as keyof typeof COALITION_COLORS], weight: 2, dashArray: '6 4' }}
        />
      )}
      <Marker
        position={pos}
        icon={icon}
        eventHandlers={{
          click: () => selectEntity({ type: 'group', coalition, countryIdx, category, groupIdx }),
        }}
      >
        <Tooltip direction="top" offset={[0, -16]} opacity={0.92}>
          <div className="text-xs font-mono">
            <div className="font-bold">{group.name}</div>
            <div>{group.units.length} unité(s) · {category}</div>
            {group.units[0] && <div>{getUnitByType(group.units[0].type)?.name ?? group.units[0].type}</div>}
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

  // Centre Caucase
  const center: [number, number] = [41.8, 44.5];

  return (
    <MapContainer
      center={center}
      zoom={7}
      style={{ height: '100%', width: '100%', background: '#1e293b' }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        opacity={0.7}
      />
      <ClickToDeselect />

      {/* Zones de trigger */}
      {zones.map((zone, i) => {
        const pos = dcsToLatLng(zone.x, zone.y);
        return (
          <Circle
            key={i}
            center={pos}
            radius={zone.radius}
            pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.08, weight: 1, dashArray: '4 4' }}
          >
            <Tooltip permanent direction="center" className="text-xs font-mono bg-slate-900 text-amber-400 border-amber-400">
              {zone.name}
            </Tooltip>
          </Circle>
        );
      })}

      {/* Groupes */}
      {groups.map((entry, i) => (
        <GroupMarker key={`${entry.coalition}-${entry.groupIdx}-${i}`} entry={entry} />
      ))}
    </MapContainer>
  );
}
