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
  f.choose('Printer', 'local'); f.choose('Pages', 'one'); f.choose('Paper size', 'a4'); f.choose('Copies', '1');
  f.choose('Orientation', 'portrait'); f.choose('Scaling', 'raw'); f.choose('Driver profile', 'app');
  f.choose('Color mode', 'k'); f.choose('Paper source', 'tray1'); f.choose('Duplex', 'simplex');
  f.check('Automatic driver recovery (recommended)', false);
  f.click('Open paper tray'); f.click('Remove crumpled sheet'); f.closeErrors();
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

test('projector: cable, input and duplicate mode are all required', () => {
  const f = fixture(1);
  f.click('Present slide'); for (let i = 0; i < 14; i++) f.click('Nudge →'); f.click('Connect cable');
  f.choose('Input source', '2'); f.click('Present slide'); assert.ok(!f.d.querySelector('.success'));
  f.choose('Display mode', 'duplicate'); f.click('Present slide');
  f.click('Go live'); assert.ok(!f.d.querySelector('.success'));
  f.choose('Content to share', 'slides'); f.check('Show desktop notifications while presenting', false); f.click('Go live'); f.won(); f.close();
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
  f.choose('Driver profile', 'app'); f.choose('Copies', '1'); f.click('Print'); f.closeErrors();
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
  for (let i = 0; i < 14; i++) f.click('Nudge →');
  f.click('Connect cable'); f.choose('Input source', '2'); f.choose('Display mode', 'duplicate'); f.click('Present slide');
  f.click('Go live'); assert.ok(!f.d.querySelector('.success'));
  f.choose('Content to share', 'slides'); f.check('Show desktop notifications while presenting', false); f.click('Go live'); f.won();
  assert.match(f.d.querySelector('#game-progress').textContent, /1 \/ 5 practice/);
  const difficulty = f.d.querySelector('#difficulty'); difficulty.value = 'cursed'; difficulty.dispatchEvent(new f.w.Event('change'));
  assert.match(f.d.querySelector('#game-progress').textContent, /0 \/ 5 cursed/);
  f.click('Nudge →'); f.d.querySelector('#game-dialog').close(); const before = f.d.querySelector('#game-time').textContent;
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
  assert.equal(frontier.length, 2);
  assert.match(f.d.querySelector('#frontier-summary').textContent, /Gemini Tab Ultra \/ low → GPT-Paperclip \/ low/);
  const rows = [...f.d.querySelectorAll('#results tr')];
  const costs = [...f.d.querySelectorAll('#cost-data tr')];
  assert.equal(rows.length, 36);
  assert.equal(costs.length, 36);
  assert.equal(f.d.querySelectorAll('.plot-point').length, 36);
  assert.equal(f.d.querySelectorAll('#plot-participant option').length, 37);
  f.d.querySelector('[data-filter="model"]').click();
  assert.equal(f.d.querySelectorAll('#results tr').length, 32);
  f.d.querySelector('[data-filter="all"]').click();
  rows.forEach((row, i) => {
    const cells = costs[i].querySelectorAll('td');
    const values = [...cells].slice(2).map(cell => Number(cell.textContent.slice(1)));
    assert.equal(Math.round((values[0] + values[1] + values[2]) * 100), Math.round(values[3] * 100));
    assert.equal(row.querySelector('.invoice-total b').textContent, cells[5].textContent);
    assert.ok(row.querySelector('.consumed').textContent.length > 0);
    assert.match(row.querySelector('.participant-type').textContent, i < 32 ? /fictional LLM/ : /Human/);
  });
  const scores = rows.map(row => Number(row.querySelector('.score b').textContent.split('/')[0]));
  assert.ok(Math.min(...scores.slice(0, 32)) > Math.max(...scores.slice(32)));
  const picker = f.d.querySelector('#plot-participant');
  picker.value = [...picker.options].find(o => o.textContent === 'Grok Kernel / unhinged').value;
  picker.dispatchEvent(new f.w.Event('change'));
  assert.match(f.d.querySelector('#plot-detail').textContent, /\$122\.89 total/);
  assert.match(f.d.querySelector('#plot-detail').textContent, /consumables: \$1\.10/);
  f.close();
});

test('axis tricks change geometry without changing invoices or Pareto membership', () => {
  const f = fixture(0);
  f.w.eval(fs.readFileSync('site/app.js', 'utf8') + '\n' + fs.readFileSync('site/chart.js', 'utf8'));
  const mode = f.d.querySelector('#axis-mode');
  const data = f.d.querySelector('#cost-data').innerHTML;
  const path = () => f.d.querySelector('.pareto-path').getAttribute('points');
  const original = path();
  const efficient = () => [...f.d.querySelectorAll('.efficient')].map(p => p.dataset.point).sort();
  const originalFrontier = efficient();
  for (const value of ['launch', 'reverse', 'vibes']) {
    mode.value = value;
    mode.dispatchEvent(new f.w.Event('change'));
    assert.notEqual(path(), original);
    assert.equal(f.d.querySelector('#cost-data').innerHTML, data);
    assert.deepEqual(efficient(), originalFrontier);
    assert.match(f.d.querySelector('#axis-disclosure').textContent, /AXIS TRICK/);
    assert.doesNotMatch(f.d.querySelector('#cost-plot').innerHTML, /NaN|Infinity/);
  }
  f.d.querySelector('#reset-axes').click();
  assert.equal(mode.value, 'honest');
  assert.equal(path(), original);
  assert.equal(f.d.querySelectorAll('.effort-pair').length, 8);
  assert.equal((f.d.querySelector('#effort-comparisons').textContent.match(/REGRESSION/g) || []).length, 8);
  f.close();
});
