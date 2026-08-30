// Simple client-side search: fetch /index.json and perform a naive substring search.

(async function(){
  if (typeof window === 'undefined') return;
  window.themeSearch = {
    index: null,
    async load() {
      if (this.index) return this.index;
      try {
        // Determine the base path for the site dynamically. When the theme is
        // served from a subpath (for example `/recipes/`) a hardcoded
        // `/index.json` will point to the domain root and fail. Derive the
        // base from the script URL that loaded this file (works with Hugo's
        // resource pipeline and fingerprinting).
        let base = '/';
        try {
          const scripts = Array.from(document.getElementsByTagName('script'));
          // Find the script that contains "js/search" in its src
          const s = scripts.find(el => el.src && /\/js\/search(\.|$)/.test(el.src));
          if (s && s.src) {
            const u = new URL(s.src, window.location.origin);
            base = u.pathname.replace(/\/js\/search.*$/, '/');
          }
        } catch (e) {
          // fall back to root-relative
          base = '/';
        }

        const res = await fetch(base + 'index.json');
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

      // If the query is empty, clear results and don't show "No results".
      if (!q || !q.trim()) {
        results.innerHTML = '';
        srStatus.textContent = '';
        return;
      }

      const items = await window.themeSearch.query(q);
      results.replaceChildren();
      const matches = items.slice(0, 50);
      if (matches.length === 0) {
        const item = document.createElement('li');
        item.textContent = 'No results';
        results.appendChild(item);
      } else {
        matches.forEach(i => {
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.href = i.url;
          link.textContent = i.title;
          const summary = document.createElement('p');
          summary.textContent = i.summary;
          item.append(link, summary);
          results.appendChild(item);
        });
      }
      // Announce results count for screen readers
      const count = items.length;
      srStatus.textContent = count ? `${count} result${count === 1 ? '' : 's'} found` : 'No results';
    });
  });
})();
