/**
 * Parser de tables Lua DCS vers objets JavaScript.
 * Gère le format spécifique des fichiers .miz (mission, warehouses, options).
 */

export function parseLuaTable(src: string): unknown {
  const tokens = tokenize(src);
  const parser = new LuaParser(tokens);
  return parser.parseFile();
}

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
    // skip whitespace
    if (/\s/.test(src[i])) { i++; continue; }

    // single-line comment
    if (src[i] === '-' && src[i + 1] === '-' && src[i + 2] !== '[') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }

    // multi-line comment --[[ ... ]]
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
      while (i < src.length && !(src[i] === ']' && src[i + 1] === ']')) {
        str += src[i++];
      }
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
          const esc: Record<string, string> = { n: '\n', t: '\t', r: '\r', '\\': '\\', '"': '"', "'": "'" };
          str += esc[src[i]] ?? src[i];
        } else {
          str += src[i];
        }
        i++;
      }
      i++;
      tokens.push({ type: 'string', value: str });
      continue;
    }

    // number (including negative)
    if (/[0-9]/.test(src[i]) || (src[i] === '-' && /[0-9]/.test(src[i + 1]))) {
      let num = '';
      if (src[i] === '-') num += src[i++];
      while (i < src.length && /[0-9eE.+\-x]/.test(src[i])) {
        num += src[i++];
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }

    // punctuation
    if (src[i] === '{') { tokens.push({ type: 'lbrace' }); i++; continue; }
    if (src[i] === '}') { tokens.push({ type: 'rbrace' }); i++; continue; }
    if (src[i] === '[') { tokens.push({ type: 'lbracket' }); i++; continue; }
    if (src[i] === ']') { tokens.push({ type: 'rbracket' }); i++; continue; }
    if (src[i] === '=') { tokens.push({ type: 'equals' }); i++; continue; }
    if (src[i] === ',') { tokens.push({ type: 'comma' }); i++; continue; }

    // identifier or keyword
    if (/[a-zA-Z_]/.test(src[i])) {
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

class LuaParser {
  private pos = 0;
  private tokens: Token[];
  constructor(tokens: Token[]) { this.tokens = tokens; }

  private peek(): Token { return this.tokens[this.pos]; }
  private consume(): Token { return this.tokens[this.pos++]; }
  private expect(type: Token['type']): Token {
    const t = this.consume();
    if (t.type !== type) throw new Error(`Expected ${type}, got ${t.type} at pos ${this.pos}`);
    return t;
  }

  parseFile(): unknown {
    // Skip top-level assignment: "mission = { ... }" or just "{ ... }"
    const first = this.peek();
    if (first.type === 'ident') {
      const ident = first as { type: 'ident'; value: string };
      this.consume();
      if (this.peek().type === 'equals') {
        this.consume(); // consume '='
        return this.parseValue();
      }
      // Identifier alone — shouldn't happen in DCS files
      return ident.value;
    }
    return this.parseValue();
  }

  private parseValue(): unknown {
    const t = this.peek();

    if (t.type === 'lbrace') return this.parseTable();
    if (t.type === 'number') { this.consume(); return (t as { type: 'number'; value: number }).value; }
    if (t.type === 'string') { this.consume(); return (t as { type: 'string'; value: string }).value; }
    if (t.type === 'bool') { this.consume(); return (t as { type: 'bool'; value: boolean }).value; }
    if (t.type === 'nil') { this.consume(); return null; }
    if (t.type === 'ident') {
      // Could be a function call like "tostring(...)" — skip for DCS
      this.consume();
      return (t as { type: 'ident'; value: string }).value;
    }

    return null;
  }

  private parseTable(): Record<string, unknown> | unknown[] {
    this.expect('lbrace');
    const obj: Record<string, unknown> = {};
    const arr: unknown[] = [];
    let arrayMode = true;
    let arrayIdx = 1;

    while (this.peek().type !== 'rbrace' && this.peek().type !== 'eof') {
      const t = this.peek();

      // [key] = value  or  ["key"] = value
      if (t.type === 'lbracket') {
        this.consume(); // [
        const keyTok = this.consume();
        this.expect('rbracket');
        this.expect('equals');
        const value = this.parseValue();

        let key: string;
        if (keyTok.type === 'string') key = (keyTok as { type: 'string'; value: string }).value;
        else if (keyTok.type === 'number') key = String((keyTok as { type: 'number'; value: number }).value);
        else key = String(keyTok);

        obj[key] = value;
        arrayMode = false;
      }
      // ident = value
      else if (t.type === 'ident' && this.tokens[this.pos + 1]?.type === 'equals') {
        const key = (this.consume() as { type: 'ident'; value: string }).value;
        this.expect('equals');
        obj[key] = this.parseValue();
        arrayMode = false;
      }
      // positional value
      else {
        const value = this.parseValue();
        arr.push(value);
        obj[String(arrayIdx++)] = value;
      }

      // optional trailing comma
      if (this.peek().type === 'comma') this.consume();
    }

    this.expect('rbrace');

    // If all keys are numeric from 1..N, return as array
    if (arrayMode && arr.length > 0) return arr;
    return obj;
  }
}

/** Serialize JS object back to Lua table string */
export function serializeLuaTable(value: unknown, name?: string, indent = 0): string {
  const pad = '  '.repeat(indent);
  const inner = '  '.repeat(indent + 1);

  if (value === null || value === undefined) return `${name ? `${name} = ` : ''}nil`;
  if (typeof value === 'boolean') return `${name ? `${name} = ` : ''}${value}`;
  if (typeof value === 'number') return `${name ? `${name} = ` : ''}${value}`;
  if (typeof value === 'string') {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `${name ? `${name} = ` : ''}"${escaped}"`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return `${name ? `${name} = ` : ''}{}`;
    const items = value.map((v, i) => `${inner}[${i + 1}] = ${serializeLuaTable(v, undefined, indent + 1)},`);
    return `${name ? `${name} = ` : ''}{\n${items.join('\n')}\n${pad}}`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return `${name ? `${name} = ` : ''}{}`;

    const items = entries.map(([k, v]) => {
      const key = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k) ? k : `["${k}"]`;
      return `${inner}${key} = ${serializeLuaTable(v, undefined, indent + 1)},`;
    });
    return `${name ? `${name} = ` : ''}{\n${items.join('\n')}\n${pad}}`;
  }

  return `${name ? `${name} = ` : ''}nil`;
}
