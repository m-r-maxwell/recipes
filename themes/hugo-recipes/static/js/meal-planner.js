// Minimal Meal Planner
// - Loads /index.json (site list.json) to get recipes and tags
// - Lets user pick tags and number of meals (1-4)
// - Picks random recipes matching selected tags and shows aggregated macros

async function loadData() {
  const candidates = ['/recipes/index.json', '/index.json'];
  for (const p of candidates) {
    try {
      const resp = await fetch(p);
      if (resp.ok) return resp.json();
    } catch (e) {
      // continue trying
    }
  }
  throw new Error('Failed to load data from /recipes/index.json or /index.json');
}

function parseMacros(text) {
  // crude parser: look for "NNN Calories" and "XXg Protein|Carbs|Fat"
  const res = { calories: null, protein: null, carbs: null, fat: null };
  const cal = text.match(/(\d{2,4})\s*Calories/i);
  if (cal) res.calories = Number(cal[1]);
  const prot = text.match(/(\d{1,3})g\s*Protein/i);
  if (prot) res.protein = Number(prot[1]);
  const carbs = text.match(/(\d{1,3})g\s*Carbs/i);
  if (carbs) res.carbs = Number(carbs[1]);
  const fat = text.match(/(\d{1,3})g\s*Fat/i);
  if (fat) res.fat = Number(fat[1]);
  return res;
}

function sumMacros(list) {
  return list.reduce((acc, cur) => {
    acc.calories += (cur.calories || 0);
    acc.protein += (cur.protein || 0);
    acc.carbs += (cur.carbs || 0);
    acc.fat += (cur.fat || 0);
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function matchByTags(item, selectedTags) {
  if (!selectedTags || selectedTags.length === 0) return true;
  const tags = (item.tags || []).map(t => t.toLowerCase());
  // OR semantics: match if item has any of the selected tags
  return selectedTags.some(st => tags.includes(st.toLowerCase()));
}

function combinations(arr, k) {
  const results = [];
  const combo = [];
  function helper(start, depth) {
    if (depth === 0) {
      results.push(combo.slice());
      return;
    }
    for (let i = start; i <= arr.length - depth; i++) {
      combo.push(arr[i]);
      helper(i + 1, depth - 1);
      combo.pop();
    }
  }
  helper(0, k);
  return results;
}

function scoreComboByStrategy(sum, strategy, totalTarget, count) {
  // weights for balanced scoring
  const wcal = 1, wprot = 2, wcarb = 0.5, wfat = 0.5;
  if (strategy === 'high-protein') {
    // maximize protein, prefer closer to calorie target as tie-breaker
    return - (sum.protein || 0) + 0.001 * Math.abs((sum.calories || 0) - (totalTarget || 0));
  }
  if (strategy === 'balanced') {
    const protTarget = 30 * count; // default protein target per meal
    const carbTarget = 50 * count;
    const fatTarget = 20 * count;
    const calDiff = ((sum.calories || 0) - (totalTarget || 0));
    const pDiff = ((sum.protein || 0) - protTarget);
    const cDiff = ((sum.carbs || 0) - carbTarget);
    const fDiff = ((sum.fat || 0) - fatTarget);
    return Math.sqrt(wcal * calDiff * calDiff + wprot * pDiff * pDiff + wcarb * cDiff * cDiff + wfat * fDiff * fDiff);
  }
  // default: closest to calories
  return Math.abs((sum.calories || 0) - (totalTarget || 0));
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await loadData();
    const items = data.map(i => ({
      title: i.title,
      url: i.url,
      summary: i.summary,
      tags: i.tags || [],
      ...parseMacros(i.summary + ' ' + i.content)
    }));

    // build tag list
    const tagSet = new Set();
    items.forEach(i => (i.tags || []).forEach(t => tagSet.add(t)));
    const tags = Array.from(tagSet).sort();

    const tagsContainer = document.getElementById('planner-tags-list');
    if (!tagsContainer) {
      console.warn('Meal planner: #planner-tags-list not found — aborting initialization');
      return;
    }
    tags.forEach(t => {
      const label = document.createElement('label');
      label.className = 'planner-tag';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = t;
      input.setAttribute('aria-checked', 'false');
      label.appendChild(input);
      const span = document.createElement('span');
      span.textContent = ' ' + t;
      label.appendChild(span);
      tagsContainer.appendChild(label);
    });

    const generateBtn = document.getElementById('planner-generate');
    if (!generateBtn) {
      console.warn('Meal planner: #planner-generate button not found — planner controls unavailable');
      return;
    }
    generateBtn.addEventListener('click', () => {
      const selected = Array.from(document.querySelectorAll('#planner-tags-list input[type=checkbox]:checked')).map(i => i.value);
      const count = Number(document.getElementById('planner-count').value) || 1;
      const strategy = (document.getElementById('planner-strategy').value) || 'closest';
      const targetCaloriesInput = Number(document.getElementById('planner-calories').value) || 0;

      let pool = items.filter(i => matchByTags(i, selected));

      // If a calorie target is provided, prefer recipes that have calories defined
      if (targetCaloriesInput > 0) {
        pool = pool.filter(p => p.calories != null);
      }

      if (pool.length === 0) {
        const main = document.getElementById('planner-list');
        main.innerHTML = '<li>No recipes match the selected tags/filters.</li>';
        return;
      }

      // Determine total target calories (use provided total or default per-meal * count)
      const perMealDefault = 600;
      const totalTarget = targetCaloriesInput > 0 ? targetCaloriesInput : perMealDefault * count;

      // limit pool by closeness to per-meal calories (reduce combinatorial explosion)
      const perMealTarget = Math.max(50, Math.round(totalTarget / count));
      pool.sort((a, b) => {
        const aDiff = Math.abs((a.calories || perMealTarget) - perMealTarget);
        const bDiff = Math.abs((b.calories || perMealTarget) - perMealTarget);
        return aDiff - bDiff;
      });
      const MAX_POOL = 40;
      const reduced = pool.slice(0, Math.min(MAX_POOL, pool.length));

      // Generate combos and score them
      const combos = combinations(reduced, count);
      let best = null;
      let bestScore = Infinity;
      for (const combo of combos) {
        const sum = sumMacros(combo);
        const s = scoreComboByStrategy(sum, strategy, totalTarget, count);
        if (s < bestScore) {
          bestScore = s;
          best = { combo, sum, score: s };
        }
      }

      const chosen = best ? best.combo : [];

      const list = document.getElementById('planner-list');
      list.innerHTML = '';
      chosen.forEach(c => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${c.url}">${c.title}</a> - ${c.tags.join(', ')} <br> ${c.calories || '-'} cal | ${c.protein || '-'}g P | ${c.carbs || '-'}g C | ${c.fat || '-'}g F`;
        list.appendChild(li);
      });

      const totals = best ? best.sum : { calories: 0, protein: 0, carbs: 0, fat: 0 };
      const totalsDiv = document.getElementById('planner-totals');
      totalsDiv.innerHTML = `Calories: ${totals.calories} | Protein: ${totals.protein}g | Carbs: ${totals.carbs}g | Fat: ${totals.fat}g`;
        // planner chosen recipes (shopping list removed)
    });

    /* Shopping-list UI and helpers commented out per user request.
    const shopWrapper = document.createElement('div');
    shopWrapper.className = 'planner-shopping-wrapper';
    shopWrapper.style.marginTop = '1rem';

    const shopBtn = document.createElement('button');
    shopBtn.id = 'planner-generate-list';
    shopBtn.textContent = 'Generate Shopping List';
    shopBtn.type = 'button';
    shopBtn.style.marginRight = '0.5rem';
    shopWrapper.appendChild(shopBtn);

    const copyBtn = document.createElement('button');
    copyBtn.id = 'planner-copy-list';
    copyBtn.textContent = 'Copy';
    copyBtn.type = 'button';
    copyBtn.style.display = 'none';
    shopWrapper.appendChild(copyBtn);

    const shopArea = document.createElement('textarea');
    shopArea.id = 'planner-shopping-area';
    shopArea.rows = 8;
    shopArea.style.width = '100%';
    shopArea.style.marginTop = '0.5rem';
    shopArea.placeholder = 'Shopping list will appear here...';
    shopWrapper.appendChild(shopArea);

    const plannerContainer = document.getElementById('planner-controls') || document.body;
    plannerContainer.appendChild(shopWrapper);

    function extractIngredients(text) {
      if (!text) return [];
      // find Ingredients ... Steps/Instructions or blank line
      const m = text.match(/Ingredients[:\s]*\n([\s\S]*?)(?:\n\s*\n|\nSteps[:\s]|\nInstructions[:\s]|\nDirections[:\s]|$)/i);
      let block = '';
      if (m && m[1]) block = m[1];
      else {
        // try inline 'Ingredients' on single line
        const n = text.match(/Ingredients[:\s]*([^\n]*?)((?:Steps|Instructions)|$)/i);
        if (n && n[1]) block = n[1];
      }
      if (!block) return [];
      // split lines or double-space separated items
      let lines = block.split(/\n|\r|\s{2,}/).map(s => s.trim()).filter(Boolean);
      // filter out headings like "Ingredients (4 Servings)"
      lines = lines.filter(l => !/^Ingredients?/i.test(l) && !/^Servings?/i.test(l));
      return lines;
    }

    function normalizeIngredient(line) {
      let s = line.toLowerCase().trim();
      // remove leading quantity and common units
      s = s.replace(/^[\d\s\/.,-]+/, '');
      s = s.replace(/^(?:\b(?:g|kg|tbsp|tablespoon|tablespoons|cup|cups|tsp|teaspoon|teaspoons|oz|ml|lb|lbs|pound|pounds)\b[\s,]*)+/i, '');
      // collapse spaces
      s = s.replace(/\s+/g, ' ').trim();
      return s;
    }

    shopBtn.addEventListener('click', () => {
      const chosen = (window.__planner_chosen) || [];
      if (!chosen || chosen.length === 0) {
        shopArea.value = 'No chosen recipes to build a shopping list from. Generate a plan first.';
        copyBtn.style.display = 'none';
        return;
      }
      const map = new Map();
      chosen.forEach(item => {
        const text = (item.summary || '') + '\n' + (item.content || '');
        const ings = extractIngredients(text);
        ings.forEach(orig => {
          const norm = normalizeIngredient(orig) || orig.toLowerCase();
          if (!map.has(norm)) map.set(norm, { examples: new Set(), count: 0 });
          const entry = map.get(norm);
          entry.examples.add(orig);
          entry.count += 1;
        });
      });
      if (map.size === 0) {
        shopArea.value = 'No ingredients found in selected recipes.';
        copyBtn.style.display = 'none';
        return;
      }
      const lines = [];
      for (const [norm, data] of map.entries()) {
        const ex = Array.from(data.examples)[0];
        const note = data.count > 1 ? ` (from ${data.count} recipes)` : '';
        lines.push(`${ex}${note}`);
      }
      shopArea.value = lines.join('\n');
      copyBtn.style.display = 'inline-block';
    });

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(document.getElementById('planner-shopping-area').value);
        copyBtn.textContent = 'Copied';
        setTimeout(() => copyBtn.textContent = 'Copy', 2000);
      } catch (e) {
        console.error('copy failed', e);
      }
    });
    */
  } catch (e) {
    console.error('meal planner error', e);
    const main = document.getElementById('content') || document.body;
    const p = document.createElement('p');
    p.textContent = 'Failed to load meal data.';
    main.appendChild(p);
  }
});
