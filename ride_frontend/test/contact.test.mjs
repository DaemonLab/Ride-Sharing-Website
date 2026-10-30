import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Exercise the actual service without adding a test runtime or sending email.
const source = await readFile(new URL('../src/services/contactService.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { submitContactMessage } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const message = { name: 'Student', email: 'student@example.com', subject: 'Question', message: 'Hello' };

test('contact uses FormSubmit with no session credentials and sends the enquiry fields', async t => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://formsubmit.co/ajax/ershavait@gmail.com');
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.referrerPolicy, 'strict-origin');
    assert.equal(options.headers.Authorization, undefined);
    assert.equal(options.headers['X-Requested-With'], undefined);
    assert.deepEqual(JSON.parse(options.body), { ...message, _subject: 'RideShare contact: Question', _template: 'table' });
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ success: 'true' });
  });
  await assert.doesNotReject(submitContactMessage(message));
});

test('HTTP 200 does not mean success when the provider rejects a submission', async t => {
  for (const body of [{ success: 'false' }, { success: false }, {}, null]) {
    const mock = t.mock.method(globalThis, 'fetch', async () => Response.json(body));
    await assert.rejects(submitContactMessage(message), /CONTACT_NOT_ACCEPTED/);
    mock.mock.restore();
  }
});

test('provider outages, rate limits, network failures and non-JSON replies reject', async t => {
  for (const response of [new Response('', { status: 521 }), new Response('', { status: 429 }), new Response('<html>Error</html>')]) {
    const mock = t.mock.method(globalThis, 'fetch', async () => response);
    await assert.rejects(submitContactMessage(message));
    mock.mock.restore();
  }
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Network unavailable'); });
  await assert.rejects(submitContactMessage(message));
});
