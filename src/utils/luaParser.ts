/**
 * Parser de tables Lua DCS → objets JavaScript.
 * Tables numériques [1]=,[2]= → arrays JS.
 * Tables mixtes (clés string + number) → objet JS.
 */

type Token =
  | { type: 'lbrace' }
  | { type: 'rbrace' }
  | { type: 'lbracket' }
  | { type: 'rbracket' }
  | { type: 'equals' }
  | { type: 'comma' }
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'bool'; value: boolean }
  | { type: 'nil' }
  | { type: 'ident'; value: string }
  | { type: 'eof' };

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < src.length) {
    // whitespace
    if (src[i] <= ' ') { i++; continue; }

    // single-line comment
    if (src[i] === '-' && src[i + 1] === '-' && src[i + 2] !== '[') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }

    // long comment --[[ ... ]]
    if (src[i] === '-' && src[i + 1] === '-' && src[i + 2] === '[' && src[i + 3] === '[') {
      i += 4;
      while (i < src.length && !(src[i] === ']' && src[i + 1] === ']')) i++;
      i += 2;
      continue;
    }

    // long string [[ ... ]]
    if (src[i] === '[' && src[i + 1] === '[') {
      i += 2;
      let str = '';
      while (i < src.length && !(src[i] === ']' && src[i + 1] === ']')) str += src[i++];
      i += 2;
      tokens.push({ type: 'string', value: str });
      continue;
    }

    // quoted string
    if (src[i] === '"' || src[i] === "'") {
      const q = src[i++];
      let str = '';
      while (i < src.length && src[i] !== q) {
        if (src[i] === '\\') {
          i++;
          const c = src[i] ?? '';
          str += c === 'n' ? '\n' : c === 't' ? '\t' : c === 'r' ? '\r' : c;
        } else {
          str += src[i];
        }
        i++;
      }
      if (i < src.length) i++; // closing quote
      tokens.push({ type: 'string', value: str });
      continue;
    }

    // negative number: only if not a comment start
    if (src[i] === '-' && /[0-9]/.test(src[i + 1] ?? '')) {
      let num = '-';
      i++;
      while (i < src.length && /[0-9eE.]/.test(src[i])) num += src[i++];
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }

    // positive number
    if (/[0-9]/.test(src[i])) {
      let num = '';
      while (i < src.length && /[0-9eE.x]/.test(src[i])) num += src[i++];
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }

    // punctuation
    const ch = src[i];
    if (ch === '{') { tokens.push({ type: 'lbrace' }); i++; continue; }
    if (ch === '}') { tokens.push({ type: 'rbrace' }); i++; continue; }
    if (ch === '[') { tokens.push({ type: 'lbracket' }); i++; continue; }
    if (ch === ']') { tokens.push({ type: 'rbracket' }); i++; continue; }
    if (ch === '=') { tokens.push({ type: 'equals' }); i++; continue; }
    if (ch === ',') { tokens.push({ type: 'comma' }); i++; continue; }

    // identifier / keyword
    if (/[a-zA-Z_]/.test(ch)) {
      let ident = '';
      while (i < src.length && /[a-zA-Z0-9_]/.test(src[i])) ident += src[i++];
      if (ident === 'true') tokens.push({ type: 'bool', value: true });
      else if (ident === 'false') tokens.push({ type: 'bool', value: false });
      else if (ident === 'nil') tokens.push({ type: 'nil' });
      else tokens.push({ type: 'ident', value: ident });
      continue;
    }

    i++; // skip unknown char
  }

  tokens.push({ type: 'eof' });
  return tokens;
}

function parseTokens(tokens: Token[]): unknown {
  let pos = 0;

  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];
  const expect = (type: string) => {
    const t = consume();
    if (t.type !== type) throw new Error(`Expected ${type} got ${t.type} at pos ${pos}`);
    return t;
  };

  function parseValue(): unknown {
    const t = peek();
    if (t.type === 'lbrace') return parseTable();
    if (t.type === 'number') { consume(); return (t as { type: 'number'; value: number }).value; }
    if (t.type === 'string') { consume(); return (t as { type: 'string'; value: string }).value; }
    if (t.type === 'bool') { consume(); return (t as { type: 'bool'; value: boolean }).value; }
    if (t.type === 'nil') { consume(); return null; }
    if (t.type === 'ident') { consume(); return (t as { type: 'ident'; value: string }).value; }
    return null;
  }

  function parseTable(): unknown[] | Record<string, unknown> {
    expect('lbrace');

    // numericEntries: clés numériques [1]=, [2]= ...
    const numericEntries: Record<number, unknown> = {};
    // stringEntries: clés string ["foo"]= ou ident=
    const stringEntries: Record<string, unknown> = {};
    let hasStringKeys = false;

    while (peek().type !== 'rbrace' && peek().type !== 'eof') {
      const t = peek();

      if (t.type === 'lbracket') {
        // [key] = value
        consume(); // [
        const keyTok = consume();
        expect('rbracket');
        expect('equals');
        const value = parseValue();

        if (keyTok.type === 'number') {
          const n = (keyTok as { type: 'number'; value: number }).value;
          numericEntries[n] = value;
        } else {
          const k = keyTok.type === 'string'
            ? (keyTok as { type: 'string'; value: string }).value
            : String((keyTok as { type: 'ident'; value: string }).value);
          stringEntries[k] = value;
          hasStringKeys = true;
        }
      } else if (t.type === 'ident' && tokens[pos + 1]?.type === 'equals') {
        // ident = value
        const key = (consume() as { type: 'ident'; value: string }).value;
        expect('equals');
        stringEntries[key] = parseValue();
        hasStringKeys = true;
      } else {
        // positional (sans clé)
        const value = parseValue();
        const nextIdx = Object.keys(numericEntries).length + 1;
        numericEntries[nextIdx] = value;
      }

      if (peek().type === 'comma') consume();
    }

    expect('rbrace');

    const numKeys = Object.keys(numericEntries).map(Number).sort((a, b) => a - b);

    if (numKeys.length > 0 && !hasStringKeys) {
      // Table purement numérique → array (index 0-based)
      return numKeys.map(k => numericEntries[k]);
    }

    // Table mixte ou purement string → objet
    const result: Record<string, unknown> = { ...stringEntries };
    numKeys.forEach(k => { result[String(k)] = numericEntries[k]; });
    return result;
  }

  // Top-level: "name = { ... }" ou directement "{ ... }"
  const first = peek();
  if (first.type === 'ident') {
    const name = (consume() as { type: 'ident'; value: string }).value;
    if (peek().type === 'equals') {
      consume();
      return parseValue();
    }
    return name;
  }
  return parseValue();
}

export function parseLuaTable(src: string): unknown {
  const tokens = tokenize(src);
  return parseTokens(tokens);
}

/** Serialize JS → Lua table string */
export function serializeLuaTable(value: unknown, indent = 0): string {
  const pad = '\t'.repeat(indent);
  const inner = '\t'.repeat(indent + 1);

  if (value === null || value === undefined) return 'nil';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '{}';
    const items = value.map((v, i) => `${inner}[${i + 1}] = ${serializeLuaTable(v, indent + 1)},`);
    return `{\n${items.join('\n')}\n${pad}}`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const items = entries.map(([k, v]) => {
      const key = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k) ? k : `["${k}"]`;
      return `${inner}${key} = ${serializeLuaTable(v, indent + 1)},`;
    });
    return `{\n${items.join('\n')}\n${pad}}`;
  }

  return 'nil';
}
