import type { MistConfig } from '../types/dcs';

/**
 * Génère le code Lua MIST à injecter dans la mission.
 * Appelé lors de l'export .miz.
 */
export function generateMistLua(config: MistConfig): string {
  if (!config.enabled) return '';

  const lines: string[] = [];
  lines.push('-- DCS Mission Forge — Script MIST auto-généré');
  lines.push('-- NE PAS MODIFIER MANUELLEMENT\n');

  // Auto-respawn
  for (const ar of config.autoRespawnGroups) {
    lines.push(`-- Auto-respawn: ${ar.groupName}`);
    lines.push(`mist.scheduleFunction(function()`);
    lines.push(`  mist.respawnGroup('${ar.groupName}', ${ar.retakeTask})`);
    lines.push(`end, {}, ${ar.delay})\n`);
  }

  // Zone respawn
  for (const zr of config.zoneRespawns) {
    lines.push(`-- Respawn dans zone: ${zr.groupName} → ${zr.zoneName}`);
    lines.push(`mist.scheduleFunction(function()`);
    lines.push(`  mist.respawnInZone('${zr.groupName}', {'${zr.zoneName}'})`);
    lines.push(`end, {}, ${zr.delay})\n`);
  }

  // Scheduled functions
  for (const sf of config.scheduledFunctions) {
    lines.push(`-- Fonction planifiée pour: ${sf.groupName}`);
    lines.push(`mist.scheduleFunction(function()`);
    lines.push(`  ${sf.functionCode}`);
    lines.push(`end, {}, ${sf.delay})\n`);
  }

  return lines.join('\n');
}

export const MIST_PRESETS = [
  {
    id: 'cap_auto',
    name: 'CAP Automatique',
    description: 'Un groupe aérien respawn automatiquement après destruction. Parfait pour des CAP permanentes.',
    icon: '✈️',
    defaultDelay: 300,
    generateConfig: (groupName: string, delay: number): Partial<MistConfig> => ({
      autoRespawnGroups: [{ groupName, delay, retakeTask: true }],
    }),
  },
  {
    id: 'convoy_dynamic',
    name: 'Convoi Dynamique',
    description: 'Un convoi de véhicules qui repart sur sa route après destruction. Idéal pour missions d\'interdiction.',
    icon: '🚛',
    defaultDelay: 180,
    generateConfig: (groupName: string, delay: number): Partial<MistConfig> => ({
      autoRespawnGroups: [{ groupName, delay, retakeTask: true }],
    }),
  },
  {
    id: 'zone_respawn',
    name: 'Respawn en Zone',
    description: 'Un groupe réapparaît dans une zone de trigger. Utile pour simulations de renforts.',
    icon: '📍',
    defaultDelay: 60,
    generateConfig: (groupName: string, delay: number, zoneName = 'RespawnZone'): Partial<MistConfig> => ({
      zoneRespawns: [{ groupName, zoneName, delay }],
    }),
  },
  {
    id: 'barcap',
    name: 'BARCAP Tournant',
    description: 'Rotation automatique de groupes CAP, idéal pour campagnes dynamiques.',
    icon: '🔄',
    defaultDelay: 600,
    generateConfig: (groupName: string, delay: number): Partial<MistConfig> => ({
      autoRespawnGroups: [{ groupName, delay, retakeTask: true }],
    }),
  },
  {
    id: 'sead_event',
    name: 'SEAD sur Événement',
    description: 'Mission SEAD déclenchée automatiquement après activation radar ennemi.',
    icon: '🎯',
    defaultDelay: 30,
    generateConfig: (groupName: string, delay: number): Partial<MistConfig> => ({
      scheduledFunctions: [{
        groupName,
        delay,
        functionCode: `mist.goRoute('${groupName}', mist.getGroupRoute('${groupName}', true))`,
      }],
    }),
  },
] as const;
