/*
 * 行動の記録（LPの部品）— うけつけるんの「行動分析」用。
 * - LPを開いた（lp.view）・予約ボタンを押した（lp.booking_click）を、うけつけるんへ送る。
 * - 予約ボタンのリンクに、訪問ID（vid）と流入元（utm・広告のクリックID・LPの前のサイト・LPのパス）を付けて、
 *   LPと予約ページを同じ1人として数えられるようにする。
 * - 名前・電話・メールなどの個人情報は送らない。送れなくても、ページの表示と予約ボタンには影響しない。
 * 使い方: <script src="/js/smk-lp.js" data-slug="smilemedi" data-src="インスタ" defer></script>
 *   data-src: LPのアドレスに src が無いときに使う流入元の名前（予約ボタンの src と同じにする）。
 */
(function () {
  try {
    var script = document.currentScript;
    var slug = (script && script.getAttribute('data-slug')) || 'smilemedi';
    var defaultSrc = (script && script.getAttribute('data-src')) || '';
    var PROD = 'https://app.uketsuke-run.online';
    var STAGING = 'https://smilemedi-cloud-w-git-56d932-rupansannsei96-yahoocojps-projects.vercel.app';
    // Netlify の確認用URLでは、うけつけるんのテスト環境へ送り、予約ボタンもテスト環境へ向ける。
    var preview = /--hb-clinic-web\.netlify\.app$/.test(location.hostname);
    var base = preview ? STAGING : PROD;
    var KEY = 'smk_lp_visit';
    var IDLE = 30 * 60 * 1000;
    var CLICK = [['fbclid', 'fbclid'], ['gclid', 'gclid'], ['gbraid', 'gbraid'], ['wbraid', 'wbraid'], ['ttclid', 'ttclid'],
      ['ldtag_cl', 'line'], ['yclid', 'yclid'], ['twclid', 'twclid'], ['msclkid', 'msclkid'], ['li_fat_id', 'linkedin']];
    var UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    var CAMPAIGN = ['src'].concat(UTM, ['click_id']);

    function clip(v, max) { v = (v || '').replace(/[\u0000-\u001f\u007f]/g, '').trim(); return v ? v.slice(0, max) : ''; }
    function uuid() {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      var b = crypto.getRandomValues(new Uint8Array(16));
      b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
      var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join('');
      return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
    }
    function fromSearch(search) {
      var p = new URLSearchParams(search), out = {}, any = false, i, v;
      v = clip(p.get('src'), 40); if (v) { out.src = v; any = true; }
      for (i = 0; i < UTM.length; i++) { v = clip(p.get(UTM[i]), 100); if (v) { out[UTM[i]] = v; any = true; } }
      for (i = 0; i < CLICK.length; i++) { v = clip(p.get(CLICK[i][0]), 255); if (v) { out.click_id_type = CLICK[i][1]; out.click_id = v; any = true; break; } }
      v = p.get('test') || p.get('smk_test'); if (v === '1' || v === 'true') { out.test = true; any = true; }
      return any ? out : null;
    }
    function isNew(cur, inc) {
      if (!inc) return false;
      if (!cur) return true;
      for (var i = 0; i < CAMPAIGN.length; i++) { var k = CAMPAIGN[i]; if (inc[k] !== undefined && inc[k] !== cur[k]) return true; }
      return false;
    }
    function referrerHost() {
      try { var h = new URL(document.referrer).hostname.toLowerCase(); return h && h !== location.hostname ? h : ''; } catch (e) { return ''; }
    }
    function load() {
      try { var v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v && v.id && v.att && Date.now() - v.t < IDLE) return v; } catch (e) {}
      return null;
    }
    function save(v) { v.t = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }

    var incoming = fromSearch(location.search);
    var visit = load();
    if (!visit || isNew(visit.att, incoming)) {
      var att = incoming || {};
      if (!att.src && defaultSrc) att.src = clip(defaultSrc, 40);
      var ref = referrerHost(); if (ref) att.referrer_host = ref;
      att.landing_page = location.pathname.slice(0, 200);
      visit = { id: uuid(), att: att };
    } else if (incoming && incoming.test) {
      visit.att.test = true;
    }
    save(visit);

    function send(event) {
      var body = JSON.stringify({ slug: slug, event: event, visit: visit.id, page: location.pathname, att: visit.att });
      var url = base + '/api/public/lp-track';
      try { if (navigator.sendBeacon && navigator.sendBeacon(url, body)) return; } catch (e) {}
      try { fetch(url, { method: 'POST', body: body, mode: 'no-cors', keepalive: true, credentials: 'omit', headers: { 'Content-Type': 'text/plain' } }); } catch (e) {}
    }

    // 予約ボタンのリンクに印を付ける（すでに付いている値は変えない）。
    function decorate(a) {
      var u;
      try { u = new URL(a.getAttribute('data-smk-href') || a.href); } catch (e) { return false; }
      if (u.origin !== PROD || u.pathname.indexOf('/booking/') !== 0) return false;
      if (!a.getAttribute('data-smk-href')) a.setAttribute('data-smk-href', u.href);
      var att = visit.att, p = u.searchParams, i;
      for (i = 0; i < UTM.length; i++) if (att[UTM[i]] && !p.get(UTM[i])) p.set(UTM[i], att[UTM[i]]);
      if (att.click_id && att.click_id_type) {
        for (i = 0; i < CLICK.length; i++) if (CLICK[i][1] === att.click_id_type) { if (!p.get(CLICK[i][0])) p.set(CLICK[i][0], att.click_id); break; }
      }
      if (att.test) p.set('test', '1');
      p.set('vid', visit.id);
      if (att.referrer_host) p.set('smk_ref', att.referrer_host); else p.delete('smk_ref');
      if (att.landing_page) p.set('smk_lp', att.landing_page);
      a.href = (preview ? STAGING : PROD) + u.pathname + '?' + p.toString() + u.hash;
      return true;
    }
    function decorateAll() {
      var links = document.querySelectorAll('a[href]');
      for (var i = 0; i < links.length; i++) decorate(links[i]);
    }

    var viewKey = 'smk_lp_view:' + visit.id + ':' + location.pathname;
    var seen = false;
    try { seen = !!sessionStorage.getItem(viewKey); sessionStorage.setItem(viewKey, '1'); } catch (e) {}
    if (!seen) send('lp.view');

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorateAll); else decorateAll();
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var current = load();
      if (current && current.id === visit.id) visit = current;
      save(visit);
      if (decorate(a)) send('lp.booking_click');
    }, true);
  } catch (e) { /* 記録できなくても、ページの表示と予約ボタンには影響させない */ }
})();
