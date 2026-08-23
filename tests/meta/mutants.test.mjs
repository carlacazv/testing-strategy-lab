import assert from 'node:assert/strict';
import test from 'node:test';
import { mutants } from '../../mutation/catalog.mjs';

test('mutation catalog has unique ids', () => {
  const ids = mutants.map((mutant) => mutant.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every mutant declares a supported target and a meaningful replacement', () => {
  for (const mutant of mutants) {
    assert.ok(['sut', 'lab'].includes(mutant.target), `${mutant.id} target`);
    assert.ok(mutant.path, `${mutant.id} path`);
    assert.ok(mutant.risk, `${mutant.id} risk`);
    assert.notEqual(mutant.from, mutant.to, `${mutant.id} replacement`);
  }
});

test('catalog spans unit, component, integration, browser and accessibility risks', () => {
  const ids = mutants.map((mutant) => mutant.id);
  for (const prefix of ['unit-', 'component-', 'integration-', 'e2e-', 'a11y-']) {
    assert.ok(ids.some((id) => id.startsWith(prefix)), `missing ${prefix} mutant`);
  }
});
