"""
build_units_db.py
Enrichit public/data/units_db.json avec subcategory, coalition, country, era, role.
"""

import json
import os

# ---------------------------------------------------------------------------
# Dictionnaires de classification
# ---------------------------------------------------------------------------

PLANE_CLASSIFICATIONS = {
    # USA / OTAN
    "F-16C_50": ("fighter", "blue", "USA", "modern", "Chasseur multirôle"),
    "F-16A": ("fighter", "blue", "USA", "coldwar", "Chasseur"),
    "F-16A MLU": ("fighter", "blue", "USA", "modern", "Chasseur"),
    "FA-18C_hornet": ("fighter", "blue", "USA", "modern", "Chasseur embarqué"),
    "F/A-18C": ("fighter", "blue", "USA", "modern", "Chasseur embarqué"),
    "F-15C": ("fighter", "blue", "USA", "modern", "Chasseur air-air"),
    "F-15ESE": ("attacker", "blue", "USA", "modern", "Chasseur-bombardier"),
    "F-14A-135-GR": ("fighter", "blue", "USA", "coldwar", "Chasseur embarqué"),
    "F-14B": ("fighter", "blue", "USA", "modern", "Chasseur embarqué"),
    "F-14A": ("fighter", "blue", "USA", "coldwar", "Chasseur embarqué"),
    "A-10A": ("attacker", "blue", "USA", "coldwar", "Avion d'attaque au sol"),
    "A-10C": ("attacker", "blue", "USA", "modern", "Avion d'attaque au sol"),
    "A-10C_2": ("attacker", "blue", "USA", "modern", "Avion d'attaque au sol II"),
    "AV8BNA": ("attacker", "blue", "USA", "modern", "Attaque VTOL"),
    "B-52H": ("bomber", "blue", "USA", "modern", "Bombardier stratégique"),
    "B-1B": ("bomber", "blue", "USA", "modern", "Bombardier supersonique"),
    "C-130": ("transport", "blue", "USA", "modern", "Transport tactique"),
    "C-17A": ("transport", "blue", "USA", "modern", "Transport stratégique"),
    "E-3A": ("awacs", "blue", "USA", "modern", "AWACS"),
    "E-2C": ("awacs", "blue", "USA", "modern", "AWACS embarqué"),
    "KC-135": ("tanker", "blue", "USA", "modern", "Ravitailleur"),
    "KC-10A": ("tanker", "blue", "USA", "modern", "Ravitailleur"),
    "S-3B": ("tanker", "blue", "USA", "coldwar", "Ravitailleur/ASM embarqué"),
    "MQ-9 Reaper": ("uav", "blue", "USA", "modern", "Drone MALE"),
    "RQ-1A Predator": ("uav", "blue", "USA", "modern", "Drone reconnaissance"),
    "M-2000C": ("fighter", "blue", "France", "modern", "Chasseur multirôle"),
    "Mirage 2000-5": ("fighter", "blue", "France", "modern", "Chasseur"),
    "Mirage-F1CE": ("fighter", "blue", "France", "coldwar", "Chasseur"),
    "Mirage-F1EE": ("fighter", "blue", "France", "coldwar", "Chasseur"),
    "Mirage-F1M": ("fighter", "blue", "France", "coldwar", "Chasseur"),
    "AJS37": ("attacker", "blue", "Sweden", "coldwar", "Attaque/Reconnaissance"),
    "F-5E": ("fighter", "blue", "USA", "coldwar", "Chasseur léger"),
    "F-5E-3": ("fighter", "blue", "USA", "coldwar", "Chasseur léger"),
    "F-86F Sabre": ("fighter", "blue", "USA", "ww2", "Chasseur à réaction"),
    "F-4E-45MC": ("fighter", "blue", "USA", "coldwar", "Chasseur"),
    "F-111F": ("bomber", "blue", "USA", "coldwar", "Bombardier"),
    "F-117A": ("bomber", "blue", "USA", "modern", "Bombardier furtif"),
    "Tornado GR4": ("attacker", "blue", "UK", "modern", "Attaque au sol"),
    "Tornado GR4A": ("attacker", "blue", "UK", "modern", "Reconnaissance"),
    "Tornado IDS": ("attacker", "blue", "Germany", "coldwar", "Bombardier"),
    "C-101EB": ("trainer", "blue", "Spain", "modern", "Avion d'entraînement"),
    "C-101CC": ("trainer", "blue", "Spain", "modern", "Avion d'entraînement"),
    "MB-339A": ("trainer", "blue", "Italy", "modern", "Avion d'entraînement"),
    "MB-339APAN": ("trainer", "blue", "Italy", "modern", "Avion d'entraînement"),
    "L-39C": ("trainer", "both", "Czechoslovakia", "coldwar", "Avion d'entraînement"),
    "L-39ZA": ("trainer", "both", "Czechoslovakia", "coldwar", "Avion d'entraînement/Attaque"),
    "Yak-52": ("trainer", "red", "Russia", "coldwar", "Avion d'entraînement"),
    "TF-51D": ("trainer", "blue", "USA", "ww2", "Avion d'entraînement"),
    "Hawk": ("trainer", "blue", "UK", "modern", "Avion d'entraînement"),
    # RUSSIE / PACTE
    "Su-27": ("fighter", "red", "Russia", "modern", "Chasseur air-air"),
    "Su-30": ("fighter", "red", "Russia", "modern", "Chasseur multirôle"),
    "Su-33": ("fighter", "red", "Russia", "modern", "Chasseur embarqué"),
    "MiG-29A": ("fighter", "red", "Russia", "modern", "Chasseur"),
    "MiG-29G": ("fighter", "red", "Russia", "modern", "Chasseur (export)"),
    "MiG-29S": ("fighter", "red", "Russia", "modern", "Chasseur S"),
    "MiG-29K": ("fighter", "red", "Russia", "modern", "Chasseur embarqué"),
    "MiG-31": ("fighter", "red", "Russia", "modern", "Intercepteur"),
    "MiG-25PD": ("fighter", "red", "Russia", "coldwar", "Intercepteur"),
    "MiG-25RBT": ("attacker", "red", "Russia", "coldwar", "Reconnaissance"),
    "MiG-27K": ("attacker", "red", "Russia", "coldwar", "Bombardier"),
    "MiG-23MLD": ("fighter", "red", "Russia", "coldwar", "Chasseur"),
    "MiG-21Bis": ("fighter", "red", "Russia", "coldwar", "Chasseur"),
    "Su-25": ("attacker", "red", "Russia", "modern", "Avion d'attaque"),
    "Su-25T": ("attacker", "red", "Russia", "modern", "Avion d'attaque T"),
    "Su-25TM": ("attacker", "red", "Russia", "modern", "Avion d'attaque TM"),
    "Su-17M4": ("attacker", "red", "Russia", "coldwar", "Bombardier"),
    "Su-24M": ("bomber", "red", "Russia", "modern", "Bombardier"),
    "Su-24MR": ("attacker", "red", "Russia", "modern", "Reconnaissance"),
    "Su-34": ("bomber", "red", "Russia", "modern", "Bombardier"),
    "Su-39": ("attacker", "red", "Russia", "modern", "Avion d'attaque"),
    "Tu-22M3": ("bomber", "red", "Russia", "modern", "Bombardier stratégique"),
    "Tu-142": ("bomber", "red", "Russia", "modern", "Patrouille maritime"),
    "Tu-160": ("bomber", "red", "Russia", "modern", "Bombardier supersonique"),
    "Tu-95MS": ("bomber", "red", "Russia", "modern", "Bombardier stratégique"),
    "A-50": ("awacs", "red", "Russia", "modern", "AWACS russe"),
    "Il-76MD": ("transport", "red", "Russia", "modern", "Transport stratégique"),
    "Il-78M": ("tanker", "red", "Russia", "modern", "Ravitailleur"),
    "An-26B": ("transport", "red", "Russia", "coldwar", "Transport tactique"),
    "An-30M": ("attacker", "red", "Russia", "coldwar", "Reconnaissance/Cartographie"),
    "Yak-40": ("transport", "red", "Russia", "coldwar", "Transport léger"),
    # WWII
    "P-51D": ("fighter", "blue", "USA", "ww2", "Chasseur WWII"),
    "P-51D-30-NA": ("fighter", "blue", "USA", "ww2", "Chasseur WWII"),
    "P-47D-30": ("fighter", "blue", "USA", "ww2", "Chasseur-bombardier WWII"),
    "P-47D-40": ("fighter", "blue", "USA", "ww2", "Chasseur-bombardier WWII"),
    "Spitfire LF Mk. IX": ("fighter", "blue", "UK", "ww2", "Chasseur WWII"),
    "A-20G": ("bomber", "blue", "USA", "ww2", "Bombardier léger WWII"),
    "B-17G": ("bomber", "blue", "USA", "ww2", "Forteresse volante WWII"),
    "F4U-1D": ("fighter", "blue", "USA", "ww2", "Corsair embarqué WWII"),
    "Bf 109K-4": ("fighter", "red", "Germany", "ww2", "Chasseur WWII"),
    "FW-190A8": ("fighter", "red", "Germany", "ww2", "Chasseur WWII"),
    "FW-190D9": ("fighter", "red", "Germany", "ww2", "Chasseur WWII"),
    "I-16": ("fighter", "red", "Russia", "ww2", "Chasseur WWII soviétique"),
    "He 111H-16": ("bomber", "red", "Germany", "ww2", "Bombardier WWII"),
    "La-7": ("fighter", "red", "Russia", "ww2", "Chasseur WWII soviétique"),
    "MiG-15bis": ("fighter", "red", "Russia", "coldwar", "Chasseur à réaction"),
    "MiG-19P": ("fighter", "red", "Russia", "coldwar", "Chasseur supersonique"),
    "Christen Eagle II": ("trainer", "both", "USA", "modern", "Acrobatie"),
    "OH-58D": ("uav", "blue", "USA", "modern", "Hélicoptère reconnaissance"),
}

HELI_CLASSIFICATIONS = {
    "AH-64A": ("attack", "blue", "USA", "modern", "Hélicoptère d'attaque"),
    "AH-64D_BLK_II": ("attack", "blue", "USA", "modern", "Apache Longbow"),
    "AH-1W": ("attack", "blue", "USA", "modern", "Cobra"),
    "CH-47D": ("transport", "blue", "USA", "modern", "Chinook"),
    "CH-47F": ("transport", "blue", "USA", "modern", "Chinook F"),
    "CH-53E": ("transport", "blue", "USA", "modern", "Super Stallion"),
    "UH-1H": ("transport", "blue", "USA", "coldwar", "Huey"),
    "UH-60A": ("transport", "blue", "USA", "modern", "Black Hawk"),
    "SH-60B": ("transport", "blue", "USA", "modern", "Seahawk"),
    "SH-3W": ("transport", "blue", "USA", "coldwar", "Sea King"),
    "Ka-50": ("attack", "red", "Russia", "modern", "Hélicoptère d'attaque"),
    "Ka-52": ("attack", "red", "Russia", "modern", "Alligator"),
    "Ka-27": ("transport", "red", "Russia", "modern", "Helix"),
    "Mi-8MT": ("transport", "red", "Russia", "modern", "Mi-8 Hip"),
    "Mi-24V": ("attack", "red", "Russia", "modern", "Hind V"),
    "Mi-24P": ("attack", "red", "Russia", "modern", "Hind P"),
    "Mi-24W": ("attack", "red", "Russia", "modern", "Hind W"),
    "Mi-26": ("transport", "red", "Russia", "modern", "Halo — gros porteur"),
    "SA342M": ("attack", "blue", "France", "modern", "Gazelle HOT"),
    "SA342L": ("transport", "blue", "France", "modern", "Gazelle"),
    "SA342Minigun": ("attack", "blue", "France", "modern", "Gazelle Minigun"),
    "SA342Mistral": ("attack", "blue", "France", "modern", "Gazelle Mistral"),
}

VEHICLE_CLASSIFICATIONS = {
    # Chars
    "M-1 Abrams": ("tank", "blue", "USA", "modern", "Char de combat principal"),
    "M1A2": ("tank", "blue", "USA", "modern", "Char de combat M1A2"),
    "M1A2C_SEP_V3": ("tank", "blue", "USA", "modern", "Char M1A2C SEP V3"),
    "Leclerc": ("tank", "blue", "France", "modern", "Char Leclerc"),
    "Challenger2": ("tank", "blue", "UK", "modern", "Challenger 2"),
    "Leopard1A3": ("tank", "blue", "Germany", "coldwar", "Léopard 1A3"),
    "Leopard-2": ("tank", "blue", "Germany", "modern", "Léopard 2"),
    "Leopard-2A4": ("tank", "blue", "Germany", "modern", "Léopard 2A4"),
    "M-60": ("tank", "blue", "USA", "coldwar", "Char M60"),
    "M48A3 Patton": ("tank", "blue", "USA", "coldwar", "Char Patton"),
    "M4_Sherman": ("tank", "blue", "USA", "ww2", "Sherman WWII"),
    "T-55": ("tank", "red", "Russia", "coldwar", "Char T-55"),
    "T-72B": ("tank", "red", "Russia", "modern", "Char T-72"),
    "T-80UD": ("tank", "red", "Russia", "modern", "Char T-80"),
    "T-90": ("tank", "red", "Russia", "modern", "Char T-90"),
    "Pz_IV_H": ("tank", "red", "Germany", "ww2", "Panzer IV WWII"),
    "Tiger": ("tank", "red", "Germany", "ww2", "Tiger WWII"),
    # IFV
    "M-2 Bradley": ("ifv", "blue", "USA", "modern", "VCI Bradley"),
    "M1126": ("ifv", "blue", "USA", "modern", "Stryker ICV"),
    "M1128": ("ifv", "blue", "USA", "modern", "Stryker MGS"),
    "M1134": ("ifv", "blue", "USA", "modern", "Stryker ATGM"),
    "AAV7": ("ifv", "blue", "USA", "modern", "Assault Amphibian"),
    "LAV-25": ("ifv", "blue", "USA", "modern", "LAV-25"),
    "M-113": ("apc", "blue", "USA", "coldwar", "APC M113"),
    "BMP-1": ("ifv", "red", "Russia", "coldwar", "VCI BMP-1"),
    "BMP-2": ("ifv", "red", "Russia", "modern", "VCI BMP-2"),
    "BMP-3": ("ifv", "red", "Russia", "modern", "VCI BMP-3"),
    "BMD-1": ("ifv", "red", "Russia", "coldwar", "VCI aéroporté BMD-1"),
    "BTR-D": ("apc", "red", "Russia", "coldwar", "APC BTR-D"),
    "BTR-80": ("apc", "red", "Russia", "modern", "APC BTR-80"),
    "MTLB": ("apc", "red", "Russia", "coldwar", "MTLB"),
    "Marder": ("ifv", "blue", "Germany", "coldwar", "Marder"),
    "MCV-80": ("ifv", "blue", "UK", "modern", "Warrior"),
    "TPz_1_Fuchs": ("apc", "blue", "Germany", "modern", "Fuchs"),
    # SAM
    "Patriot AIO": ("sam", "blue", "USA", "modern", "SAM Patriot"),
    "Patriot str": ("sam", "blue", "USA", "modern", "Patriot Radar"),
    "Patriot ln": ("sam", "blue", "USA", "modern", "Patriot Lanceur"),
    "Patriot cp": ("sam", "blue", "USA", "modern", "Patriot Poste commande"),
    "Patriot EPP": ("sam", "blue", "USA", "modern", "Patriot EPP"),
    "Patriot AMG": ("sam", "blue", "USA", "modern", "Patriot AMG"),
    "Patriot ECS": ("sam", "blue", "USA", "modern", "Patriot ECS"),
    "M48 Chaparral": ("sam", "blue", "USA", "coldwar", "SAM Chaparral"),
    "M6 Linebacker": ("aa", "blue", "USA", "modern", "AA Linebacker"),
    "Vulcan": ("aa", "blue", "USA", "coldwar", "AA Vulcan M163"),
    "Stinger manpad": ("sam", "blue", "USA", "modern", "Stinger MANPAD"),
    "ZSU-23-4 Shilka": ("aa", "red", "Russia", "coldwar", "AA Shilka"),
    "2S6 Tunguska": ("aa", "red", "Russia", "modern", "AA Tunguska"),
    "Strela-10M3": ("sam", "red", "Russia", "modern", "SA-13 Gopher"),
    "SA-15 Tor": ("sam", "red", "Russia", "modern", "SA-15 Tor"),
    "5p73 s-125 ln": ("sam", "red", "Russia", "coldwar", "SA-3 Goa LN"),
    "S-300 PS SA-10B LN 5P85C": ("sam", "red", "Russia", "modern", "S-300 LN"),
    "S-300 PS SA-10B LN 5P85D": ("sam", "red", "Russia", "modern", "S-300 LN"),
    "SA-11 Buk LN 9A310M1": ("sam", "red", "Russia", "modern", "SA-11 Buk LN"),
    "SA-11 Buk SR 9S18M1": ("radar", "red", "Russia", "modern", "SA-11 Buk SR"),
    "SA-11 Buk CC 9S470M1": ("sam", "red", "Russia", "modern", "SA-11 Buk CC"),
    "SA-6 Kub LN 2P25": ("sam", "red", "Russia", "coldwar", "SA-6 Kub LN"),
    "SA-6 Kub STR 9S91": ("radar", "red", "Russia", "coldwar", "SA-6 Kub STR"),
    "Osa 9A33 ln": ("sam", "red", "Russia", "coldwar", "SA-8 Gecko"),
    "Gepard": ("aa", "blue", "Germany", "modern", "AA Gepard"),
    "Roland ADS": ("sam", "blue", "Germany", "modern", "Roland SAM"),
    "Hawk AIO": ("sam", "blue", "USA", "coldwar", "Hawk SAM"),
    # Radar
    "1L13 EWR": ("radar", "red", "Russia", "modern", "Radar EWR 1L13"),
    "55G6 EWR": ("radar", "red", "Russia", "coldwar", "Radar EWR 55G6"),
    "p-19 s-125 sr": ("radar", "red", "Russia", "coldwar", "Radar P-19"),
    "snr s-125 tr": ("radar", "red", "Russia", "coldwar", "Radar SNR"),
    "Dog Ear radar": ("radar", "red", "Russia", "coldwar", "Radar Dog Ear"),
    "Kub 1S91 str": ("radar", "red", "Russia", "coldwar", "Radar Kub"),
    "S-300 SR 64H6E": ("radar", "red", "Russia", "modern", "Radar S-300 SR"),
    "S-300 TR 30N6": ("radar", "red", "Russia", "modern", "Radar S-300 TR"),
    # Artillerie
    "2B11 mortar": ("artillery", "red", "Russia", "modern", "Mortier 120mm"),
    "M-109": ("artillery", "blue", "USA", "modern", "Howitzer M109"),
    "2S1_Gvozdika": ("artillery", "red", "Russia", "modern", "2S1 Gvozdika"),
    "2S3 Akatsia": ("artillery", "red", "Russia", "modern", "2S3 Akatsia"),
    "SAU Msta": ("artillery", "red", "Russia", "modern", "2S19 Msta-S"),
    "SAU Gvozdika": ("artillery", "red", "Russia", "modern", "2S1 Gvozdika"),
    "SpGH_Dana": ("artillery", "red", "Czechoslovakia", "coldwar", "Dana 152mm"),
    "BM-21 Grad": ("artillery", "red", "Russia", "modern", "BM-21 Grad MLRS"),
    "Uragan_9K57": ("artillery", "red", "Russia", "modern", "BM-27 Uragan MLRS"),
    "Smerch": ("artillery", "red", "Russia", "modern", "BM-30 Smerch MLRS"),
    "MLRS": ("artillery", "blue", "USA", "modern", "MLRS"),
    "M270 MLRS": ("artillery", "blue", "USA", "modern", "M270 MLRS"),
    "Grad_FDDM": ("radar", "red", "Russia", "modern", "Radar Grad"),
}

# ---------------------------------------------------------------------------
# Fallbacks par catégorie
# ---------------------------------------------------------------------------

FALLBACKS = {
    "plane":      ("other",  "both", "Unknown", "modern", ""),
    "helicopter": ("other",  "both", "Unknown", "modern", ""),
    "vehicle":    ("supply", "both", "Unknown", "modern", ""),
    "ship":       ("other",  "both", "Unknown", "modern", ""),
    "static":     ("other",  "both", "Unknown", "modern", ""),
}

CLASSIF_MAP = {
    "plane":      PLANE_CLASSIFICATIONS,
    "helicopter": HELI_CLASSIFICATIONS,
    "vehicle":    VEHICLE_CLASSIFICATIONS,
}

# ---------------------------------------------------------------------------
# Chemins
# ---------------------------------------------------------------------------

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
INPUT_PATH  = os.path.join(PROJECT_DIR, "public", "data", "units_db.json")
OUTPUT_PATH = INPUT_PATH   # on écrase le même fichier

# ---------------------------------------------------------------------------
# Traitement
# ---------------------------------------------------------------------------

def enrich_unit(unit: dict, category: str, classif: dict, fallback: tuple) -> dict:
    tid = unit.get("type", "")
    data = classif.get(tid)
    if data is None:
        subcategory, coalition, country, era, role = fallback
    else:
        subcategory, coalition, country, era, role = data

    return {
        "type":        tid,
        "name":        unit.get("name", tid),
        "subcategory": subcategory,
        "coalition":   coalition,
        "country":     country,
        "era":         era,
        "role":        role,
    }


def main():
    print(f"Lecture de {INPUT_PATH}")
    with open(INPUT_PATH, encoding="utf-8") as f:
        db = json.load(f)

    stats = {}
    result = {}

    for category, units in db.items():
        classif  = CLASSIF_MAP.get(category, {})
        fallback = FALLBACKS.get(category, ("other", "both", "Unknown", "modern", ""))

        enriched = 0
        fallback_count = 0
        enriched_units = []

        for unit in units:
            tid = unit.get("type", "")
            if tid in classif:
                enriched += 1
            else:
                fallback_count += 1
            enriched_units.append(enrich_unit(unit, category, classif, fallback))

        result[category] = enriched_units
        stats[category] = {"total": len(units), "enriched": enriched, "fallback": fallback_count}

    print(f"Ecriture de {OUTPUT_PATH}")
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print("\n=== Statistiques ===")
    total_enriched  = 0
    total_fallback  = 0
    total_all       = 0
    for cat, s in stats.items():
        print(f"  {cat:12s}  total={s['total']:4d}  enriched={s['enriched']:4d}  fallback={s['fallback']:4d}")
        total_enriched += s["enriched"]
        total_fallback += s["fallback"]
        total_all      += s["total"]
    print(f"  {'TOTAL':12s}  total={total_all:4d}  enriched={total_enriched:4d}  fallback={total_fallback:4d}")
    print("\nDone.")


if __name__ == "__main__":
    main()
