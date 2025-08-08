// Global Config (placeholders)
const CALENDAR_URL = 'https://calendly.com/fangel0608/30min';
const STRIPE_CORE_URL = 'https://buy.stripe.com/4gM14ofs24kggqG5Y0cfK02';
const EMAIL_ENDPOINT = 'https://api.web3forms.com/submit'; // placeholder

function openExternal(url) {
  window.open(url, '_blank', 'noopener');
}

function bindCTAButtons() {
  const ids = ['header-audit-btn', 'mobile-audit-btn', 'hero-primary-cta', 'cta-audit-btn', 'mobile-sticky-cta'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openExternal(CALENDAR_URL);
        const ctaSection = document.getElementById('cta');
        if (ctaSection) ctaSection.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });
  const stripeBtn = document.getElementById('pricing-stripe-btn');
  if (stripeBtn) {
    stripeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openExternal(STRIPE_CORE_URL);
    });
  }
}

function enableSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href.length === 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) toggleMobileMenu(false);
    });
  });
}

function toggleMobileMenu(forceOpen) {
  const btn = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  const isOpen = forceOpen ?? menu.classList.contains('hidden') === true;
  if (isOpen) {
    menu.classList.remove('hidden');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
  } else {
    menu.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
  }
}

function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-button');
  if (!btn) return;
  btn.addEventListener('click', () => toggleMobileMenu());
}

function headerShadowOnScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const setShadow = () => {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  setShadow();
  window.addEventListener('scroll', setShadow, { passive: true });
}

function initAccordion() {
  const triggers = document.querySelectorAll('.accordion-button');
  triggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const panelId = btn.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if (panel) panel.hidden = expanded;
    });
  });
}

function initForm() {
  const form = document.getElementById('starter-kit-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  const success = document.getElementById('form-success');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Sending…';
    success.classList.add('hidden');

    const formData = new FormData(form);
    try {
      const res = await fetch(form.action || EMAIL_ENDPOINT, {
        method: form.method || 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json().catch(() => ({}));
      if (data && data.success === false) throw new Error('API error');
      status.textContent = '';
      success.classList.remove('hidden');
      form.reset();
    } catch (err) {
      status.textContent = 'Something went wrong. Please try again.';
    }
  });
}

function init() {
  bindCTAButtons();
  enableSmoothAnchors();
  initMobileMenu();
  headerShadowOnScroll();
  initAccordion();
  initForm();
}

document.addEventListener('DOMContentLoaded', init);
