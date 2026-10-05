import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { syncSkills } from './sync-skills.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'upskwela-skill-links-'));
  t.after(() => {
    assert.equal(path.dirname(root), os.tmpdir());
    rmSync(root, { recursive: true, force: true });
  });
  for (const directory of [
    'tools/context-factory/demo',
    'tools/context-factory/expo',
    'tools/context-factory/frontend',
    'apps/agent/rules/skills',
  ]) {
    mkdirSync(path.join(root, directory), { recursive: true });
  }
  const source = path.join(root, 'tools/context-factory/demo');
  writeFileSync(
    path.join(source, 'SKILL.md'),
    '---\nname: demo\ndescription: Test skill\n---\nOriginal instructions\n'
  );
  return { root, source, target: path.join(root, '.agents/skills/demo') };
}

test('links expose source edits immediately and repeated setup changes nothing', t => {
  const { root, source, target } = fixture(t);
  assert.equal(syncSkills(root).changed, 4);
  assert.equal(realpathSync(target), realpathSync(source));
  const updated = '---\nname: demo\ndescription: Test skill\n---\nUpdated instructions\n';
  writeFileSync(path.join(source, 'SKILL.md'), updated);
  assert.equal(readFileSync(path.join(target, 'SKILL.md'), 'utf8'), updated);
  assert.equal(syncSkills(root).changed, 0);
  assert.equal(syncSkills(root, { check: true }).changed, 0);
});

test('check reports missing links without creating them', t => {
  const { root, target } = fixture(t);
  assert.throws(() => syncSkills(root, { check: true }), /need repair/);
  assert.throws(() => realpathSync(target), { code: 'ENOENT' });
});

test('existing copies and local edits are never overwritten', t => {
  const { root, target } = fixture(t);
  mkdirSync(target, { recursive: true });
  writeFileSync(path.join(target, 'SKILL.md'), 'Local edits\n');
  assert.throws(() => syncSkills(root), /Refusing to overwrite/);
  assert.equal(readFileSync(path.join(target, 'SKILL.md'), 'utf8'), 'Local edits\n');
  assert.throws(() => realpathSync(path.join(root, '.agent')), { code: 'ENOENT' });
});

test('repairs a link without deleting its old target', t => {
  const { root, source, target } = fixture(t);
  const oldTarget = path.join(root, 'old-skill');
  mkdirSync(oldTarget);
  writeFileSync(path.join(oldTarget, 'keep.txt'), 'Keep me\n');
  mkdirSync(path.dirname(target), { recursive: true });
  symlinkSync(oldTarget, target, process.platform === 'win32' ? 'junction' : 'dir');
  syncSkills(root);
  assert.equal(realpathSync(target), realpathSync(source));
  assert.equal(readFileSync(path.join(oldTarget, 'keep.txt'), 'utf8'), 'Keep me\n');
});

test('does not follow an assistant directory outside the repository', t => {
  const { root } = fixture(t);
  const { root: outside } = fixture(t);
  symlinkSync(
    outside,
    path.join(root, '.agents'),
    process.platform === 'win32' ? 'junction' : 'dir'
  );
  assert.throws(() => syncSkills(root), /outside the repository/);
});

test('repairs a broken link after a checkout moves and keeps unrelated skills', t => {
  const { root, source, target } = fixture(t);
  mkdirSync(path.dirname(target), { recursive: true });
  symlinkSync(
    path.join(root, 'missing-source'),
    target,
    process.platform === 'win32' ? 'junction' : 'dir'
  );
  const local = path.join(root, '.agents/skills/local');
  mkdirSync(local);
  writeFileSync(path.join(local, 'SKILL.md'), 'Local skill\n');
  syncSkills(root);
  assert.equal(realpathSync(target), realpathSync(source));
  assert.equal(readFileSync(path.join(local, 'SKILL.md'), 'utf8'), 'Local skill\n');
});

test('frontend skills use the same source through every assistant path', t => {
  const { root } = fixture(t);
  const source = path.join(root, 'tools/context-factory/frontend/shadcn');
  mkdirSync(source);
  writeFileSync(
    path.join(source, 'SKILL.md'),
    '---\nname: shadcn\ndescription: Test skill\n---\nShared shadcn guidance\n'
  );
  syncSkills(root);
  for (const assistant of ['.agent', '.agents', '.claude', '.cursor']) {
    assert.equal(realpathSync(path.join(root, assistant, 'skills/shadcn')), realpathSync(source));
  }
});

test('validates instruction imports and rejects divergent Claude rules without overwriting them', t => {
  const { root } = fixture(t);
  const scope = path.join(root, 'apps/example');
  mkdirSync(scope, { recursive: true });
  writeFileSync(path.join(scope, 'AGENTS.md'), 'Shared rules\n');
  const claude = path.join(scope, 'CLAUDE.md');
  assert.throws(() => syncSkills(root), /must contain only @AGENTS.md/);
  writeFileSync(claude, 'Duplicated rules\n');
  assert.throws(() => syncSkills(root), /must contain only @AGENTS.md/);
  assert.equal(readFileSync(claude, 'utf8'), 'Duplicated rules\n');
  writeFileSync(claude, '@AGENTS.md\n');
  assert.equal(syncSkills(root).rules, 1);
  assert.equal(syncSkills(root, { check: true }).rules, 1);
});

test('discovery folders match declared skill names, not source grouping names', t => {
  const { root, source } = fixture(t);
  writeFileSync(
    path.join(source, 'SKILL.md'),
    '---\nname: demo-skill\ndescription: Test skill\n---\n'
  );
  syncSkills(root);
  assert.equal(realpathSync(path.join(root, '.agents/skills/demo-skill')), realpathSync(source));
  assert.throws(() => realpathSync(path.join(root, '.agents/skills/demo')), { code: 'ENOENT' });
});

test('duplicate skill identities fail before creating links', t => {
  const { root } = fixture(t);
  const duplicate = path.join(root, 'tools/context-factory/expo/another-folder');
  mkdirSync(duplicate);
  writeFileSync(
    path.join(duplicate, 'SKILL.md'),
    '---\nname: demo\ndescription: Duplicate skill\n---\n'
  );
  assert.throws(() => syncSkills(root), /Duplicate skill name/);
  assert.throws(() => realpathSync(path.join(root, '.agents')), { code: 'ENOENT' });
});
