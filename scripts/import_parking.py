"""
import_parking.py
================
Lit parking_export.lua (généré par extract_parking_stands.lua dans DCS)
et met à jour caucasusAirfields.ts avec les vrais IDs et coordonnées physiques.

Usage:
    python scripts/import_parking.py [chemin/vers/parking_export.lua]

Défaut: C:/Users/[user]/Saved Games/DCS/parking_export.lua
"""

import sys
import re
import os
import json

sys.stdout.reconfigure(encoding='utf-8')

# --- Chemin par défaut ---
DEFAULT_EXPORT = os.path.expandvars(
    r'%USERPROFILE%\Saved Games\DCS\parking_export.lua'
)
AIRFIELDS_TS = os.path.join(
    os.path.dirname(__file__), '..', 'src', 'utils', 'caucasusAirfields.ts'
)


def parse_parking_lua(filepath: str) -> dict:
    """Parse parking_export.lua → dict[airfield_id: int] = list of spots"""
    with open(filepath, encoding='utf-8') as f:
        content = f.read()

    result = {}

    # Pattern: [id] = { ... spots = { { id=N, x=X, z=Z, y=Y, ... }, ... } }
    af_blocks = re.findall(
        r'\[(\d+)\]\s*=\s*\{.*?spots\s*=\s*\{(.*?)\}\s*,\s*\}',
        content, re.DOTALL
    )

    for af_id_str, spots_str in af_blocks:
        af_id = int(af_id_str)
        spots = []
        spot_matches = re.findall(
            r'\{\s*id\s*=\s*(\d+)\s*,\s*x\s*=\s*([+-]?\d+\.\d+)\s*,'
            r'\s*z\s*=\s*([+-]?\d+\.\d+)\s*,\s*y\s*=\s*([+-]?\d+\.\d+)'
            r'.*?heli\s*=\s*(true|false).*?plane\s*=\s*(true|false)'
            r'.*?\}',
            spots_str
        )
        for spot_id_str, x_str, z_str, y_str, heli_str, plane_str in spot_matches:
            spots.append({
                'id': int(spot_id_str),
                'x': float(x_str),
                'z': float(z_str),
                'y': float(y_str),
                'heli': heli_str == 'true',
                'plane': plane_str == 'true',
            })
        result[af_id] = spots

    return result


def format_parking_spots_ts(spots: list) -> str:
    """Formate la liste de spots en TypeScript inline."""
    lines = ['[\n']
    for s in spots:
        heli = 'true' if s['heli'] else 'false'
        plane = 'true' if s['plane'] else 'false'
        lines.append(
            f"      {{ id: {s['id']:3d}, x: {s['x']:14.3f}, z: {s['z']:14.3f},"
            f" y: {s['y']:8.3f}, heli: {heli}, plane: {plane} }},\n"
        )
    lines.append('    ]')
    return ''.join(lines)


def update_airfields_ts(parking_data: dict, ts_path: str) -> None:
    """Met à jour parkingIds ET parkingSpots dans caucasusAirfields.ts"""
    with open(ts_path, encoding='utf-8') as f:
        content = f.read()

    original = content
    updated_count = 0

    for af_id, spots in parking_data.items():
        if not spots:
            continue

        # --- 1. Mettre à jour parkingIds (liste des IDs seuls) ---
        ids = [s['id'] for s in spots]
        ids_str = ', '.join(str(i) for i in ids)

        pattern_ids = re.compile(
            r'(id:\s*' + str(af_id) + r',.*?parkingIds:\s*\[)[^\]]*(\])',
            re.DOTALL
        )
        new_content, n = pattern_ids.subn(
            lambda m: m.group(1) + ids_str + m.group(2),
            content, count=1
        )
        if n > 0:
            content = new_content

        # --- 2. Mettre à jour / insérer parkingSpots ---
        spots_ts = format_parking_spots_ts(spots)

        # Si parkingSpots existe déjà pour cet AF → remplacer
        pattern_spots = re.compile(
            r'(id:\s*' + str(af_id) + r',.*?parkingSpots:\s*)\[.*?\]',
            re.DOTALL
        )
        new_content, n2 = pattern_spots.subn(
            lambda m: m.group(1) + spots_ts,
            content, count=1
        )

        if n2 > 0:
            content = new_content
            updated_count += 1
        else:
            # Pas encore de parkingSpots → l'insérer après parkingIds: [...]
            pattern_insert = re.compile(
                r'(id:\s*' + str(af_id) + r',.*?parkingIds:\s*\[[^\]]*\])',
                re.DOTALL
            )
            replacement = r'\1,\n    parkingSpots: ' + spots_ts
            new_content, n3 = pattern_insert.subn(replacement, content, count=1)
            if n3 > 0:
                content = new_content
                updated_count += 1

        if n > 0 or n2 > 0:
            print(f'  AF {af_id:2d}: {len(spots):3d} spots → IDs [{ids_str[:50]}{"..." if len(ids_str)>50 else ""}]')

    if content != original:
        with open(ts_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'\nMis à jour: {updated_count} aérodromes dans {ts_path}')
    else:
        print('Aucune modification (IDs déjà à jour ou pattern non trouvé)')


def print_summary(parking_data: dict) -> None:
    print('\n=== RÉSUMÉ PARKING EXTRAIT ===')
    total_spots = 0
    for af_id in sorted(parking_data):
        spots = parking_data[af_id]
        total_spots += len(spots)
        ids = [s['id'] for s in spots]
        planes = sum(1 for s in spots if s['plane'])
        helis  = sum(1 for s in spots if s['heli'])
        print(f'  AF {af_id:3d}: {len(spots):3d} spots  ({planes} avions / {helis} heli)'
              f'  IDs: {ids[:6]}{"..." if len(ids)>6 else ""}')
        if spots:
            xs = [s['x'] for s in spots]
            zs = [s['z'] for s in spots]
            print(f'    x∈[{min(xs):.0f}, {max(xs):.0f}]  z∈[{min(zs):.0f}, {max(zs):.0f}]')
    print(f'\nTotal: {total_spots} spots sur {len(parking_data)} aérodromes')


def main():
    export_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_EXPORT

    print(f'Lecture: {export_path}')
    if not os.path.exists(export_path):
        print(f'ERREUR: fichier introuvable: {export_path}')
        print()
        print('Pour générer parking_export.lua:')
        print('  1. Ouvrir DCS Mission Editor')
        print('  2. Nouvelle mission Caucase')
        print('  3. Trigger: ONCE / Mission Start / DO SCRIPT FILE')
        print('     → C:\\Users\\trufa\\Saved Games\\DCS\\Scripts\\extract_parking_stands.lua')
        print('  4. Lancer (F12 > Fly), attendre 3s, quitter')
        print('  5. Relancer ce script')
        return

    parking_data = parse_parking_lua(export_path)
    print_summary(parking_data)

    ts_path = os.path.abspath(AIRFIELDS_TS)
    print(f'\nMise à jour: {ts_path}')
    update_airfields_ts(parking_data, ts_path)

    # Export JSON pour debug
    json_out = export_path.replace('.lua', '.json')
    with open(json_out, 'w', encoding='utf-8') as f:
        # Convertir bool Python → JSON bool
        json.dump({str(k): v for k, v in parking_data.items()}, f, indent=2)
    print(f'JSON exporté: {json_out}')


if __name__ == '__main__':
    main()
