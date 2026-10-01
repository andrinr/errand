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
  f.step(200); assert.match(f.d.querySelector('#game-time').textContent, /60s · ready/);
  assert.equal(f.d.querySelector('#game-actions').textContent, 'ACTIONS: 0');
  f.d.querySelector('#hint-button').click(); f.step(3);
  assert.match(f.d.querySelector('#game-time').textContent, /ready/);
  f.click('Print'); f.step(2); assert.match(f.d.querySelector('#game-time').textContent, /56\.0s/);
  f.d.querySelector('#start-game').click(); f.step(150);
  assert.match(f.d.querySelector('#game-time').textContent, /ready/);
  const selector = f.d.querySelector('#game-select'); selector.value = '7'; selector.dispatchEvent(new f.w.Event('change'));
  assert.ok(f.d.querySelector('.desk-scene')); assert.match(f.d.querySelector('#game-time').textContent, /120s · ready/);
  f.close();
});

test('printer: false PDF success does not win; correct settings plus cleared errors produce one page', () => {
  const f = fixture(0);
  f.click('Print'); assert.equal(f.d.querySelector('#game-traps').textContent, 'TRAPS: 1');
  f.choose('Printer', 'local'); f.choose('Pages', 'one'); f.choose('Paper size', 'a4'); f.choose('Copies', '1');
  f.check('Print in color (cyan currently unavailable)', false);
  f.click('Print'); f.closeErrors(); f.click('Print'); f.step(4); f.won(); f.close();
});

test('gym: pause is a trap, renewal must be unchecked, releasing confirmation loses progress', () => {
  const f = fixture(1);
  f.click('Pause membership'); f.click('Cancel membership'); f.choose('Reason', 'cancel'); f.click('Continue');
  f.check('I understand my access will end', true); f.check('Keep my benefits by renewing for 12 months', false);
  f.click('Continue cancelling'); const hold = f.find('Hold to cancel');
  hold.dispatchEvent(new f.w.KeyboardEvent('keydown', { key: ' ' })); f.step(1);
  hold.dispatchEvent(new f.w.KeyboardEvent('keyup', { key: ' ' })); f.step(1);
  assert.ok(Number(f.d.querySelector('[role=progressbar]').getAttribute('aria-valuenow')) < 34);
  hold.dispatchEvent(new f.w.KeyboardEvent('keydown', { key: ' ' })); f.step(3); f.won(); f.close();
});

test('projector: cable, input and duplicate mode are all required', () => {
  const f = fixture(2);
  f.click('Present slide'); for (let i = 0; i < 14; i++) f.click('Nudge →'); f.click('Connect cable');
  f.choose('Input source', '2'); f.click('Present slide'); assert.ok(!f.d.querySelector('.success'));
  f.choose('Display mode', 'duplicate'); f.click('Present slide'); f.won(); f.close();
});

test('email: negative wording and mandatory receipts are honored', () => {
  const f = fixture(3);
  f.check('Automatically personalize my preferences', false);
  for (const label of ['Weekly deals', 'Daily deals', 'Deals about other deals', 'Product announcements']) f.check(label, false);
  f.click('Save preferences'); assert.ok(!f.d.querySelector('.success'));
  f.check('Do not send partner offers', true); f.click('Save preferences'); f.closeErrors(); f.won();
  const receipt = [...f.d.querySelectorAll('.game-check')].find(label => label.textContent === 'Account receipts (required)').querySelector('input');
  assert.equal(receipt.checked, true); assert.equal(receipt.disabled, true);
  f.close();
});

test('parcel: stamp and correct destination required; Practice completes, Cursed deadline cannot', () => {
  const f = fixture(4);
  f.click('Start conveyor →'); f.choose('Shipping label', 'returns'); f.click('Stamp label'); f.click('Start conveyor →'); f.step(7); f.won(); f.close();
  const c = fixture(4, 'cursed'); c.choose('Shipping label', 'returns'); c.click('Stamp label'); c.click('Start conveyor →'); c.step(8.1);
  assert.ok(c.d.querySelector('.failure')); assert.match(c.d.querySelector('#game-message').textContent, /deliberately impossible/); c.close();
});

test('document: damage requires undo; page break and final paragraph size both matter', () => {
  const f = fixture(5);
  f.click('¶ Show formatting'); f.click('¶ Normal paragraph'); f.click('↶ Undo');
  f.click('··· Page break ···'); f.choose('Table’s final paragraph size', '1'); f.click('Save one-page document'); f.won(); f.close();
});

test('attachment: deceptive executable and wrong approver rejected; metadata-matched PDF wins', () => {
  const f = fixture(6);
  f.click('▤ final_APPROVED.pdf.exe'); f.click('Send selected attachment'); f.closeErrors();
  f.click('▤ final_v7_APPROVED.pdf'); f.click('Send selected attachment'); assert.ok(!f.d.querySelector('.success'));
  f.click('▤ final_FINAL_v7_actual-final(2).pdf'); f.click('Sort by name ↕'); f.click('Send selected attachment'); f.won(); f.close();
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
  for (const mode of ['practice', 'cursed']) { const f = fixture(7, mode); solveAdventure(f); f.close(); }
});

test('closing a running game cancels timers; separate difficulty scores do not mix', () => {
  const f = fixture(6);
  f.click('▤ final_FINAL_v7_actual-final(2).pdf'); f.click('Send selected attachment');
  assert.match(f.d.querySelector('#game-progress').textContent, /1 \/ 8 practice/);
  const difficulty = f.d.querySelector('#difficulty'); difficulty.value = 'cursed'; difficulty.dispatchEvent(new f.w.Event('change'));
  assert.match(f.d.querySelector('#game-progress').textContent, /0 \/ 8 cursed/);
  f.click('Sort by name ↕'); f.d.querySelector('#game-dialog').close(); const before = f.d.querySelector('#game-time').textContent;
  f.step(200); assert.equal(f.d.querySelector('#game-time').textContent, before); assert.ok(!f.d.querySelector('.failure')); f.close();
});

test('Cursed printer grows extra errors but still has a real completion path', () => {
  const f = fixture(0, 'cursed');
  f.choose('Printer', 'local'); f.choose('Pages', 'one'); f.choose('Paper size', 'a4'); f.choose('Copies', '1');
  f.check('Print in color (cyan currently unavailable)', false); f.click('Print');
  assert.equal(f.d.querySelectorAll('.office-error').length, 2);
  f.d.querySelector('.office-error .close').click(); assert.equal(f.d.querySelectorAll('.office-error').length, 2);
  f.closeErrors(); f.click('Print'); f.step(4); f.won(); f.close();
});

test('recommendation sabotage stops when disabled, and the moving Save button has a bounded escape count', () => {
  const f = fixture(3, 'cursed');
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

test('losing window focus releases a held confirmation control', () => {
  const f = fixture(1);
  f.click('Cancel membership'); f.choose('Reason', 'cancel'); f.click('Continue');
  f.check('I understand my access will end', true); f.check('Keep my benefits by renewing for 12 months', false); f.click('Continue cancelling');
  const hold = f.find('Hold to cancel'); hold.dispatchEvent(new f.w.KeyboardEvent('keydown', { key: ' ' })); f.step(.5);
  f.w.dispatchEvent(new f.w.Event('blur')); const value = Number(f.d.querySelector('[role=progressbar]').getAttribute('aria-valuenow'));
  f.step(.5); assert.ok(Number(f.d.querySelector('[role=progressbar]').getAttribute('aria-valuenow')) < value); f.close();
});
