import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { todayJst, validDate, eventVenues, eventOnDate, eventInRange, matchesEvent, sortEvents } from '../assets/event-utils.js';

const filters = { period: 'upcoming', venue: '', fee: '', category: '', query: '', from: '', to: '', tentative: false, tags: [] };
const event = { id: 'test', title: '高崎 TEST 2026', start: '2026-11-06', end: '2026-11-08', venue: '高崎芸術劇場 音楽ホール', venues: ['高崎芸術劇場'], fee_type: 'paid', category: '音楽', tags: ['クラシック'], summary: '公開の催し' };
const match = (overrides = {}, item = event) => matchesEvent(item, { ...filters, ...overrides }, '2026-11-02');

test('Japan date crosses midnight independently of host timezone', () => {
  assert.equal(todayJst(new Date('2026-11-01T14:59:59Z')), '2026-11-01');
  assert.equal(todayJst(new Date('2026-11-01T15:00:00Z')), '2026-11-02');
});
test('strict ISO dates include leap year validation', () => {
  assert.ok(validDate('2028-02-29'));
  for (const key of ['2026-02-29', '2026-11-31', '2026-13-01', '', '2026/11/02', undefined]) assert.equal(validDate(key), false);
});
test('venue groups preserve hall details and multiple venues', () => {
  assert.deepEqual(eventVenues(event), ['高崎芸術劇場']);
  assert.deepEqual(eventVenues({ venue: 'もてなし広場' }), ['もてなし広場']);
  assert.ok(match({ venue: '高崎芸術劇場' }));
  assert.equal(match({ venue: '高崎アリーナ' }), false);
});
test('all filter dimensions combine with AND and tags combine with OR', () => {
  assert.ok(match({ venue: '高崎芸術劇場', fee: 'paid', category: '音楽', query: 'ＴＥＳＴ 高崎', tags: ['未一致', 'クラシック'] }));
  assert.equal(match({ fee: 'free' }), false);
  assert.equal(match({ category: 'スポーツ' }), false);
  assert.equal(match({ query: '未登録' }), false);
  assert.equal(match({ tags: ['未一致'] }), false);
});
test('venue and hall names are searchable', () => {
  assert.ok(match({ query: '音楽ホール' }));
});
test('unknown fees never match free', () => {
  const unknown = { ...event, fee_type: undefined };
  assert.ok(match({ fee: 'unknown' }, unknown));
  assert.equal(match({ fee: 'free' }, unknown), false);
});
test('unconfirmed information is opt-in', () => {
  assert.equal(match({}, { ...event, tentative: true }), false);
  assert.ok(match({ tentative: true }, { ...event, tentative: true }));
});
test('ranges include overlapping and last-day events', () => {
  assert.ok(match({ from: '2026-11-08', to: '2026-11-08' }));
  assert.equal(match({ from: '2026-11-09' }), false);
  assert.equal(match({ from: '2026-11-09', to: '2026-11-08' }), false);
  assert.ok(matchesEvent(event, filters, '2026-11-08'));
  assert.equal(matchesEvent(event, filters, '2026-11-09'), false);
});
test('past and ongoing events are distinct', () => {
  assert.ok(matchesEvent(event, { ...filters, period: 'past' }, '2026-11-09'));
  assert.equal(matchesEvent(event, { ...filters, period: 'past' }, '2026-11-07'), false);
});
test('discontinuous dates do not create events in the gaps', () => {
  const item = { ...event, dates: ['2026-11-06', '2026-11-08'] };
  assert.equal(eventOnDate(item, '2026-11-07'), false);
  assert.equal(eventInRange(item, '2026-11-07', '2026-11-07'), false);
  assert.ok(eventOnDate(item, '2026-11-08'));
});
test('museum holidays are excluded from day and range queries', () => {
  const item = { ...event, excluded_dates: ['2026-11-06', '2026-11-08'] };
  assert.equal(eventOnDate(item, '2026-11-06'), false);
  assert.equal(eventInRange(item, '2026-11-08', '2026-11-08'), false);
  assert.ok(eventInRange(item, '2026-11-06', '2026-11-08'));
});
test('sorting is deterministic and does not mutate source', () => {
  const items = [{ ...event, id: 'b', start: '2026-12-01' }, { ...event, id: 'a', start: '2026-11-08' }];
  assert.deepEqual(sortEvents(items).map(e => e.id), ['a', 'b']);
  assert.deepEqual(sortEvents(items, 'date', 'desc').map(e => e.id), ['b', 'a']);
  assert.equal(items[0].id, 'b');
});
test('published dataset has unique IDs, valid dates, fees, venues and safe links', async () => {
  const data = JSON.parse(await readFile(new URL('../data/events.json', import.meta.url)));
  assert.equal(new Set(data.events.map(e => e.id)).size, data.events.length);
  for (const e of data.events) {
    assert.ok(validDate(e.start), e.id);
    assert.ok(validDate(e.end || e.start), e.id);
    assert.ok((e.end || e.start) >= e.start, e.id);
    assert.ok(['free', 'paid', 'mixed', 'unknown'].includes(e.fee_type), e.id);
    assert.ok(Array.isArray(e.venues) && e.venues.length, e.id);
    for (const key of e.excluded_dates || []) assert.ok(validDate(key) && key >= e.start && key <= (e.end || e.start), e.id);
    for (const link of [e.official_url, e.source_url].filter(Boolean)) assert.ok(['https:', 'http:'].includes(new URL(link).protocol), e.id);
  }
  const museum = data.events.find(e => e.id === 'takasaki-art-human-figure-2026');
  assert.equal(eventOnDate(museum, '2026-11-09'), false);
  assert.ok(eventOnDate(museum, '2026-11-23'));
  assert.equal(eventOnDate(museum, '2026-11-24'), false);
});
