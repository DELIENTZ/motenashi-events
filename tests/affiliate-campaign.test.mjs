import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { campaignActive, updateCampaigns } from '../assets/affiliate-campaign.js';

const start = '2026-11-20T12:00:00+09:00';
const end = '2026-11-30T00:00:00+09:00';

test('campaign respects JST start and exclusive end across UTC dates', () => {
  assert.equal(campaignActive(start, end, Date.parse('2026-11-20T02:59:59.999Z')), false);
  assert.equal(campaignActive(start, end, Date.parse('2026-11-20T03:00:00Z')), true);
  assert.equal(campaignActive(start, end, Date.parse('2026-11-29T14:59:59.999Z')), true);
  assert.equal(campaignActive(start, end, Date.parse('2026-11-29T15:00:00Z')), false);
  assert.equal(campaignActive(start, end, Date.parse('2027-01-01T00:00:00Z')), false);
});

test('invalid dates, reversed ranges and invalid clocks fail closed', () => {
  for (const [a, b] of [['', end], [start, 'invalid'], [end, start], [start, start]]) {
    assert.equal(campaignActive(a, b), false);
  }
  assert.equal(campaignActive(start, end, NaN), false);
});

test('visibility update hides expired notice and returns next transition', () => {
  const node = { dataset: { campaignStart: start, campaignEnd: end }, hidden: true };
  const root = { querySelectorAll: () => [node] };
  assert.equal(updateCampaigns(root, Date.parse(start) - 1), Date.parse(start));
  assert.equal(node.hidden, true);
  assert.equal(updateCampaigns(root, Date.parse(start)), Date.parse(end));
  assert.equal(node.hidden, false);
  assert.equal(updateCampaigns(root, Date.parse(end)), Infinity);
  assert.equal(node.hidden, true);
});

test('invalid markup stays hidden without scheduling an invalid range', () => {
  const node = { dataset: { campaignStart: end, campaignEnd: start }, hidden: false };
  assert.equal(updateCampaigns({ querySelectorAll: () => [node] }, Date.parse(start)), Infinity);
  assert.equal(node.hidden, true);
});

test('published campaign is hidden without JS and matches verified terms and official MyLink', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /data-campaign-start="2026-11-20T12:00:00\+09:00" data-campaign-end="2026-11-30T00:00:00\+09:00" hidden/);
  assert.match(html, /対象施設限定のクーポンは先着・利用条件あり/);
  assert.match(html, /高崎の全施設で使えるものではありません/);
  assert.match(html, /sid=3786702&amp;pid=892741303&amp;vc_url=https%3A%2F%2Fwww.asoview.com%2Fbrand%2F202611_blackfriday%2F/);
  assert.match(html, /src="assets\/affiliate-campaign.js"/);
  assert.match(html, /rel="nofollow sponsored noopener" aria-label="広告：アソビュー！のポイント5倍/);
});
