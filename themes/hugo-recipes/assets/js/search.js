// Simple client-side search: fetch /index.json and perform a naive substring search.

(async function(){
  if (typeof window === 'undefined') return;
  window.themeSearch = {
    index: null,
    async load() {
      if (this.index) return this.index;
      try {
        const res = await fetch('/index.json');
        this.index = await res.json();
        return this.index;
      } catch (e) {
        console.warn('Search index load failed', e);
        this.index = [];
        return this.index;
      }
    },
    async query(q){
      q = (q||'').trim().toLowerCase();
      if (!q) return [];
      await this.load();
      return this.index.filter(item => {
        return (item.title||'').toLowerCase().includes(q)
          || (item.summary||'').toLowerCase().includes(q)
          || (item.content||'').toLowerCase().includes(q)
          || (item.tags||[]).join(' ').toLowerCase().includes(q)
      });
    }
  };

  // If a search UI is present on the page, wire it up
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('input[data-theme-search]');
    let results = document.querySelector('[data-theme-search-results]');
    // Ensure results container has an ID for aria-controls
    if (results && !results.id) results.id = 'theme-search-results';
    results = document.getElementById('theme-search-results');
    // Create (or use) a status node for screen readers to announce counts
    let srStatus = document.getElementById('theme-search-status');
    if (!srStatus) {
      srStatus = document.createElement('div');
      srStatus.id = 'theme-search-status';
      srStatus.setAttribute('aria-live', 'polite');
      srStatus.setAttribute('aria-atomic', 'true');
      srStatus.style.position = 'absolute';
      srStatus.style.width = '1px';
      srStatus.style.height = '1px';
      srStatus.style.overflow = 'hidden';
      srStatus.style.clip = 'rect(1px, 1px, 1px, 1px)';
      document.body.appendChild(srStatus);
    }
    if (!input || !results) return;
    let last = null;
    input.addEventListener('input', async (e) => {
      const q = e.target.value;
      if (q === last) return;
      last = q;
      const items = await window.themeSearch.query(q);
      results.innerHTML = items.slice(0, 50).map(i => `
        <li><a href="${i.url}">${i.title}</a><p>${i.summary}</p></li>
      `).join('\n') || '<li>No results</li>';
      // Announce results count for screen readers
      const count = items.length;
      srStatus.textContent = count ? `${count} result${count === 1 ? '' : 's'} found` : 'No results';
    });
  });
})();
