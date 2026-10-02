const test = require('node:test');
const assert = require('node:assert/strict');
const { RELEASE_AT, remaining } = require('../js/album-countdown.js');

test('midnight October 9 Eastern is 04:00 UTC', () => {
  assert.equal(RELEASE_AT, Date.parse('2026-10-09T04:00:00Z'));
});
test('before release splits days, hours, minutes and seconds', () => {
  assert.deepEqual(remaining(RELEASE_AT - 90061000), { days: 1, hours: 1, minutes: 1, seconds: 1, released: false });
});
test('final fractional second stays positive before release', () => {
  assert.equal(remaining(RELEASE_AT - 1).seconds, 1);
  assert.equal(remaining(RELEASE_AT - 1).released, false);
});
test('exact release transitions to zero', () => {
  assert.deepEqual(remaining(RELEASE_AT), { days: 0, hours: 0, minutes: 0, seconds: 0, released: true });
});
test('after release never shows a negative countdown', () => {
  assert.deepEqual(remaining(RELEASE_AT + 864000000), { days: 0, hours: 0, minutes: 0, seconds: 0, released: true });
});
test('equivalent visitor timezone timestamps produce the same countdown', () => {
  assert.deepEqual(remaining(Date.parse('2026-10-08T21:00:00-07:00')), remaining(Date.parse('2026-10-09T13:00:00+09:00')));
});
