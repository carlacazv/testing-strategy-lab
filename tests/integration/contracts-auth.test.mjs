import assert from 'node:assert/strict';
import test from 'node:test';
import { listenMockApi } from '../../scripts/mock-api.mjs';

async function withApi(fn) {
  const server = await listenMockApi(0);
  const address = server.address();
  try {
    await fn(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('login returns the RealWorld user envelope and token', async () => {
  await withApi(async (base) => {
    const response = await fetch(`${base}/api/users/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ user: { email: 'qa@example.com', password: 'secret' } }),
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.user.username, 'strategy_lab');
    assert.ok(body.user.token);
  });
});

test('invalid login payload is rejected with an errors envelope', async () => {
  await withApi(async (base) => {
    const response = await fetch(`${base}/api/users/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ user: {} }),
    });
    const body = await response.json();
    assert.equal(response.status, 422);
    assert.ok(body.errors);
  });
});
