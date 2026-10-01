const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('site/index.html', 'utf8');
const gameCode = fs.readFileSync('site/games.js', 'utf8');

function fixture(index, mode = 'practice') {
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://example.test/' });
  const w = dom.window, d = w.document;
  let now = 0, id = 0;
  const frames = new Map();
  Object.defineProperty(w.performance, 'now', { value: () => now });
  w.requestAnimationFrame = cb => { frames.set(++id, cb); return id; };
  w.cancelAnimationFrame = n => frames.delete(n);
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  const step = seconds => {
    for (let left = seconds * 1000; left > 0;) {
      const dt = Math.min(20, left); now += dt; left -= dt;
      const pending = [...frames.values()]; frames.clear(); pending.forEach(cb => cb(now));
    }
  };
  w.eval(gameCode);
  d.querySelector('#difficulty').value = mode;
  w.openGame(index);
  const buttons = () => [...d.querySelectorAll('#game-arena button')];
  const find = name => {
    const b = buttons().find(b => b.textContent === name && !b.disabled);
    assert.ok(b, `Enabled button exists: ${name}`); return b;
  };
  const click = name => find(name).click();
  const field = label => {
    const el = [...d.querySelectorAll('.game-field')].find(e => e.firstChild.textContent === label);
    assert.ok(el, `Field exists: ${label}`); return el.querySelector('select,input');
  };
  const choose = (label, value) => { const el = field(label); el.value = value; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  const check = (label, value) => {
    const el = [...d.querySelectorAll('.game-check')].find(e => e.textContent === label);
    assert.ok(el, `Checkbox exists: ${label}`); const input = el.querySelector('input');
    if (input.checked !== value) input.click();
  };
  const closeErrors = () => { let guard = 20; while (d.querySelector('.office-error .close') && guard--) d.querySelector('.office-error .close').click(); assert.ok(guard > 0); };
  const won = () => assert.ok(d.querySelector('.result-overlay.success'), d.querySelector('#game-message').textContent);
  return { w, d, step, find, click, choose, check, closeErrors, won, close: () => dom.window.close() };
}

test('opening, changing and retrying games arms the timer; only the first action starts it', () => {
  const f = fixture(0, 'cursed');
  f.step(200); assert.match(f.d.querySelector('#game-time').textContent, /75s · ready/);
  assert.equal(f.d.querySelector('#game-actions').textContent, 'ACTIONS: 0');
  f.d.querySelector('#hint-button').click(); f.step(3);
  assert.match(f.d.querySelector('#game-time').textContent, /ready/);
  f.click('Print'); f.step(2); assert.match(f.d.querySelector('#game-time').textContent, /71\.0s/);
  f.d.querySelector('#start-game').click(); f.step(150);
  assert.match(f.d.querySelector('#game-time').textContent, /ready/);
  const selector = f.d.querySelector('#game-select'); selector.value = '3'; selector.dispatchEvent(new f.w.Event('change'));
  assert.ok(f.d.querySelector('.desk-scene')); assert.match(f.d.querySelector('#game-time').textContent, /120s · ready/);
  f.close();
});

function configurePrinter(f) {
  f.click('Document');
  f.choose('Printer', 'local'); f.choose('Pages', 'one'); f.choose('Paper size', 'a4'); f.choose('Copies', '1');
  f.choose('Orientation', 'portrait'); f.choose('Scaling', 'raw');
  f.click('Driver'); f.choose('Driver profile', 'app'); f.choose('Color mode', 'k'); f.choose('Paper source', 'tray1'); f.choose('Duplex', 'simplex');
  f.check('Automatic driver recovery (recommended)', false);
  f.click('Diagnostics'); f.click('Hardware'); f.click('Open paper tray'); f.click('Remove crumpled sheet'); f.closeErrors();
}
function releaseAndCollect(f) {
  f.step(3); assert.ok(!f.d.querySelector('.success'));
  const pin = f.d.querySelector('[aria-label="Release PIN"]'); pin.value = '042'; pin.dispatchEvent(new f.w.Event('input'));
  f.click('Release print job'); f.step(1); assert.ok(!f.d.querySelector('.success'));
  f.click('Collect output'); f.won();
}

test('printer: crash recovery, effective settings, physical jam, secure release and collection all matter', () => {
  const f = fixture(0);
  f.click('Print'); assert.match(f.d.querySelector('#game-message').textContent, /Spooler crash/); f.closeErrors();
  configurePrinter(f); f.click('Restart spooler');
  f.choose('Color mode', 'bw'); f.click('Print'); assert.ok(!f.d.querySelector('.success'));
  f.click('Diagnostics'); assert.match(f.d.querySelector('.effective-settings').textContent, /CMY composite/);
  f.choose('Color mode', 'k'); f.click('Print'); releaseAndCollect(f); f.close();
});

function wireProjector(f) {
  const present = [...f.d.querySelectorAll('#game-arena button')].find(b => b.textContent === 'Present slide');
  if (!present.hidden) f.click('Present slide');
  f.choose('Adapter from drawer', 'video'); f.choose('Wall socket', '2');
  f.click('Connect cable'); f.click('Connect adapter power'); f.click('Open lens shutter');
  f.click('2 / Signal lab');
  f.choose('Input source', '2'); f.choose('Display mode', 'duplicate');
  f.choose('Resolution', '1080'); f.choose('Refresh rate', '60'); f.choose('Color format', 'rgb');
}
function calibrateProjector(f) {
  f.click('3 / Audience view'); f.choose('Content to share', 'pattern');
  f.check('Overscan (recommended: fill screen)', false); f.click('Verify four corners');
  f.choose('Content to share', 'slides'); f.check('Show desktop notifications while presenting', false);
}
test('projector: discover hardware, negotiate native timing, calibrate and verify in both modes', () => {
  for (const mode of ['practice', 'cursed']) {
    const f = fixture(1, mode);
    f.step(200); assert.match(f.d.querySelector('#game-time').textContent, /ready/);
    f.click('Connect cable'); assert.match(f.d.querySelector('#game-message').textContent, /only charges/);
    wireProjector(f); f.check('Automatically switch to newly detected sources', false);
    f.click('Read EDID / negotiate signal'); f.step(1);
    f.click('3 / Audience view'); f.click('Go live'); assert.ok(!f.d.querySelector('.success'));
    f.step(1.1); f.choose('Content to share', 'pattern'); f.click('Verify four corners');
    assert.match(f.d.querySelector('#game-message').textContent, /Overscan/);
    calibrateProjector(f); f.click('Go live');
    if (mode === 'cursed') { assert.ok(f.d.querySelector('.office-error')); f.closeErrors(); f.click('Go live'); }
    f.won(); f.close();
  }
});
test('projector: automatic input theft and signal changes require recovery and recalibration', () => {
  const f = fixture(1); wireProjector(f); f.click('Read EDID / negotiate signal'); f.step(6.2);
  assert.match(f.d.querySelector('#game-message').textContent, /Auto source switched/);
  f.closeErrors(); f.check('Automatically switch to newly detected sources', false);
  f.choose('Input source', '2'); f.click('Read EDID / negotiate signal'); f.step(2.1); calibrateProjector(f);
  f.click('2 / Signal lab'); f.choose('Refresh rate', '120'); f.choose('Refresh rate', '60');
  f.click('3 / Audience view'); f.click('Go live'); assert.match(f.d.querySelector('#game-message').textContent, /handshake/);
  f.click('2 / Signal lab'); f.click('Read EDID / negotiate signal'); f.step(2.1);
  f.click('3 / Audience view'); f.click('Go live'); assert.match(f.d.querySelector('#game-message').textContent, /framing unverified/);
  calibrateProjector(f); f.click('Go live'); f.won(); f.close();
});
test('projector: frozen output, sleeping source and optional update cannot pass as a live slide', () => {
  const f = fixture(1, 'cursed'); wireProjector(f); f.check('Automatically switch to newly detected sources', false);
  f.click('Read EDID / negotiate signal'); f.step(2.1); calibrateProjector(f);
  f.click('Freeze projector frame'); f.click('Go live'); assert.match(f.d.querySelector('#game-message').textContent, /frozen/);
  f.click('Unfreeze projector frame'); calibrateProjector(f);
  f.click('Close laptop lid'); f.click('Go live'); assert.ok(!f.d.querySelector('.success')); f.click('Open laptop lid');
  f.click('2 / Signal lab'); f.click('Read EDID / negotiate signal'); f.step(2.1); calibrateProjector(f);
  f.click('Go live'); f.click('Install & restart now');
  f.click('Go live'); assert.ok(!f.d.querySelector('.success'));
  f.click('2 / Signal lab'); f.choose('Resolution', '1080'); f.choose('Refresh rate', '60'); f.choose('Color format', 'rgb');
  f.click('Read EDID / negotiate signal'); f.step(2.1); calibrateProjector(f); f.click('Go live'); f.won(); f.close();
});

test('email: negative wording and mandatory receipts are honored', () => {
  const f = fixture(2);
  f.check('Automatically personalize my preferences', false);
  for (const label of ['Weekly deals', 'Daily deals', 'Deals about other deals', 'Product announcements']) f.check(label, false);
  f.click('Save preferences'); assert.ok(!f.d.querySelector('.success'));
  f.check('Do not send partner offers', true); f.click('Save preferences'); f.closeErrors();
  f.click('Spam (1)'); f.click('Open: confirm unsubscribe request'); f.click('Confirm unsubscribe'); assert.ok(!f.d.querySelector('.success'));
  f.choose('Apply unsubscribe to', 'account'); f.click('Confirm unsubscribe'); f.won();
  const receipt = [...f.d.querySelectorAll('.game-check')].find(label => label.textContent === 'Account receipts (required)').querySelector('input');
  assert.equal(receipt.checked, true); assert.equal(receipt.disabled, true);
  f.close();
});




function solveAdventure(f) {
  f.click('▰\nStuck drawer'); assert.match(f.d.querySelector('#game-message').textContent, /thin piece of metal/);
  f.click('☕\nCoffee mug'); f.click('⌁ Paperclip'); f.click('▰\nStuck drawer');
  f.click('Take recovery floppy'); f.click('Read sticky note'); f.closeErrors();
  f.click('▧\nBlue-screen PC');
  const code = f.d.querySelector('[aria-label="Boot code"]'); code.value = '095'; code.dispatchEvent(new f.w.Event('input'));
  f.click('Unlock safe mode'); f.click('▰ Backups folder'); f.click('PRINT95.SYS — yesterday 16:59');
  f.click('▧ Broken driver slot'); f.check('Automatically install the newest driver after repair', false);
  f.step(5); f.closeErrors(); f.click('Restart anyway'); f.click('Remind me in 2095'); f.won();
}
test('blue-screen adventure: inventory gates four rooms; Practice and Cursed both solvable', () => {
  for (const mode of ['practice', 'cursed']) { const f = fixture(3, mode); solveAdventure(f); f.close(); }
});


test('printer crashes reset defaults unless preservation is enabled; Cursed mode remains solvable', () => {
  const f = fixture(0, 'cursed');
  f.click('Print'); f.closeErrors();
  f.click('Document'); f.choose('Copies', '1'); f.click('Driver'); f.choose('Driver profile', 'app'); f.click('Restart spooler'); f.closeErrors();
  f.click('Diagnostics'); assert.match(f.d.querySelector('.printer-crash-log').textContent, /RESET: profile=auto, copies=2/);
  f.choose('Driver profile', 'app'); f.choose('Copies', '1'); f.check('Preserve settings after a spooler crash', true);
  f.click('Restart spooler'); f.closeErrors(); f.click('Diagnostics'); assert.match(f.d.querySelector('.printer-crash-log').textContent, /settings preserved/);
  configurePrinter(f); f.click('Restart spooler'); f.click('Print'); releaseAndCollect(f); f.close();
});

test('recommendation sabotage stops when disabled, and the moving Save button has a bounded escape count', () => {
  const f = fixture(2, 'cursed');
  f.check('Weekly deals', false); f.step(3.1);
  const weekly = () => [...f.d.querySelectorAll('.game-check')].find(e => e.textContent === 'Weekly deals').querySelector('input');
  assert.equal(weekly().checked, true);
  f.check('Automatically personalize my preferences', false); f.check('Weekly deals', false); f.step(5);
  assert.equal(weekly().checked, false);
  const save = f.find('Save preferences');
  for (let i = 0; i < 3; i++) save.dispatchEvent(new f.w.Event('pointerenter'));
  const position = save.style.cssText; save.dispatchEvent(new f.w.Event('pointerenter'));
  assert.equal(save.style.cssText, position); f.close();
});


test('virus desktop: remove persistence, stop parent then child, quarantine disguised payload, and verify', () => {
  for (const mode of ['practice', 'cursed']) {
    const f = fixture(4, mode);
    f.step(10); assert.match(f.d.querySelector('#game-time').textContent, /ready/);
    f.click('▥\nTask Manager'); f.step(.1);
    const kill = name => f.d.querySelector(`[aria-label="End ${name}"]`).click();
    kill('AdBuddy.exe'); assert.match(f.d.querySelector('#game-message').textContent, /restarted AdBuddy/);
    kill('Updatr.exe'); assert.match(f.d.querySelector('#game-message').textContent, /Startup/);
    f.check('Launch Updatr.exe when this PC starts', false); kill('Updatr.exe'); kill('AdBuddy.exe');
    f.click('▰\nMy Files'); f.check('Show file extensions', true);
    f.click('▰ System32'); f.click('Quarantine selected file'); assert.ok(!f.d.querySelector('.success'));
    f.click('▤ invoice.pdf.exe'); f.click('Quarantine selected file');
    assert.ok(f.d.querySelector('.virus-contained'));
    f.click('♜\nSecurity'); f.click('Verify cleanup'); f.step(2);
    assert.ok(!f.d.querySelector('.success'), 'Unclosed scam alerts must block completion');
    for (const close of [...f.d.querySelectorAll('[aria-label^="Close Virus detected!"]')]) close.click();
    f.click('Verify cleanup'); f.step(2); f.won(); f.close();
  }
});

test('virus desktop: fake antivirus spawns bounded extra warnings and app windows minimize/restore', () => {
  const f = fixture(4, 'cursed'); f.click('▤\nREAD ME'); f.step(.1);
  f.click('REMOVE EVERYTHING NOW'); assert.equal(f.d.querySelectorAll('.rogue-window').length, 2);
  f.step(30); assert.equal(f.d.querySelectorAll('.rogue-window').length, 3);
  const notes = f.d.querySelector('[aria-label="READ ME — Notepad"]');
  f.d.querySelector('[aria-label="Minimize READ ME — Notepad"]').click(); assert.equal(notes.hidden, true);
  f.click('READ ME — Notepad'); assert.equal(notes.hidden, false);
  f.d.querySelector('[aria-label="Maximize READ ME — Notepad"]').click(); assert.equal(notes.classList.contains('maximized'), true);
  f.d.querySelector('[aria-label="Close READ ME — Notepad"]').click(); assert.equal(notes.isConnected, false);
  f.close();
});

test('all five games have launch cards and hints, with no dad references in shipped copy', () => {
  const f = fixture(4);
  assert.equal(f.d.querySelectorAll('#game-select option').length, 5);
  f.d.querySelector('#hint-button').click(); assert.match(f.d.querySelector('#game-hint').textContent, /Updatr/);
  const source = html + gameCode + fs.readFileSync('site/app.js', 'utf8'); assert.doesNotMatch(source, /\bdad\b/i);
  f.close();
});

test('closing cancels the timer and scores stay separate by difficulty', () => {
  const f = fixture(1);
  wireProjector(f); f.check('Automatically switch to newly detected sources', false);
  f.click('Read EDID / negotiate signal'); f.step(2.1); calibrateProjector(f); f.click('Go live'); f.won();
  assert.match(f.d.querySelector('#game-progress').textContent, /1 \/ 5 practice/);
  const difficulty = f.d.querySelector('#difficulty'); difficulty.value = 'cursed'; difficulty.dispatchEvent(new f.w.Event('change'));
  assert.match(f.d.querySelector('#game-progress').textContent, /0 \/ 5 cursed/);
  f.click('Connect cable'); f.d.querySelector('#game-dialog').close(); const before = f.d.querySelector('#game-time').textContent;
  f.step(200); assert.equal(f.d.querySelector('#game-time').textContent, before); assert.ok(!f.d.querySelector('.failure')); f.close();
});

test('removed games are absent from the playable catalog and runtime', () => {
  const f = fixture(0); f.w.eval(fs.readFileSync('site/app.js', 'utf8'));
  assert.equal(f.d.querySelectorAll('#benchmarks article').length, 5);
  for (const name of ['Cancel My Gym', 'Return the Parcel', 'Make It One Page', 'Find the Attachment']) {
    assert.ok(!f.d.querySelector('#benchmarks').textContent.includes(name));
    assert.ok(!f.d.querySelector('#game-select').textContent.includes(name));
  }
  assert.doesNotMatch(gameCode, /gymGame|parcelGame|documentGame|attachmentGame/);
  f.close();
});

test('leaderboard and Pareto plot always include every invoice component, with AI ahead', () => {
  const f = fixture(0);
  f.w.eval(fs.readFileSync('site/app.js', 'utf8') + '\n' + fs.readFileSync('site/chart.js', 'utf8'));
  assert.equal(f.d.querySelector('#include-subscriptions'), null);
  const frontier = [...f.d.querySelectorAll('.plot-point.efficient')].map(el => Number(el.dataset.point)).sort();
  assert.ok(frontier.length >= 2);

  const rows = [...f.d.querySelectorAll('#results tr')];
  const costs = [...f.d.querySelectorAll('#cost-data tr')];
  assert.equal(rows.length, 46);
  assert.equal(costs.length, 46);
  assert.equal(f.d.querySelectorAll('.plot-point').length, 46);
  assert.equal(f.d.querySelectorAll('#plot-participant option').length, 47);
  f.d.querySelector('[data-filter="model"]').click();
  assert.equal(f.d.querySelectorAll('#results tr').length, 36);
  f.d.querySelector('[data-filter="all"]').click();
  rows.forEach((row, i) => {
    const cells = costs[i].querySelectorAll('td');
    const values = [...cells].slice(2).map(cell => Number(cell.textContent.slice(1)));
    assert.equal(Math.round((values[0] + values[1] + values[2]) * 100), Math.round(values[3] * 100));
    assert.equal(row.querySelector('.invoice-total b').textContent, cells[5].textContent);
    assert.ok(row.querySelector('.consumed').textContent.length > 0);
    assert.match(row.querySelector('.participant-type').textContent, i < 36 ? /LLM/ : /Human/);
  });
  const scores = rows.map(row => Number(row.querySelector('.score b').textContent.split('/')[0]));
  assert.ok(Math.min(...scores.slice(0, 36)) > Math.max(...scores.slice(36)));
  const picker = f.d.querySelector('#plot-participant');
  picker.value = [...picker.options].find(o => o.textContent === 'Grok 4.7 / unhinged').value;
  picker.dispatchEvent(new f.w.Event('change'));
  assert.match(f.d.querySelector('#plot-detail').textContent, /\$122\.89 total/);
  assert.match(f.d.querySelector('#plot-detail').textContent, /consumables \/ goods \/ perks: \$1\.10/);
  f.close();
});

test('combined scores reward speed within a level and Pareto uses full raw values', () => {
  const f = fixture(0);
  f.w.eval(fs.readFileSync('site/app.js', 'utf8') + '\n' + fs.readFileSync('site/chart.js', 'utf8'));
  assert.equal(f.d.querySelector('#axis-mode'), null);
  assert.equal(f.d.querySelector('#reset-axes'), null);
  const rows = [...f.d.querySelectorAll('#results tr')];
  const points = rows.map((row, id) => ({ id, score: Number(row.querySelector('.score b').textContent), levels: Number(row.querySelector('.score .participant-type').textContent.split('/')[0]), cost: Number(row.querySelector('.invoice-total b').textContent.slice(1)), time: row.children[3].textContent.split(':').map(Number).reduce((m, v) => m * 60 + v, 0) }));
  for (const point of points) {
    assert.ok(point.score >= point.levels * 180 && point.score <= point.levels * 200);
    if (!point.levels) assert.equal(point.score, 0);
    for (const other of points) if (point.levels === other.levels && point.levels > 0 && point.time < other.time) assert.ok(point.score > other.score);
    assert.equal(Number(f.d.querySelectorAll('#cost-data tr')[point.id].children[1].textContent), point.score);
  }
  assert.ok(new Set(points.slice(0, 36).map(p => p.score)).size > 20);
  const expected = points.filter(p => !points.some(q => q.cost <= p.cost && q.score >= p.score && (q.cost < p.cost || q.score > p.score))).map(p => p.id).sort((a,b) => a-b);
  assert.deepEqual([...f.d.querySelectorAll('.efficient')].map(p => Number(p.dataset.point)).sort((a,b) => a-b), expected);
  const byCost = [...points].sort((a,b) => a.cost-b.cost);
  let previous = -Infinity;
  for (const point of byCost) {
    const x = Number(f.d.querySelector(`[data-point="${point.id}"] circle`).getAttribute('cx'));
    assert.ok(x >= previous); previous = x;
  }
  assert.match(f.d.querySelector('#cost-plot').textContent, /Cost per attempt/);
  f.close();
});

test('management invoices include luxury spending and fit the cursed scale', () => {
  const f = fixture(0);
  f.w.eval(fs.readFileSync('site/app.js', 'utf8') + '\n' + fs.readFileSync('site/chart.js', 'utf8'));
  f.d.querySelector('[data-filter="management"]').click();
  assert.equal(f.d.querySelectorAll('#results tr').length, 7);
  assert.match(f.d.querySelector('#results').textContent, /Private jet/);
  f.d.querySelector('[data-filter="engineering"]').click();
  assert.equal(f.d.querySelectorAll('#results tr').length, 3);
  const picker = f.d.querySelector('#plot-participant');
  picker.value = [...picker.options].find(o => o.textContent === 'Chief Executive Officer').value;
  picker.dispatchEvent(new f.w.Event('change'));
  assert.match(f.d.querySelector('#plot-detail').textContent, /\$186999\.00 total/);
  {
    for (const point of f.d.querySelectorAll('.plot-point')) {
      const hit = point.querySelector('circle');
      const x = Number(hit.getAttribute('cx')), y = Number(hit.getAttribute('cy'));
      assert.ok(x >= 70 && x <= 650 && y >= 60 && y <= 300);
    }
  }
  f.close();
});

test('model effort lines join the correct points in preset order on the cursed scale', () => {
  const f = fixture(0);
  f.w.eval(fs.readFileSync('site/app.js', 'utf8') + '\n' + fs.readFileSync('site/chart.js', 'utf8'));
  const names = [...f.d.querySelector('#plot-participant').options].slice(1).map(o => o.textContent);
  const order = ['low', 'medium', 'high', 'xhigh', 'ultra', 'max', 'unhinged'];
  {
    const lines = [...f.d.querySelectorAll('.effort-path')];
    assert.equal(lines.length, 9);
    for (const line of lines) {
      const ids = line.dataset.pointIds.split(',');
      assert.equal(ids.length, 4);
      const presets = ids.map(id => names[Number(id)].split(' / ')[1]);
      assert.deepEqual(presets, [...presets].sort((a, b) => order.indexOf(a) - order.indexOf(b)));
      const expected = ids.map(id => {
        assert.ok(names[Number(id)].startsWith(line.dataset.family + ' / '));
        const point = f.d.querySelector(`[data-point="${id}"] circle`);
        return `${point.getAttribute('cx')},${point.getAttribute('cy')}`;
      }).join(' ');
      assert.equal(line.getAttribute('points'), expected);
    }
  }
  const picker = f.d.querySelector('#plot-participant');
  picker.value = [...picker.options].find(o => o.textContent === 'GPT-6.1 Sol / high').value;
  picker.dispatchEvent(new f.w.Event('change'));
  assert.equal(f.d.querySelector('[data-family="GPT-6.1 Sol"]').getAttribute('stroke-width'), '3.5');
  assert.equal(f.d.querySelectorAll('#effort-legend span').length, 9);
  f.close();
});

test('human roles credit only hands-on engineers and include their AI assistance costs', () => {
  const f = fixture(0);
  f.w.eval(fs.readFileSync('site/app.js', 'utf8'));
  f.d.querySelector('[data-filter="engineering"]').click();
  const rows = [...f.d.querySelectorAll('#results tr')];
  assert.equal(rows.length, 3);
  const successful = rows.filter(row => Number(row.querySelector('.score b').textContent) > 0);
  assert.deepEqual(successful.map(row => row.querySelector('.participant').textContent), ['Staff Software Engineer', 'Site Reliability Engineer', 'Legacy Systems Engineer']);
  assert.equal(rows.filter(row => /assisted|AI-generated|multi-agent/.test(row.querySelector('.participant-type').textContent)).length, 2);
  for (const row of successful.slice(0, 2)) assert.doesNotMatch(row.querySelector('.invoice-total .participant-type').textContent, /Compute \$0\.00/);
  f.close();
});

test('printer and HDMI progressively reveal controls and restart in their simple view', () => {
  const p = fixture(0);
  assert.equal(p.d.querySelector('.printer-tabs').hidden, true);
  assert.equal(p.d.querySelector('.printer-document-details').hidden, true);
  assert.equal(p.d.querySelector('.printer-specification').hidden, true);
  p.click('Printer properties…'); assert.equal(p.d.querySelector('.printer-document-details').hidden, false);
  assert.equal(p.d.querySelector('.printer-tabs').hidden, true);
  p.click('Print'); p.closeErrors(); assert.equal(p.d.querySelector('.printer-tabs').hidden, false);
  const hardware = [...p.d.querySelectorAll('.printer-tabs button')].find(b => b.textContent === 'Hardware');
  assert.equal(hardware.hidden, true); p.click('Diagnostics'); assert.equal(hardware.hidden, false);
  p.d.querySelector('#start-game').click(); assert.equal(p.d.querySelector('.printer-tabs').hidden, true); p.close();
  const h = fixture(1);
  const stages = [...h.d.querySelectorAll('.hdmi-stage')];
  assert.ok(stages.every(stage => stage.hidden));
  h.click('Present slide'); assert.equal(stages[0].hidden, false);
  const tabs = [...h.d.querySelectorAll('.inline-controls button')];
  assert.equal(tabs[1].hidden, true); assert.equal(tabs[2].hidden, true);
  wireProjector(h); assert.equal(tabs[1].hidden, false); assert.equal(tabs[2].hidden, true);
  h.check('Automatically switch to newly detected sources', false); h.click('Read EDID / negotiate signal'); h.step(2.1);
  assert.equal(tabs[2].hidden, false);
  h.d.querySelector('#start-game').click(); assert.ok([...h.d.querySelectorAll('.hdmi-stage')].every(stage => stage.hidden)); h.close();
});
