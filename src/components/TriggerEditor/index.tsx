import { useMissionStore, extractAllGroups, extractTriggerZones } from '../../store/missionStore';
import type { DCSTrigger, DCSCondition, DCSAction, DCSTriggerZone } from '../../types/dcs';
import { useState, useMemo } from 'react';

const INP = 'w-full bg-slate-800 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500';
const SEL = `${INP} cursor-pointer`;
const LBL = 'text-[10px] text-slate-500 uppercase tracking-wider block mb-1';

const TRIGGER_TYPES: DCSTrigger['triggerType'][] = ['once', 'repetitive', 'switched', 'missionStart', 'noEvent'];
const CONDITION_TYPES: DCSCondition['type'][] = ['time', 'missionStart', 'flag', 'unitDead', 'groupDead', 'unitInZone'];
const ACTION_TYPES: DCSAction['type'][] = ['setFlag', 'message', 'smokeMarker', 'explosion', 'sound', 'stopMission', 'lua'];

const COND_LABELS: Record<string, string> = {
  time: '⏱ Temps écoulé', missionStart: '🚀 Début mission', flag: '🚩 Flag',
  unitDead: '💥 Unité détruite', groupDead: '💀 Groupe détruit', unitInZone: '📍 Unité en zone',
};
const ACT_LABELS: Record<string, string> = {
  setFlag: '🚩 Modifier flag', message: '💬 Message', smokeMarker: '💨 Fumée',
  explosion: '💥 Explosion', sound: '🔊 Son', stopMission: '🛑 Fin mission', lua: '📜 Code Lua',
};

function newTrigger(): DCSTrigger {
  return {
    triggerType: 'once',
    condition: { type: 'time', params: { seconds: 60 } },
    actions: [{ type: 'message', params: { text: '', displayTime: 10, clearView: false } }],
    comment: 'Nouveau trigger',
  };
}

// ── Éditeur de condition ──────────────────────────────────────────────────

function ConditionEditor({
  cond, groupNames, zoneNames,
  onChange,
}: {
  cond: DCSCondition;
  groupNames: string[];
  zoneNames: string[];
  onChange: (c: DCSCondition) => void;
}) {
  const p = (cond.params ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-2">
      <div>
        <label className={LBL}>Type de condition</label>
        <select className={SEL} value={cond.type} onChange={e => onChange({ type: e.target.value as DCSCondition['type'], params: {} })}>
          {CONDITION_TYPES.map(t => <option key={t} value={t}>{COND_LABELS[t] ?? t}</option>)}
        </select>
      </div>

      {cond.type === 'time' && (
        <div>
          <label className={LBL}>Secondes depuis départ</label>
          <input type="number" min={0} className={INP}
            value={(p.seconds as number) ?? 0}
            onChange={e => onChange({ ...cond, params: { seconds: parseInt(e.target.value) || 0 } })} />
        </div>
      )}

      {cond.type === 'flag' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={LBL}>Numéro de flag</label>
            <input type="number" min={1} className={INP}
              value={(p.flag as number) ?? 1}
              onChange={e => onChange({ ...cond, params: { ...p, flag: parseInt(e.target.value) || 1 } })} />
          </div>
          <div>
            <label className={LBL}>Valeur</label>
            <select className={SEL}
              value={String(p.value ?? 'true')}
              onChange={e => onChange({ ...cond, params: { ...p, value: e.target.value === 'true' } })}>
              <option value="true">Activé (true)</option>
              <option value="false">Désactivé (false)</option>
            </select>
          </div>
        </div>
      )}

      {(cond.type === 'unitDead' || cond.type === 'groupDead') && (
        <div>
          <label className={LBL}>{cond.type === 'unitDead' ? 'Nom unité' : 'Groupe'}</label>
          {cond.type === 'groupDead' && groupNames.length > 0 ? (
            <select className={SEL}
              value={(p.groupName as string) ?? ''}
              onChange={e => onChange({ ...cond, params: { groupName: e.target.value } })}>
              <option value="">-- Choisir --</option>
              {groupNames.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          ) : (
            <input className={INP}
              value={(p.unitName as string) ?? ''}
              onChange={e => onChange({ ...cond, params: { unitName: e.target.value } })} />
          )}
        </div>
      )}

      {cond.type === 'unitInZone' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={LBL}>Nom unité</label>
            <input className={INP}
              value={(p.unitName as string) ?? ''}
              onChange={e => onChange({ ...cond, params: { ...p, unitName: e.target.value } })} />
          </div>
          <div>
            <label className={LBL}>Zone trigger</label>
            {zoneNames.length > 0 ? (
              <select className={SEL}
                value={(p.zoneName as string) ?? ''}
                onChange={e => onChange({ ...cond, params: { ...p, zoneName: e.target.value } })}>
                <option value="">-- Choisir --</option>
                {zoneNames.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            ) : (
              <input className={INP}
                value={(p.zoneName as string) ?? ''}
                onChange={e => onChange({ ...cond, params: { ...p, zoneName: e.target.value } })} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Éditeur d'action ──────────────────────────────────────────────────────

function ActionEditor({
  action, idx, onChange, onDelete,
}: {
  action: DCSAction;
  idx: number;
  onChange: (a: DCSAction) => void;
  onDelete: () => void;
}) {
  const p = (action.params ?? {}) as Record<string, unknown>;

  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <select className={`${SEL} flex-1`} value={action.type}
          onChange={e => onChange({ type: e.target.value as DCSAction['type'], params: {} })}>
          {ACTION_TYPES.map(t => <option key={t} value={t}>{ACT_LABELS[t] ?? t}</option>)}
        </select>
        <button onClick={onDelete} className="text-slate-600 hover:text-red-400 flex-shrink-0 text-sm">×</button>
      </div>

      {action.type === 'message' && (
        <>
          <div>
            <label className={LBL}>Texte</label>
            <textarea className={`${INP} h-16 resize-none`}
              value={(p.text as string) ?? ''}
              onChange={e => onChange({ ...action, params: { ...p, text: e.target.value } })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LBL}>Durée (s)</label>
              <input type="number" min={1} className={INP}
                value={(p.displayTime as number) ?? 10}
                onChange={e => onChange({ ...action, params: { ...p, displayTime: parseInt(e.target.value) || 10 } })} />
            </div>
            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input type="checkbox" className="accent-blue-500"
                  checked={!!(p.clearView)}
                  onChange={e => onChange({ ...action, params: { ...p, clearView: e.target.checked } })} />
                Effacer tout
              </label>
            </div>
          </div>
        </>
      )}

      {action.type === 'setFlag' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={LBL}>N° de flag</label>
            <input type="number" min={1} className={INP}
              value={(p.flag as number) ?? 1}
              onChange={e => onChange({ ...action, params: { ...p, flag: parseInt(e.target.value) || 1 } })} />
          </div>
          <div>
            <label className={LBL}>Valeur</label>
            <select className={SEL}
              value={String(p.value ?? 'true')}
              onChange={e => onChange({ ...action, params: { ...p, value: e.target.value === 'true' } })}>
              <option value="true">Activer (true)</option>
              <option value="false">Désactiver (false)</option>
            </select>
          </div>
        </div>
      )}

      {action.type === 'smokeMarker' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={LBL}>Couleur</label>
            <select className={SEL}
              value={(p.color as string) ?? '0'}
              onChange={e => onChange({ ...action, params: { ...p, color: e.target.value } })}>
              {[['0','Vert'],['1','Rouge'],['2','Blanc'],['3','Orange'],['4','Bleu']].map(([v, l]) =>
                <option key={v} value={v}>{l}</option>
              )}
            </select>
          </div>
        </div>
      )}

      {action.type === 'explosion' && (
        <div>
          <label className={LBL}>Puissance</label>
          <input type="number" min={1} max={9999} className={INP}
            value={(p.power as number) ?? 100}
            onChange={e => onChange({ ...action, params: { ...p, power: parseInt(e.target.value) || 100 } })} />
        </div>
      )}

      {action.type === 'lua' && (
        <div>
          <label className={LBL}>Code Lua</label>
          <textarea className={`${INP} h-24 resize-none font-mono`}
            value={(p.statement as string) ?? ''}
            onChange={e => onChange({ ...action, params: { ...p, statement: e.target.value } })} />
        </div>
      )}

      {(action.type === 'stopMission' || action.type === 'sound') && (
        <div className="text-[10px] text-slate-600 italic">
          {action.type === 'stopMission' ? 'Met fin à la mission.' : 'Action son — configurez le fichier son dans DCS ME.'}
        </div>
      )}

      <div className="text-[9px] text-slate-700 font-mono">action #{idx + 1} · {action.type}</div>
    </div>
  );
}

// ── Carte de trigger ──────────────────────────────────────────────────────

function TriggerCard({
  trigger, idx, groupNames, zoneNames,
  onUpdate, onDelete,
}: {
  trigger: DCSTrigger;
  idx: number;
  groupNames: string[];
  zoneNames: string[];
  onUpdate: (t: DCSTrigger) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const addAction = () => {
    onUpdate({ ...trigger, actions: [...trigger.actions, { type: 'message', params: { text: '', displayTime: 10 } }] });
  };

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-800/60 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 flex-shrink-0">
          {trigger.triggerType}
        </span>
        <span className="text-xs text-slate-200 flex-1 truncate">{trigger.comment || `Trigger ${idx + 1}`}</span>
        <span className="text-[10px] text-slate-600">{COND_LABELS[trigger.condition.type] ?? trigger.condition.type}</span>
        <span className="text-slate-600 text-xs ml-1">{expanded ? '▲' : '▼'}</span>
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="text-slate-600 hover:text-red-400 flex-shrink-0 ml-1 text-sm"
        >×</button>
      </button>

      {expanded && (
        <div className="border-t border-slate-700/40 p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LBL}>Type trigger</label>
              <select className={SEL} value={trigger.triggerType}
                onChange={e => onUpdate({ ...trigger, triggerType: e.target.value as DCSTrigger['triggerType'] })}>
                {TRIGGER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={LBL}>Commentaire</label>
              <input className={INP} value={trigger.comment ?? ''} placeholder="ex: Déclencher CAP"
                onChange={e => onUpdate({ ...trigger, comment: e.target.value })} />
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">Condition</div>
            <ConditionEditor
              cond={trigger.condition}
              groupNames={groupNames}
              zoneNames={zoneNames}
              onChange={c => onUpdate({ ...trigger, condition: c })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                Actions ({trigger.actions.length})
              </div>
              <button onClick={addAction}
                className="text-[10px] bg-blue-700 hover:bg-blue-600 text-white px-2 py-0.5 rounded transition-colors">
                + Action
              </button>
            </div>
            <div className="space-y-2">
              {trigger.actions.map((action, ai) => (
                <ActionEditor
                  key={ai}
                  action={action}
                  idx={ai}
                  onChange={a => {
                    const actions = [...trigger.actions];
                    actions[ai] = a;
                    onUpdate({ ...trigger, actions });
                  }}
                  onDelete={() => {
                    const actions = trigger.actions.filter((_, i) => i !== ai);
                    onUpdate({ ...trigger, actions });
                  }}
                />
              ))}
              {trigger.actions.length === 0 && (
                <div className="text-xs text-slate-600 italic py-2 text-center">Aucune action — ajoutez-en une</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Éditeur de zones ──────────────────────────────────────────────────────

function ZoneEditor({
  zone, onUpdate, onDelete,
}: {
  zone: DCSTriggerZone;
  onUpdate: (z: DCSTriggerZone) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-amber-700/30 bg-amber-950/10 overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-amber-950/20 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-2.5 h-2.5 rounded-full border-2 border-amber-400 flex-shrink-0" />
        <span className="text-xs text-slate-200 flex-1 truncate">{zone.name}</span>
        <span className="text-[10px] text-slate-600">r={Math.round(zone.radius)}m</span>
        <span className="text-slate-600 text-xs ml-1">{expanded ? '▲' : '▼'}</span>
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="text-slate-600 hover:text-red-400 text-sm ml-1"
        >×</button>
      </button>

      {expanded && (
        <div className="border-t border-amber-700/20 p-3 space-y-2">
          <div>
            <label className={LBL}>Nom</label>
            <input className={INP} value={zone.name}
              onChange={e => onUpdate({ ...zone, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LBL}>Rayon (m)</label>
              <input type="number" min={100} className={INP}
                value={Math.round(zone.radius)}
                onChange={e => onUpdate({ ...zone, radius: parseInt(e.target.value) || 1000 })} />
            </div>
            <div>
              <label className={LBL}>Type</label>
              <select className={SEL} value={zone.type}
                onChange={e => onUpdate({ ...zone, type: parseInt(e.target.value) })}>
                <option value={0}>Cercle</option>
                <option value={2}>Polygone</option>
              </select>
            </div>
          </div>
          <div className="text-[10px] text-slate-600 font-mono">x={Math.round(zone.x)} y={Math.round(zone.y)}</div>
          <div className="text-[10px] text-slate-700 italic">Pour déplacer la zone, modifiez les coordonnées directement. Le placement visuel sur carte sera ajouté prochainement.</div>
        </div>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────

export default function TriggerEditor() {
  const miz = useMissionStore(s => s.miz);
  const addTrigger = useMissionStore(s => s.addTrigger);
  const updateTrigger = useMissionStore(s => s.updateTrigger);
  const deleteTrigger = useMissionStore(s => s.deleteTrigger);
  const addTriggerZone = useMissionStore(s => s.addTriggerZone);
  const updateTriggerZone = useMissionStore(s => s.updateTriggerZone);
  const deleteTriggerZone = useMissionStore(s => s.deleteTriggerZone);
  const [activeSection, setActiveSection] = useState<'triggers' | 'zones'>('triggers');

  const allGroups = useMemo(() => miz ? extractAllGroups(miz) : [], [miz]);
  const zones = useMemo(() => miz ? extractTriggerZones(miz) : [], [miz]);

  const groupNames = useMemo(() => allGroups.map(e => e.group.name), [allGroups]);
  const zoneNames = useMemo(() => zones.map(z => z.name), [zones]);

  if (!miz) return (
    <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
      Chargez une mission
    </div>
  );

  const triggers: DCSTrigger[] = (() => {
    const raw = miz.mission.trigrules ?? [];
    return Array.isArray(raw) ? raw : Object.values(raw as object);
  })();

  return (
    <div className="flex flex-col h-full">
      {/* Sous-navigation */}
      <div className="flex border-b border-slate-700/60 bg-slate-900 flex-shrink-0">
        {([
          { id: 'triggers', label: `Triggers (${triggers.length})` },
          { id: 'zones',    label: `Zones (${zones.length})` },
        ] as { id: typeof activeSection; label: string }[]).map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex-1 py-2 text-[10px] uppercase tracking-wider border-b-2 transition-colors ${
              activeSection === s.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-600 hover:text-slate-400'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">

        {/* ── Triggers ── */}
        {activeSection === 'triggers' && (
          <>
            <button
              onClick={() => addTrigger(newTrigger())}
              className="w-full bg-blue-700 hover:bg-blue-600 text-white text-xs py-2 rounded-lg font-medium transition-colors"
            >
              + Nouveau trigger
            </button>

            {triggers.map((trig, i) => (
              <TriggerCard
                key={i}
                trigger={trig}
                idx={i}
                groupNames={groupNames}
                zoneNames={zoneNames}
                onUpdate={t => updateTrigger(i, t)}
                onDelete={() => deleteTrigger(i)}
              />
            ))}

            {triggers.length === 0 && (
              <div className="text-center text-slate-600 text-xs py-8">
                Aucun trigger — créez-en un ci-dessus
              </div>
            )}

            <div className="rounded-lg bg-slate-800/50 px-3 py-2 text-[10px] text-slate-600">
              💡 Les triggers sont exportés dans le fichier .miz et lus directement par DCS.
            </div>
          </>
        )}

        {/* ── Zones ── */}
        {activeSection === 'zones' && (
          <>
            <button
              onClick={() => addTriggerZone({ name: `Zone ${zones.length + 1}`, type: 0, x: 0, y: 0, radius: 1000 })}
              className="w-full bg-amber-700 hover:bg-amber-600 text-white text-xs py-2 rounded-lg font-medium transition-colors"
            >
              + Nouvelle zone trigger
            </button>

            {zones.map((zone, i) => (
              <ZoneEditor
                key={i}
                zone={zone}
                onUpdate={z => updateTriggerZone(i, z)}
                onDelete={() => deleteTriggerZone(i)}
              />
            ))}

            {zones.length === 0 && (
              <div className="text-center text-slate-600 text-xs py-8">
                Aucune zone trigger dans cette mission
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
