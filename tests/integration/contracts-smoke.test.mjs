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

test('RealWorld tags contract exposes a tags array', async () => {
  await withApi(async (base) => {
    const response = await fetch(`${base}/api/tags`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.ok(Array.isArray(body.tags));
    assert.ok(body.tags.includes('testing'));
  });
});

test('RealWorld article list contract includes count and article identity', async () => {
  await withApi(async (base) => {
    const response = await fetch(`${base}/api/articles?limit=3&offset=0`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.articlesCount, 1);
    assert.equal(body.articles[0].slug, 'testing-strategies-with-evidence');
    assert.ok(Array.isArray(body.articles[0].tagList));
  });
});
