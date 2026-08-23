import assert from 'node:assert/strict';
import test from 'node:test';
import { scoreStrategy, strategies, validateStrategies } from '../../src/strategies.mjs';

test('every strategy references a known layer', () => {
  assert.deepEqual(validateStrategies(), []);
});

test('all named strategies contain at least one end-user boundary', () => {
  for (const [name, layers] of Object.entries(strategies)) {
    assert.ok(
      layers.some((layer) => layer.startsWith('e2e')),
      `${name} must include an E2E boundary`,
    );
  }
});

test('strategy score separates effectiveness from execution cost', () => {
  const score = scoreStrategy({ killed: 8, totalMutants: 10, durationMs: 4000 });
  assert.equal(score.mutationScore, 0.8);
  assert.equal(score.killsPerSecond, 2);
});
