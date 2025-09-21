// Simple menu toggle for mobile: toggles a class and aria attributes
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('menu-toggle');
  var nav = document.getElementById('main-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    nav.setAttribute('aria-hidden', String(expanded));
    nav.classList.toggle('open');
  });
});
