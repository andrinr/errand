(() => {
  'use strict';
  const container = document.querySelector('#cost-plot');
  const detail = document.querySelector('#plot-detail');
  const money = value => `$${value.toFixed(2)}`;
  const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const effortOrder = ['low', 'medium', 'high', 'xhigh', 'ultra', 'max', 'unhinged'];
  const familyOf = point => point.type === 'model' ? point.name.split(' / ')[0] : '';
  const families = [...new Set(participants.filter(p => p.type === 'model').map(familyOf))];
  const palette = ['#000080', '#a04000', '#7040a0', '#005c5c', '#b00040', '#526300', '#3658a0', '#69452c', '#e06510'];
  const familyColor = family => palette[families.indexOf(family) % palette.length];
  let selected = null;
  function render() {
    const points = participants.map((participant, i) => ({ ...participant, id: i, cost: totalCost(participant), performance: benchmarkScore(participant) }));
    const frontier = points.filter(point => !points.some(other => other.id !== point.id && other.cost <= point.cost && other.performance >= point.performance && (other.cost < point.cost || other.performance > point.performance))).sort((a, b) => a.cost - b.cost);
    const efficient = new Set(frontier.map(p => p.id));
    const axisMax = Math.max(200, Math.ceil(Math.max(...points.map(p => p.cost)) / 10000) * 10000);
    // Continuous, strictly increasing segments; the budget committee changed units twice.
    const x = value => 70 + 580 * (value <= 1 ? .35 * value : value <= 100 ? .35 + .35 * Math.log10(value) / 2 : .70 + .30 * Math.expm1(3 * (value - 100) / (axisMax - 100)) / Math.expm1(3));
    const y = value => 300 - value / 1000 * 240;
    let svg = '<svg viewBox="0 0 720 365" role="group" aria-label="Cost versus errand score. Cost axis switches from linear to logarithmic to exponential. Select a point for its invoice."><rect x="70" y="60" width="580" height="240" fill="#fffff0" stroke="#888"/>';
    for (const tick of [0, 200, 400, 600, 800, 1000]) svg += `<line x1="70" x2="650" y1="${y(tick)}" y2="${y(tick)}" stroke="#d5d5c9" stroke-dasharray="2 4"/><text x="57" y="${y(tick) + 4}" text-anchor="end">${tick}</text>`;
    for (const tick of [0, .5, 1, 10, 100, axisMax / 2, axisMax]) svg += `<line x1="${x(tick)}" x2="${x(tick)}" y1="60" y2="300" stroke="#d5d5c9" stroke-dasharray="2 4"/><text x="${x(tick)}" y="321" text-anchor="middle">${tick >= 1000 ? '$' + Math.round(tick / 1000) + 'k' : '$' + tick}</text>`;
    for (const boundary of [1, 100]) svg += `<line x1="${x(boundary)}" x2="${x(boundary)}" y1="48" y2="300" stroke="#b06000" stroke-dasharray="4 3"/>`;
    svg += '<text x="70" y="22" class="axis-title">Score ↑</text><text x="360" y="352" text-anchor="middle" class="axis-title">Cost per attempt → (US$)</text>';
    for (const family of families) {
      const variants = points.filter(p => familyOf(p) === family).sort((a, b) => effortOrder.indexOf(a.effort) - effortOrder.indexOf(b.effort));
      svg += `<polyline class="effort-path" data-family="${escape(family)}" data-point-ids="${variants.map(p => p.id).join(',')}" points="${variants.map(p => `${x(p.cost)},${y(p.performance)}`).join(' ')}" fill="none" stroke="${familyColor(family)}" stroke-width="1.8" stroke-opacity="0.6" pointer-events="none"><title>${escape(family)}: ${variants.map(p => escape(p.effort)).join(' → ')} (increasing effort)</title></polyline>`;
    }
    svg += `<polyline points="${frontier.map(point => `${x(point.cost)},${y(point.performance)}`).join(' ')}" fill="none" stroke="#008000" stroke-width="2.5" stroke-dasharray="7 4" class="pareto-path"/>`;
    // Draw low performers first so frontier markers remain visible at crowded low costs.
    for (const point of [...points].sort((a, b) => a.performance - b.performance)) {
      const px = x(point.cost), py = y(point.performance), color = point.role === 'management' ? '#800080' : point.type === 'human' ? '#008080' : familyColor(familyOf(point));
      const label = `${point.name}: ${money(point.cost)}, ${point.performance.toFixed(1)} points${efficient.has(point.id) ? ', Pareto-efficient' : ''}`;
      svg += `<g class="plot-point ${efficient.has(point.id) ? 'efficient' : ''} ${selected === point.id ? 'selected' : ''}" data-point="${point.id}" tabindex="0" role="button" aria-label="${escape(label)}"><title>${escape(label)}</title><circle cx="${px}" cy="${py}" r="14" fill="transparent"/>`;
      if (efficient.has(point.id)) svg += `<circle cx="${px}" cy="${py}" r="10" fill="none" stroke="#008000" stroke-width="2"/>`;
      svg += point.role === 'management' ? `<path d="M ${px} ${py - 7} l 7 7 l -7 7 l -7 -7 Z" fill="${color}" stroke="white"/>` : point.type === 'human' ? `<rect x="${px - 5}" y="${py - 5}" width="10" height="10" fill="${color}" stroke="white"/>` : `<circle cx="${px}" cy="${py}" r="5.5" fill="${color}" stroke="white"/>`;
      if (efficient.has(point.id)) svg += `<text x="${px + 13}" y="${py + (point.performance >= 900 ? -13 : -11)}" class="point-label">${escape(point.name)}</text>`;
      svg += '</g>';
    }
    svg += '</svg>'; container.innerHTML = svg;
    const show = id => {
      selected = id; document.querySelector('#plot-participant').value = String(id); const point = points[id];
      container.querySelectorAll('.plot-point').forEach(el => el.classList.toggle('selected', Number(el.dataset.point) === id));
      container.querySelectorAll('.effort-path').forEach(path => {
        const active = path.dataset.family === familyOf(point);
        path.setAttribute('stroke-width', active ? '3.5' : '1.8');
        path.setAttribute('stroke-opacity', active ? '1' : point.type === 'model' ? '0.18' : '0.6');
      });
      detail.textContent = `${point.name} · ${point.performance.toFixed(1)} points · ${point.score}/5 levels · ${point.time} per attempt · ${money(point.cost)} total. Compute: ${money(point.costs.compute)}; accidental subscriptions: ${money(point.costs.subscriptions)}; consumables / goods / perks: ${money(point.costs.consumables)} (${point.consumed}).`;
    };
    container.querySelectorAll('.plot-point').forEach(element => {
      element.onclick = () => show(Number(element.dataset.point));
      element.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); show(Number(element.dataset.point)); } };
    });
    document.querySelector('#frontier-summary').textContent = `Pareto frontier: ${frontier.map(point => point.name).join(' → ')}.`;
    document.querySelector('#invoice-status').textContent = 'Ready';
    document.querySelector('#cost-data').innerHTML = points.map(point => `<tr><td>${escape(point.name)}</td><td>${point.performance.toFixed(1)}</td><td>${money(point.costs.compute)}</td><td>${money(point.costs.subscriptions)}</td><td>${money(point.costs.consumables)}</td><td>${money(point.cost)}</td></tr>`).join('');
    if (selected !== null) show(selected);
  }
  document.querySelector('#effort-legend').innerHTML = families.map(family => `<span><i style="border-color:${familyColor(family)}"></i>${escape(family)}</span>`).join('');
  const picker = document.querySelector('#plot-participant');
  picker.innerHTML = '<option value="">Inspect a participant…</option>' + participants.map((p, i) => `<option value="${i}">${escape(p.name)}</option>`).join('');
  picker.addEventListener('change', () => { selected = picker.value === '' ? null : Number(picker.value); render(); if (selected === null) detail.textContent = 'Select a participant to inspect the invoice.'; });
  render();
})();
