// Lightweight touch feedback helper
// Adds a `.pressed` class on touchstart and removes it on touchend/cancel.
(function () {
  if (typeof window === 'undefined') return;

  // Only activate on coarse pointers (touch) to avoid interfering with desktop mouse interactions
  var isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (!isCoarse) return;

  var pressedClass = 'pressed';

  function onStart(e) {
    var t = e.target;
    // Find nearest actionable element (a, button, or .term a)
    var el = t.closest && (t.closest('a') || t.closest('button'));
    if (!el) return;
    el.classList.add(pressedClass);
  }

  function onEnd(e) {
    var t = e.target;
    var el = t.closest && (t.closest('a') || t.closest('button'));
    if (!el) return;
    // Delay removal slightly to make the press visible for very quick taps
    setTimeout(function () { el.classList.remove(pressedClass); }, 80);
  }

  function onCancel(e) {
    var t = e.target;
    var el = t.closest && (t.closest('a') || t.closest('button'));
    if (!el) return;
    el.classList.remove(pressedClass);
  }

  document.addEventListener('touchstart', onStart, { passive: true });
  document.addEventListener('touchend', onEnd, { passive: true });
  document.addEventListener('touchcancel', onCancel, { passive: true });

  // Mouse fallback for devices that emulate touch
  document.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    var el = e.target.closest && (e.target.closest('a') || e.target.closest('button'));
    if (!el) return;
    el.classList.add(pressedClass);
  });
  document.addEventListener('mouseup', function (e) {
    var el = e.target.closest && (e.target.closest('a') || e.target.closest('button'));
    if (!el) return;
    setTimeout(function () { el.classList.remove(pressedClass); }, 50);
  });

})();
