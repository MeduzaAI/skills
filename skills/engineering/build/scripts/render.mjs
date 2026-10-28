#!/usr/bin/env node
// Renders a checkpoint.yaml (fields: ../assets/checkpoint.example.yaml) into
// the checkpoint page ../assets/checkpoint.html, written next to the YAML.
// Node 18+, no dependencies.
//   node render.mjs checkpoint.yaml [-o <out>]
// Preview with the full sample: node render.mjs ../assets/checkpoint.demo.yaml -o /tmp/checkpoint.html

// ==== shared: YAML subset parser, validator, page injection, CLI ============
// Byte-identical in the plan, build and retro skills' scripts/render.mjs.
// Change one, change all three: each skill stays self-contained, so none
// imports another's copy.
//
// The parser reads the YAML these skills' data files use: block mappings and
// sequences (`- key: v` items too), plain, 'single' and "double" quoted
// scalars (over several lines too), null, booleans, numbers, # comments,
// block scalars | |- |+ > >- >+ (an indentation indicator like |2 too), and
// flow sequences of scalars [a, "b, c"]. Anything else (anchors, aliases,
// tags, flow mappings, complex keys, directives, several documents) is an
// error naming its line. One leniency over YAML: a block scalar is indented
// by its least-indented line, so a diff may open with an unchanged " line".

import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export class YamlError extends Error {
  constructor(line, msg) { super(`line ${line}: ${msg}`); this.line = line; this.reason = msg; }
}
// Every parsed mapping and list carries [POS] = { line, keys: { key or index: line } }.
export const POS = Symbol('yaml.pos');
const setPos = (o, line, keys) => Object.defineProperty(o, POS, { value: { line, keys } });
const setKey = (o, k, v) => Object.defineProperty(o, k, { value: v, enumerable: true, writable: true, configurable: true });

const isBlank = t => /^\s*(#.*)?$/.test(t);
const isItem = t => t === '-' || t.startsWith('- ');
const cutComment = t => { const m = t.match(/(^|\s)#/); return (m ? t.slice(0, m.index) : t).trimEnd(); };

function resolve(s) {
  if (/^(null|Null|NULL|~)?$/.test(s)) return null;
  if (/^(true|True|TRUE)$/.test(s)) return true;
  if (/^(false|False|FALSE)$/.test(s)) return false;
  let n;
  if (/^[-+]?\d+$/.test(s)) n = Number(s);
  else if (/^0x[0-9a-fA-F]+$/.test(s)) n = parseInt(s.slice(2), 16);
  else if (/^0o[0-7]+$/.test(s)) n = parseInt(s.slice(2), 8);
  else if (/^[-+]?(\.\d+|\d+(\.\d*)?)([eE][-+]?\d+)?$/.test(s)) return Number(s);
  else if (/^[-+]?\.(inf|Inf|INF)$/.test(s)) return s[0] === '-' ? -Infinity : Infinity;
  else if (/^\.(nan|NaN|NAN)$/.test(s)) return NaN;
  else return s;
  return Number.isSafeInteger(n) ? n : s;
}

// A quoted scalar at the start of s: { value, end } or null while unterminated.
function scanQuoted(s, line) {
  const q = s[0]; let out = '', j = 1;
  while (j < s.length) {
    const c = s[j];
    if (c === q) {
      if (q === "'" && s[j + 1] === "'") { out += "'"; j += 2; continue; }
      return { value: out, end: j + 1 };
    }
    if (c === '\n') {               // a line break inside quotes folds: one space, or \n per empty line
      out = out.replace(/[ \t]+$/, ''); let breaks = 0; j++;
      for (;;) { while (s[j] === ' ' || s[j] === '\t') j++; if (s[j] === '\n') { breaks++; j++; } else break; }
      out += breaks ? '\n'.repeat(breaks) : ' '; continue;
    }
    if (c === '\\' && q === '"') {
      if (j + 1 >= s.length) return null;
      const e = s[j + 1];
      if (e === '\n') { j += 2; while (s[j] === ' ' || s[j] === '\t') j++; continue; }
      const ESC = { 0: '\0', a: '\x07', b: '\b', t: '\t', '\t': '\t', n: '\n', v: '\v', f: '\f', r: '\r', e: '\x1b', ' ': ' ',
        '"': '"', '/': '/', '\\': '\\', N: '\x85', _: '\xa0', L: '\u2028', P: '\u2029' };
      if (Object.hasOwn(ESC, e)) { out += ESC[e]; j += 2; continue; }
      const len = { x: 2, u: 4, U: 8 }[e], h = len && s.slice(j + 2, j + 2 + len);
      if (!len || !/^[0-9a-fA-F]+$/.test(h) || h.length !== len) throw new YamlError(line, `unknown escape \\${e} in a "double-quoted" value`);
      out += String.fromCodePoint(parseInt(h, 16)); j += 2 + len; continue;
    }
    out += c; j++;
  }
  return null;
}

export function parseYaml(src) {
  const L = String(src).replace(/^﻿/, '').split(/\r?\n/).map((text, k) => ({ n: k + 1, text, ind: text.match(/^ */)[0].length }));
  let i = 0;
  const fail = (n, m) => { throw new YamlError(n, m); };
  const QUOTE = ' (quote the value, or write it as a block scalar with |)';

  function next() {                       // the next line that holds content, without consuming it
    while (i < L.length && isBlank(L[i].text)) i++;
    const l = L[i];
    if (l) {
      if (/^ *\t/.test(l.text)) fail(l.n, 'tab in indentation; indent with spaces');
      if (l.ind === 0 && /^(---|\.\.\.)(\s|$)/.test(l.text)) fail(l.n, 'several documents in one file are not supported');
      if (l.ind === 0 && l.text[0] === '%') fail(l.n, 'directives (%) are not supported');
    }
    return l;
  }
  function keyOf(l) {                     // "key: rest" → { key, rest }, else null
    const t = l.text.slice(l.ind);
    if (/^\?(\s|$)/.test(t)) fail(l.n, 'complex keys (?) are not supported');
    if (t[0] === '"' || t[0] === "'") {
      const q = scanQuoted(t, l.n); if (!q) return null;
      const m = t.slice(q.end).match(/^[ \t]*:(?=\s|$)/);
      return m ? { key: q.value, rest: t.slice(q.end + m[0].length) } : null;
    }
    if (/^[[\]{},#&*!|>%@`]/.test(t) || isItem(t)) return null;
    const m = t.match(/^(.*?)[ \t]*:(?=\s|$)/);
    if (!m || /(^|\s)#/.test(m[1])) return null;
    return { key: m[1], rest: t.slice(m[0].length) };
  }
  function node(parent) {                 // the node on the next content line, indented past parent
    const l = next(), t = l.text.slice(l.ind);
    if (isItem(t)) return seq(l.ind);
    if (keyOf(l)) return map(l.ind);
    i++; return value(t, l, parent, false);
  }
  function map(ind) {
    const o = {}, keys = {}; setPos(o, next().n, keys);
    for (let l; (l = next()) && l.ind === ind;) {
      const k = keyOf(l);
      if (!k) fail(l.n, isItem(l.text.slice(ind)) ? 'a list item where "key: value" was expected' : `expected "key: value"${QUOTE}`);
      if (Object.hasOwn(o, k.key)) fail(l.n, `duplicate key "${k.key}"`);
      i++; keys[k.key] = l.n;
      setKey(o, k.key, value(k.rest, l, ind, true));
    }
    const l = next(); if (l && l.ind > ind) fail(l.n, 'unexpected indentation');
    return o;
  }
  function seq(ind) {
    const a = [], keys = {}; setPos(a, next().n, keys);
    for (let l; (l = next()) && l.ind === ind && isItem(l.text.slice(ind));) {
      keys[a.length] = l.n;
      const t = l.text.slice(ind), k = 1 + t.slice(1).match(/^ */)[0].length, body = t.slice(k);
      if (isBlank(body)) { i++; const nl = next(); a.push(nl && nl.ind > ind ? node(ind) : null); continue; }
      const virtual = { n: l.n, ind: ind + k, text: ' '.repeat(ind + k) + body };
      if (isItem(body) || keyOf(virtual)) { L[i] = virtual; a.push(node(ind)); continue; }   // "- key: v" or "- - v"
      i++; a.push(value(body, l, ind, false));
    }
    const l = next(); if (l && l.ind > ind) fail(l.n, 'unexpected indentation');
    return a;
  }
  // What follows "key:" or "- " on line l; parent is the indentation the node must exceed.
  function value(rest, l, parent, inMap) {
    const t = rest.trim();
    if (isBlank(t)) {
      const nl = next();
      if (nl && nl.ind > parent) return node(parent);
      if (nl && inMap && nl.ind === parent && isItem(nl.text.slice(parent))) return seq(parent);
      return null;
    }
    const c = t[0];
    if (c === '|' || c === '>') return block(t, l, parent);
    if (c === '[') return flow(t, l, parent);
    if (c === '"' || c === "'") return quoted(t, l);
    if (c === '{') fail(l.n, 'flow mappings {…} are not supported; use indented "key: value" lines' + (inMap ? QUOTE : ''));
    if (c === '&' || c === '*') fail(l.n, 'anchors and aliases (& *) are not supported');
    if (c === '!') fail(l.n, 'tags (!) are not supported');
    if (isItem(t)) fail(l.n, 'a list cannot start on the line of its key; put "- " items on the next lines');
    if ('@`%,]}?'.includes(c) && !(c === '?' && t[1] && !/\s/.test(t[1]))) fail(l.n, `a plain value cannot start with ${c}${QUOTE}`);
    return plain(t, l, parent);
  }
  function plain(t, l, parent) {
    const first = cutComment(t), commented = first !== t.trimEnd();
    if (/:(\s|$)/.test(first)) fail(l.n, `": " inside a plain value${QUOTE}`);
    const parts = [first];
    while (!commented && i < L.length) {   // continuation lines, folded with spaces
      let j = i, empties = 0;
      while (j < L.length && /^\s*$/.test(L[j].text)) { j++; empties++; }
      const nl = L[j];
      if (!nl || nl.ind <= parent || nl.text.trim()[0] === '#') break;
      const tt = cutComment(nl.text.trim());
      if (/:(\s|$)/.test(tt) || isItem(tt)) fail(nl.n, `this line continues the value above but reads like a new entry; indent less, or quote the value`);
      parts.push(empties ? '\n'.repeat(empties) + tt : ' ' + tt); i = j + 1;
      if (tt !== nl.text.trim()) break;
    }
    return parts.length > 1 ? parts.join('') : resolve(first);
  }
  function quoted(t, l) {
    let buf = t, r = scanQuoted(buf, l.n);
    while (!r) {
      if (i >= L.length) fail(l.n, 'unterminated quoted value');
      buf += '\n' + L[i++].text; r = scanQuoted(buf, l.n);
    }
    const after = buf.slice(r.end);
    if (!isBlank(after.split('\n')[0])) fail(l.n + buf.slice(0, r.end).split('\n').length - 1, 'unexpected text after the closing quote');
    return r.value;
  }
  function flow(t, l, parent) {
    let buf = t;
    for (;;) {
      const a = [];
      let j = 1, done = false;
      for (;;) {
        while (/\s/.test(buf[j] || '')) j++;
        if (j >= buf.length) break;
        if (buf[j] === ']') { done = true; j++; break; }
        if (buf[j] === '[' || buf[j] === '{') fail(l.n, 'nested [ ] or { } inside a flow list is not supported; use an indented list');
        if (buf[j] === '"' || buf[j] === "'") {
          const q = scanQuoted(buf.slice(j), l.n); if (!q) break;
          a.push(q.value); j += q.end;
        } else {
          const m = buf.slice(j).match(/^[^,\]\[{}]*/)[0], s = m.trim();
          if (!s) fail(l.n, 'empty item in a flow list');
          if (/^[#&*!|>%@`]/.test(s)) fail(l.n, `a list item cannot start with ${s[0]}; quote it`);
          a.push(resolve(s)); j += m.length;
          if (j >= buf.length) break;
        }
        while (/\s/.test(buf[j] || '')) j++;
        if (buf[j] === ',') { j++; continue; }
        if (buf[j] === ']') { done = true; j++; break; }
        if (j < buf.length) fail(l.n, `unexpected "${buf[j]}" in a flow list`);
      }
      if (done) {
        if (!isBlank(buf.slice(j))) fail(l.n, 'unexpected text after ]');
        return a;
      }
      const nl = L[i];
      if (!nl || (nl.ind <= parent && !/^\s*$/.test(nl.text))) fail(l.n, 'unterminated flow list: missing ]');
      buf += ' ' + nl.text.trim(); i++;
    }
  }
  function block(t, l, parent) {
    const m = t.match(/^([|>])(?:([1-9])([+-]?)|([+-])([1-9]?))?(\s+#.*|\s*)$/);
    if (!m) fail(l.n, `bad block scalar header "${t}"; use | or |- (or > to fold lines)`);
    const fold = m[1] === '>', chomp = m[3] || m[4] || '', explicit = Number(m[2] || m[5] || 0);
    const body = [];
    while (i < L.length && (/^\s*$/.test(L[i].text) || L[i].ind > parent)) body.push(L[i++]);
    const content = body.filter(x => !/^\s*$/.test(x.text));
    const ci = explicit ? parent + explicit : Math.min(...content.map(x => x.ind));
    for (const x of content) if (x.ind < ci) fail(x.n, `less indented than the block scalar's indicator (${explicit})`);
    const lines = body.map(x => /^\s*$/.test(x.text) ? '' : x.text.slice(ci));
    let trail = 0; while (lines.length && lines.at(-1) === '') { lines.pop(); trail++; }
    let text;
    if (!fold) text = lines.join('\n');
    else {
      text = ''; let prev = null;
      for (const s of lines) {
        const kind = s === '' ? 'blank' : /^[ \t]/.test(s) ? 'more' : 'text';
        if (kind === 'blank') text += '\n';
        else if (kind === 'more') text += (prev && prev !== 'blank' ? '\n' : '') + s;
        else text += (prev === 'text' ? ' ' : prev === 'more' ? '\n' : '') + s;
        prev = kind;
      }
    }
    if (!lines.length) return chomp === '+' ? '\n'.repeat(trail) : '';
    return chomp === '-' ? text : chomp === '+' ? text + '\n' + '\n'.repeat(trail) : text + '\n';
  }

  while (i < L.length && isBlank(L[i].text)) i++;
  if (L[i] && /^---(\s|$)/.test(L[i].text)) {   // one leading document marker is fine
    if (!isBlank(L[i].text.slice(3))) fail(L[i].n, 'content on the --- line is not supported');
    i++;
  }
  let l = next();
  if (!l) return null;
  const root = node(-1);
  l = next(); if (l) fail(l.n, 'unexpected content; check the indentation of this line and the one above');
  return root;
}

// ---- validation against a small schema ----
// A spec is a type name ('str', 'num', 'id' text or number, 'bool', 'any',
// 'lines' text or list → list of lines, 'text' text or list → one text),
// '=a|b' for one of those words, { field: spec } for a mapping ({ '*': spec }
// for any keys), [spec] for a list. A trailing '?' on a name, or opt(spec),
// makes it optional; optional also accepts null.
const OPT = Symbol('optional');
export const opt = s => ({ [OPT]: s });
export const lineOf = (o, k) => o?.[POS]?.keys[k] ?? o?.[POS]?.line ?? 1;
const kindOf = v => v === null || v === undefined ? 'nothing' : Array.isArray(v) ? 'a list' : typeof v === 'object' ? 'a mapping'
  : typeof v === 'string' ? 'text' : typeof v === 'number' ? 'a number' : 'true/false';
const toLines = v => typeof v === 'string' ? v.replace(/\n$/, '').split('\n') : v.map(String);

export function validate(root, spec) {
  const errs = [], add = (line, path, msg) => errs.push({ line, path, msg });
  const join = (p, k) => typeof k === 'number' ? `${p}[${k}]` : p ? `${p}.${k}` : k;
  function walk(parent, key, path, spec) {
    let v = parent[key], optional = false;
    if (spec && spec[OPT]) { optional = true; spec = spec[OPT]; }
    if (typeof spec === 'string' && spec.endsWith('?')) { optional = true; spec = spec.slice(0, -1); }
    if (v === undefined || v === null) {
      if (!optional) add(lineOf(parent, v === undefined ? undefined : key), path, v === undefined ? 'missing' : 'is empty');
      return;
    }
    const at = lineOf(parent, key);
    const bad = want => add(at, path, `expected ${want}, got ${kindOf(v)}` +
      (kindOf(v) === 'a mapping' && /text/.test(want) ? ' (a plain value with ": " in it reads as a mapping; quote it)' : ''));
    if (Array.isArray(spec)) {
      if (!Array.isArray(v)) return bad('a list');
      v.forEach((_, k) => walk(v, k, join(path, k), spec[0]));
    } else if (typeof spec === 'object') {
      if (kindOf(v) !== 'a mapping') return bad('a mapping');
      const any = spec['*'];
      for (const k of Object.keys(v)) {
        if (any) walk(v, k, join(path, k), any);
        else if (!Object.hasOwn(spec, k)) add(lineOf(v, k), join(path, k), `unknown field; expected one of: ${Object.keys(spec).join(', ')}`);
      }
      if (!any) for (const k of Object.keys(spec)) walk(v, k, join(path, k), spec[k]);
    } else if (spec[0] === '=') {
      const ok = spec.slice(1).split('|');
      if (!ok.includes(String(v))) add(at, path, `expected one of: ${ok.join(', ')}; got "${v}"`);
    } else if (spec === 'str') {
      if (typeof v === 'string') parent[key] = v.replace(/\n$/, '');
      else if (typeof v === 'number' || typeof v === 'boolean') parent[key] = String(v);
      else bad('text');
    } else if (spec === 'lines' || spec === 'text') {
      const ok = typeof v === 'string' || (Array.isArray(v) && v.every(x => ['string', 'number', 'boolean'].includes(typeof x)));
      if (!ok) return bad('text or a list of lines');
      parent[key] = spec === 'lines' ? toLines(v) : toLines(v).join('\n');
    } else if (spec === 'num') { if (typeof v !== 'number') bad('a number'); }
    else if (spec === 'id') { if (typeof v !== 'string' && typeof v !== 'number') bad('text or a number'); }
    else if (spec === 'bool') { if (typeof v !== 'boolean') bad('true or false'); }
  }
  walk({ root }, 'root', '', spec);
  return errs;
}

// ---- Markdown helpers ----
export const fence = (lines, lang = '') => {
  const body = [].concat(lines).join('\n'), tick = '`'.repeat(Math.max(3, ...(body.match(/`{3,}/g) || []).map(s => s.length + 1)));
  return `${tick}${lang}\n${body}\n${tick}`;
};
export const cell = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n+/g, '<br>');
export const link = (text, url) => url && url !== '#' ? `[${text}](${url})` : text;

// ---- page: the data goes in place of the template's one DATA marker ----
export const MARK = '/*DATA*/null/*/DATA*/';
export function inject(template, data) {
  const parts = template.split(MARK);
  if (parts.length !== 2) throw new Error(`the template must hold the DATA marker exactly once, found ${parts.length - 1}`);
  const json = JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return parts[0] + json + parts[1];
}

// Parse and check a data file's text: { data, errors: [{ line, path, msg }] }.
export function load(src, skill) {
  let data;
  try { data = parseYaml(src); } catch (e) {
    if (e instanceof YamlError) return { data: null, errors: [{ line: e.line, path: '', msg: e.reason }] };
    throw e;
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { data, errors: [{ line: 1, path: '', msg: 'expected a mapping of fields at the top level' }] };
  const errors = validate(data, skill.schema);
  if (!errors.length) skill.check(data, (line, path, msg) => errors.push({ line, path, msg }));
  return { data, errors: errors.sort((a, b) => a.line - b.line) };
}

export function run(argv, skill) {
  const usage = `usage: node render.mjs <${skill.name}.yaml>${skill.markdown ? ' [--md]' : ''} [-o <out>]`;
  let file, md = false, out;
  for (let k = 0; k < argv.length; k++) {
    const a = argv[k];
    if (a === '--md') md = true;
    else if (a === '-o' || a === '--out') out = argv[++k];
    else if (a === '-h' || a === '--help') { console.log(usage); return 0; }
    else if (!file && !a.startsWith('-')) file = a;
    else { console.error(`unknown argument ${a}\n${usage}`); return 2; }
  }
  if (!file || (out === undefined && argv.includes('-o'))) { console.error(usage); return 2; }
  if (md && !skill.markdown) { console.error(`${skill.name} has no Markdown view\n${usage}`); return 2; }
  let src;
  try { src = readFileSync(file, 'utf8'); } catch (e) { console.error(`cannot read ${file}: ${e.message}`); return 1; }
  const { data, errors } = load(src, skill);
  if (errors.length) {
    for (const e of errors) console.error(`${file}:${e.line}: ${e.path ? e.path + ': ' : ''}${e.msg}`);
    console.error(`${errors.length} problem${errors.length > 1 ? 's' : ''}; the fields are described in assets/${skill.name}.example.yaml`);
    return 1;
  }
  if (md) {
    const text = skill.markdown(data);
    if (!out) { process.stdout.write(text); return 0; }
    writeFileSync(out, text); console.log(realpathSync(out)); return 0;
  }
  const dest = out || file.replace(/\.ya?ml$/i, '') + '.html';
  writeFileSync(dest, inject(readFileSync(skill.template, 'utf8'), data));
  console.log(realpathSync(dest));
  return 0;
}

export function isMain(url) {
  try { return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(url)); } catch { return false; }
}
// ==== end of the shared section ==============================================

// ---- checkpoint ----
const SHAPE = { files: 'lines?', calls: 'lines?' };
const SCHEMA = {
  id: 'str', title: 'str', issue: { ref: 'str', url: 'str?' }, checkpoint: { stack: 'id' },
  stacks: [{ id: 'id', repo: 'str' }],
  slices: [{ n: 'num', stack: 'id', title: 'str', state: '=checkpoint|blocked|built|waiting',
    status: '=Done|Unproved|Failed|Blocked?', pr: opt({ num: 'id', url: 'str' }),
    planned: SHAPE, built: opt(SHAPE),
    decisions: opt([{ id: 'str', text: 'str', why: 'str', explains: opt(['str']) }]),
    flows: opt([{ name: 'str', state: '=proved|broken|unwalkable', evidence: opt({ label: 'str', url: 'str' }),
      headline: 'str?', why: 'str?', expected: 'str?', actual: 'str?' }]),
    question: opt({ text: 'str', why: 'str?', phase: 'str?', options: ['str'] }) }],
};

function check(d, err) {
  const stacks = new Set(d.stacks.map(k => String(k.id))), ns = new Set(), decs = new Set();
  if (!stacks.has(String(d.checkpoint.stack))) err(lineOf(d.checkpoint, 'stack'), 'checkpoint.stack', `no stack has id "${d.checkpoint.stack}"`);
  d.slices.forEach((s, a) => {
    const at = `slices[${a}]`;
    if (ns.has(s.n)) err(lineOf(s, 'n'), `${at}.n`, `duplicate n ${s.n}`); ns.add(s.n);
    if (!stacks.has(String(s.stack))) err(lineOf(s, 'stack'), `${at}.stack`, `no stack has id "${s.stack}"`);
    if (s.state === 'blocked' && !s.question) err(lineOf(d.slices, a), at, 'a blocked slice needs its question');
    if (s.question && (s.question.options.length < 2 || s.question.options.length > 4)) err(lineOf(s.question, 'options'), `${at}.question.options`, 'give 2 or 3 options');
    if (s.state === 'checkpoint' && !s.pr) err(lineOf(d.slices, a), at, 'a slice at the checkpoint needs its pr');
    s.decisions ??= []; s.flows ??= [];
    s.decisions.forEach((x, b) => { if (decs.has(x.id)) err(lineOf(s.decisions, b), `${at}.decisions[${b}].id`, `duplicate id "${x.id}"`); decs.add(x.id); });
    s.flows.forEach((f, b) => {
      if (f.state === 'broken') for (const k of ['headline', 'expected', 'actual'])
        if (!f[k]) err(lineOf(s.flows, b), `${at}.flows[${b}].${k}`, 'missing; a broken flow needs headline, expected and actual');
    });
  });
}

export const SKILL = { name: 'checkpoint', template: new URL('../assets/checkpoint.html', import.meta.url), schema: SCHEMA, check, markdown: null };
if (isMain(import.meta.url)) process.exitCode = run(process.argv.slice(2), SKILL);
