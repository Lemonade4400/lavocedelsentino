/* La Voce del Sentino — interactions */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  // ---------- Sticky nav on scroll ----------
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  if (nav) {
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---------- Mobile menu toggle ----------
  const toggle = document.querySelector('.nav__toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
      const expanded = nav.classList.contains('is-open');
      toggle.setAttribute('aria-expanded', expanded);
    });
    nav.querySelectorAll('.nav__links a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('is-open'));
    });
  }

  // ---------- Reveal on scroll ----------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  // ---------- Current year ----------
  const yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();

  // ---------- Contact form (mailto fallback) ----------
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    const mailFallback = {
      mailSubject: 'Richiesta soggiorno',
      mailFallbackName: 'Ospite',
      mailFieldName: 'Nome',
      mailFieldEmail: 'Email',
      mailFieldArrival: 'Arrivo',
      mailFieldDeparture: 'Partenza',
      mailFieldGuests: 'Ospiti'
    };
    const mailT = (k) => {
      const v = window.LVSi18n && window.LVSi18n.t('contact.form.' + k);
      return typeof v === 'string' && v ? v : mailFallback[k];
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const arrival = (data.get('arrival') || '').toString().trim();
      const departure = (data.get('departure') || '').toString().trim();
      const guests = (data.get('guests') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();
      const subject = encodeURIComponent(`${mailT('mailSubject')} — ${name || mailT('mailFallbackName')}`);
      const body = encodeURIComponent(
        `${mailT('mailFieldName')}: ${name}\n${mailT('mailFieldEmail')}: ${email}\n${mailT('mailFieldArrival')}: ${arrival}\n${mailT('mailFieldDeparture')}: ${departure}\n${mailT('mailFieldGuests')}: ${guests}\n\n${message}`
      );
      window.location.href = `mailto:prenotazioni@lavocedelsentino.com?subject=${subject}&body=${body}`;
    });
  }
})();
