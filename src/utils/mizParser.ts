import JSZip from 'jszip';
import { parseLuaTable, serializeLuaTable } from './luaParser';
import type { MizFile, DCSMission, DCSWarehouses } from '../types/dcs';

export async function parseMiz(file: File): Promise<MizFile> {
  const zip = await JSZip.loadAsync(file);

  const readLua = async (path: string): Promise<unknown> => {
    const f = zip.file(path);
    if (!f) throw new Error(`File not found in .miz: ${path}`);
    const text = await f.async('string');
    return parseLuaTable(text);
  };

  const missionRaw = await readLua('mission');
  const warehousesRaw = await readLua('warehouses');
  const optionsRaw = await readLua('options');

  const theatreFile = zip.file('theatre');
  const theatre = theatreFile ? (await theatreFile.async('string')).trim() : 'Caucasus';

  let dictionary: Record<string, string> = {};
  const dictFile = zip.file('l10n/DEFAULT/dictionary');
  if (dictFile) {
    const dictRaw = await dictFile.async('string');
    const parsed = parseLuaTable(dictRaw);
    if (parsed && typeof parsed === 'object') dictionary = parsed as Record<string, string>;
  }

  return {
    mission: missionRaw as DCSMission,
    warehouses: warehousesRaw as DCSWarehouses,
    options: optionsRaw as Record<string, unknown>,
    theatre,
    dictionary,
  };
}

export async function buildMiz(miz: MizFile, extraLua?: string): Promise<Blob> {
  const zip = new JSZip();

  zip.file('mission', `mission =\n${serializeLuaTable(miz.mission)}\n`);
  zip.file('warehouses', `warehouses =\n${serializeLuaTable(miz.warehouses)}\n`);
  zip.file('options', `options =\n${serializeLuaTable(miz.options)}\n`);
  zip.file('theatre', miz.theatre);

  if (miz.dictionary) {
    zip.file('l10n/DEFAULT/dictionary', `dictionary =\n${serializeLuaTable(miz.dictionary)}\n`);
    zip.file('l10n/DEFAULT/mapResource', 'mapResource = {}');
  }

  if (extraLua) {
    zip.file('l10n/DEFAULT/mist_init.lua', extraLua);
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
