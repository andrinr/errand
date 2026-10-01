(() => {
  'use strict';
  const container = document.querySelector('#cost-plot');
  const detail = document.querySelector('#plot-detail');
  const money = value => `$${value.toFixed(2)}`;
  const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const modeControl = document.querySelector('#axis-mode');
  let selected = null;
  function render() {
    const points = participants.map((participant, i) => ({ ...participant, id: i, cost: totalCost(participant), performance: participant.score / tasks.length * 100 }));
    const frontier = points.filter(point => !points.some(other => other.id !== point.id && other.cost <= point.cost && other.performance >= point.performance && (other.cost < point.cost || other.performance > point.performance))).sort((a, b) => a.cost - b.cost);
    const efficient = new Set(frontier.map(p => p.id));
    const mode = modeControl.value;
    const logX = value => Math.log10(1 + value) / Math.log10(151);
    const costs = [...new Set(points.map(p => p.cost))].sort((a, b) => a - b);
    const x = value => 70 + (mode === 'reverse' ? 1 - logX(value) : mode === 'vibes' ? costs.indexOf(value) / (costs.length - 1) : logX(value)) * 580;
    const y = value => 300 - (mode === 'launch' ? Math.pow(value / 100, 8) : value / 100) * 240;
    const disclosures = {
      honest: 'Fixed axes. Full invoice. No gradient was harmed to improve this result.',
      launch: 'AXIS TRICK: completion is raised to the 8th power. 80% lands at 16.8% of the chart height. Scores are unchanged. The gap has a launch budget.',
      reverse: 'AXIS TRICK: cost runs backwards. Expensive models move left. Lower cost is now RIGHT. The invoice has not decreased.',
      vibes: 'AXIS TRICK: invoices are equally spaced by rank, regardless of dollar gaps. Distance has no monetary meaning. npm install credibility.'
    };
    document.querySelector('#axis-disclosure').textContent = disclosures[mode];
    document.querySelector('.plot-legend > span:last-child').textContent = mode === 'reverse' ? '↗ Lower cost, higher completion' : '↖ Lower cost, higher completion';
    let svg = '<svg viewBox="0 0 720 365" role="group" aria-label="Fictional cost versus completion plot. Axis manipulation is disclosed above. Select a point for its full invoice."><rect x="70" y="60" width="580" height="240" fill="#fffff0" stroke="#888"/>';
    for (const tick of (mode === 'launch' ? [0, 80, 90, 95, 100] : [0, 20, 40, 60, 80, 100])) svg += `<line x1="70" x2="650" y1="${y(tick)}" y2="${y(tick)}" stroke="#d5d5c9" stroke-dasharray="2 4"/><text x="57" y="${y(tick) + 4}" text-anchor="end">${tick}%</text>`;
    const ticks = mode === 'vibes' ? costs.filter((_, i) => i % 3 === 0 || i === costs.length - 1) : [0, 1, 10, 100];
    for (const tick of ticks) svg += `<line x1="${x(tick)}" x2="${x(tick)}" y1="60" y2="300" stroke="#d5d5c9" stroke-dasharray="2 4"/><text x="${x(tick)}" y="321" text-anchor="middle">${money(tick)}</text>`;
    svg += `<text x="70" y="29" class="axis-title">${mode === 'launch' ? 'Completion ↑ (warped: eighth-power scale)' : 'Errands completed ↑'}</text><text x="360" y="350" text-anchor="middle" class="axis-title">${mode === 'vibes' ? 'Invoice rank → (NOT proportional to cost)' : mode === 'reverse' ? '← Cost per attempt (US$, reversed log scale)' : 'Cost per attempt → (US$, log scale)'}</text>`;
    svg += `<polyline points="${frontier.map(point => `${x(point.cost)},${y(point.performance)}`).join(' ')}" fill="none" stroke="#008000" stroke-width="2.5" stroke-dasharray="7 4" class="pareto-path"/>`;
    // Draw low performers first so frontier markers remain visible at crowded low costs.
    for (const point of [...points].sort((a, b) => a.performance - b.performance)) {
      const px = x(point.cost), py = y(point.performance), color = point.type === 'human' ? '#008080' : '#000080';
      const label = `${point.name}: ${money(point.cost)}, ${point.performance.toFixed(0)}% completion${efficient.has(point.id) ? ', Pareto-efficient' : ''}`;
      svg += `<g class="plot-point ${efficient.has(point.id) ? 'efficient' : ''} ${selected === point.id ? 'selected' : ''}" data-point="${point.id}" tabindex="0" role="button" aria-label="${escape(label)}"><title>${escape(label)}</title><circle cx="${px}" cy="${py}" r="14" fill="transparent"/>`;
      if (efficient.has(point.id)) svg += `<circle cx="${px}" cy="${py}" r="10" fill="none" stroke="#008000" stroke-width="2"/>`;
      svg += point.type === 'human' ? `<rect x="${px - 5}" y="${py - 5}" width="10" height="10" fill="${color}" stroke="white"/>` : `<circle cx="${px}" cy="${py}" r="5.5" fill="${color}" stroke="white"/>`;
      if (efficient.has(point.id)) svg += `<text x="${px + 13}" y="${py + (point.performance === 100 ? -13 : -11)}" class="point-label">${escape(point.name)}</text>`;
      svg += '</g>';
    }
    svg += '</svg>'; container.innerHTML = svg;
    const show = id => {
      selected = id; document.querySelector('#plot-participant').value = String(id); const point = points[id];
      container.querySelectorAll('.plot-point').forEach(el => el.classList.toggle('selected', Number(el.dataset.point) === id));
      detail.textContent = `${point.name} · ${point.performance.toFixed(0)}% complete · ${money(point.cost)} total. Compute: ${money(point.costs.compute)}; accidental subscriptions: ${money(point.costs.subscriptions)}; consumables: ${money(point.costs.consumables)} (${point.consumed}). Every charge counts, including failed attempts.`;
    };
    container.querySelectorAll('.plot-point').forEach(element => {
      element.onclick = () => show(Number(element.dataset.point));
      element.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); show(Number(element.dataset.point)); } };
    });
    document.querySelector('#frontier-summary').textContent = `Pareto frontier: ${frontier.map(point => point.name).join(' → ')}. Billing is a side effect. Side effects count.`;
    document.querySelector('#invoice-status').textContent = 'Invoice: subscriptions + consumables always included';
    document.querySelector('#cost-data').innerHTML = points.map(point => `<tr><td>${escape(point.name)}</td><td>${point.performance.toFixed(0)}%</td><td>${money(point.costs.compute)}</td><td>${money(point.costs.subscriptions)}</td><td>${money(point.costs.consumables)}</td><td>${money(point.cost)}</td></tr>`).join('');
    if (selected !== null) show(selected);
  }
  const effortOrder = ['low', 'medium', 'high', 'xhigh', 'ultra', 'max', 'unhinged'];
  document.querySelector('#effort-comparisons').innerHTML = [...new Set(participants.filter(p => p.type === 'model').map(p => p.company))].map(company => {
    const variants = participants.filter(p => p.company === company).sort((a, b) => effortOrder.indexOf(a.effort) - effortOrder.indexOf(b.effort));
    const regresses = variants.some((p, i) => i > 0 && p.score < variants[i - 1].score);
    return `<div class="effort-pair"><b>${escape(company)} parody</b><span>${variants.map(p => `${escape(p.effort)}: ${p.score}/5 · ${money(totalCost(p))}`).join(' → ')}</span><small>${regresses ? 'REGRESSION: more effort eventually completes fewer errands.' : 'PLATEAU: the invoice scales more reliably than the score.'}</small></div>`;
  }).join('');
  const picker = document.querySelector('#plot-participant');
  picker.innerHTML = '<option value="">Inspect a participant…</option>' + participants.map((p, i) => `<option value="${i}">${escape(p.name)}</option>`).join('');
  picker.addEventListener('change', () => { selected = picker.value === '' ? null : Number(picker.value); render(); if (selected === null) detail.textContent = 'Select a participant to inspect the invoice.'; });
  modeControl.addEventListener('change', render);
  document.querySelector('#reset-axes').addEventListener('click', () => { modeControl.value = 'honest'; render(); });
  render();
})();
