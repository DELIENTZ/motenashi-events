export function campaignActive(start, end, now = Date.now()) {
  const from = Date.parse(start), until = Date.parse(end);
  return Number.isFinite(from) && Number.isFinite(until) && from < until
    && Number.isFinite(now) && now >= from && now < until;
}

export function updateCampaigns(root, now = Date.now()) {
  let next = Infinity;
  for (const node of root.querySelectorAll('[data-campaign-start][data-campaign-end]')) {
    const { campaignStart: start, campaignEnd: end } = node.dataset;
    node.hidden = !campaignActive(start, end, now);
    if (Date.parse(start) >= Date.parse(end)) continue;
    for (const deadline of [Date.parse(start), Date.parse(end)]) {
      if (deadline > now) next = Math.min(next, deadline);
    }
  }
  return next;
}

if (typeof document !== 'undefined') {
  let timer;
  const refresh = () => {
    clearTimeout(timer);
    const now = Date.now();
    const next = updateCampaigns(document, now);
    // Recheck at the boundary even when the visitor keeps the page open.
    if (Number.isFinite(next)) timer = setTimeout(refresh, Math.min(next - now, 2147483647));
  };
  refresh();
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', refresh);
}
