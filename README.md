# DCS Mission Forge

**Éditeur web open-source de missions DCS World — Caucase**

> Gratuit · 100% navigateur · Support MIST natif · Aucune connaissance en code requise

🌐 **[Accéder à l'outil en ligne](https://AstroQuestStudio.github.io/dcs-mission-forge/)**

---

## Fonctionnalités

| Feature | Statut |
|---------|--------|
| Chargement .miz par drag & drop | ✅ |
| Carte Caucase interactive (Leaflet) | ✅ |
| Affichage groupes / unités / zones trigger | ✅ |
| Éditeur de propriétés unités | ✅ |
| Éditeur météo (vent, nuages, visibilité) | ✅ |
| Support MIST no-code (respawn, presets) | ✅ |
| Export .miz téléchargeable | ✅ |
| Briefing mission BLEU/ROUGE | ✅ |
| Presets MIST (CAP auto, convoi, BARCAP) | ✅ |
| GitHub Pages — aucun hébergement requis | ✅ |

## Comment utiliser

1. Ouvrez l'outil : **https://AstroQuestStudio.github.io/dcs-mission-forge/**
2. Glissez-déposez votre fichier `.miz` dans la fenêtre
3. Explorez et modifiez votre mission sur la carte Caucase
4. Configurez les options MIST (auto-respawn, etc.) sans écrire de code
5. Exportez votre fichier `.miz` modifié et rechargez-le dans DCS

## MIST — Support natif

L'onglet **MIST** permet de configurer des comportements avancés sans écrire de Lua :

- **CAP Automatique** — Groupe aérien qui respawn après destruction
- **Convoi Dynamique** — Colonne qui repart après élimination
- **BARCAP Tournant** — Rotation automatique de CAP
- **Respawn en Zone** — Réapparition dans une zone trigger définie
- **SEAD sur Événement** — Mission SEAD déclenchée automatiquement

> Le code Lua MIST est automatiquement injecté dans le .miz exporté.
> Assurez-vous que `mist_4_5_126.lua` est chargé en premier dans vos triggers DCS.

## Développement local

```bash
git clone https://github.com/AstroQuestStudio/dcs-mission-forge
cd dcs-mission-forge
npm install
npm run dev
```

Ouvrez http://localhost:5173/dcs-mission-forge/

## Déploiement (automatique via GitHub Actions)

Chaque push sur `main` → déploiement automatique sur GitHub Pages.

```bash
git push origin main
```

Pour activer GitHub Pages :
1. Aller dans **Settings → Pages** du repo
2. Source : **GitHub Actions**
3. Le workflow `.github/workflows/deploy.yml` s'occupe du reste

## Technologies

- **React 18** + TypeScript + Vite
- **Tailwind CSS v4**
- **Leaflet.js** + react-leaflet
- **JSZip** (lecture/écriture .miz en pur navigateur)
- **Zustand** (state management)
- **GitHub Pages** (hébergement gratuit)

## Licence

MIT — Utilisez, modifiez, redistribuez librement.

---

*Projet open-source indépendant — non affilié à Eagle Dynamics.*
