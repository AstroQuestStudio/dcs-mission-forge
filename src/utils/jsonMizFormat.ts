import type { MizFile } from '../types/dcs';

export function exportMizJson(miz: MizFile): Blob {
  const json = JSON.stringify(miz, null, 2);
  return new Blob([json], { type: 'application/json' });
}

export function importMizJson(text: string): MizFile {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !parsed.mission || !parsed.theatre) {
    throw new Error('Format JSON invalide — ce fichier ne semble pas être un export DCS Mission Forge');
  }
  return parsed as MizFile;
}
