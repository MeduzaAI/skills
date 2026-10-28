// Tests for render.mjs: node --test scripts/render.test.mjs
// The parser and page-harness parts are the same in the plan, build and retro skills.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { parseYaml, YamlError, POS, validate, opt, inject, MARK, SKILL } from './render.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const script = join(here, 'render.mjs');
const example = join(here, '..', 'assets', `${SKILL.name}.example.yaml`);   // the shape agents copy
const demo = join(here, '..', 'assets', `${SKILL.name}.demo.yaml`);         // the full sample
const template = join(here, '..', 'assets', `${SKILL.name}.html`);
const cli = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
const tmp = () => mkdtempSync(join(tmpdir(), 'render-test-'));
const throwsAt = (src, line, re) => assert.throws(() => parseYaml(src), e => e instanceof YamlError && e.line === line && re.test(e.message));

// ---- parser ----
test('mappings, nested lists and "- key: v" items', () => {
  const v = parseYaml(`
# a comment
title: Partial refunds   # trailing comment
stacks:
  - id: api
    slices: [S1, S2]
  - id: web
    slices:
      - S3
list:
- a
- - nested
  - pair
empty:
nested:
  deeper:
    deepest: 1
`);
  assert.deepEqual(v, { title: 'Partial refunds', stacks: [{ id: 'api', slices: ['S1', 'S2'] }, { id: 'web', slices: ['S3'] }],
    list: ['a', ['nested', 'pair']], empty: null, nested: { deeper: { deepest: 1 } } });
  assert.equal(v[POS].keys.stacks, 4);
  assert.equal(v.stacks[POS].keys[1], 7);
  assert.equal(v.stacks[1][POS].keys.slices, 8);
});

test('scalars: quotes, escapes, numbers, booleans, null', () => {
  const v = parseYaml(String.raw`
a: 'it''s # not a comment'
b: "tab\there \"q\" \u00e9 \\"
c: 42
d: -1.5e3
e: true
f: ~
g: null
h: 0042
i: a#b
j: http://x.test/a:b
k: 2026-10-20T10:12:00Z
l: "#"
m: 12345678901234567890
`);
  assert.deepEqual(v, { a: "it's # not a comment", b: 'tab\there "q" é \\', c: 42, d: -1500, e: true, f: null, g: null, h: 42,
    i: 'a#b', j: 'http://x.test/a:b', k: '2026-10-20T10:12:00Z', l: '#', m: '12345678901234567890' });
});

test('multi-line plain and quoted values fold', () => {
  const v = parseYaml(`a: one
  two

  three
b: "x
  y"
c: 'p

  q'
`);
  assert.deepEqual(v, { a: 'one two\nthree', b: 'x y', c: 'p\nq' });
});

test('block scalars: literal, chomping, folded, indicators', () => {
  const v = parseYaml(`
keep: |
  line one
    indented # not a comment

  last
strip: |-
  no newline
plus: |+
  kept

folded: >-
  joined
  lines

  new paragraph
explicit: |2
     three spaces kept
  then two
list:
  - |
    in a list
  - key: |
      in an item
    after: x
`);
  assert.equal(v.keep, 'line one\n  indented # not a comment\n\nlast\n');
  assert.equal(v.strip, 'no newline');
  assert.equal(v.plus, 'kept\n\n');
  assert.equal(v.folded, 'joined lines\nnew paragraph');
  assert.equal(v.explicit, '   three spaces kept\nthen two\n');
  assert.deepEqual(v.list, ['in a list\n', { key: 'in an item\n', after: 'x' }]);
});

test('a block scalar may open more indented than its later lines (diffs)', () => {
  const v = parseYaml(`calls: |
    POST /x
  +   added()
  -   removed()
next: 1
`);
  assert.equal(v.calls, '  POST /x\n+   added()\n-   removed()\n');
  assert.equal(v.next, 1);
});

test('flow lists of scalars', () => {
  assert.deepEqual(parseYaml('a: [x, "y, z", 3, true, \'q\']\nb: []\nc: [one,\n  two]\n'),
    { a: ['x', 'y, z', 3, true, 'q'], b: [], c: ['one', 'two'] });
});

test('a leading --- is fine; a second document is not', () => {
  assert.deepEqual(parseYaml('---\na: 1\n'), { a: 1 });
  throwsAt('a: 1\n---\nb: 2\n', 2, /several documents/);
});

test('rejects what the subset does not read, naming the line', () => {
  throwsAt('a: 1\nb: &x 2\n', 2, /anchors/);
  throwsAt('a: *x\n', 1, /aliases/);
  throwsAt('a: !!str 1\n', 1, /tags/);
  throwsAt('a:\n  b: {c: 1}\n', 2, /flow mappings/);
  throwsAt('? a\n: b\n', 1, /complex keys/);
  throwsAt('a: 1\na: 2\n', 2, /duplicate key "a"/);
  throwsAt('a: 1\n   b: 2\n', 2, /continues the value above/);
  throwsAt('a:\n  b: 1\n c: 2\n', 3, /unexpected indentation|expected/);
  throwsAt('a:\n\tb: 1\n', 2, /tab/);
  throwsAt('a: "open\nb: 1\n', 1, /unterminated/);
  throwsAt('a: x: y\n', 1, /": " inside a plain value/);
  throwsAt('a: `code`\n', 1, /cannot start with `/);
  throwsAt('a: [x, [y]]\n', 1, /nested/);
  throwsAt('a: "x" y\n', 1, /after the closing quote/);
  throwsAt('items:\n  - a\n  b: 1\n', 3, /expected|indentation/);
});

// ---- validation ----
test('validation names the field path and its line', () => {
  const d = parseYaml('top:\n  - name: a\n    count: x\n    extra: 1\n  - count: 2\n    kind: z\n');
  const errs = validate(d, { top: [{ name: 'str', count: 'num', kind: '=x|y?' }] });
  assert.deepEqual(errs.map(e => `${e.line} ${e.path} ${e.msg.split(';')[0]}`), [
    '4 top[0].extra unknown field',
    '3 top[0].count expected a number, got text',
    '5 top[1].name missing',
    '6 top[1].kind expected one of: x, y',
  ]);
  const d2 = parseYaml('m:\n  x: y\nlines: |\n  one\n  two\n');
  assert.match(validate(d2, { m: 'str', lines: 'lines' })[0].msg, /got a mapping .*quote it/);
  assert.deepEqual(d2.lines, ['one', 'two']);
  assert.deepEqual(validate(parseYaml('a: 1\n'), { a: 'str', b: opt(['str']) }), []);
});

// ---- page injection ----
test('injected data cannot close the script tag', () => {
  const page = inject(`<script>const DATA = ${MARK};</script>`, { t: '</script><script>alert(1)</script>', u: 'a\u2028b' });
  assert.equal(page.match(/<\/script>/g).length, 1);
  assert.ok(!page.includes('\u2028'));
  const json = page.slice('<script>const DATA = '.length, -';</script>'.length);
  assert.deepEqual(JSON.parse(json), { t: '</script><script>alert(1)</script>', u: 'a\u2028b' });
  assert.throws(() => inject('no marker', {}), /exactly once/);
});

// ---- the page: compiles, and builds itself from the injected data ----
function stub() {
  const store = {};
  return new Proxy(function () {}, {
    get: (t, k) => k in store ? store[k] : k === Symbol.toPrimitive ? () => 0 : k === Symbol.iterator ? function* () {} : k === 'then' ? undefined : (store[k] = stub()),
    set: (t, k, v) => { store[k] = v; return true; },
    apply: () => stub(),
  });
}
function runPage(html) {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  assert.ok(scripts.length >= 2, 'page has its scripts');
  for (const s of scripts) new vm.Script(s);           // syntax check, as node --check would
  const els = {}, saved = {};
  const document = { getElementById: id => (els[id] ??= stub()), querySelector: () => stub(), querySelectorAll: () => [],
    body: stub(), title: '', createElement: () => stub(), addEventListener() {} };
  const ctx = { document, console, localStorage: { getItem: k => saved[k] ?? null, setItem: (k, v) => { saved[k] = v; } },
    navigator: { clipboard: { writeText() {} } }, addEventListener() {}, removeEventListener() {}, setTimeout: () => 0, clearTimeout() {},
    scrollTo() {}, scrollY: 0, innerHeight: 800, location: { hash: '' } };
  ctx.window = ctx;
  vm.createContext(ctx);
  let error;
  try { for (const s of scripts) vm.runInContext(s, ctx); } catch (e) { error = e; }
  return { ctx, els, document, error, eval: code => vm.runInContext(code, ctx) };
}

test('the template, opened un-rendered, says how to render it', () => {
  const page = runPage(readFileSync(template, 'utf8'));
  assert.match(String(page.error?.message), /Render with scripts\/render\.mjs/);
  assert.match(page.document.body.innerHTML, /Render with scripts\/render\.mjs/);
});

// ---- plan ----
test('the example validates and renders into a page that builds itself', () => {
  const dir = tmp(), yaml = join(dir, 'plan.yaml');
  copyFileSync(example, yaml);
  const r = cli(yaml);
  assert.equal(r.status, 0, r.stderr);
  const page = runPage(readFileSync(r.stdout.trim(), 'utf8'));
  assert.equal(page.error, undefined, page.error?.stack);
  assert.match(page.els.app.innerHTML, /\S/);
  assert.equal(cli(example, '--md').status, 0);
});

test('the demo renders into the page', () => {
  const dir = tmp(), yaml = join(dir, 'plan.yaml');
  copyFileSync(demo, yaml);
  const r = cli(yaml);
  assert.equal(r.status, 0, r.stderr);
  const out = r.stdout.trim();
  assert.ok(out.endsWith('plan.html') && existsSync(out));
  const html = readFileSync(out, 'utf8');
  assert.ok(!html.includes(MARK));
  assert.ok(html.includes('"title":"Partial refunds"'));
  const page = runPage(html);
  assert.equal(page.error, undefined, page.error?.stack);
  assert.match(page.els.app.innerHTML, /Partial refunds/);
  page.eval(`setNote('S1.files', 'split the migration'); setVerdict('approve');`);
  assert.equal(page.els.ans.textContent, 'S1.files 💬 "split the migration"\napprove');
});

test('--md is the saved plan, with only the sections present', () => {
  const r = cli(demo, '--md');
  assert.equal(r.status, 0, r.stderr);
  for (const h of ['# Partial refunds', '## What and why', '## Decisions', '## Facts', '## Architecture', '### Components and flow',
    '## Slices', '### S1. Partial refund endpoint', '**Files**', '**Call tree**', '**Signatures**', '**Flow 1: Partial refund is created**', '## Stacks'])
    assert.ok(r.stdout.includes(h), h);
  assert.match(r.stdout, /\| D1 \| Who can issue a partial refund\? \|/);
  assert.match(r.stdout, /^\+ {5}0042_create_refunds\.sql/m);
  const dir = tmp(), small = join(dir, 'p.yaml'), md = join(dir, 'p.md');
  writeFileSync(small, 'id: p1\nref: BUG-1\ntitle: Fix\nwhat: w\nwhy: y\nstacks:\n  - id: a\n    repo: a\n    slices: [S1]\nslices:\n  - id: S1\n    repo: a\n    title: t\n    delivers: d\n    files: |\n      ~ a.ts — fix\n');
  assert.equal(cli(small, '--md', '-o', md).status, 0);
  const text = readFileSync(md, 'utf8');
  for (const h of ['## Decisions', '## Facts', '## Architecture', '## Stacks', '**Call tree**']) assert.ok(!text.includes(h), h);
});

test('a bad plan fails with the line and field of each problem', () => {
  const dir = tmp(), yaml = join(dir, 'plan.yaml');
  writeFileSync(yaml, readFileSync(demo, 'utf8').replace('    title: Refund dialog\n', ''));
  const r = cli(yaml);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /plan\.yaml:\d+: slices\[2\]: missing|plan\.yaml:\d+: slices\[2\]\.title: missing/);
  assert.ok(!existsSync(join(dir, 'plan.html')));
  writeFileSync(yaml, readFileSync(demo, 'utf8').replace('title: Refund status from webhook\n    after: [S1]', 'title: Refund status from webhook\n    after: [S9]')
    + 'before:\n  S7.files: x\n');
  const r2 = cli(yaml);
  assert.equal(r2.status, 1);
  assert.match(r2.stderr, /slices\[1\]\.after\[0\]: no slice has id "S9"/);
  assert.match(r2.stderr, /before\.S7\.files: no block has id "S7\.files"/);
  writeFileSync(yaml, 'id: x\ntitle: "unterminated\n');
  assert.match(cli(yaml).stderr, /plan\.yaml:2: unterminated/);
});
