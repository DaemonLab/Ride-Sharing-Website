import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadConfigFromFile } from 'vite';

test('hosted frontend builds require a public HTTPS backend origin', async () => {
  process.env.VERCEL = '1';
  for (const value of ['', 'http://localhost:3000', 'https://api.example.com/api', 'invalid', 'http://api.example.com']) {
    process.env.VITE_BACKEND_URL = value;
    await assert.rejects(() => loadConfigFromFile({ command: 'build', mode: 'production' }));
  }
  process.env.VITE_BACKEND_URL = 'https://api.example.com';
  const result = await loadConfigFromFile({ command: 'build', mode: 'production' });
  assert.ok(result?.config);
  delete process.env.VERCEL;
});
