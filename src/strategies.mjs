export const layers = {
  static: { command: 'test:static', category: 'static' },
  unit: { command: 'test:unit', category: 'unit' },
  component: { command: 'test:component', category: 'component' },
  integrationSmoke: { command: 'test:integration:smoke', category: 'integration' },
  integrationFull: { command: 'test:integration', category: 'integration' },
  e2eSmoke: { command: 'test:e2e:smoke', category: 'e2e' },
  e2eFull: { command: 'test:e2e', category: 'e2e' },
  accessibility: { command: 'test:a11y', category: 'accessibility' },
};

export const strategies = {
  pyramid: ['static', 'unit', 'component', 'integrationSmoke', 'e2eSmoke'],
  trophy: ['static', 'unit', 'component', 'integrationFull', 'e2eSmoke'],
  diamond: ['static', 'component', 'integrationFull', 'e2eSmoke'],
  crab: ['static', 'integrationSmoke', 'e2eFull', 'accessibility'],
  'e2e-heavy': ['static', 'e2eFull', 'accessibility'],
  full: ['static', 'unit', 'component', 'integrationFull', 'e2eFull', 'accessibility'],
};

export function validateStrategies() {
  const missing = [];
  for (const [strategy, names] of Object.entries(strategies)) {
    for (const name of names) {
      if (!layers[name]) missing.push(`${strategy}:${name}`);
    }
  }
  return missing;
}

export function scoreStrategy({ killed = 0, totalMutants = 0, durationMs = 0 }) {
  const mutationScore = totalMutants > 0 ? killed / totalMutants : 0;
  const seconds = Math.max(durationMs / 1000, 0.001);
  return {
    mutationScore,
    killsPerSecond: killed / seconds,
  };
}
