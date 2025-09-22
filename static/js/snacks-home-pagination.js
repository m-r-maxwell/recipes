(function () {
  'use strict';

  function $id(id) { return document.getElementById(id); }

  function renderList(container, items) {
    if (!container) return;
    var ul = document.createElement('ul');
    items.forEach(function (it) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = it.url;
      a.textContent = it.title;
      var t = document.createElement('time');
      t.dateTime = '';
      t.textContent = it.date;
      li.appendChild(a);
      li.appendChild(document.createTextNode(' '));
      li.appendChild(t);
      ul.appendChild(li);
    });
    container.innerHTML = '';
    container.appendChild(ul);
  }

  function renderPagination(nav, currentPage, totalPages) {
    nav.innerHTML = '';
    if (totalPages <= 1) return;
    if (currentPage > 1) {
      var prev = document.createElement('a'); prev.href='#'; prev.className='prev'; prev.textContent='\u2190 Newer';
      prev.addEventListener('click', function (e) { e.preventDefault(); goToPage(currentPage-1); });
      nav.appendChild(prev);
    }
    for (var i=1;i<=totalPages;i++){
      if (i===currentPage){
        var span = document.createElement('span'); span.className='page current'; span.textContent = i; nav.appendChild(span);
      } else {
        var a = document.createElement('a'); a.href='#'; a.className='page'; a.textContent = i;
        (function(p){ a.addEventListener('click', function(e){ e.preventDefault(); goToPage(p); }); })(i);
        nav.appendChild(a);
      }
    }
    if (currentPage < totalPages) {
      var next = document.createElement('a'); next.href='#'; next.className='next'; next.textContent='Older \u2192';
      next.addEventListener('click', function (e) { e.preventDefault(); goToPage(currentPage+1); });
      nav.appendChild(next);
    }
  }

  var snacksDataEl = $id('snacks-data');
  if (!snacksDataEl) return;
  var items = [];
  try { items = JSON.parse(snacksDataEl.textContent || '[]'); } catch (e) { items = []; }
  var perPage = 5;
  var container = $id('snacks-list');
  var nav = $id('snacks-pagination');
  if (!container) return;
  try {
    var attr = $id('snacks-home').getAttribute('data-per-page');
    if (attr) perPage = parseInt(attr, 10) || perPage;
  } catch (e){}

  var totalPages = Math.max(1, Math.ceil(items.length / perPage));
  var current = 1;

  function goToPage(p) {
    if (p < 1) p = 1; if (p > totalPages) p = totalPages; current = p;
    var start = (current-1)*perPage; var pageItems = items.slice(start, start+perPage);
    renderList(container, pageItems);
    renderPagination(nav, current, totalPages);
    if (totalPages>1) nav.hidden = false; else nav.hidden = true;
  }

  // expose goToPage for closure usage
  window.goToSnacksPage = goToPage;

  // initial render
  goToPage(1);

})();
