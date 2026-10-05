import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  symlinkSync,
  unlinkSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceDirectories = [
  'tools/context-factory',
  'tools/context-factory/expo',
  'tools/context-factory/frontend',
  'apps/agent/rules/skills',
];
const assistantDirectories = ['.agent/skills', '.agents/skills', '.claude/skills', '.cursor/skills'];

function assertInsideRoot(rootDir, candidate) {
  const relative = path.relative(rootDir, candidate);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Skill path is outside the repository: ${candidate}`);
  }
}

export function syncSkills(rootDir, { check = false } = {}) {
  rootDir = realpathSync(rootDir);
  const instructionScopes = [rootDir];
  for (const directory of ['apps', 'packages']) {
    const parent = path.join(rootDir, directory);
    if (!existsSync(parent)) continue;
    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      if (entry.isDirectory()) instructionScopes.push(path.join(parent, entry.name));
    }
  }
  const rules = instructionScopes.filter(scope => existsSync(path.join(scope, 'AGENTS.md')));
  for (const scope of rules) {
    assertInsideRoot(rootDir, realpathSync(scope));
    const claude = path.join(scope, 'CLAUDE.md');
    if (!existsSync(claude) || readFileSync(claude, 'utf8').trim() !== '@AGENTS.md') {
      throw new Error(
        `${claude} must contain only @AGENTS.md. Keep shared instructions in AGENTS.md.`
      );
    }
  }
  const sources = new Map();

  for (const directory of sourceDirectories) {
    const sourceRoot = path.join(rootDir, directory);
    for (const entry of readdirSync(sourceRoot, { withFileTypes: true })) {
      const source = path.join(sourceRoot, entry.name);
      if (!entry.isDirectory() || !existsSync(path.join(source, 'SKILL.md'))) continue;
      assertInsideRoot(rootDir, realpathSync(source));
      const content = readFileSync(path.join(source, 'SKILL.md'), 'utf8');
      const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
      const name = frontmatter?.match(/^name:[ \t]*([a-z0-9]+(?:-[a-z0-9]+)*)[ \t]*$/m)?.[1];
      if (!name || name.length > 64) {
        throw new Error(
          `${source}/SKILL.md needs a plain lowercase, hyphenated name (max 64 characters).`
        );
      }
      if (sources.has(name)) throw new Error(`Duplicate skill name: ${name}`);
      sources.set(name, realpathSync(source));
    }
  }

  // Validate every destination before writing. Never replace a real folder or its edits.
  const pending = [];
  for (const directory of assistantDirectories) {
    const targetRoot = path.join(rootDir, directory);
    let ancestor = targetRoot;
    while (!existsSync(ancestor)) ancestor = path.dirname(ancestor);
    assertInsideRoot(rootDir, realpathSync(ancestor));

    for (const [name, source] of sources) {
      const target = path.join(targetRoot, name);
      const stat = lstatSync(target, { throwIfNoEntry: false });
      if (stat && !stat.isSymbolicLink()) {
        throw new Error(
          `Refusing to overwrite ${target}. Move any edits to ${source}, then remove the old copy.`
        );
      }
      if (stat && existsSync(target) && realpathSync(target) === source) continue;
      pending.push({ source, target, exists: Boolean(stat) });
    }
  }

  if (check && pending.length) {
    throw new Error(`${pending.length} skill links need repair. Run pnpm sync:skills.`);
  }

  for (const { source, target, exists } of pending) {
    mkdirSync(path.dirname(target), { recursive: true });
    // Unlink only the directory entry; never traverse or delete the linked source.
    if (exists) unlinkSync(target);
    symlinkSync(
      process.platform === 'win32' ? source : path.relative(path.dirname(target), source),
      target,
      process.platform === 'win32' ? 'junction' : 'dir'
    );
  }

  return {
    rules: rules.length,
    skills: sources.size,
    links: sources.size * assistantDirectories.length,
    changed: pending.length,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some(arg => arg !== '--check')) throw new Error('Usage: pnpm sync:skills [--check]');
    const rootDir = fileURLToPath(new URL('../../../', import.meta.url));
    const result = syncSkills(rootDir, { check: args.includes('--check') });
    console.log(
      `Verified ${result.rules} instruction imports and ${result.links} links to ${result.skills} canonical skills (${result.changed} updated).`
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
