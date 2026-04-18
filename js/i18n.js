/* La Voce del Sentino — i18n */
(function () {
  'use strict';

  const STORAGE_KEY = 'lvs-lang';
  const DEFAULT_LANG = 'it';
  const SUPPORTED = ['it', 'en'];
  const cache = {};

  function detect() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.includes(saved)) return saved;
    } catch (e) {}
    const nav = (navigator.language || DEFAULT_LANG).slice(0, 2).toLowerCase();
    return SUPPORTED.includes(nav) ? nav : DEFAULT_LANG;
  }

  function dig(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj);
  }

  async function load(lang) {
    if (cache[lang]) return cache[lang];
    const res = await fetch(`js/i18n/${lang}.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`i18n: failed to load ${lang}`);
    cache[lang] = await res.json();
    return cache[lang];
  }

  function applyDom(dict) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = dig(dict, el.getAttribute('data-i18n'));
      if (typeof v === 'string') el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const v = dig(dict, el.getAttribute('data-i18n-html'));
      if (typeof v === 'string') el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.getAttribute('data-i18n-attr').split('|').forEach(pair => {
        const [attr, key] = pair.split('=').map(s => s && s.trim());
        if (!attr || !key) return;
        const v = dig(dict, key);
        if (typeof v === 'string') el.setAttribute(attr, v);
      });
    });
  }

  function updateSwitcher(lang) {
    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
      const is = btn.getAttribute('data-lang-switch') === lang;
      btn.setAttribute('aria-pressed', is ? 'true' : 'false');
      btn.classList.toggle('is-active', is);
    });
  }

  async function apply(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    try {
      const dict = await load(lang);
      document.documentElement.lang = lang;
      applyDom(dict);
      updateSwitcher(lang);
      if (document.documentElement.hasAttribute('data-lang-pending')) {
        document.documentElement.removeAttribute('data-lang-pending');
      }
      window.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang, dict } }));
    } catch (err) {
      console.error(err);
      document.documentElement.removeAttribute('data-lang-pending');
    }
  }

  function setLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    apply(lang);
  }

  function t(key) {
    const lang = detect();
    const dict = cache[lang];
    if (!dict) return undefined;
    return dig(dict, key);
  }

  function init() {
    const lang = detect();
    apply(lang);
    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
      btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang-switch')));
    });
  }

  window.LVSi18n = { detect, setLang, apply, t, SUPPORTED };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
