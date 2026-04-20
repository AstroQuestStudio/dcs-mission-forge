# Graph Report - src  (2026-04-20)

## Corpus Check
- Corpus is ~13,866 words - fits in a single context window. You may not need a graph.

## Summary
- 56 nodes · 45 edges · 20 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `handleExport()` - 4 edges
2. `upd()` - 4 edges
3. `parseLuaTable()` - 4 edges
4. `toArray()` - 3 edges
5. `buildMiz()` - 3 edges
6. `removeAutoRespawn()` - 2 edges
7. `removeZoneRespawn()` - 2 edges
8. `extractAllGroups()` - 2 edges
9. `extractTriggerZones()` - 2 edges
10. `tokenize()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `handleExport()` --calls--> `buildMiz()`  [INFERRED]
  C:\Users\trufa\Saved Games\DCS\dcs-mission-forge\src\App.tsx → C:\Users\trufa\Saved Games\DCS\dcs-mission-forge\src\utils\mizParser.ts
- `handleExport()` --calls--> `generateMistLua()`  [INFERRED]
  C:\Users\trufa\Saved Games\DCS\dcs-mission-forge\src\App.tsx → C:\Users\trufa\Saved Games\DCS\dcs-mission-forge\src\utils\mistGenerator.ts
- `handleExport()` --calls--> `downloadBlob()`  [INFERRED]
  C:\Users\trufa\Saved Games\DCS\dcs-mission-forge\src\App.tsx → C:\Users\trufa\Saved Games\DCS\dcs-mission-forge\src\utils\mizParser.ts
- `parseMiz()` --calls--> `parseLuaTable()`  [INFERRED]
  C:\Users\trufa\Saved Games\DCS\dcs-mission-forge\src\utils\mizParser.ts → C:\Users\trufa\Saved Games\DCS\dcs-mission-forge\src\utils\luaParser.ts
- `buildMiz()` --calls--> `serializeLuaTable()`  [INFERRED]
  C:\Users\trufa\Saved Games\DCS\dcs-mission-forge\src\utils\mizParser.ts → C:\Users\trufa\Saved Games\DCS\dcs-mission-forge\src\utils\luaParser.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.36
Nodes (6): parseLuaTable(), parseTokens(), serializeLuaTable(), tokenize(), buildMiz(), parseMiz()

### Community 1 - "Community 1"
Cohesion: 0.38
Nodes (3): removeAutoRespawn(), removeZoneRespawn(), upd()

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.33
Nodes (3): handleExport(), generateMistLua(), downloadBlob()

### Community 4 - "Community 4"
Cohesion: 0.4
Nodes (0): 

### Community 5 - "Community 5"
Cohesion: 0.83
Nodes (3): extractAllGroups(), extractTriggerZones(), toArray()

### Community 6 - "Community 6"
Cohesion: 0.67
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 0.67
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (1): App Root

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (1): useMissionStore Zustand

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (1): dcsToLatLng proj4

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (1): parseMiz JSZip

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (1): MapView Leaflet drag

## Knowledge Gaps
- **5 isolated node(s):** `App Root`, `useMissionStore Zustand`, `dcsToLatLng proj4`, `parseMiz JSZip`, `MapView Leaflet drag`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 8`** (2 nodes): `index.tsx`, `toggle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (2 nodes): `index.tsx`, `MissionSettings()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `_gf_detect.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `dcs.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `App Root`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `useMissionStore Zustand`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `dcsToLatLng proj4`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `parseMiz JSZip`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `MapView Leaflet drag`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `handleExport()` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `buildMiz()` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `handleExport()` (e.g. with `generateMistLua()` and `buildMiz()`) actually correct?**
  _`handleExport()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `buildMiz()` (e.g. with `handleExport()` and `serializeLuaTable()`) actually correct?**
  _`buildMiz()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `App Root`, `useMissionStore Zustand`, `dcsToLatLng proj4` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._