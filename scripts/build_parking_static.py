import sys, json, math
sys.stdout.reconfigure(encoding='utf-8')

AIRFIELDS = [
    # (id, name, x_center, z_center, elevation, rwy_hdg_deg, n_spots)
    (12, "Anapa-Vityazevo",       -1321.8,   246748.5, 12,  102, 20),
    (13, "Krasnodar-Center",      -93717.5,  361938.3, 15,  240, 24),
    (14, "Novorossiysk",          -44547.2,  282827.8, 4,   120, 8),
    (15, "Krymsk",                -28070.0,  276800.0, 32,  40,  14),
    (16, "Maykop-Khanskaya",      -118610.0, 373330.0, 181, 40,  12),
    (17, "Gelendzhik",            -64756.8,  295819.5, 29,  110, 6),
    (18, "Sochi-Adler",           -170396.3, 337616.8, 7,   120, 16),
    (19, "Krasnodar-Pashkovsky",  -108553.1, 372980.8, 44,  230, 18),
    (20, "Sukhumi-Babushara",     -219344.8, 376870.5, 15,  110, 8),
    (21, "Gudauta",               -244143.7, 397750.5, 28,  110, 10),
    (22, "Batumi",                -356584.8, 618472.4, 10,  130, 8),
    (23, "Senaki-Kolkhi",         -297041.0, 631558.7, 28,  90,  24),
    (24, "Kobuleti",              -331292.0, 610987.0, 5,   150, 6),
    (25, "Kutaisi",               -284502.8, 685199.5, 46,  90,  20),
    (26, "Mineralnyye Vody",      -50326.4,  703758.6, 313, 115, 14),
    (27, "Nalchik",               -125664.6, 759355.7, 430, 60,  10),
    (28, "Mozdok",                -83799.6,  831748.8, 145, 83,  20),
    (29, "Tbilisi-Lochini",       -316544.1, 897748.5, 479, 130, 32),
    (30, "Tbilisi-Soganlug",      -325180.0, 886440.0, 467, 10,  18),
    (31, "Vaziani",               -321321.0, 920950.0, 464, 130, 22),
    (32, "Beslan",                -148692.1, 845322.9, 542, 270, 16),
]

def generate_spots(af_id, cx, cz, elev, rwy_hdg, n_spots):
    """Génère N spots en 2 rangées parallèles à la piste."""
    rad = math.radians(rwy_hdg)
    # Axe piste : (sin(hdg), cos(hdg)) en DCS (X=Nord, Z=Est)
    ax = math.sin(rad)
    az = math.cos(rad)
    # Perpendiculaire (vers gauche)
    px = -az
    pz = ax

    spots = []
    half = n_spots // 2
    remainder = n_spots - half

    # Décalage latéral selon la taille (grands aérodromes = plus large)
    lateral_offset = 200.0
    along_start = -(half // 2) * 30.0

    for i in range(half):
        along = along_start + i * 30.0
        x = cx + ax * along + px * lateral_offset
        z = cz + az * along + pz * lateral_offset
        spots.append({"id": i + 1, "x": round(x, 1), "z": round(z, 1), "y": float(elev), "heli": True, "plane": True})

    for i in range(remainder):
        along = along_start + i * 30.0
        x = cx + ax * along - px * lateral_offset
        z = cz + az * along - pz * lateral_offset
        spots.append({"id": half + i + 1, "x": round(x, 1), "z": round(z, 1), "y": float(elev), "heli": True, "plane": True})

    return spots

result = {}
for af_id, name, cx, cz, elev, rwy_hdg, n_spots in AIRFIELDS:
    result[str(af_id)] = generate_spots(af_id, cx, cz, elev, rwy_hdg, n_spots)
    print(f"  {name}: {n_spots} spots générés")

output_path = r"C:\Users\trufa\Saved Games\DCS\dcs-mission-forge\public\data\parking_caucasus.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2)
print(f"\nOK → {output_path}")
print(f"Total: {sum(len(v) for v in result.values())} spots pour {len(result)} aérodromes")
