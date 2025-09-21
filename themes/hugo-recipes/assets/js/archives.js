// Smoothly scroll to the selected archive month anchor and update the hash.
document.addEventListener('DOMContentLoaded', function () {
  var sel = document.querySelector('.archives-toc-select');
  if (!sel) return;
  sel.addEventListener('change', function (e) {
    var val = e.target.value;
    if (!val) return;
    // If the value is a hash (e.g. #month-0-september-2025)
    if (val.charAt(0) === '#') {
      var el = document.querySelector(val);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update the hash without adding a new history entry
        if (history.replaceState) {
          history.replaceState(null, '', val);
        } else {
          location.hash = val;
        }
      }
    }
  });
});
