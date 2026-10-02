import test from 'node:test';
import assert from 'node:assert/strict';
import { setupMailerLite } from './create-mailerlite-group.mjs';

const page = (data, next = null) => ({ data, links: { next } });
function fixture(responses) {
  const calls = [];
  const logs = [];
  return {
    calls, logs,
    options: {
      token: 'test-only-placeholder',
      log: (message) => logs.push(message),
      fetchImpl: async (url, options) => {
        calls.push({ url, ...options });
        assert.ok(responses.length, 'unexpected API call');
        return { ok: true, json: async () => responses.shift() };
      }
    }
  };
}

test('missing or blank token fails before making a request', async () => {
  for (const token of ['', '  ']) {
    await assert.rejects(setupMailerLite({ token, fetchImpl: () => assert.fail('network called') }), /not available/);
  }
});

test('read-only check follows pagination, reports forms, and never writes', async () => {
  const f = fixture([page([], 'next'), page([{ id: '1', name: 'Deric Updates' }]),
    page([{ id: '2', name: 'Website', active: true, has_content: true, is_broken: false, double_optin: true }])]);
  const status = await setupMailerLite({ ...f.options, checkOnly: true });
  assert.equal(status.group.id, '1');
  assert.equal(status.embeddedForms[0].double_optin, true);
  assert.equal(f.calls.length, 3);
  assert.ok(f.calls.every((call) => !call.method || call.method === 'GET'));
  assert.ok(f.calls[1].url.endsWith('page=2'));
  assert.ok(!f.logs.join('').includes(f.options.token));
});

test('check mode does not create a missing group', async () => {
  const f = fixture([page([]), page([])]);
  const status = await setupMailerLite({ ...f.options, checkOnly: true });
  assert.equal(status.group, null);
  assert.deepEqual(status.embeddedForms, []);
  assert.equal(f.calls.length, 2);
});

test('existing group is reused case-insensitively', async () => {
  const f = fixture([page([{ id: '1', name: 'deric updates' }])]);
  assert.equal((await setupMailerLite(f.options)).id, '1');
  assert.equal(f.calls.length, 1);
});

test('setup creates only the named group after an exhaustive lookup', async () => {
  const f = fixture([page([]), { data: { id: '1', name: 'Deric Updates' } }]);
  await setupMailerLite(f.options);
  assert.equal(f.calls[1].method, 'POST');
  assert.equal(f.calls[1].url, 'https://connect.mailerlite.com/api/groups');
  assert.deepEqual(JSON.parse(f.calls[1].body), { name: 'Deric Updates' });
});

test('incomplete responses and pagination exhaustion cannot create a duplicate', async () => {
  for (const responses of [[{}], [{ data: [] }], Array.from({ length: 100 }, () => page([], 'next'))]) {
    const f = fixture(responses);
    await assert.rejects(setupMailerLite(f.options), /incomplete|pagination limit/);
    assert.ok(f.calls.every((call) => !call.method));
  }
});

test('API and network failures do not expose credentials or response bodies', async () => {
  await assert.rejects(setupMailerLite({ token: 'private', fetchImpl: async () => {
    throw new Error('private');
  } }), { message: 'MailerLite request failed or timed out. Check connectivity and try again.' });
  await assert.rejects(setupMailerLite({ token: 'private', fetchImpl: async () => ({
    ok: false, status: 401, json: async () => ({ token: 'private' })
  }) }), { message: 'MailerLite API returned HTTP 401.' });
});
