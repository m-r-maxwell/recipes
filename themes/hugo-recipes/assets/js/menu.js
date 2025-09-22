// Simple menu toggle for mobile: toggles a class and aria attributes
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('menu-toggle');
  var nav = document.getElementById('main-nav');

  if (!btn || !nav) {
    console.warn('[menu] missing menu-toggle or main-nav');
    return;
  }

  /* No backdrop: rely on the toggle button for opening/closing to keep mobile UX simple */

  function openMenu() {
    btn.setAttribute('aria-expanded', 'true');
    nav.setAttribute('aria-hidden', 'false');
    nav.classList.add('open');
  }

  function closeMenu() {
    btn.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', 'true');
    nav.classList.remove('open');
  }

  // Make toggle reliable by listening for pointerup and click on the icon
  function toggleHandler(ev) {

    try { ev.stopPropagation(); } catch (e) {}
    var expanded = btn.getAttribute('aria-expanded') === 'true';
  if (expanded) { closeMenu(); } else { openMenu(); }
  }
  // Listen on pointerdown too as a fallback for devices/emulators where pointerup/click don't fire as expected
  btn.addEventListener('pointerdown', toggleHandler);
  btn.addEventListener('pointerup', toggleHandler);
  btn.addEventListener('click', toggleHandler);
  // Close when clicking/tapping outside the menu. Use capture so we run early.
  function outsideCloseHandler(ev) {
    if (!nav.classList.contains('open')) return;
    var target = ev.target;
    // If the click/tap is the toggle or inside the nav, ignore it
    if (target === btn || btn.contains(target)) return;
    if (target.closest && target.closest('#main-nav')) return;
    // Otherwise close
    closeMenu();
  }
  // Pointer-based and touch fallbacks attached in capture phase
  document.addEventListener('pointerup', outsideCloseHandler, { capture: true });
  document.addEventListener('touchend', outsideCloseHandler, { capture: true, passive: true });
  // Click fallback
  document.addEventListener('click', outsideCloseHandler, { capture: true });

  // Close on Escape for accessibility
  function escHandler(ev) {
    var k = ev.key || ev.keyIdentifier || ev.keyCode;
    if (k === 'Escape' || k === 'Esc' || k === 27 || k === '27') {
      if (nav.classList.contains('open')) {
        closeMenu();
        try { btn.focus(); } catch (e) {}
      }
    }
  }
  document.addEventListener('keydown', escHandler, true);
  document.addEventListener('keyup', escHandler, true);

  // If a link inside the nav is clicked, close the menu (mobile behavior)
  nav.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a');
    if (a) {
      closeMenu();
    }
  });
});
