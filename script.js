// Global Config (placeholders)
const CALENDAR_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeJ5qWw4iaDnkkNeC3mc_7ENr1qFnpOBm2LWKzsc7LoPqdQsQ/viewform?usp=dialog';
const STRIPE_CORE_URL = CALENDAR_URL;
const EMAIL_ENDPOINT = 'https://api.web3forms.com/submit'; // placeholder

function openExternal(url) {
  window.open(url, '_blank', 'noopener');
}

function bindCTAButtons() {
  // Remove old CTA button bindings since we're not using them anymore
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
  const form = document.getElementById('free-workout-form') || document.getElementById('starter-kit-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  const success = document.getElementById('form-success');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (status) status.textContent = 'Sending…';
    if (success) success.classList.add('hidden');

    const payload = {
      name: form.name?.value?.trim() || form.querySelector('#first-name')?.value?.trim() || '',
      email: form.email?.value?.trim() || form.querySelector('#email')?.value?.trim() || '',
      phone: form.phone?.value?.trim() || '',
      consent: form.consent?.checked || true,
      subject: form.querySelector('input[name="subject"]')?.value || 'Free 6-Day Workout Program Request',
    };

    try {
      const res = await fetch(form.action || EMAIL_ENDPOINT, {
        method: form.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json().catch(() => ({}));
      if (data && data.success === false) throw new Error('API error');
      if (status) status.textContent = '';
      if (success) {
        success.classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
    } catch (err) {
      if (status) status.textContent = 'Something went wrong. Please try again.';
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
