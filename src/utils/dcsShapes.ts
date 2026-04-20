/**
 * Silhouettes SVG vue de dessus pour toutes les unités DCS.
 * viewBox="0 0 48 48", unité pointe vers le HAUT (nord).
 * Pas de fill/stroke — appliqués par le code parent.
 * Fragments SVG internes uniquement (pas de balise <svg>).
 */

export const DCS_SHAPES: Record<string, string> = {

  // ══════════════════════════════════════════════════════════
  // WWII
  // ══════════════════════════════════════════════════════════

  p51: `<polygon points="24,3 26,14 44,21 42,24 26,20 27,36 30,38 30,40 24,38 18,40 18,38 21,36 22,20 6,24 4,21 22,14"/>
    <polygon points="24,36 26,42 24,45 22,42"/>`,

  p47: `<ellipse cx="24" cy="16" rx="6" ry="14"/>
    <polygon points="24,16 44,23 43,26 27,22 28,34 31,36 31,38 24,37 17,38 17,36 20,34 21,22 5,26 4,23"/>
    <polygon points="22,36 26,36 25,43 24,45 23,43"/>`,

  p38: `<rect x="22" y="6" width="4" height="28" rx="2"/>
    <polygon points="24,14 44,20 44,23 24,18 4,23 4,20"/>
    <rect x="10" y="8" width="4" height="24" rx="2"/>
    <rect x="34" y="8" width="4" height="24" rx="2"/>
    <polygon points="10,32 14,32 14,36 10,36"/>
    <polygon points="34,32 38,32 38,36 34,36"/>`,

  fw190: `<ellipse cx="24" cy="14" rx="6" ry="12"/>
    <polygon points="24,18 42,24 41,27 27,23 27,34 30,36 30,38 24,37 18,38 18,36 21,34 21,23 7,27 6,24"/>
    <polygon points="22,35 26,35 25,42 24,44 23,42"/>`,

  bf109: `<polygon points="24,2 26,4 26,14 44,21 43,24 26,19 26,35 29,37 28,39 24,38 20,39 19,37 22,35 22,19 5,24 4,21 22,14 22,4"/>
    <polygon points="22,36 26,36 25,42 24,44 23,42"/>`,

  spitfire: `<polygon points="24,3 26,12 28,16 44,22 42,26 28,22 26,22 27,36 30,38 29,40 24,39 19,40 18,38 21,36 22,22 20,22 6,26 4,22 20,16 22,12"/>
    <polygon points="22,37 26,37 25,43 24,45 23,43"/>`,

  corsair: `<ellipse cx="24" cy="14" rx="5" ry="12"/>
    <polygon points="24,22 28,25 36,21 43,23 41,26 34,24 28,28 27,36 30,38 30,40 24,39 18,40 18,38 21,36 21,28 20,28 14,24 7,26 5,23 12,21 20,25"/>
    <polygon points="22,37 26,37 25,43 24,45 23,43"/>`,

  mosquito: `<rect x="22" y="4" width="4" height="36" rx="2"/>
    <polygon points="24,18 44,23 44,26 24,22 4,26 4,23"/>
    <rect x="14" y="14" width="6" height="16" rx="3"/>
    <rect x="28" y="14" width="6" height="16" rx="3"/>
    <polygon points="22,36 26,36 25,42 24,44 23,42"/>`,

  f86: `<ellipse cx="24" cy="16" rx="4" ry="14"/>
    <polygon points="24,20 44,30 43,33 26,24 26,36 29,38 28,40 24,39 20,40 19,38 22,36 22,24 5,33 4,30"/>
    <polygon points="22,37 26,37 25,42 24,44 23,42"/>
    <ellipse cx="24" cy="5" rx="3" ry="2"/>`,

  mig15: `<ellipse cx="24" cy="15" rx="5" ry="13"/>
    <polygon points="24,20 45,33 44,36 26,25 26,36 29,38 28,40 24,39 20,40 19,38 22,36 22,25 4,36 3,33"/>
    <polygon points="22,37 26,37 25,42 24,44 23,42"/>
    <circle cx="24" cy="5" r="3"/>`,

  mig19: `<polygon points="24,4 28,12 26,22 26,34 29,36 28,38 24,37 20,38 19,36 22,34 22,22 20,12"/>
    <polygon points="24,16 44,28 43,32 26,24 22,24 5,32 4,28"/>
    <rect x="19" y="32" width="4" height="8" rx="2"/>
    <rect x="25" y="32" width="4" height="8" rx="2"/>`,

  a20: `<rect x="21" y="4" width="6" height="38" rx="3"/>
    <polygon points="24,20 45,25 45,28 24,24 3,28 3,25"/>
    <rect x="12" y="14" width="8" height="18" rx="4"/>
    <rect x="28" y="14" width="8" height="18" rx="4"/>
    <polygon points="21,38 27,38 26,43 25,45 23,45 22,43"/>`,

  // ══════════════════════════════════════════════════════════
  // JETS OTAN MODERNES
  // ══════════════════════════════════════════════════════════

  f16: `<polygon points="24,3 22,10 26,10 22,26 26,26 23,38 24,45 25,38 26,26 22,26"/>
    <polygon points="22,14 3,33 7,34 21,24"/>
    <polygon points="26,14 45,33 41,34 27,24"/>
    <polygon points="22,30 13,41 16,42 22,36"/>
    <polygon points="26,30 35,41 32,42 26,36"/>
    <rect x="22.5" y="10" width="3" height="3.5" rx="0.5"/>`,

  f18: `<polygon points="22,4 26,4 27,10 21,10"/>
    <polygon points="21,10 27,10 28,32 20,32"/>
    <polygon points="20,32 28,32 27,40 21,40"/>
    <polygon points="22,10 15,14 19,22 21,16"/>
    <polygon points="26,10 33,14 29,22 27,16"/>
    <polygon points="19,20 2,32 6,34 19,27"/>
    <polygon points="29,20 46,32 42,34 29,27"/>
    <polygon points="20,30 11,42 14,43 20,36"/>
    <polygon points="28,30 37,42 34,43 28,36"/>
    <rect x="19" y="37" width="2.5" height="6" rx="1"/>
    <rect x="26.5" y="37" width="2.5" height="6" rx="1"/>`,

  f14: `<polygon points="21,3 27,3 28,9 20,9"/>
    <polygon points="20,9 28,9 29,38 19,38"/>
    <polygon points="19,38 29,38 27,44 21,44"/>
    <polygon points="20,14 3,37 7,38 19,27"/>
    <polygon points="28,14 45,37 41,38 29,27"/>
    <polygon points="19,32 10,44 13,45 19,38"/>
    <polygon points="29,32 38,44 35,45 29,38"/>
    <rect x="18.5" y="36" width="3" height="7" rx="1"/>
    <rect x="26.5" y="36" width="3" height="7" rx="1"/>`,

  f15: `<polygon points="21,3 27,3 28,8 20,8"/>
    <polygon points="20,8 28,8 29,36 19,36"/>
    <polygon points="19,36 29,36 27,43 21,43"/>
    <polygon points="20,10 14,15 19,21 20,17"/>
    <polygon points="28,10 34,15 29,21 28,17"/>
    <polygon points="19,17 2,30 5,32 19,27"/>
    <polygon points="29,17 46,30 43,32 29,27"/>
    <polygon points="19,30 9,41 12,42 19,36"/>
    <polygon points="29,30 39,41 36,42 29,36"/>
    <rect x="18.5" y="34" width="3" height="8" rx="1"/>
    <rect x="26.5" y="34" width="3" height="8" rx="1"/>`,

  f15e: `<polygon points="21,3 27,3 28,7 20,7"/>
    <polygon points="20,7 28,7 30,36 18,36"/>
    <polygon points="18,36 30,36 28,43 20,43"/>
    <rect x="15.5" y="12" width="3" height="19" rx="1"/>
    <rect x="29.5" y="12" width="3" height="19" rx="1"/>
    <polygon points="19,10 12,16 18,22 19,18"/>
    <polygon points="29,10 36,16 30,22 29,18"/>
    <polygon points="18,18 1,30 4,32 18,27"/>
    <polygon points="30,18 47,30 44,32 30,27"/>
    <polygon points="18,30 8,41 11,42 18,36"/>
    <polygon points="30,30 40,41 37,42 30,36"/>
    <rect x="17.5" y="34" width="3.5" height="8" rx="1"/>
    <rect x="27" y="34" width="3.5" height="8" rx="1"/>`,

  f22: `<polygon points="24,3 20,10 19,32 22,36 26,36 29,32 28,10"/>
    <polygon points="20,10 2,29 6,31 20,23"/>
    <polygon points="28,10 46,29 42,31 28,23"/>
    <polygon points="19,27 7,41 11,42 20,33"/>
    <polygon points="29,27 41,41 37,42 28,33"/>
    <polygon points="22,36 26,36 25,44 23,44"/>`,

  f35: `<polygon points="24,3 20,9 19,31 22,36 26,36 29,31 28,9"/>
    <polygon points="20,12 2,31 7,33 20,25"/>
    <polygon points="28,12 46,31 41,33 28,25"/>
    <polygon points="19,28 11,41 14,42 20,34"/>
    <polygon points="29,28 37,41 34,42 28,34"/>
    <ellipse cx="24" cy="40" rx="3" ry="4"/>`,

  eurofighter: `<polygon points="24,2 22,8 22,36 23,39 25,39 26,36 26,8"/>
    <polygon points="22,10 10,19 13,20 22,15"/>
    <polygon points="26,10 38,19 35,20 26,15"/>
    <polygon points="22,18 1,40 6,42 22,31"/>
    <polygon points="26,18 47,40 42,42 26,31"/>
    <rect x="22" y="37" width="4" height="6" rx="1.5"/>`,

  rafale: `<polygon points="24,3 22,9 21,35 22,39 26,39 27,35 26,9"/>
    <polygon points="22,11 13,17 15,18 22,16"/>
    <polygon points="26,11 35,17 33,18 26,16"/>
    <polygon points="21,20 3,37 7,39 21,30"/>
    <polygon points="27,20 45,37 41,39 27,30"/>
    <rect x="20.5" y="35" width="2.5" height="7" rx="1"/>
    <rect x="25" y="35" width="2.5" height="7" rx="1"/>`,

  gripen: `<polygon points="24,4 22,10 22,34 23,38 25,38 26,34 26,10"/>
    <polygon points="22,12 13,20 15,21 22,16"/>
    <polygon points="26,12 35,20 33,21 26,16"/>
    <polygon points="22,19 4,37 9,39 22,29"/>
    <polygon points="26,19 44,37 39,39 26,29"/>
    <rect x="22" y="34" width="4" height="8" rx="1.5"/>`,

  m2000: `<polygon points="24,2 22,13 22,34 23,40 25,40 26,34 26,13"/>
    <polygon points="22,14 2,39 8,41 22,32"/>
    <polygon points="26,14 46,39 40,41 26,32"/>
    <rect x="22" y="38" width="4" height="6" rx="1.5"/>`,

  f4: `<polygon points="24,3 21,9 20,10 20,37 22,40 26,40 28,37 28,10 27,9"/>
    <rect x="17" y="10" width="3" height="12" rx="0.5"/>
    <rect x="28" y="10" width="3" height="12" rx="0.5"/>
    <polygon points="20,15 2,27 4,31 20,24"/>
    <polygon points="28,15 46,27 44,31 28,24"/>
    <polygon points="20,30 9,42 12,43 20,37"/>
    <polygon points="28,30 39,42 36,43 28,37"/>
    <rect x="19" y="35" width="3" height="8" rx="1"/>
    <rect x="26" y="35" width="3" height="8" rx="1"/>`,

  // ── Divers OTAN ──────────────────────────────────────────

  mirage_f1: `<polygon points="24,3 22,11 22,33 23,39 25,39 26,33 26,11"/>
    <polygon points="22,15 5,35 10,37 22,28"/>
    <polygon points="26,15 43,35 38,37 26,28"/>
    <polygon points="21,28 14,38 17,39 22,33"/>
    <polygon points="27,28 34,38 31,39 26,33"/>
    <rect x="22" y="37" width="4" height="6" rx="1.5"/>`,

  av8: `<polygon points="24,4 22,9 22,32 23,37 25,37 26,32 26,9"/>
    <polygon points="22,14 5,26 7,29 22,22"/>
    <polygon points="26,14 43,26 41,29 26,22"/>
    <polygon points="21,26 12,36 15,37 22,31"/>
    <polygon points="27,26 36,36 33,37 26,31"/>
    <rect x="22" y="35" width="4" height="6" rx="1.5"/>`,

  tornado: `<polygon points="21,3 27,3 28,9 20,9"/>
    <polygon points="20,9 28,9 28,35 20,35"/>
    <polygon points="20,22 6,32 8,35 20,28"/>
    <polygon points="28,22 42,32 40,35 28,28"/>
    <polygon points="20,30 12,40 15,41 20,35"/>
    <polygon points="28,30 36,40 33,41 28,35"/>
    <rect x="19" y="33" width="3" height="7" rx="1"/>
    <rect x="26" y="33" width="3" height="7" rx="1"/>`,

  a10: `<rect x="4" y="20" width="40" height="5" rx="2"/>
    <rect x="19" y="4" width="4" height="38" rx="2"/>
    <rect x="23" y="4" width="4" height="38" rx="2"/>
    <rect x="11" y="28" width="5" height="10" rx="1"/>
    <rect x="32" y="28" width="5" height="10" rx="1"/>
    <rect x="21" y="3" width="6" height="4" rx="1"/>`,

  // ══════════════════════════════════════════════════════════
  // JETS RUSSES / SOVIÉTIQUES
  // ══════════════════════════════════════════════════════════

  su27: `<ellipse cx="20" cy="30" rx="2" ry="7"/>
    <ellipse cx="28" cy="30" rx="2" ry="7"/>
    <ellipse cx="24" cy="22" rx="2.8" ry="13"/>
    <polygon points="24,6 22,13 26,13"/>
    <polygon points="22,14 8,28 14,28 21,20"/>
    <polygon points="26,14 40,28 34,28 27,20"/>
    <polygon points="14,28 8,28 10,36 20,32"/>
    <polygon points="34,28 40,28 38,36 28,32"/>
    <polygon points="18,37 12,42 16,43 20,39"/>
    <polygon points="30,37 36,42 32,43 28,39"/>
    <rect x="18.5" y="32" width="2" height="9" rx="0.5"/>
    <rect x="27.5" y="32" width="2" height="9" rx="0.5"/>`,

  su25: `<ellipse cx="24" cy="24" rx="3.5" ry="12"/>
    <ellipse cx="24" cy="12" rx="3" ry="4"/>
    <polygon points="20,20 7,23 7,27 20,28"/>
    <polygon points="28,20 41,23 41,27 28,28"/>
    <ellipse cx="19" cy="28" rx="2" ry="5.5"/>
    <ellipse cx="29" cy="28" rx="2" ry="5.5"/>
    <polygon points="21,34 14,38 16,41 22,37"/>
    <polygon points="27,34 34,38 32,41 26,37"/>
    <rect x="22.5" y="33" width="3" height="8" rx="0.5"/>`,

  su34: `<rect x="20" y="12" width="8" height="22" rx="2.5"/>
    <polygon points="24,6 20,13 28,13"/>
    <polygon points="21,14 14,17 15,19 21,17"/>
    <polygon points="27,14 34,17 33,19 27,17"/>
    <polygon points="21,18 7,30 13,30 20,23"/>
    <polygon points="27,18 41,30 35,30 28,23"/>
    <polygon points="13,30 7,30 10,38 21,33"/>
    <polygon points="35,30 41,30 38,38 27,33"/>
    <ellipse cx="19.5" cy="31" rx="2" ry="7"/>
    <ellipse cx="28.5" cy="31" rx="2" ry="7"/>
    <polygon points="19,37 12,42 15,43 20,39"/>
    <polygon points="29,37 36,42 33,43 28,39"/>
    <rect x="19" y="33" width="2" height="8" rx="0.5"/>
    <rect x="27" y="33" width="2" height="8" rx="0.5"/>`,

  mig29: `<ellipse cx="21" cy="30" rx="2" ry="6.5"/>
    <ellipse cx="27" cy="30" rx="2" ry="6.5"/>
    <ellipse cx="24" cy="23" rx="2.5" ry="11"/>
    <polygon points="24,8 22,14 26,14"/>
    <polygon points="22,16 9,27 15,27 21,21"/>
    <polygon points="26,16 39,27 33,27 27,21"/>
    <polygon points="15,27 9,27 11,34 20,31"/>
    <polygon points="33,27 39,27 37,34 28,31"/>
    <polygon points="19,36 13,40 16,41 20,38"/>
    <polygon points="29,36 35,40 32,41 28,38"/>
    <rect x="19.5" y="31" width="2" height="8" rx="0.5"/>
    <rect x="26.5" y="31" width="2" height="8" rx="0.5"/>`,

  mig31: `<ellipse cx="24" cy="24" rx="3.2" ry="14"/>
    <polygon points="24,7 22,13 26,13"/>
    <polygon points="21,19 8,27 9,31 21,26"/>
    <polygon points="27,19 40,27 39,31 27,26"/>
    <ellipse cx="20" cy="30" rx="2.5" ry="7"/>
    <ellipse cx="28" cy="30" rx="2.5" ry="7"/>
    <polygon points="19,36 11,41 14,42 20,38"/>
    <polygon points="29,36 37,41 34,42 28,38"/>
    <rect x="19.5" y="32" width="2" height="8" rx="0.5"/>
    <rect x="26.5" y="32" width="2" height="8" rx="0.5"/>`,

  mig21: `<ellipse cx="24" cy="24" rx="2" ry="14"/>
    <polygon points="24,6 23,13 25,13"/>
    <polygon points="23,18 7,36 22,36"/>
    <polygon points="25,18 41,36 26,36"/>
    <polygon points="22,36 17,41 19,42 23,38"/>
    <polygon points="26,36 31,41 29,42 25,38"/>
    <rect x="22.8" y="30" width="2.4" height="10" rx="0.5"/>`,

  su24: `<rect x="21" y="11" width="6" height="26" rx="2"/>
    <polygon points="24,7 21,12 27,12"/>
    <polygon points="22,19 9,30 12,33 22,24"/>
    <polygon points="26,19 39,30 36,33 26,24"/>
    <polygon points="21,34 13,40 15,42 22,37"/>
    <polygon points="27,34 35,40 33,42 26,37"/>
    <rect x="20.5" y="31" width="2" height="8" rx="0.5"/>
    <rect x="25.5" y="31" width="2" height="8" rx="0.5"/>`,

  su30: `<ellipse cx="20" cy="29" rx="2.2" ry="8"/>
    <ellipse cx="28" cy="29" rx="2.2" ry="8"/>
    <ellipse cx="24" cy="21" rx="2.8" ry="13"/>
    <polygon points="24,5 22,13 26,13"/>
    <polygon points="21,13 13,18 18,18 21,16"/>
    <polygon points="27,13 35,18 30,18 27,16"/>
    <polygon points="22,15 8,27 14,27 21,21"/>
    <polygon points="26,15 40,27 34,27 27,21"/>
    <polygon points="14,27 8,27 10,35 20,31"/>
    <polygon points="34,27 40,27 38,35 28,31"/>
    <polygon points="18,36 12,41 15,42 19,38"/>
    <polygon points="30,36 36,41 33,42 29,38"/>
    <rect x="18.5" y="32" width="2" height="8" rx="0.5"/>
    <rect x="27.5" y="32" width="2" height="8" rx="0.5"/>`,

  // ══════════════════════════════════════════════════════════
  // BOMBARDIERS
  // ══════════════════════════════════════════════════════════

  tu95: `<ellipse cx="24" cy="24" rx="2.5" ry="16"/>
    <polygon points="24,5 22,11 26,11"/>
    <polygon points="22,17 3,26 4,30 22,23"/>
    <polygon points="26,17 45,26 44,30 26,23"/>
    <ellipse cx="16" cy="23" rx="1.8" ry="3"/>
    <circle cx="16" cy="20" r="2.5" fill="none" stroke="currentColor" stroke-width="0.8"/>
    <ellipse cx="9" cy="25" rx="1.8" ry="3"/>
    <circle cx="9" cy="22" r="2.5" fill="none" stroke="currentColor" stroke-width="0.8"/>
    <ellipse cx="32" cy="23" rx="1.8" ry="3"/>
    <circle cx="32" cy="20" r="2.5" fill="none" stroke="currentColor" stroke-width="0.8"/>
    <ellipse cx="39" cy="25" rx="1.8" ry="3"/>
    <circle cx="39" cy="22" r="2.5" fill="none" stroke="currentColor" stroke-width="0.8"/>
    <polygon points="22,37 14,43 16,44 23,40"/>
    <polygon points="26,37 34,43 32,44 25,40"/>
    <rect x="22.5" y="35" width="3" height="8" rx="0.5"/>`,

  b1: `<ellipse cx="24" cy="24" rx="2.8" ry="15"/>
    <polygon points="24,6 22,12 26,12"/>
    <polygon points="22,20 6,30 8,34 22,26"/>
    <polygon points="26,20 42,30 40,34 26,26"/>
    <ellipse cx="16" cy="28" rx="1.8" ry="4.5"/>
    <ellipse cx="11" cy="30" rx="1.8" ry="4"/>
    <ellipse cx="32" cy="28" rx="1.8" ry="4.5"/>
    <ellipse cx="37" cy="30" rx="1.8" ry="4"/>
    <polygon points="21,36 13,41 15,43 22,39"/>
    <polygon points="27,36 35,41 33,43 26,39"/>
    <rect x="22.5" y="34" width="3" height="8" rx="0.5"/>`,

  b52: `<ellipse cx="24" cy="23" rx="3.5" ry="14"/>
    <ellipse cx="24" cy="9" rx="3" ry="3.5"/>
    <polygon points="20,18 3,22 3,27 20,24"/>
    <polygon points="28,18 45,22 45,27 28,24"/>
    <ellipse cx="15" cy="22" rx="2" ry="4"/>
    <ellipse cx="9" cy="23" rx="2" ry="3.5"/>
    <ellipse cx="33" cy="22" rx="2" ry="4"/>
    <ellipse cx="39" cy="23" rx="2" ry="3.5"/>
    <polygon points="20,33 11,39 13,41 21,36"/>
    <polygon points="28,33 37,39 35,41 27,36"/>
    <rect x="22" y="31" width="4" height="10" rx="1"/>`,

  b2: `<polygon points="24,8 38,18 44,22 40,28 34,26 29,32 24,33 19,32 14,26 8,28 4,22 10,18"/>`,

  tu160: `<ellipse cx="24" cy="24" rx="3" ry="16"/>
    <polygon points="24,5 22,12 26,12"/>
    <polygon points="22,18 4,28 6,32 22,24"/>
    <polygon points="26,18 44,28 42,32 26,24"/>
    <ellipse cx="18" cy="27" rx="2" ry="5"/>
    <ellipse cx="30" cy="27" rx="2" ry="5"/>
    <polygon points="21,36 13,42 15,44 22,39"/>
    <polygon points="27,36 35,42 33,44 26,39"/>
    <rect x="22" y="34" width="4" height="9" rx="0.5"/>`,

  // ══════════════════════════════════════════════════════════
  // TRANSPORT / AWACS / TANKER
  // ══════════════════════════════════════════════════════════

  c130: `<rect x="19" y="5" width="10" height="36" rx="3"/>
    <polygon points="24,20 5,25 5,29 24,26 43,29 43,25"/>
    <ellipse cx="14" cy="23" rx="2" ry="4"/>
    <ellipse cx="34" cy="23" rx="2" ry="4"/>
    <ellipse cx="10" cy="24" rx="2" ry="4"/>
    <ellipse cx="38" cy="24" rx="2" ry="4"/>
    <polygon points="20,37 28,37 27,42 21,42"/>`,

  e3: `<rect x="19" y="5" width="10" height="36" rx="3"/>
    <polygon points="24,20 5,25 5,28 24,26 43,28 43,25"/>
    <ellipse cx="14" cy="23" rx="2" ry="4"/>
    <ellipse cx="34" cy="23" rx="2" ry="4"/>
    <ellipse cx="10" cy="24" rx="2" ry="4"/>
    <ellipse cx="38" cy="24" rx="2" ry="4"/>
    <ellipse cx="24" cy="16" rx="12" ry="3"/>
    <polygon points="20,37 28,37 27,42 21,42"/>`,

  kc135: `<rect x="20" y="5" width="8" height="36" rx="3"/>
    <polygon points="24,19 6,25 6,28 24,25 42,28 42,25"/>
    <ellipse cx="14" cy="23" rx="2" ry="4"/>
    <ellipse cx="34" cy="23" rx="2" ry="4"/>
    <polygon points="21,37 27,37 26,42 22,42"/>
    <rect x="22" y="38" width="4" height="4" rx="1"/>`,

  // ══════════════════════════════════════════════════════════
  // HÉLICOPTÈRES
  // ══════════════════════════════════════════════════════════

  ah64: `<circle cx="24" cy="22" r="12" fill="none" stroke="currentColor" stroke-width="0.9"/>
    <line x1="12" y1="22" x2="36" y2="22" stroke="currentColor" stroke-width="1.2"/>
    <line x1="24" y1="10" x2="24" y2="34" stroke="currentColor" stroke-width="1.2"/>
    <ellipse cx="24" cy="26" rx="2.8" ry="12"/>
    <polygon points="24,12 22,17 26,17"/>
    <rect x="11" y="23" width="10" height="2" rx="0.5"/>
    <rect x="27" y="23" width="10" height="2" rx="0.5"/>
    <rect x="23" y="34" width="2" height="8" rx="0.5"/>
    <line x1="19" y1="41" x2="29" y2="41" stroke="currentColor" stroke-width="1.1"/>`,

  ka50: `<circle cx="24" cy="22" r="13" fill="none" stroke="currentColor" stroke-width="0.9"/>
    <circle cx="24" cy="22" r="9" fill="none" stroke="currentColor" stroke-width="0.9"/>
    <line x1="11" y1="22" x2="37" y2="22" stroke="currentColor" stroke-width="1.2"/>
    <line x1="16.5" y1="12.3" x2="31.5" y2="31.7" stroke="currentColor" stroke-width="1.2"/>
    <line x1="16.5" y1="31.7" x2="31.5" y2="12.3" stroke="currentColor" stroke-width="1.2"/>
    <ellipse cx="24" cy="26" rx="3" ry="10"/>
    <rect x="12" y="24" width="9" height="2.5" rx="0.5"/>
    <rect x="27" y="24" width="9" height="2.5" rx="0.5"/>
    <polygon points="22,35 21,41 27,41 26,35"/>`,

  mi24: `<circle cx="24" cy="21" r="14" fill="none" stroke="currentColor" stroke-width="0.9"/>
    <line x1="10" y1="21" x2="38" y2="21" stroke="currentColor" stroke-width="1.2"/>
    <line x1="17" y1="8.5" x2="31" y2="33.5" stroke="currentColor" stroke-width="1.2"/>
    <line x1="31" y1="8.5" x2="17" y2="33.5" stroke="currentColor" stroke-width="1.2"/>
    <ellipse cx="24" cy="25" rx="3.5" ry="11"/>
    <ellipse cx="24" cy="16" rx="3" ry="5"/>
    <polygon points="20,22 9,26 9,29 20,25"/>
    <polygon points="28,22 39,26 39,29 28,25"/>
    <rect x="22.5" y="34" width="3" height="9" rx="0.5"/>
    <line x1="18" y1="42" x2="30" y2="42" stroke="currentColor" stroke-width="1.1"/>`,

  uh60: `<circle cx="24" cy="21" r="13" fill="none" stroke="currentColor" stroke-width="0.9"/>
    <line x1="11" y1="21" x2="37" y2="21" stroke="currentColor" stroke-width="1.3"/>
    <line x1="24" y1="8" x2="24" y2="34" stroke="currentColor" stroke-width="1.3"/>
    <rect x="20" y="17" width="8" height="16" rx="2.5"/>
    <polygon points="21,29 13,32 14,34 21,31"/>
    <polygon points="27,29 35,32 34,34 27,31"/>
    <rect x="22.5" y="33" width="3" height="8" rx="0.5"/>
    <line x1="18.5" y1="40" x2="29.5" y2="40" stroke="currentColor" stroke-width="1.1"/>`,

  mi8: `<circle cx="24" cy="21" r="13" fill="none" stroke="currentColor" stroke-width="0.9"/>
    <line x1="11" y1="21" x2="37" y2="21" stroke="currentColor" stroke-width="1.2"/>
    <line x1="16" y1="12" x2="32" y2="30" stroke="currentColor" stroke-width="1.2"/>
    <line x1="32" y1="12" x2="16" y2="30" stroke="currentColor" stroke-width="1.2"/>
    <rect x="20.5" y="17" width="7" height="17" rx="2"/>
    <ellipse cx="24" cy="17" rx="3.5" ry="3"/>
    <rect x="22.5" y="34" width="3" height="8" rx="0.5"/>
    <line x1="18" y1="41" x2="30" y2="41" stroke="currentColor" stroke-width="1.1"/>`,

  sa342: `<circle cx="24" cy="22" r="10" fill="none" stroke="currentColor" stroke-width="0.9"/>
    <line x1="14" y1="22" x2="34" y2="22" stroke="currentColor" stroke-width="1.1"/>
    <line x1="24" y1="12" x2="24" y2="32" stroke="currentColor" stroke-width="1.1"/>
    <ellipse cx="24" cy="26" rx="2.5" ry="9"/>
    <rect x="23" y="33" width="2" height="7" rx="0.5"/>
    <line x1="20" y1="39" x2="28" y2="39" stroke="currentColor" stroke-width="1"/>`,

  // ══════════════════════════════════════════════════════════
  // VÉHICULES SOL
  // ══════════════════════════════════════════════════════════

  tank_t72: `<rect x="12" y="10" width="24" height="30" rx="2"/>
    <rect x="8" y="9" width="5" height="30" rx="2"/>
    <rect x="35" y="9" width="5" height="30" rx="2"/>
    <rect x="8.5" y="11" width="4" height="3" rx="1"/>
    <rect x="8.5" y="17" width="4" height="3" rx="1"/>
    <rect x="8.5" y="23" width="4" height="3" rx="1"/>
    <rect x="8.5" y="29" width="4" height="3" rx="1"/>
    <rect x="35.5" y="11" width="4" height="3" rx="1"/>
    <rect x="35.5" y="17" width="4" height="3" rx="1"/>
    <rect x="35.5" y="23" width="4" height="3" rx="1"/>
    <rect x="35.5" y="29" width="4" height="3" rx="1"/>
    <circle cx="24" cy="26" r="8"/>
    <rect x="23" y="4" width="2" height="22" rx="0.5"/>`,

  tank_m1: `<polygon points="13,9 35,9 36,38 12,38"/>
    <rect x="8" y="9" width="5" height="29" rx="2"/>
    <rect x="35" y="9" width="5" height="29" rx="2"/>
    <rect x="8.5" y="11" width="4" height="3" rx="1"/>
    <rect x="8.5" y="17" width="4" height="3" rx="1"/>
    <rect x="8.5" y="23" width="4" height="3" rx="1"/>
    <rect x="8.5" y="29" width="4" height="3" rx="1"/>
    <rect x="35.5" y="11" width="4" height="3" rx="1"/>
    <rect x="35.5" y="17" width="4" height="3" rx="1"/>
    <rect x="35.5" y="23" width="4" height="3" rx="1"/>
    <rect x="35.5" y="29" width="4" height="3" rx="1"/>
    <polygon points="16,20 32,20 33,34 15,34"/>
    <rect x="23" y="4" width="2" height="17" rx="0.5"/>`,

  ifv_bmp: `<rect x="13" y="8" width="22" height="32" rx="2"/>
    <rect x="9" y="8" width="4" height="32" rx="2"/>
    <rect x="35" y="8" width="4" height="32" rx="2"/>
    <circle cx="24" cy="22" r="5"/>
    <rect x="23.2" y="12" width="1.6" height="11" rx="0.4"/>
    <rect x="13" y="20" width="4" height="1.5" rx="0.5"/>`,

  ifv_bradley: `<rect x="13" y="9" width="22" height="30" rx="2"/>
    <rect x="9" y="9" width="4" height="30" rx="2"/>
    <rect x="35" y="9" width="4" height="30" rx="2"/>
    <polygon points="17,18 31,18 32,30 16,30"/>
    <rect x="23.2" y="9" width="1.6" height="10" rx="0.4"/>
    <rect x="31" y="21" width="5" height="3" rx="0.5"/>`,

  aaa_zsu: `<rect x="13" y="10" width="22" height="28" rx="2"/>
    <rect x="9" y="10" width="4" height="28" rx="2"/>
    <rect x="35" y="10" width="4" height="28" rx="2"/>
    <rect x="15" y="15" width="18" height="18" rx="1.5"/>
    <circle cx="20" cy="28" r="3"/>
    <rect x="16" y="8" width="1.5" height="9" rx="0.4"/>
    <rect x="19.5" y="8" width="1.5" height="9" rx="0.4"/>
    <rect x="27" y="8" width="1.5" height="9" rx="0.4"/>
    <rect x="30.5" y="8" width="1.5" height="9" rx="0.4"/>`,

  arty_msta: `<rect x="11" y="10" width="26" height="30" rx="2"/>
    <rect x="7" y="10" width="5" height="30" rx="2"/>
    <rect x="36" y="10" width="5" height="30" rx="2"/>
    <rect x="14" y="16" width="20" height="22" rx="1.5"/>
    <rect x="22" y="3" width="4" height="14" rx="0.5"/>
    <rect x="21" y="3" width="6" height="2" rx="0.5"/>`,

  vehicle: `<rect x="16" y="14" width="16" height="22" rx="3"/>
    <rect x="18" y="10" width="12" height="7" rx="2"/>
    <rect x="12" y="18" width="4" height="12" rx="2"/>
    <rect x="32" y="18" width="4" height="12" rx="2"/>`,

  // ══════════════════════════════════════════════════════════
  // SAM / DÉFENSE AÉRIENNE
  // ══════════════════════════════════════════════════════════

  sam_s300: `<rect x="20" y="8" width="8" height="20" rx="1"/>
    <rect x="21" y="6" width="6" height="5" rx="1"/>
    <rect x="19" y="28" width="10" height="14" rx="1"/>
    <rect x="19.5" y="29" width="4" height="11" rx="0.5"/>
    <rect x="24.5" y="29" width="4" height="11" rx="0.5"/>
    <rect x="17" y="10" width="3" height="5" rx="1"/>
    <rect x="28" y="10" width="3" height="5" rx="1"/>`,

  sam_patriot: `<rect x="20" y="5" width="8" height="12" rx="1"/>
    <rect x="18" y="18" width="12" height="24" rx="1"/>
    <circle cx="24" cy="20" r="2"/>
    <rect x="19.5" y="21" width="4" height="10" rx="0.5"/>
    <rect x="24.5" y="21" width="4" height="10" rx="0.5"/>
    <rect x="15" y="32" width="3" height="5" rx="1"/>
    <rect x="30" y="32" width="3" height="5" rx="1"/>`,

  sam_buk: `<rect x="12" y="10" width="24" height="28" rx="2"/>
    <rect x="9" y="11" width="4" height="26" rx="2"/>
    <rect x="35" y="11" width="4" height="26" rx="2"/>
    <rect x="18" y="16" width="5" height="8" rx="0.5"/>
    <rect x="25" y="16" width="5" height="8" rx="0.5"/>
    <rect x="18" y="25" width="5" height="7" rx="0.5"/>
    <rect x="25" y="25" width="5" height="7" rx="0.5"/>
    <rect x="19" y="10" width="10" height="5" rx="1"/>`,

  sam_pantsir: `<rect x="18" y="7" width="12" height="28" rx="1.5"/>
    <rect x="19" y="18" width="10" height="12" rx="1"/>
    <ellipse cx="24" cy="19" rx="4" ry="2"/>
    <rect x="13" y="19" width="5" height="10" rx="0.5"/>
    <rect x="30" y="19" width="5" height="10" rx="0.5"/>
    <rect x="10" y="21" width="3" height="6" rx="0.5"/>
    <rect x="35" y="21" width="3" height="6" rx="0.5"/>`,

  sam_tor: `<rect x="13" y="9" width="22" height="30" rx="2"/>
    <rect x="10" y="10" width="4" height="28" rx="2"/>
    <rect x="34" y="10" width="4" height="28" rx="2"/>
    <rect x="17" y="13" width="14" height="5" rx="0.5"/>
    <rect x="17" y="20" width="6" height="3.5" rx="0.4"/>
    <rect x="25" y="20" width="6" height="3.5" rx="0.4"/>
    <rect x="17" y="25" width="6" height="3.5" rx="0.4"/>
    <rect x="25" y="25" width="6" height="3.5" rx="0.4"/>
    <rect x="17" y="30" width="6" height="3.5" rx="0.4"/>
    <rect x="25" y="30" width="6" height="3.5" rx="0.4"/>`,

  sam_nasams: `<rect x="14" y="10" width="20" height="30" rx="2"/>
    <rect x="16" y="13" width="16" height="24" rx="1"/>
    <rect x="17" y="14" width="6" height="6" rx="0.8"/>
    <rect x="25" y="14" width="6" height="6" rx="0.8"/>
    <rect x="17" y="22" width="6" height="6" rx="0.8"/>
    <rect x="25" y="22" width="6" height="6" rx="0.8"/>
    <rect x="17" y="30" width="6" height="6" rx="0.8"/>
    <rect x="25" y="30" width="6" height="6" rx="0.8"/>`,

  radar_search: `<rect x="10" y="5" width="28" height="10" rx="1"/>
    <line x1="10" y1="8" x2="38" y2="8" stroke="currentColor" stroke-width="0.5"/>
    <line x1="10" y1="10.5" x2="38" y2="10.5" stroke="currentColor" stroke-width="0.5"/>
    <line x1="10" y1="13" x2="38" y2="13" stroke="currentColor" stroke-width="0.5"/>
    <rect x="23" y="15" width="2" height="12" rx="0.5"/>
    <rect x="16" y="27" width="16" height="16" rx="1.5"/>
    <circle cx="24" cy="30" r="3"/>`,

  // ══════════════════════════════════════════════════════════
  // NAVIRES
  // ══════════════════════════════════════════════════════════

  ship_carrier: `<ellipse cx="24" cy="24" rx="10" ry="21"/>
    <rect x="14" y="5" width="20" height="38" rx="2"/>
    <line x1="24" y1="7" x2="24" y2="42" stroke="currentColor" stroke-width="0.6"/>
    <line x1="16" y1="10" x2="24" y2="16" stroke="currentColor" stroke-width="0.8"/>
    <line x1="16" y1="16" x2="24" y2="22" stroke="currentColor" stroke-width="0.8"/>
    <rect x="28" y="18" width="5" height="9" rx="0.5"/>
    <line x1="15" y1="34" x2="33" y2="34" stroke="currentColor" stroke-width="0.6"/>
    <line x1="15" y1="37" x2="33" y2="37" stroke="currentColor" stroke-width="0.6"/>`,

  ship_cruiser: `<ellipse cx="24" cy="24" rx="7" ry="20"/>
    <rect x="19" y="6" width="10" height="36" rx="1"/>
    <rect x="20" y="9" width="8" height="8" rx="0.5"/>
    <circle cx="24" cy="11" r="2.5"/>
    <rect x="23.3" y="7" width="1.4" height="4.5" rx="0.3"/>
    <rect x="21" y="19" width="6" height="6" rx="0.5"/>
    <rect x="21" y="27" width="6" height="6" rx="0.5"/>
    <circle cx="24" cy="36" r="2.5"/>
    <rect x="23.3" y="36" width="1.4" height="4" rx="0.3"/>
    <rect x="17" y="21" width="2" height="6" rx="0.5"/>
    <rect x="29" y="21" width="2" height="6" rx="0.5"/>`,

  ship_destroyer: `<ellipse cx="24" cy="24" rx="5.5" ry="20"/>
    <rect x="20" y="6" width="8" height="36" rx="1"/>
    <circle cx="24" cy="11" r="2.5"/>
    <rect x="23.3" y="7" width="1.4" height="4.5" rx="0.3"/>
    <rect x="21" y="13" width="6" height="5" rx="0.5"/>
    <rect x="21" y="20" width="6" height="5" rx="0.5"/>
    <rect x="21" y="27" width="6" height="4" rx="0.5"/>
    <circle cx="24" cy="36" r="2"/>
    <rect x="23.3" y="36" width="1.4" height="4" rx="0.3"/>
    <rect x="18" y="28" width="2" height="4" rx="0.5"/>
    <rect x="28" y="28" width="2" height="4" rx="0.5"/>`,

  ship_frigate: `<ellipse cx="24" cy="25" rx="5" ry="18"/>
    <rect x="20.5" y="9" width="7" height="32" rx="1"/>
    <circle cx="24" cy="13" r="2"/>
    <rect x="23.3" y="9" width="1.4" height="4.5" rx="0.3"/>
    <rect x="21.5" y="15" width="5" height="7" rx="0.5"/>
    <rect x="21" y="32" width="6" height="6" rx="0.5"/>
    <line x1="24" y1="33.5" x2="24" y2="37" stroke="currentColor" stroke-width="0.6"/>
    <line x1="22" y1="35.5" x2="26" y2="35.5" stroke="currentColor" stroke-width="0.6"/>`,

  // ══════════════════════════════════════════════════════════
  // STATIQUE / GÉNÉRIQUE
  // ══════════════════════════════════════════════════════════

  static_building: `<rect x="14" y="14" width="20" height="20" rx="2"/>
    <line x1="14" y1="14" x2="34" y2="34" stroke="currentColor" stroke-width="0.8"/>
    <line x1="34" y1="14" x2="14" y2="34" stroke="currentColor" stroke-width="0.8"/>`,

  plane_generic: `<polygon points="24,3 26,14 42,20 40,23 26,19 27,35 30,37 30,39 24,38 18,39 18,37 21,35 22,19 8,23 6,20 22,14"/>
    <polygon points="22,36 26,36 25,43 24,45 23,43"/>`,
};

// ── Mapping DCS type → clé shape ──────────────────────────────────────────

export function getDCSShape(unitType: string, category: string): string {
  const t = unitType.toUpperCase();

  // Hélicoptères
  if (category === 'helicopter') {
    if (/AH-64|AH64|AH-1Z/.test(t)) return DCS_SHAPES.ah64;
    if (/KA-50|KA50|KA-52|KA52/.test(t)) return DCS_SHAPES.ka50;
    if (/MI-24|MI24|MI-28|MI28/.test(t)) return DCS_SHAPES.mi24;
    if (/UH-60|UH60|HH-60|MH-60/.test(t)) return DCS_SHAPES.uh60;
    if (/MI-8|MI8|MI-17|MI17/.test(t)) return DCS_SHAPES.mi8;
    if (/SA-?342|GAZELLE/.test(t)) return DCS_SHAPES.sa342;
    return DCS_SHAPES.uh60;
  }

  // Navires
  if (category === 'ship') {
    if (/KUZNETSOV|CVN|NIMITZ|CVF|CARRIER/.test(t)) return DCS_SHAPES.ship_carrier;
    if (/SLAVA|MOSKVA|CRUISER|TICONDEROGA/.test(t)) return DCS_SHAPES.ship_cruiser;
    if (/DESTROYER|DDG|ARLEIGH/.test(t)) return DCS_SHAPES.ship_destroyer;
    return DCS_SHAPES.ship_frigate;
  }

  // Statique
  if (category === 'static') return DCS_SHAPES.static_building;

  // Véhicules sol
  if (category === 'vehicle') {
    if (/T-72|T72|T-80|T80|T-90|T90/.test(t)) return DCS_SHAPES.tank_t72;
    if (/M1[^0-9]|ABRAMS|LEOPARD|CHALLENGER|LECLERC|MERKAVA/.test(t)) return DCS_SHAPES.tank_m1;
    if (/BMP|BTR|MARDER|CV90|WARRIOR|PUMA/.test(t)) return DCS_SHAPES.ifv_bmp;
    if (/BRADLEY|M2[^0-9]|M3[^0-9]/.test(t)) return DCS_SHAPES.ifv_bradley;
    if (/ZSU|SHILKA|GEPARD|M163|VULCAN/.test(t)) return DCS_SHAPES.aaa_zsu;
    if (/MSTA|2S19|2S3|M109|CAESAR|AS90|HOWITZER/.test(t)) return DCS_SHAPES.arty_msta;
    if (/S-300|SA-10|SA-20|PATRIOT|HAWK|NASAMS|SAMP/.test(t)) return DCS_SHAPES.sam_s300;
    if (/BUK|SA-11|SA-17/.test(t)) return DCS_SHAPES.sam_buk;
    if (/PANTSIR|SA-22/.test(t)) return DCS_SHAPES.sam_pantsir;
    if (/TOR|SA-15/.test(t)) return DCS_SHAPES.sam_tor;
    if (/NASAMS/.test(t)) return DCS_SHAPES.sam_nasams;
    return DCS_SHAPES.vehicle;
  }

  // Avions — bombardiers lourds
  if (/B-52|B52/.test(t)) return DCS_SHAPES.b52;
  if (/B-1|B1B/.test(t)) return DCS_SHAPES.b1;
  if (/B-2|B2/.test(t)) return DCS_SHAPES.b2;
  if (/TU-160|TU160/.test(t)) return DCS_SHAPES.tu160;
  if (/TU-95|TU95/.test(t)) return DCS_SHAPES.tu95;
  if (/TU-22|TU22|TU-16|TU16/.test(t)) return DCS_SHAPES.b1;

  // AWACS / EW
  if (/E-3|E3|A-50|KJ-|MAINSTAY|SENTRY/.test(t)) return DCS_SHAPES.e3;
  if (/TU-126|TU126/.test(t)) return DCS_SHAPES.e3;

  // Tanker / Transport
  if (/KC-135|KC135|KC-10|KC10|IL-78|IL78|S-3B/.test(t)) return DCS_SHAPES.kc135;
  if (/C-130|C130|C-17|C17|AN-26|AN26|IL-76|IL76|C-5|A400/.test(t)) return DCS_SHAPES.c130;

  // Attaque sol
  if (/A-10|A10/.test(t)) return DCS_SHAPES.a10;
  if (/SU-25|SU25/.test(t)) return DCS_SHAPES.su25;
  if (/AV-8|AV8|HARRIER/.test(t)) return DCS_SHAPES.av8;

  // Jets russes
  if (/SU-27|SU27/.test(t)) return DCS_SHAPES.su27;
  if (/SU-33|SU33/.test(t)) return DCS_SHAPES.su27;
  if (/SU-34|SU34/.test(t)) return DCS_SHAPES.su34;
  if (/SU-30|SU30/.test(t)) return DCS_SHAPES.su30;
  if (/SU-24|SU24/.test(t)) return DCS_SHAPES.su24;
  if (/MIG-29|MIG29/.test(t)) return DCS_SHAPES.mig29;
  if (/MIG-31|MIG31/.test(t)) return DCS_SHAPES.mig31;
  if (/MIG-21|MIG21/.test(t)) return DCS_SHAPES.mig21;
  if (/MIG-19|MIG19/.test(t)) return DCS_SHAPES.mig19;
  if (/MIG-15|MIG15/.test(t)) return DCS_SHAPES.mig15;

  // Jets OTAN modernes
  if (/F-22|F22/.test(t)) return DCS_SHAPES.f22;
  if (/F-35|F35/.test(t)) return DCS_SHAPES.f35;
  if (/F-15E|F15E/.test(t)) return DCS_SHAPES.f15e;
  if (/F-15|F15/.test(t)) return DCS_SHAPES.f15;
  if (/F-14|F14/.test(t)) return DCS_SHAPES.f14;
  if (/F-16|F16/.test(t)) return DCS_SHAPES.f16;
  if (/F\/A-18|FA-18|FA18|F-18/.test(t)) return DCS_SHAPES.f18;
  if (/F-4|F4/.test(t)) return DCS_SHAPES.f4;
  if (/F-5|F5|F-86|F86/.test(t)) return DCS_SHAPES.f86;
  if (/EUROFIGHTER|TYPHOON/.test(t)) return DCS_SHAPES.eurofighter;
  if (/RAFALE/.test(t)) return DCS_SHAPES.rafale;
  if (/GRIPEN|JAS.?39/.test(t)) return DCS_SHAPES.gripen;
  if (/M-2000|M2000|MIRAGE.?2000/.test(t)) return DCS_SHAPES.m2000;
  if (/MIRAGE.?F1/.test(t)) return DCS_SHAPES.mirage_f1;
  if (/TORNADO/.test(t)) return DCS_SHAPES.tornado;
  if (/VIGGEN|AJS.?37/.test(t)) return DCS_SHAPES.gripen;

  // WWII
  if (/P-51|P51/.test(t)) return DCS_SHAPES.p51;
  if (/P-47|P47/.test(t)) return DCS_SHAPES.p47;
  if (/P-38|P38/.test(t)) return DCS_SHAPES.p38;
  if (/FW.?190|FW190/.test(t)) return DCS_SHAPES.fw190;
  if (/BF.?109|BF109|ME.?109/.test(t)) return DCS_SHAPES.bf109;
  if (/SPITFIRE/.test(t)) return DCS_SHAPES.spitfire;
  if (/CORSAIR|F4U/.test(t)) return DCS_SHAPES.corsair;
  if (/MOSQUITO/.test(t)) return DCS_SHAPES.mosquito;
  if (/A-20|A20|BOSTON|HAVOC/.test(t)) return DCS_SHAPES.a20;

  return DCS_SHAPES.plane_generic;
}
