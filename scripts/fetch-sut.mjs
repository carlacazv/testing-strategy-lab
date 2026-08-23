import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import config from '../sut.config.json' with { type: 'json' };

const target = resolve(config.directory);
const gitDir = resolve(target, '.git');

function git(args, cwd = process.cwd()) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
}

if (!existsSync(gitDir)) {
  rmSync(target, { recursive: true, force: true });
  mkdirSync(dirname(target), { recursive: true });
  git(['clone', '--filter=blob:none', '--no-checkout', config.repository, target]);
}

const origin = git(['remote', 'get-url', 'origin'], target);
if (origin !== config.repository) {
  throw new Error(`Unexpected SUT origin: ${origin}`);
}

git(['fetch', '--depth', '1', 'origin', config.commit], target);
git(['checkout', '--force', config.commit], target);
git(['clean', '-fdx'], target);

const head = git(['rev-parse', 'HEAD'], target);
if (head !== config.commit) {
  throw new Error(`SUT pin mismatch: expected ${config.commit}, got ${head}`);
}

console.log(`SUT ready at ${target} @ ${head}`);
