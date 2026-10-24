/* Shared Constitution Navigator UI: all pages use the same /api/navigator endpoint. */
(() => {
  const $ = id => document.getElementById(id);
  let previousFocus = null;
  let previousOverflow = '';
  let controller = null;
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function resourceHref(raw) {
    try {
      const url = new URL(String(raw || ''), window.location.origin);
      return url.origin === window.location.origin && /^https?:$/.test(url.protocol) ? url.pathname + url.search + url.hash : '#';
    } catch (_) { return '#'; }
  }
  function isOpen() { return !$('navigatorDrawer').hidden; }
  function open({focusInput = true} = {}) {
    if (!isOpen()) {
      previousFocus = document.activeElement;
      previousOverflow = document.body.style.overflow;
      $('navigatorOverlay').hidden = false;
      $('navigatorDrawer').hidden = false;
      document.body.style.overflow = 'hidden';
    }
    if (focusInput) $('navigatorQuestion').focus();
    else $('navigatorClose').focus();
  }
  function close() {
    if (!isOpen()) return;
    if (controller) controller.abort();
    $('navigatorDrawer').hidden = true;
    $('navigatorOverlay').hidden = true;
    $('navigatorLoading').hidden = true;
    $('navigatorAsk').disabled = false;
    document.body.style.overflow = previousOverflow;
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
  }
  function render(result) {
    let html = '<p class="global-nav-section-label">Answer</p><p class="global-nav-summary">' + escapeHtml(result.summary || '') + '</p>';
    if (Array.isArray(result.provisions) && result.provisions.length) {
      html += '<p class="global-nav-section-label">What the Constitution establishes</p><div class="global-nav-stack">';
      result.provisions.forEach(v => {
        const note = v.verbatim && v.text
          ? '<p class="global-nav-note global-nav-verbatim">' + escapeHtml(v.text) + '</p>'
          : v.relevance ? '<p class="global-nav-note">' + escapeHtml(v.relevance) + '</p>' : '';
        html += '<div class="global-nav-provision"><div class="global-nav-number">' + escapeHtml(v.num || '') + '</div><strong>' + escapeHtml(v.name || '') + '</strong>' + note + '</div>';
      });
      html += '</div>';
    }
    if (Array.isArray(result.resources) && result.resources.length) {
      html += '<p class="global-nav-section-label">Where to read more</p><div class="global-nav-stack">';
      result.resources.forEach(r => {
        html += '<a class="global-nav-resource" href="' + escapeHtml(resourceHref(r.href)) + '"><strong>' + escapeHtml(r.title || '') + '</strong><span>' + escapeHtml(r.note || '') + '</span></a>';
      });
      html += '</div>';
    }
    $('navigatorBody').innerHTML = html;
  }
  async function ask(question) {
    const q = String(question || $('navigatorQuestion').value).trim();
    open({focusInput:false});
    if (!q) { $('navigatorQuestion').focus(); return; }
    $('navigatorQuestion').value = q;
    if (controller) controller.abort();
    controller = new AbortController();
    const request = controller;
    $('navigatorLoading').hidden = false;
    $('navigatorBody').replaceChildren();
    $('navigatorAsk').disabled = true;
    const homeButton = $('navBtn');
    if (homeButton) homeButton.disabled = true;
    try {
      const response = await fetch('/api/navigator', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({question:q}), signal:request.signal});
      if (!response.ok) throw Error('Navigator request failed');
      const result = await response.json();
      if (result.error) throw Error('Navigator unavailable');
      if (controller === request) render(result);
    } catch (error) {
      if (error.name !== 'AbortError' && controller === request) {
        $('navigatorBody').textContent = 'Something went wrong — please try again.';
      }
    } finally {
      if (controller === request) {
        $('navigatorLoading').hidden = true;
        $('navigatorAsk').disabled = false;
        if (homeButton) homeButton.disabled = false;
        controller = null;
      }
    }
  }
  window.runNav = () => {
    const homepage = $('navQ');
    return ask(homepage ? homepage.value : $('navigatorQuestion').value);
  };
  window.closeNav = close;
  document.addEventListener('DOMContentLoaded', () => {
    $('navigatorLaunch').addEventListener('click', () => open());
    $('navigatorClose').addEventListener('click', close);
    $('navigatorOverlay').addEventListener('click', close);
    $('navigatorForm').addEventListener('submit', event => { event.preventDefault(); ask(); });
    const home = $('navQ');
    if (home) home.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); window.runNav(); } });
    $('navigatorDrawer').addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const candidates = [...$('navigatorDrawer').querySelectorAll('button:not(:disabled),input:not(:disabled),a[href]')].filter(el => el.getClientRects().length);
      if (!candidates.length) return;
      const first = candidates[0], last = candidates[candidates.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && isOpen()) { event.preventDefault(); close(); } });
  });
})();
