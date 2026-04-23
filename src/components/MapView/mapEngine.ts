import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { dcsToLatLng, latLngToDcs } from '../../utils/dcsCoords';
import { makeUnitDivIcon, makeAirportDivIcon } from '../../utils/unitSilhouettes';
import type { GroupEntry } from '../../store/missionStore';
import type { DCSUnit } from '../../types/dcs';
import type { ParkingSpot } from '../../utils/caucasusAirfields';
import { getThreatRange } from '../../utils/threatRanges';

const COAL_COLOR: Record<string, string> = {
  blue: '#3b82f6', red: '#ef4444', neutrals: '#94a3b8',
};

export interface RenderState {
  groups: GroupEntry[];
  selectedEntity: { coalition: string; countryIdx: number; category: string; groupIdx: number } | null;
  airports: { id: number; name: string; lat: number; lon: number; parkingCount: number; parkingSpots?: ParkingSpot[] }[];
  showAirports: boolean;
  showZones: boolean;
  showRoutes: boolean;
  showTopo: boolean;
  showThreatRings: boolean;
  zones: { x: number; y: number; radius?: number; name: string }[];
  addMode: boolean;
}

export interface MapEngine {
  init(container: HTMLDivElement): void;
  destroy(): void;
  render(state: RenderState): void;
  flyTo(lat: number, lon: number, zoom?: number): void;
  containerPointToLatLng(x: number, y: number): { lat: number; lon: number } | null;
  setTopo(enabled: boolean): void;
}

export function createMapEngine(
  emitEvent: (name: string, detail: unknown) => void,
  baseUrl: string = '/',
): MapEngine {
  const safeEmit = (name: string, detail: unknown) => {
    setTimeout(() => emitEvent(name, detail), 0);
  };

  let map: L.Map | null = null;
  let markersLayer: L.LayerGroup | null = null;
  let routesLayer: L.LayerGroup | null = null;
  let waypointsLayer: L.LayerGroup | null = null;
  let zonesLayer: L.LayerGroup | null = null;
  let airportsLayer: L.LayerGroup | null = null;
  let lastSelectedKey = '';

  let osmLayer: L.TileLayer | null = null;
  let topoLayer: L.TileLayer | null = null;
  let currentTopo = false;
  let parkingSlotsLayer: L.LayerGroup | null = null;
  let threatLayer: L.LayerGroup | null = null;

  return {
    init(container: HTMLDivElement) {
      if (map) return;
      map = L.map(container, {
        center: [42.5, 41.5],
        zoom: 7,
        zoomControl: false,
        preferCanvas: true,
      });

      osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      });

      topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap contributors',
        maxZoom: 17,
        subdomains: ['a', 'b', 'c'],
      });

      osmLayer.addTo(map);

      routesLayer = L.layerGroup().addTo(map);
      waypointsLayer = L.layerGroup().addTo(map);
      zonesLayer = L.layerGroup().addTo(map);
      airportsLayer = L.layerGroup().addTo(map);
      parkingSlotsLayer = L.layerGroup().addTo(map);
      threatLayer = L.layerGroup().addTo(map);
      markersLayer = L.layerGroup().addTo(map);

      map.on('click', () => {
        safeEmit('dcs:mapclick', {});
      });
      map.on('zoomend', () => {
        safeEmit('dcs:zoom', { zoom: map!.getZoom() });
      });
    },

    destroy() {
      if (map) { map.remove(); map = null; }
      markersLayer = null; routesLayer = null; waypointsLayer = null;
      zonesLayer = null; airportsLayer = null; parkingSlotsLayer = null; threatLayer = null;
    },

    setTopo(enabled: boolean) {
      if (!map || !osmLayer || !topoLayer) return;
      if (enabled === currentTopo) return;
      currentTopo = enabled;
      if (enabled) { osmLayer.remove(); topoLayer.addTo(map); }
      else { topoLayer.remove(); osmLayer.addTo(map); }
    },

    render(state: RenderState) {
      if (!map || !markersLayer || !routesLayer || !waypointsLayer || !zonesLayer || !airportsLayer || !parkingSlotsLayer || !threatLayer) return;

      const { groups, selectedEntity, airports, showAirports, showZones, showRoutes, showTopo, showThreatRings, zones } = state;

      this.setTopo(showTopo);

      // ── Cercles de portée menace (SAM/radar) ──────────────
      threatLayer!.clearLayers();
      if (showThreatRings) {
        groups.forEach(entry => {
          (entry.group.units ?? []).forEach((unit: { type: string; x: number; y: number }) => {
            const threat = getThreatRange(unit.type);
            if (!threat) return;
            const ll = dcsToLatLng(unit.x ?? 0, unit.y ?? 0) as L.LatLngTuple;
            if (threat.engagement > 0) {
              L.circle(ll, {
                radius: threat.engagement,
                color: '#ef4444',
                weight: 1,
                fillColor: '#ef4444',
                fillOpacity: 0.05,
                interactive: false,
              }).bindTooltip(
                `<span style="font-family:monospace;font-size:10px;color:#fca5a5">${threat.name} — ${(threat.engagement/1000).toFixed(0)}km</span>`,
                { direction: 'top' }
              ).addTo(threatLayer!);
            }
            if (threat.detection > 0) {
              L.circle(ll, {
                radius: threat.detection,
                color: '#f97316',
                weight: 1,
                fillOpacity: 0,
                dashArray: '8 6',
                interactive: false,
              }).addTo(threatLayer!);
            }
          });
        });
      }

      // ── Routes + waypoints ────────────────────────────────────────
      markersLayer.clearLayers();
      routesLayer.clearLayers();
      waypointsLayer.clearLayers();

      groups.forEach(entry => {
        const isSelected =
          selectedEntity !== null &&
          selectedEntity.coalition === entry.coalition &&
          selectedEntity.countryIdx === entry.countryIdx &&
          selectedEntity.category === entry.category &&
          selectedEntity.groupIdx === entry.groupIdx;

        const color = COAL_COLOR[entry.coalition] ?? '#888';

        if (showRoutes) {
          const rawWps = entry.group.route?.points ?? [];
          const wps = rawWps
            .filter((wp: { x?: number; y?: number }) => wp.x != null && wp.y != null)
            .map((wp: { x: number; y: number }) => dcsToLatLng(wp.x, wp.y) as L.LatLngTuple);

          if (wps.length > 1) {
            L.polyline(wps, {
              color,
              weight: isSelected ? 2.5 : 1.5,
              opacity: isSelected ? 0.9 : 0.35,
              dashArray: isSelected ? undefined : '6 5',
            }).addTo(routesLayer!);

            // Waypoints draggables quand le groupe est sélectionné
            if (isSelected) {
              wps.forEach((wp, wi) => {
                const isFirst = wi === 0;
                const rawWp = rawWps[wi] as { x: number; y: number; name?: string };
                const wpLabel = rawWp?.name ?? `WP${wi + 1}`;

                const icon = L.divIcon({
                  html: `<div style="
                    width:${isFirst ? 22 : 20}px;height:${isFirst ? 22 : 20}px;
                    border-radius:50%;
                    background:${isFirst ? color : '#0f172a'};
                    border:2.5px solid ${color};
                    display:flex;align-items:center;justify-content:center;
                    font-size:8px;font-weight:bold;color:${isFirst ? '#fff' : color};
                    font-family:monospace;cursor:grab;
                    box-shadow:0 2px 6px rgba(0,0,0,0.5)
                  ">${wi + 1}</div>`,
                  className: '',
                  iconSize: [isFirst ? 22 : 20, isFirst ? 22 : 20],
                  iconAnchor: [isFirst ? 11 : 10, isFirst ? 11 : 10],
                });

                const wpMarker = L.marker(wp, { icon, draggable: true, zIndexOffset: 500 });

                wpMarker.bindTooltip(
                  `<span style="font-family:monospace;font-size:10px;color:${color}">${wpLabel}</span>`,
                  { direction: 'top', offset: [0, -14], opacity: 1 }
                );

                wpMarker.on('dragend', () => {
                  const ll = wpMarker.getLatLng();
                  const { x, y } = latLngToDcs(ll.lat, ll.lng);
                  safeEmit('dcs:waypoint-move', {
                    coalition: entry.coalition,
                    countryIdx: entry.countryIdx,
                    category: entry.category,
                    groupIdx: entry.groupIdx,
                    wpIdx: wi,
                    x, y,
                  });
                });

                wpMarker.addTo(waypointsLayer!);
              });
            } else {
              // Non sélectionné : cercles simples non-draggables
              wps.slice(1).forEach((wp) => {
                L.circleMarker(wp, {
                  radius: 4,
                  color,
                  weight: 1.5,
                  fillColor: '#0f172a',
                  fillOpacity: 0.8,
                  opacity: 0.5,
                }).addTo(waypointsLayer!);
              });
            }
          }
        }

        (entry.group.units ?? []).forEach((unit: DCSUnit, ui: number) => {
          const isLeader = ui === 0;
          const [lat, lon] = dcsToLatLng(unit.x ?? 0, unit.y ?? 0);
          const icon = L.divIcon(makeUnitDivIcon(
            unit.type ?? '',
            entry.category,
            entry.coalition,
            isSelected && isLeader,
            isLeader,
            unit.heading,
            baseUrl,
          ));

          const marker = L.marker([lat, lon], {
            icon,
            draggable: true,
            zIndexOffset: isSelected ? (isLeader ? 300 : 200) : (isLeader ? 10 : 0),
          });

          marker.bindTooltip(`<div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:6px 10px;font-family:monospace;font-size:11px;line-height:1.6;min-width:140px">
            ${isLeader ? `<div style="font-weight:bold;color:${color};margin-bottom:2px">${entry.group.name}</div>` : ''}
            <div style="color:#e2e8f0">${unit.name ?? ''}</div>
            <div style="color:#64748b;font-size:10px">${unit.type ?? ''}</div>
            <div style="color:#475569;font-size:10px">${unit.skill ?? '—'} · ${Math.round(unit.alt ?? 0)}m</div>
            ${isSelected && isLeader ? '<div style="color:#fbbf24;font-size:10px;margin-top:2px">✦ glisser pour déplacer</div>' : ''}
          </div>`, {
            direction: 'top',
            offset: [0, -18],
            opacity: 1,
            className: 'leaflet-tooltip-dark',
          });

          marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            safeEmit('dcs:select', {
              coalition: entry.coalition,
              countryIdx: entry.countryIdx,
              category: entry.category,
              groupIdx: entry.groupIdx,
            });
          });

          marker.on('dragend', () => {
            const ll = marker.getLatLng();
            const { x, y } = latLngToDcs(ll.lat, ll.lng);
            safeEmit('dcs:move', {
              coalition: entry.coalition,
              countryIdx: entry.countryIdx,
              category: entry.category,
              groupIdx: entry.groupIdx,
              unitIdx: ui,
              x, y,
            });
          });

          marker.addTo(markersLayer!);
        });
      });

      // ── FlyTo si sélection nouvelle ───────────────────────────────
      if (selectedEntity) {
        const key = `${selectedEntity.coalition}.${selectedEntity.countryIdx}.${selectedEntity.category}.${selectedEntity.groupIdx}`;
        if (key !== lastSelectedKey) {
          lastSelectedKey = key;
          const entry = groups.find(g =>
            g.coalition === selectedEntity.coalition &&
            g.countryIdx === selectedEntity.countryIdx &&
            g.category === selectedEntity.category &&
            g.groupIdx === selectedEntity.groupIdx
          );
          if (entry && map) {
            const x = entry.group.x ?? entry.group.units?.[0]?.x ?? 0;
            const y = entry.group.y ?? entry.group.units?.[0]?.y ?? 0;
            const [lat, lon] = dcsToLatLng(x, y);
            setTimeout(() => { map?.flyTo([lat, lon], Math.max(map.getZoom(), 9), { duration: 0.8 }); }, 0);
          }
        }
      } else {
        lastSelectedKey = '';
      }

      // ── Zones ─────────────────────────────────────────────────────
      zonesLayer.clearLayers();
      if (showZones) {
        zones.forEach(zone => {
          if (!zone.x || !zone.y) return;
          const [lat, lon] = dcsToLatLng(zone.x, zone.y);
          const c = L.circle([lat, lon], {
            radius: zone.radius ?? 1000,
            color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.06, weight: 1.5, dashArray: '6 4',
          });
          c.bindTooltip(`<span style="font-size:10px;color:#fbbf24;font-family:monospace">${zone.name}</span>`,
            { permanent: true, direction: 'center', opacity: 0.9 });
          c.addTo(zonesLayer!);
        });
      }

      // ── Aérodromes ────────────────────────────────────────────────
      airportsLayer.clearLayers();
      parkingSlotsLayer.clearLayers();
      if (showAirports) {
        const zoom = map.getZoom();
        airports.forEach(ap => {
          const m = L.marker([ap.lat, ap.lon], { icon: L.divIcon(makeAirportDivIcon(baseUrl)) });
          const spotsInfo = ap.parkingSpots
            ? `${ap.parkingSpots.length} slots (coords DCS)`
            : `${ap.parkingCount} slots`;
          m.bindTooltip(`<div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:6px 10px;font-family:monospace;font-size:11px">
            <div style="font-weight:bold;color:#94a3b8">${ap.name}</div>
            <div style="color:#475569">${spotsInfo}</div>
          </div>`, { direction: 'top', offset: [0, -16], opacity: 1, className: 'leaflet-tooltip-dark' });
          m.addTo(airportsLayer!);

          // ── Parking slots (visibles selon zoom) ──────────────
          if (ap.parkingSpots && ap.parkingSpots.length > 0) {
            const showNumbers = zoom >= 15;
            const showDots = zoom >= 13;

            if (showDots) {
              ap.parkingSpots.forEach(spot => {
                const ll = dcsToLatLng(spot.x, spot.z) as L.LatLngTuple;
                const color = spot.plane && spot.heli
                  ? '#a78bfa'   // violet = mixte
                  : spot.plane
                  ? '#38bdf8'   // cyan = avion
                  : '#4ade80';  // vert = hélico

                let marker: L.Marker | L.CircleMarker;

                if (showNumbers) {
                  // Zoom 15+ → cercle avec numéro lisible
                  const icon = L.divIcon({
                    html: `<div style="background:${color};color:#000;font-size:8px;font-weight:900;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;border:1.5px solid #0f172a;line-height:1;box-shadow:0 1px 3px rgba(0,0,0,0.6)">${spot.id}</div>`,
                    className: '',
                    iconSize: [18, 18],
                    iconAnchor: [9, 9],
                  });
                  marker = L.marker(ll, { icon, interactive: true });
                } else {
                  // Zoom 13-14 → petit dot coloré sans numéro
                  marker = L.circleMarker(ll, {
                    radius: 4,
                    color: '#0f172a',
                    weight: 1,
                    fillColor: color,
                    fillOpacity: 0.9,
                    interactive: true,
                  });
                }

                const typeLabel = spot.plane && spot.heli ? 'Mixte' : spot.plane ? 'Avion' : 'Hélico';
                marker.bindTooltip(
                  `<div style="font-family:monospace;font-size:10px;background:#0f172a;border:1px solid #334155;border-radius:4px;padding:3px 7px;white-space:nowrap">
                    <b style="color:#e2e8f0">Slot #${spot.id}</b>
                    <span style="color:#64748b;margin-left:5px">${typeLabel}</span>
                    <br><span style="color:#475569">x=${spot.x.toFixed(0)} z=${spot.z.toFixed(0)} y=${spot.y.toFixed(0)}</span>
                  </div>`,
                  { direction: 'top', offset: [0, -8], opacity: 1 }
                );

                marker.addTo(parkingSlotsLayer!);
              });
            }
          }
        });
      }
    },

    flyTo(lat: number, lon: number, zoom?: number) {
      if (!map) return;
      map.flyTo([lat, lon], zoom ?? map.getZoom(), { duration: 0.8 });
    },

    containerPointToLatLng(x: number, y: number) {
      if (!map) return null;
      const ll = map.containerPointToLatLng([x, y]);
      return { lat: ll.lat, lon: ll.lng };
    },
  };
}
