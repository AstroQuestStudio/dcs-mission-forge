import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, Tooltip, useMapEvents, LayersControl, useMap } from 'react-leaflet';
import { divIcon, type Map as LMap } from 'leaflet';
import { useMissionStore, extractAllGroups, extractTriggerZones, type GroupEntry } from '../../store/missionStore';
import { dcsToLatLng } from '../../utils/dcsCoords';
import { getUnitByType } from '../../utils/dcsUnits';

// ── Types ──────────────────────────────────────────────────────────────────
interface Airport { id: number; name: string; lat: number; lon: number; parkingCount: number }

// ── Couleurs & icônes ──────────────────────────────────────────────────────
const COAL_COLOR: Record<string, string> = {
  blue: '#3b82f6', red: '#ef4444', neutrals: '#9ca3af',
};
const COAL_BG: Record<string, string> = {
  blue: '#1e3a5f', red: '#5f1e1e', neutrals: '#2d2d2d',
};
const CAT_SYM: Record<string, string> = {
  plane: '✈', helicopter: '🚁', vehicle: '▣', ship: '⚓', static: '▲',
};

function groupIcon(coalition: string, category: string, selected: boolean) {
  const color = COAL_COLOR[coalition] ?? '#888';
  const sym   = CAT_SYM[category] ?? '•';
  const bg    = selected ? '#0f172a' : (COAL_BG[coalition] ?? '#1e293b');
  const border = selected ? `3px solid #fbbf24` : `2px solid ${color}`;
  const size   = selected ? 36 : 28;
  return divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};border:${border};
      display:flex;align-items:center;justify-content:center;
      font-size:${selected ? 17 : 13}px;
      box-shadow:0 2px 10px rgba(0,0,0,.7);
      transition:all .15s ease;
    ">${sym}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function airportIcon(coalition: string) {
  const color = coalition === 'red' ? '#ef4444' : coalition === 'blue' ? '#3b82f6' : '#94a3b8';
  return divIcon({
    html: `<div style="
      width:24px;height:24px;border-radius:4px;
      background:#0f172a;border:2px solid ${color};
      display:flex;align-items:center;justify-content:center;
      font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.6);
    ">🛬</div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// ── Sous-composants ────────────────────────────────────────────────────────

function ClickToDeselect() {
  const { selectEntity } = useMissionStore();
  useMapEvents({ click: () => selectEntity(null) });
  return null;
}

function FlyToSelected({ groups }: { groups: GroupEntry[] }) {
  const { selectedEntity } = useMissionStore();
  const map = useMap();
  const prev = useRef<string>('');

  useEffect(() => {
    if (!selectedEntity || selectedEntity.type !== 'group') return;
    const key = `${selectedEntity.coalition}-${selectedEntity.countryIdx}-${selectedEntity.category}-${selectedEntity.groupIdx}`;
    if (key === prev.current) return;
    prev.current = key;
    const entry = groups.find(e =>
      e.coalition === selectedEntity.coalition &&
      e.countryIdx === selectedEntity.countryIdx &&
      e.category === selectedEntity.category &&
      e.groupIdx === selectedEntity.groupIdx
    );
    if (!entry) return;
    const gx = entry.group.x ?? entry.group.units?.[0]?.x ?? 0;
    const gy = entry.group.y ?? entry.group.units?.[0]?.y ?? 0;
    const pos = dcsToLatLng(gx, gy);
    map.flyTo(pos, Math.max(map.getZoom(), 9), { duration: 0.8 });
  }, [selectedEntity, groups, map]);

  return null;
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

  const gx = group.x ?? group.units?.[0]?.x ?? 0;
  const gy = group.y ?? group.units?.[0]?.y ?? 0;
  const pos = dcsToLatLng(gx, gy);

  const waypoints = (group.route?.points ?? [])
    .filter(wp => wp.x != null && wp.y != null)
    .map(wp => dcsToLatLng(wp.x, wp.y));

  return (
    <>
      {isSelected && waypoints.length > 1 && (
        <Polyline
          positions={waypoints}
          pathOptions={{ color: COAL_COLOR[coalition] ?? '#888', weight: 2, dashArray: '8 5', opacity: 0.8 }}
        />
      )}
      <Marker
        position={pos}
        icon={groupIcon(coalition, category, isSelected)}
        zIndexOffset={isSelected ? 100 : 0}
        eventHandlers={{
          click: e => {
            e.originalEvent.stopPropagation();
            selectEntity({ type: 'group', coalition, countryIdx, category, groupIdx });
          },
        }}
      >
        <Tooltip direction="top" offset={[0, -18]} opacity={0.97}>
          <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6, minWidth: 140 }}>
            <div style={{ fontWeight: 'bold', color: COAL_COLOR[coalition] ?? '#888' }}>{group.name}</div>
            <div style={{ color: '#94a3b8' }}>{group.units?.length ?? 0} unité(s) · {category}</div>
            {group.units?.[0] && (
              <div style={{ color: '#cbd5e1' }}>
                {getUnitByType(group.units[0].type)?.name ?? group.units[0].type}
              </div>
            )}
            {group.lateActivation && <div style={{ color: '#fbbf24' }}>⏱ Activation tardive</div>}
          </div>
        </Tooltip>
      </Marker>
    </>
  );
}

function AirportMarker({ airport }: { airport: Airport }) {
  // On ne connaît pas la coalition sans la mission — on affiche neutre par défaut
  return (
    <Marker position={[airport.lat, airport.lon]} icon={airportIcon('neutral')}>
      <Tooltip direction="top" offset={[0, -14]} opacity={0.97} permanent={false}>
        <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5 }}>
          <div style={{ fontWeight: 'bold', color: '#94a3b8' }}>🛬 {airport.name}</div>
          <div style={{ color: '#64748b' }}>{airport.parkingCount} slots parking</div>
        </div>
      </Tooltip>
    </Marker>
  );
}

// ── Composant principal ────────────────────────────────────────────────────

export default function MapView() {
  const { miz } = useMissionStore();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [showAirports, setShowAirports] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const mapRef = useRef<LMap | null>(null);

  // Charger les aérodromes du théâtre courant
  useEffect(() => {
    const theatre = miz?.theatre ?? 'Caucasus';
    fetch(`${import.meta.env.BASE_URL}data/airports_caucasus.json`)
      .then(r => r.json())
      .then(data => setAirports(data as Airport[]))
      .catch(() => setAirports([]));
    void theatre; // pour l'instant on a seulement Caucasus
  }, [miz?.theatre]);

  const groups = miz ? extractAllGroups(miz) : [];
  const zones  = miz ? extractTriggerZones(miz) : [];
  const center: [number, number] = [42.5, 41.5]; // Centre Caucase

  return (
    <div className="relative h-full w-full">
      {/* Contrôles overlay */}
      <div className="absolute top-3 left-3 z-[500] flex flex-col gap-1.5">
        <button
          onClick={() => setShowAirports(v => !v)}
          className={`text-xs px-2.5 py-1.5 rounded-lg shadow border transition-all ${
            showAirports
              ? 'bg-slate-800 border-slate-600 text-slate-200'
              : 'bg-slate-900/70 border-slate-700 text-slate-500'
          }`}
          title="Afficher/masquer les aérodromes"
        >
          🛬 Aérodromes {showAirports ? `(${airports.length})` : ''}
        </button>
        <button
          onClick={() => setShowZones(v => !v)}
          className={`text-xs px-2.5 py-1.5 rounded-lg shadow border transition-all ${
            showZones
              ? 'bg-slate-800 border-slate-600 text-slate-200'
              : 'bg-slate-900/70 border-slate-700 text-slate-500'
          }`}
          title="Afficher/masquer les zones trigger"
        >
          ⬡ Zones trigger {showZones && zones.length > 0 ? `(${zones.length})` : ''}
        </button>
        {miz && (
          <div className="bg-slate-900/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-400">
            {groups.length} groupes · {groups.reduce((a, e) => a + (e.group.units?.length ?? 0), 0)} unités
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={7}
        style={{ height: '100%', width: '100%', background: '#0d1117' }}
        ref={mapRef}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri"
              maxZoom={18}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Topographie">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenTopoMap'
              maxZoom={17}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <ClickToDeselect />
        <FlyToSelected groups={groups} />

        {/* Aérodromes */}
        {showAirports && airports.map(ap => (
          <AirportMarker key={ap.id} airport={ap} />
        ))}

        {/* Zones trigger */}
        {showZones && zones.map((zone, i) => {
          if (!zone.x || !zone.y) return null;
          const pos = dcsToLatLng(zone.x, zone.y);
          return (
            <Circle
              key={i}
              center={pos}
              radius={zone.radius ?? 1000}
              pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.08, weight: 1.5, dashArray: '6 4' }}
            >
              <Tooltip permanent direction="center" opacity={0.9}>
                <span style={{ fontSize: 10, color: '#fbbf24', fontFamily: 'monospace' }}>{zone.name}</span>
              </Tooltip>
            </Circle>
          );
        })}

        {/* Groupes */}
        {groups.map((entry, i) => (
          <GroupMarker
            key={`${entry.coalition}-${entry.category}-${entry.groupIdx}-${i}`}
            entry={entry}
          />
        ))}
      </MapContainer>
    </div>
  );
}
