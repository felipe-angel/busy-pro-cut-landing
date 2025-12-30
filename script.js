// Global Config
const CALENDAR_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeJ5qWw4iaDnkkNeC3mc_7ENr1qFnpOBm2LWKzsc7LoPqdQsQ/viewform?usp=dialog';
const EMAIL_ENDPOINT = '/api/starter-kit';

// Note: Stripe is no longer used for downloads. All assets are free (soft-gated by the form).

// Temporary site-wide maintenance mode
// Set to false to re-enable the site.
const MAINTENANCE_MODE = false;

function openExternal(url) {
  window.open(url, '_blank', 'noopener');
}

function showMaintenanceModal() {
  if (!MAINTENANCE_MODE) return;
  if (document.getElementById('maintenance-overlay')) return;

  // Prevent background scroll
  try { document.documentElement.style.overflow = 'hidden'; } catch (_) {}
  try { document.body.style.overflow = 'hidden'; } catch (_) {}

  const overlay = document.createElement('div');
  overlay.id = 'maintenance-overlay';
  overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4';
  overlay.innerHTML = `
    <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/10">
      <div class="flex items-center justify-between gap-4">
        <div class="text-lg font-extrabold text-slate-900">Maintenance in progress</div>
        <span class="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Temporary</span>
      </div>
      <p class="mt-3 text-slate-700">
        I’m doing some quick updates. Please come back tomorrow to get your <strong>free workout routine</strong>,
        <strong>fat loss blueprint</strong>, and <strong>training blueprint</strong>.
      </p>
      <p class="mt-3 text-sm text-slate-500">Thanks for your patience.</p>
    </div>
  `;

  document.body.appendChild(overlay);
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
  const forms = [
    document.getElementById('free-workout-form'),
    document.getElementById('bundle-form'),
    document.getElementById('starter-kit-form'),
  ].filter(Boolean);

  forms.forEach((form) => {
    const status =
      (form.id === 'bundle-form' && document.getElementById('bundle-form-status')) ||
      document.getElementById('form-status');
    const success = document.getElementById('form-success');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (status) status.textContent = 'Sending…';
      if (success && form.id === 'free-workout-form') success.classList.add('hidden');

      const payload = {
        name: form.name?.value?.trim() || form.querySelector('[name="name"]')?.value?.trim() || '',
        email: form.email?.value?.trim() || form.querySelector('[name="email"]')?.value?.trim() || '',
        phone: form.phone?.value?.trim() || form.querySelector('[name="phone"]')?.value?.trim() || '',
        product: form.querySelector('input[name="product"]')?.value || '',
        page: window.location.href,
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

        const data = await res.json().catch(() => ({}));
        if (!res.ok || (data && data.success === false)) {
          throw new Error(data?.message || 'Network error');
        }

        if (data && data.redirect) {
          window.location.href = data.redirect;
          return;
        }

        if (status) status.textContent = '';
        if (success && form.id === 'free-workout-form') {
          success.classList.remove('hidden');
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        form.reset();
      } catch (err) {
        if (status) status.textContent = err?.message || 'Something went wrong. Please try again.';
      }
    });
  });
}

function initStripeButtons() {
  // legacy no-op
}

function init() {
  showMaintenanceModal();
  bindCTAButtons();
  enableSmoothAnchors();
  initMobileMenu();
  headerShadowOnScroll();
  initAccordion();
  initForm();
}

document.addEventListener('DOMContentLoaded', init);







