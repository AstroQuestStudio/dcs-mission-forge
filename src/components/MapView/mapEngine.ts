/**
 * mapEngine.ts — Moteur Leaflet complètement isolé de React.
 * Aucun import React ici. Communication avec React via CustomEvents DOM.
 *
 * CRITIQUE : safeEmit utilise setTimeout(0) pour sortir de la call stack
 * Leaflet avant de dispatcher. Sans ça, Leaflet fire des events pendant
 * _initEvents → Zustand notifie synchroniquement → React useCallback → #310.
 */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { dcsToLatLng, latLngToDcs } from '../../utils/dcsCoords';
import { getIconForUnit } from '../../utils/natoIcons';
import type { GroupEntry } from '../../store/missionStore';
import type { DCSUnit } from '../../types/dcs';

const COAL_COLOR: Record<string, string> = {
  blue: '#3b82f6', red: '#ef4444', neutrals: '#94a3b8',
};
const CAT_SYM: Record<string, string> = {
  plane: '✈', helicopter: '🚁', vehicle: '⬛', ship: '⚓', static: '▲',
};

function makeNatoIcon(
  coalition: string,
  category: string,
  unitType: string,
  selected: boolean,
  isLeader: boolean,
  baseUrl: string,
): L.DivIcon {
  const iconFile = getIconForUnit(unitType, category, coalition);
  const color = COAL_COLOR[coalition] ?? '#888';
  const size = selected ? (isLeader ? 42 : 34) : (isLeader ? 34 : 26);
  const borderW = selected ? 3 : isLeader ? 2 : 1.5;
  const bc = selected ? '#fbbf24' : color;
  const shadow = selected
    ? '0 0 14px 4px rgba(251,191,36,.7)'
    : isLeader ? '0 2px 8px rgba(0,0,0,.7)' : '0 1px 4px rgba(0,0,0,.5)';
  const sym = CAT_SYM[category] ?? '?';
  const imgSize = size - 4;

  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:${isLeader ? '50%' : '6px'};background:#0f172a;border:${borderW}px solid ${bc};box-shadow:${shadow};overflow:hidden;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;">
      <img src="${baseUrl}data/nato-icons/${iconFile}" width="${imgSize}" height="${imgSize}"
        style="object-fit:contain;display:block"
        onerror="this.style.display='none';this.parentElement.style.fontSize='${Math.round(size * 0.5)}px';this.parentElement.style.color='#e2e8f0';this.parentElement.innerText='${sym}'"
      />
    </div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function makeAirportIcon(baseUrl: string) {
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:6px;background:#0f172a;border:2px solid #334155;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.5);overflow:hidden;">
      <img src="${baseUrl}data/nato-icons/airdrome_class_1.png" width="22" height="22" style="object-fit:contain"
        onerror="this.style.display='none';this.parentElement.style.fontSize='14px';this.parentElement.innerText='✈'"
      />
    </div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export interface RenderState {
  groups: GroupEntry[];
  selectedEntity: { coalition: string; countryIdx: number; category: string; groupIdx: number } | null;
  airports: { id: number; name: string; lat: number; lon: number; parkingCount: number }[];
  showAirports: boolean;
  showZones: boolean;
  showRoutes: boolean;
  zones: { x: number; y: number; radius?: number; name: string }[];
  addMode: boolean;
}

export interface MapEngine {
  init(container: HTMLDivElement): void;
  destroy(): void;
  render(state: RenderState): void;
  flyTo(lat: number, lon: number, zoom?: number): void;
  containerPointToLatLng(x: number, y: number): { lat: number; lon: number } | null;
}

export function createMapEngine(
  emitEvent: (name: string, detail: unknown) => void,
  baseUrl: string = '/',
): MapEngine {
  // setTimeout(0) = nouveau macrotask JS = sorti de la call stack Leaflet
  // Garantit que Zustand n'est jamais notifié depuis _initEvents ou initialize()
  const safeEmit = (name: string, detail: unknown) => {
    setTimeout(() => emitEvent(name, detail), 0);
  };

  let map: L.Map | null = null;
  let markersLayer: L.LayerGroup | null = null;
  let routesLayer: L.LayerGroup | null = null;
  let zonesLayer: L.LayerGroup | null = null;
  let airportsLayer: L.LayerGroup | null = null;
  let lastSelectedKey = '';

  return {
    init(container: HTMLDivElement) {
      if (map) return;
      map = L.map(container, {
        center: [42.5, 41.5],
        zoom: 7,
        zoomControl: false,
        preferCanvas: true,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayer = L.layerGroup().addTo(map);
      routesLayer = L.layerGroup().addTo(map);
      zonesLayer = L.layerGroup().addTo(map);
      airportsLayer = L.layerGroup().addTo(map);

      map.on('click', () => {
        safeEmit('dcs:mapclick', {});
      });
    },

    destroy() {
      if (map) { map.remove(); map = null; }
      markersLayer = null; routesLayer = null;
      zonesLayer = null; airportsLayer = null;
    },

    render(state: RenderState) {
      if (!map || !markersLayer || !routesLayer || !zonesLayer || !airportsLayer) return;

      const { groups, selectedEntity, airports, showAirports, showZones, showRoutes, zones } = state;

      // ── Marqueurs + routes ────────────────────────────────────────
      markersLayer.clearLayers();
      routesLayer.clearLayers();

      groups.forEach(entry => {
        const isSelected =
          selectedEntity !== null &&
          selectedEntity.coalition === entry.coalition &&
          selectedEntity.countryIdx === entry.countryIdx &&
          selectedEntity.category === entry.category &&
          selectedEntity.groupIdx === entry.groupIdx;

        if (showRoutes) {
          const wps = (entry.group.route?.points ?? [])
            .filter((wp: { x?: number; y?: number }) => wp.x != null && wp.y != null)
            .map((wp: { x: number; y: number }) => dcsToLatLng(wp.x, wp.y) as L.LatLngTuple);
          if (wps.length > 1) {
            L.polyline(wps, {
              color: COAL_COLOR[entry.coalition] ?? '#888',
              weight: isSelected ? 2.5 : 1,
              opacity: isSelected ? 0.85 : 0.25,
              dashArray: isSelected ? '8 4' : '3 6',
            }).addTo(routesLayer!);
          }
        }

        (entry.group.units ?? []).forEach((unit: DCSUnit, ui: number) => {
          const isLeader = ui === 0;
          const [lat, lon] = dcsToLatLng(unit.x ?? 0, unit.y ?? 0);
          const icon = makeNatoIcon(
            entry.coalition,
            entry.category,
            unit.type ?? '',
            isSelected && isLeader,
            isLeader,
            baseUrl,
          );
          const marker = L.marker([lat, lon], {
            icon,
            draggable: true,
            zIndexOffset: isSelected ? (isLeader ? 300 : 200) : (isLeader ? 10 : 0),
          });

          const color = COAL_COLOR[entry.coalition] ?? '#888';
          marker.bindTooltip(`<div style="font-family:monospace;font-size:11px;line-height:1.5">
            ${isLeader ? `<div style="font-weight:bold;color:${color}">${entry.group.name}</div>` : ''}
            <div style="color:#cbd5e1">${unit.name ?? ''}</div>
            <div style="color:#64748b">${unit.type ?? ''} · ${unit.skill ?? '—'} · ${Math.round(unit.alt ?? 0)}m</div>
            ${isSelected && isLeader ? '<div style="color:#fbbf24;font-size:10px">✦ Sélectionné · glisser = déplacer</div>' : ''}
          </div>`, { direction: 'top', offset: [0, -14], opacity: 0.97 });

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
            color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.07, weight: 1.5, dashArray: '6 4',
          });
          c.bindTooltip(`<span style="font-size:10px;color:#fbbf24;font-family:monospace">${zone.name}</span>`,
            { permanent: true, direction: 'center', opacity: 0.9 });
          c.addTo(zonesLayer!);
        });
      }

      // ── Aérodromes ────────────────────────────────────────────────
      airportsLayer.clearLayers();
      if (showAirports) {
        airports.forEach(ap => {
          const m = L.marker([ap.lat, ap.lon], { icon: makeAirportIcon(baseUrl) });
          m.bindTooltip(`<div style="font-family:monospace;font-size:11px;line-height:1.5">
            <div style="font-weight:bold;color:#94a3b8">${ap.name}</div>
            <div style="color:#64748b">${ap.parkingCount} slots parking</div>
          </div>`, { direction: 'top', offset: [0, -16], opacity: 0.97 });
          m.addTo(airportsLayer!);
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
