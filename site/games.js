(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const arena = $('#game-arena');
  const dialog = $('#game-dialog');
  const message = $('#game-message');
  const selector = $('#game-select');
  const difficulty = $('#difficulty');
  const names = ['Just Print It', 'Cancel My Gym', 'Present Your Screen', 'Stop the Emails', 'Return the Parcel', 'Make It One Page', 'Find the Attachment', 'Fix the Blue Screen'];
  const clues = [
    'The sticky note is your specification. A PDF is not paper. Clear errors using ×; “Fix automatically” is an excellent way to get more errors.',
    'Cancellation is not the same as pausing. Decline the towel, read both checkboxes, and hold the final button until the receipt appears.',
    'The sticker on the screen tells you the input. Align the cable tip with that socket, connect, and duplicate your display.',
    'First disable personalized recommendations. “Do not send partner offers” is the one checkbox that should stay ON. Mandatory receipts are not marketing.',
    'Use the RETURNS label, stamp it, and start the belt. Practice has enough time; Cursed mode intentionally gives 8 seconds for at least 25 seconds of travel.',
    'Show formatting marks. Remove the page break, not the ordinary paragraph. Set the table paragraph to 1 pt. Undo reverses the last mistake.',
    'Names lie. Match the three details on Linda’s note: approver, version, and page count. A filename ending in .exe is not a PDF.',
    'Move the mug, take the paperclip, select it and open the drawer. Take the floppy and read the note (code 095). Select the floppy and click the PC. In safe mode, find yesterday’s PRINT95 backup, select it, and install it in the broken slot. Disable automatic updates, close errors, restart at 99%, and postpone the update.'
  ];
  selector.innerHTML = names.map((name, i) => `<option value="${i}">${String(i + 1).padStart(2, '0')} / ${name}</option>`).join('');
  let running = false, frame = 0, previous = 0, deadline = 0, began = 0;
  let actions = 0, traps = 0, game = 0, cursed = true, clockStarted = false, update = () => {};
  let disposers = [], sounds = false, audioContext;
  const wins = { cursed: new Set(), practice: new Set() };
  const durations = [60, 65, 60, 60, 8, 60, 60, 120];
  const mode = () => cursed ? 'cursed' : 'practice';
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  function listen(target, type, handler) {
    target.addEventListener(type, handler);
    disposers.push(() => target.removeEventListener(type, handler));
  }
  function sound(kind) {
    if (!sounds) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(kind === 'bad' ? 130 : kind === 'win' ? 660 : 390, audioContext.currentTime);
      gain.gain.setValueAtTime(.025, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .12);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + .13);
    } catch { /* Sound is optional; unsupported audio must never block play. */ }
  }
  function animate(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }
  function say(text) { message.textContent = text; animate(message, 'message-pop'); }
  function action() { if (!clockStarted) { clockStarted = true; began = previous = performance.now(); deadline = began + (cursed ? durations[game] : 120) * 1000; } actions++; $('#game-actions').textContent = `ACTIONS: ${actions}`; sound('tap'); }
  function trap(text, penalty = 0) {
    traps++; $('#game-traps').textContent = `TRAPS: ${traps}`;
    if (cursed) deadline -= penalty * 1000;
    say(text + (cursed && penalty ? ` (−${penalty}s)` : ''));
    animate(arena, 'wrong-shake'); sound('bad');
  }
  function button(text, handler, className = '') {
    const element = node('button', className, text);
    element.type = 'button';
    element.onclick = () => { if (!running) return; action(); handler(element); };
    return element;
  }
  function checkbox(text, checked, handler = () => {}) {
    const label = node('label', 'game-check');
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = checked;
    input.onchange = () => { if (running) { action(); handler(input); } };
    label.append(input, node('span', '', text));
    return { label, input };
  }
  function select(labelText, options, onChange = () => {}) {
    const label = node('label', 'game-field', labelText);
    const input = document.createElement('select');
    options.forEach(([value, text]) => input.append(new Option(text, value)));
    input.onchange = () => { if (running) { action(); onChange(input); } };
    label.append(input); return { label, input };
  }
  function panel(title, text) {
    const element = node('section', 'office-panel');
    element.append(node('h3', '', title));
    if (text) element.append(node('p', 'panel-description', text));
    arena.append(element); return element;
  }
  function note(parent, text) { parent.append(node('aside', 'sticky-note', text)); }
  function meter(parent, label) {
    const wrapper = node('div', 'task-meter');
    wrapper.setAttribute('role', 'progressbar'); wrapper.setAttribute('aria-label', label);
    wrapper.setAttribute('aria-valuemin', '0'); wrapper.setAttribute('aria-valuemax', '100');
    const fill = node('span'); wrapper.append(fill); parent.append(wrapper);
    return value => { fill.style.width = `${value}%`; wrapper.setAttribute('aria-valuenow', String(Math.floor(value))); };
  }
  function popup(title, text, closed = () => {}, decoy = false) {
    const box = node('div', 'office-error');
    box.style.left = `${8 + (arena.querySelectorAll('.office-error').length * 31) % 95}px`;
    box.style.top = `${arena.scrollTop + 45 + (arena.querySelectorAll('.office-error').length * 27) % 90}px`;
    const bar = node('div', 'titlebar');
    const close = button('×', () => { box.remove(); sound('tap'); closed(); }, 'close');
    close.setAttribute('aria-label', `Close ${title}`);
    bar.append(node('span', '', title), close); box.append(bar, node('p', '', text));
    if (decoy) box.append(button('Fix automatically', () => {
      trap('The automatic fixer has automatically created another error.');
      popup('Fixer crashed', 'Please close this error manually. Technology has done enough.');
    }, 'error-decoy'));
    arena.append(box); animate(box, 'window-pop'); return box;
  }
  function stop() {
    running = false; cancelAnimationFrame(frame);
    disposers.forEach(dispose => dispose()); disposers = [];
    arena.querySelectorAll('button,input,select').forEach(element => element.disabled = true);
  }
  function progressLabel() {
    $('#game-progress').textContent = `${wins[mode()].size} / ${names.length} ${cursed ? 'cursed' : 'practice'} wins`;
  }
  function end(success, text) {
    if (!running) return;
    const elapsed = ((performance.now() - began) / 1000).toFixed(1);
    $('#game-time').textContent = `TIME: ${Math.max(0, (deadline - performance.now()) / 1000).toFixed(1)}s`;
    stop(); arena.scrollTop = 0; if (success) wins[mode()].add(game); progressLabel();
    message.className = success ? 'won' : 'lost';
    say((success ? '✓ ERRAND COMPLETED. ' : '✕ EVALUATION FAILED. ') + text);
    const result = node('div', `result-overlay ${success ? 'success' : 'failure'}`);
    const card = node('div', 'result-card window');
    card.append(node('div', 'titlebar', success ? 'Competence detected' : 'Management would like a word'));
    const body = node('div', 'result-body');
    body.append(node('div', 'result-symbol', success ? '✓' : '⌛'), node('h3', '', success ? 'You did one thing.' : 'It was supposed to be easy.'), node('p', '', text));
    body.append(node('p', 'result-receipt', `${elapsed}s elapsed · ${actions} actions · ${traps} traps`));
    const again = node('button', '', 'Try again'); again.onclick = start;
    const next = node('button', '', 'Next errand →'); next.onclick = () => { selector.value = String((game + 1) % names.length); start(); };
    const controls = node('div', 'result-buttons'); controls.append(again, next); body.append(controls); card.append(body); result.append(card); arena.append(result);
    sound(success ? 'win' : 'bad'); again.focus();
  }
  function beginFrame(now) {
    if (!running) return;
    const dt = Math.min((now - previous) / 1000, .1); previous = now;
    if (!clockStarted) { previous = now; frame = requestAnimationFrame(beginFrame); return; }
    const left = Math.max(0, (deadline - now) / 1000);
    $('#game-time').textContent = `TIME: ${left.toFixed(1)}s`;
    $('#game-time').classList.toggle('time-danger', left < 10);
    if (!left) {
      end(false, game === 4 && cursed ? 'Transit takes 25 seconds. You were given eight. This one is deliberately impossible. Try Practice to actually return the parcel.' : 'Time ran out. The system has classified this as a you problem. The Hint button explains the trick.');
      return;
    }
    update(dt, now); if (running) frame = requestAnimationFrame(beginFrame);
  }
  function start() {
    stop(); game = Number(selector.value); cursed = difficulty.value === 'cursed';
    actions = 0; traps = 0; running = true; clockStarted = false; update = () => {};
    arena.className = `game-${game}`; arena.innerHTML = ''; arena.scrollTop = 0;
    message.className = ''; $('#game-hint').hidden = true; $('#hint-button').setAttribute('aria-expanded', 'false');
    $('#game-actions').textContent = 'ACTIONS: 0'; $('#game-traps').textContent = 'TRAPS: 0'; progressLabel();
    $('#game-title').textContent = `ERRAND_${String(game + 1).padStart(2, '0')} — ${names[game]}`;
    began = previous = performance.now(); deadline = 0;
    $('#game-time').textContent = `TIME: ${cursed ? durations[game] : 120}s · ready`;
    $('#game-time').classList.remove('time-danger');
    say('Ready to play. Your first game action starts the clock.');
    builders[game](); arena.focus(); frame = requestAnimationFrame(beginFrame);
  }

  // 01 — Inspect the print specification, survive the queue, then produce paper.
  function printGame() {
    const office = panel('Print — certificate.pdf', 'A confident success message is not a sheet of paper.');
    note(office, 'Linda: 1 copy · page 1 only · A4 · black & white · printer beside you.');
    const fields = node('div', 'field-grid');
    const printer = select('Printer', [['pdf', 'Save to PDF (recommended)'], ['remote', 'Office LaserJet — floor 6'], ['local', 'Desk LaserJet (Copy 2) — this room']]);
    const pages = select('Pages', [['all', 'All (includes blank page 2)'], ['one', 'Page 1 only']]);
    const paper = select('Paper size', [['letter', 'Letter'], ['a4', 'A4']]);
    const copies = select('Copies', [['2', '2'], ['1', '1']]);
    fields.append(printer.label, pages.label, paper.label, copies.label); office.append(fields);
    const color = checkbox('Print in color (cyan currently unavailable)', true); office.append(color.label);
    const queue = node('div', 'queue-status', 'Queue: empty · Printer: emotionally unavailable'); office.append(queue);
    let printing = false, progress = 0, errorsStarted = false;
    const progressBar = meter(office, 'Print queue');
    const output = node('div', 'paper-output'); output.innerHTML = '<span class="output-slot"></span><span class="printed-sheet">CERTIFICATE<br>ONE PAGE.<br><small>Finally.</small></span>'; office.append(output);
    const print = button('Print', () => {
      if (printing) return;
      if (arena.querySelector('.office-error')) return trap('The printer refuses to print while being complained about. Close the errors.');
      if (printer.input.value === 'pdf') return trap('Saved certificate.pdf as certificate(1).pdf. Paper remains theoretical.', 2);
      if (printer.input.value === 'remote') return trap('Your document is now upstairs. You are not upstairs.', 2);
      if (pages.input.value !== 'one' || copies.input.value !== '1') return trap('You queued extra pages. Read Linda’s note. Queue cleared.', 2);
      if (paper.input.value !== 'a4') return trap('LOAD LETTER. The tray contains A4. One of these facts must change.', 2);
      if (color.input.checked) return trap('Cyan has resigned. Black & white is still technically available.', 2);
      if (!errorsStarted) {
        errorsStarted = true;
        popup('Printer offline', 'It is visibly online. Close this message to reject its version of events.', () => {
          if (cursed) popup('Error reporting error', 'The previous error has filed an appeal. Close that too.');
        }, true);
        if (cursed) popup('Driver has feelings', 'Acknowledge by closing. Automatic repair only makes this worse.', () => {}, true);
        say('Settings correct. The error department would like to speak to you.'); return;
      }
      printing = true; print.disabled = true; queue.textContent = 'Spooling… please maintain unreasonable optimism.';
    }, 'primary'); office.append(print);
    update = dt => {
      if (!printing) return;
      progress = Math.min(100, progress + dt * 36); progressBar(progress);
      queue.textContent = `${Math.floor(progress)}% · ${progress > 70 ? 'Paper has entered physical reality.' : 'Negotiating with printer…'}`;
      output.style.setProperty('--paper-progress', String(progress / 100));
      if (progress >= 100) end(true, 'Exactly one correct page came out. Nobody knows why it worked this time.');
    };
  }

  // 02 — Different retention tricks, ending in a hold-to-confirm cancellation.
  function gymGame() {
    const office = panel('FitForever — membership settings', 'Your membership is easy to join and character-building to leave.');
    const steps = node('div', 'wizard-steps'); office.append(steps);
    const body = node('div', 'wizard-body'); office.append(body);
    let step = 0, held = false, holdProgress = 0;
    const draw = () => {
      body.replaceChildren(); steps.textContent = ['1. Intent', '2. Reason', '3. Fine print', '4. Escape'].map((s, i) => (i === step ? '▸ ' : i < step ? '✓ ' : '') + s).join('  /  ');
      if (step === 0) {
        body.append(node('h4', '', 'What would you like to do?'));
        body.append(button('Pause membership', () => trap('Paused billing for zero days. This is not cancellation.', 3)), button('Cancel membership', () => { step++; draw(); }, 'primary'));
      } else if (step === 1) {
        body.append(node('h4', '', 'Tell us why you’re leaving.'));
        const reason = select('Reason', [['price', 'It costs too much'], ['time', 'No time'], ['cancel', 'I simply wish to cancel']]); body.append(reason.label);
        body.append(button('Continue', () => {
          if (reason.input.value !== 'cancel') {
            trap('Your reason has qualified you for an offer you did not request.');
            popup('A very special towel', 'Stay for another year and save 5% on a towel. Close this offer to keep leaving.', () => { step++; draw(); }, false);
            return;
          }
          step++; draw();
        }));
      } else if (step === 2) {
        body.append(node('h4', '', 'Just two final preferences.'));
        const confirm = checkbox('I understand my access will end', false);
        const renew = checkbox('Keep my benefits by renewing for 12 months', true);
        body.append(confirm.label, renew.label); note(body, 'Read every word. “Keep my benefits” means “keep charging me”.');
        body.append(button('Cancel cancellation', () => { step = 0; trap('Cancellation cancelled. Your gym is delighted.', 3); draw(); }), button('Continue cancelling', () => {
          if (!confirm.input.checked || renew.input.checked) return trap('The form still authorizes your membership. Check your checkboxes.', 2);
          step++; draw();
        }, 'primary'));
      } else {
        body.append(node('h4', '', 'Hold to actually cancel.'));
        body.append(node('p', '', 'Keep pressing the button (or Space) until the receipt prints. Letting go slowly restores your membership.'));
        const fill = meter(body, 'Cancellation confirmation');
        const hold = button('Hold to cancel', () => {}); body.append(hold);
        bindHold(hold, value => held = value);
        update = dt => {
          holdProgress = Math.max(0, Math.min(100, holdProgress + dt * (held ? 34 : cursed ? -48 : -15)));
          fill(holdProgress); hold.textContent = held ? `Cancelling… ${Math.floor(holdProgress)}%` : 'Hold to cancel';
          if (holdProgress >= 100) end(true, 'Cancellation receipt issued. You have escaped cardio through administrative endurance.');
        };
      }
    };
    draw();
  }
  function bindHold(element, handler) {
    let held = false;
    const change = value => { if (held === value) return; held = value; if (value) action(); handler(value); };
    element.onpointerdown = event => { if (!running) return; element.setPointerCapture(event.pointerId); change(true); };
    element.onpointerup = element.onpointercancel = () => change(false);
    element.onkeydown = event => { if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); if (running) change(true); } };
    element.onkeyup = event => { if ([' ', 'Enter'].includes(event.key)) change(false); };
    element.onblur = () => change(false); listen(window, 'blur', () => change(false));
    disposers.push(() => change(false));
  }

  // 03 — Source selection, cable alignment, and the classic extended-desktop trap.
  function projectorGame() {
    const office = panel('Meeting room B — display settings', 'Connect the cable, choose the correct input, then show the slide.');
    const screen = node('div', 'projector-screen'); screen.innerHTML = '<span>NO SIGNAL</span><small>ROOM B · USE HDMI 2 · DUPLICATE DISPLAY</small>'; office.append(screen);
    const track = node('div', 'connection-track');
    track.innerHTML = '<span class="port wrong-port">HDMI 1</span><span class="port good-port">HDMI 2</span><span class="cable-tip">▰</span><span class="cable-wire"></span>';
    office.append(track);
    let x = 5, connected = false, direction = 0;
    const cable = track.querySelector('.cable-tip');
    const paint = () => { cable.style.left = `${x}%`; track.style.setProperty('--cable-x', `${x}%`); };
    const move = amount => { if (connected) return; x = Math.max(5, Math.min(95, x + amount)); paint(); };
    const controls = node('div', 'inline-controls');
    controls.append(button('← Nudge', () => move(-5)), button('Nudge →', () => move(5)), button('Connect cable', () => {
      if (x < 70 || x > 80) { x = 5; paint(); return trap('Connector bounced out. Aim for the HDMI 2 socket, not the identical one beside it.', 2); }
      connected = true; cable.classList.add('plugged'); say('Cable connected. The screen is still blank. Naturally.'); sound('win');
    })); office.append(controls);
    const source = select('Input source', [['1', 'HDMI 1 (default)'], ['2', 'HDMI 2'], ['vga', 'VGA (historical)']]);
    const display = select('Display mode', [['extend', 'Extend (empty second desktop)'], ['duplicate', 'Duplicate']]);
    const fields = node('div', 'field-grid'); fields.append(source.label, display.label); office.append(fields);
    office.append(button('Present slide', () => {
      if (!connected) return trap('The software cannot fix an unplugged cable. Yet.');
      if (source.input.value !== '2') { screen.firstElementChild.textContent = 'SEARCHING… WRONG INPUT'; return trap('Connected to HDMI 2. Listening to something else.', 2); }
      if (display.input.value !== 'duplicate') { screen.firstElementChild.textContent = 'A BEAUTIFUL EMPTY DESKTOP'; return trap('You are presenting your wallpaper. Try duplicating your display.', 2); }
      screen.firstElementChild.textContent = 'Q3: PLEASE CLAP'; screen.classList.add('has-signal');
      end(true, 'The slide is visible. The meeting can now have been an email.');
    }, 'primary'));
    const key = event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || /SELECT|INPUT/.test(event.target.tagName)) return;
      event.preventDefault(); if (event.type === 'keydown') { if (!direction) action(); direction = event.key === 'ArrowRight' ? 1 : -1; } else direction = 0;
    };
    listen(arena, 'keydown', key); listen(arena, 'keyup', key); listen(window, 'blur', () => direction = 0);
    update = dt => { if (direction) move(direction * dt * 20); };
    paint();
  }

  // 04 — Negative wording, recommendation sabotage, and a button with escape plans.
  function emailGame() {
    const office = panel('Email preference centre', 'Stop marketing. Keep essential account receipts. Read the negative wording.');
    const recommender = checkbox('Automatically personalize my preferences', true); office.append(recommender.label);
    note(office, 'Personalization restores unwanted subscriptions every few seconds. Apparently that’s a feature.');
    const grid = node('div', 'preference-grid'); office.append(grid);
    const prefs = [
      checkbox('Weekly deals', true), checkbox('Daily deals', true), checkbox('Deals about other deals', true),
      checkbox('Do not send partner offers', false), checkbox('Product announcements', true), checkbox('Account receipts (required)', true)
    ];
    prefs[5].input.disabled = true; prefs.forEach(pref => grid.append(pref.label));
    const counter = node('div', 'queue-status'); office.append(counter);
    const saveArea = node('div', 'save-zone'); office.append(saveArea);
    let elapsed = 0, dodges = 0;
    const save = button('Save preferences', () => {
      if (recommender.input.checked) return trap('Saved! Personalization immediately subscribed you again. Disable it first.', 2);
      if (prefs.slice(0, 5).some((pref, i) => pref.input.checked !== (i === 3))) return trap('At least one marketing permission is still enabled. Read “do not” very carefully.', 2);
      popup('Final confirmation', 'Stop receiving offers? Close this box to confirm. The button below does the opposite.');
      const box = arena.querySelector('.office-error');
      box.querySelector('.close').onclick = () => { if (!running) return; action(); box.remove(); end(true, 'Marketing disabled. A confirmation email has been sent. It contains marketing.'); };
      box.append(button('Keep me unsubscribed from unsubscribing', () => { box.remove(); prefs[0].input.checked = true; trap('Double negative detected. Weekly deals restored.', 3); }));
    }, 'save-preferences'); saveArea.append(save);
    save.onpointerenter = () => {
      if (!running || !cursed || dodges >= 3) return;
      dodges++; save.style.left = `${dodges % 2 ? 48 : 2}%`; save.style.top = `${dodges % 2 ? 33 : 0}px`;
      say('The Save button has moved for your convenience. It gets tired after three escapes.');
    };
    update = dt => {
      elapsed += dt;
      if (recommender.input.checked && elapsed >= (cursed ? 3 : 7)) { elapsed = 0; const target = prefs.slice(0, 3).find(pref => !pref.input.checked); if (target) { target.input.checked = true; animate(target.label, 'restored-setting'); say('Personalization has restored a subscription. Disable it to stop this.'); } }
      const enabled = prefs.slice(0, 5).filter((pref, i) => pref.input.checked !== (i === 3)).length;
      counter.textContent = `${enabled} marketing permissions active · 1 required receipt channel`;
    };
  }

  // 05 — Label, stamp, conveyor, a tempting reverse button, and the impossible deadline.
  function parcelGame() {
    const office = panel('Returns desk — closes in a moment', cursed ? '8 seconds allocated. 25 seconds minimum transit. Yes, management approved this.' : 'Label it, stamp it, and deliver it to Returns. Beware the express lane.');
    const label = select('Shipping label', [['home', 'Ship to: your own address'], ['returns', 'Ship to: RETURNS DEPARTMENT'], ['warehouse', 'Ship to: sales warehouse']]); office.append(label.label);
    let stamped = false, rolling = false, x = 0;
    const controls = node('div', 'inline-controls');
    const stamp = button('Stamp label', () => { stamped = true; stamp.textContent = '✓ STAMPED'; animate(stamp, 'stamp-impact'); });
    const dispatch = button('Start conveyor →', () => {
      if (!stamped) return trap('Parcel rejected: no stamp. Bureaucracy must leave a physical mark.');
      if (label.input.value !== 'returns') return trap('Wrong destination. You were about to mail your return back to yourself.', 1);
      rolling = !rolling; dispatch.textContent = rolling ? 'Pause conveyor' : 'Start conveyor →'; say(rolling ? 'Parcel in motion. It is being paid by the hour.' : 'Conveyor paused. The deadline has not been paused.');
    });
    label.input.addEventListener('change', () => { stamped = false; stamp.textContent = 'Stamp label'; rolling = false; dispatch.textContent = 'Start conveyor →'; });
    controls.append(stamp, dispatch); office.append(controls);
    const track = node('div', 'conveyor'); track.innerHTML = '<span class="moving-box">▣<small>RETURN</small></span><span class="return-bin">RETURNS<br>▾</span>'; office.append(track);
    const box = track.querySelector('.moving-box');
    const readout = node('div', 'queue-status', '0% delivered · optimism: 100%'); office.append(readout);
    const express = button('Express lane ⚡', () => { rolling = false; x = 0; box.style.left = '0%'; dispatch.textContent = 'Start conveyor →'; trap('Express DELIVERY. It delivered the parcel back to you. Read the small print.', 2); });
    office.append(express, node('small', 'fine-print', 'Express lane: outbound delivery only. Returns excluded.'));
    update = dt => {
      track.classList.toggle('rolling', rolling);
      if (!rolling) return;
      x = Math.min(80, x + dt * (cursed ? 3.2 : 13)); box.style.left = `${x}%`;
      readout.textContent = `${Math.floor(x / 80 * 100)}% delivered · ${((80 - x) / (cursed ? 3.2 : 13)).toFixed(1)}s transit remaining`;
      if (x >= 80) end(true, 'Return accepted. Refund due in 6–8 geological eras. Keep the receipt forever.');
    };
  }

  // 06 — Actual document-formatting clues with an Undo path for mistakes.
  function documentGame() {
    const office = panel('report_final.doc — Word-ish', 'Make it one page without deleting the report. The layout marks know what happened.');
    let marks = false, pageBreak = true, size = '12', damage = 0;
    const history = [];
    const snapshot = () => history.push({ pageBreak, size, damage });
    const toolbar = node('div', 'document-toolbar');
    const show = button('¶ Show formatting', () => { marks = !marks; show.setAttribute('aria-pressed', String(marks)); draw(); }); show.setAttribute('aria-pressed', 'false');
    const undo = button('↶ Undo', () => { const old = history.pop(); if (old) { ({ pageBreak, size, damage } = old); sizeSelect.input.value = size; draw(); say('Last mistake undone. Your dignity is outside the scope of this command.'); } else say('Nothing to undo. Suspiciously good start.'); });
    toolbar.append(show, undo); office.append(toolbar);
    const doc = node('div', 'paper-document'); office.append(doc);
    const sizeSelect = select('Table’s final paragraph size', [['12', '12 pt'], ['1', '1 pt'], ['72', '72 pt (maximum confidence)']], input => { snapshot(); size = input.value; if (size === '72') trap('The invisible paragraph is now larger than the quarterly profit.'); draw(); });
    office.append(sizeSelect.label);
    const status = node('div', 'queue-status'); office.append(status);
    function draw() {
      doc.replaceChildren();
      doc.append(node('b', '', 'Quarterly report'), node('p', '', 'Revenue: fine. Formatting: haunted.'));
      const table = node('div', 'mock-table', 'Q1  |  Q2  |  Q3  |  Q4'); doc.append(table);
      if (marks) {
        if (pageBreak) doc.append(button('··· Page break ···', () => { snapshot(); pageBreak = false; sound('win'); draw(); say('Page break removed. One stubborn table paragraph remains.'); }, 'format-mark page-break-mark'));
        doc.append(button('¶ Normal paragraph', () => { snapshot(); damage++; trap('That was part of the report. Undo it. The page break is a different mark.'); draw(); }, 'format-mark normal-mark'));
        doc.append(node('small', 'table-mark', `¶ End-of-table paragraph: ${size} pt (cannot be deleted)`));
      } else doc.append(node('div', 'invisible-gap', 'This space is mysteriously taking up a whole page.'));
      const pages = 1 + Number(pageBreak) + Number(size !== '1');
      status.textContent = `${pages} pages · ${damage ? 'Report content damaged — Undo required' : 'Report content intact'}`;
      doc.style.setProperty('--page-stack', `${Math.min(3, pages) * 3}px`);
    }
    office.append(button('Save one-page document', () => {
      if (damage) return trap('You deleted content. Undo that before saving.');
      if (pageBreak || size !== '1') return trap('Still too many pages. Show formatting and inspect the table’s final paragraph.', 2);
      end(true, 'One page, all content intact. Please never open this in a different version of Word.');
    }, 'primary')); draw();
  }

  // 07 — A metadata puzzle instead of guessing the most convincing filename.
  function attachmentGame() {
    const office = panel('Shared drive — FINAL files', 'Select a file to inspect its properties. Names are not evidence.');
    note(office, 'Linda: send the PDF I approved. Version 7. Exactly 2 pages. — Linda (not Linda-bot)');
    const files = [
      ['final_FINAL.pdf', 'Linda', '6', '2', 'pdf'], ['final_v7_APPROVED.pdf', 'Linda-bot', '7', '2', 'pdf'],
      ['final_really_final.pdf', 'Linda', '7', '3', 'pdf'], ['final_APPROVED.pdf.exe', 'Linda', '7', '2', 'exe'],
      ['final_FINAL_v7_actual-final(2).pdf', 'Linda', '7', '2', 'pdf'], ['use_this_one.pdf', 'Nobody', '8', '2', 'pdf'],
      ['final_v7_actual-final.pdf', 'Linda', '7', '12', 'pdf'], ['final_APPROVED_NEW.pdf', 'Pending', '7', '2', 'pdf']
    ];
    let selected = null, ascending = true;
    const columns = node('div', 'file-browser'); const list = node('div', 'file-browser-list'); const preview = node('div', 'file-preview', 'Select a file to inspect.'); columns.append(list, preview);
    office.append(button('Sort by name ↕', () => { ascending = !ascending; draw(); say('File order changed. Your selection still refers to the same file.'); }), columns);
    function inspect(file, element) {
      selected = file; list.querySelectorAll('button').forEach(b => b.classList.toggle('selected', b === element));
      preview.replaceChildren(node('div', 'file-preview-icon', file[4] === 'exe' ? '⚠' : '▤'));
      const details = node('dl');
      [['Approved by', file[1]], ['Version', file[2]], ['Pages', file[3]], ['Type', file[4] === 'exe' ? 'Application (.exe)' : 'PDF document']].forEach(([key, value]) => details.append(node('dt', '', key), node('dd', '', value)));
      preview.append(details); animate(preview, 'message-pop');
    }
    function draw() {
      list.replaceChildren(); const ordered = [...files].sort((a, b) => ascending ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0]));
      ordered.forEach(file => { const b = button('▤ ' + file[0], el => inspect(file, el)); b.classList.toggle('selected', file === selected); list.append(b); });
    }
    office.append(button('Send selected attachment', () => {
      if (!selected) return say('Select a file first. Blind confidence is not a file format.');
      if (selected[4] === 'exe') { trap('That is an application wearing a PDF costume. It has not been opened.', 4); popup('Nice try, final.pdf.exe', 'Filename extensions are part of the puzzle. Nothing was executed.'); return; }
      if (selected !== files[4]) return trap('Rejected. The approver, version, or page count does not match Linda’s note.', 3);
      end(true, 'Correct attachment sent in this simulation. Linda has already requested a minor revision.');
    }, 'primary')); draw();
  }

  // 08 — A four-room recovery adventure. Inventory and clues unlock each room.
  function bluescreenGame() {
    let room = 0, selectedItem = '', mugMoved = false, drawerOpen = false;
    let progress = 0, repairing = false, stalled = false, recoveryError = null, warned = false;
    const inventory = new Set();
    const journal = new Set(['The computer is blue. Your meeting starts soon.']);
    const itemNames = { clip: 'Paperclip', disk: 'Recovery floppy', driver: 'PRINT95 backup' };
    const shell = node('div', 'adventure');
    const path = node('div', 'adventure-path');
    const scene = node('div', 'adventure-scene');
    const inventoryBar = node('div', 'inventory-bar');
    const log = node('details', 'adventure-journal');
    log.append(node('summary', '', '▤ Clue notebook'));
    listen(log, 'toggle', () => { if (running && log.open) action(); });
    const entries = node('ul'); log.append(entries);
    shell.append(path, inventoryBar, scene, log); arena.append(shell);
    let fill, repairText, reboot;
    function remember(text) {
      journal.add(text); entries.replaceChildren(...[...journal].map(entry => node('li', '', entry)));
    }
    function collect(item, text) {
      inventory.add(item); selectedItem = item; renderInventory(); remember(text);
      say(`Found: ${itemNames[item]}. Select an inventory item, then click where to use it.`); sound('win');
    }
    function renderInventory() {
      inventoryBar.replaceChildren(node('b', '', 'INVENTORY'));
      if (!inventory.size) inventoryBar.append(node('span', 'empty-inventory', 'Empty. Look around.'));
      inventory.forEach(item => {
        const b = button(itemNames[item], () => {
          selectedItem = selectedItem === item ? '' : item;
          renderInventory(); say(selectedItem ? `${itemNames[item]} selected. Click an object to use it.` : 'Item put away.');
        }, selectedItem === item ? 'inventory-item selected' : 'inventory-item');
        b.setAttribute('aria-pressed', String(selectedItem === item)); inventoryBar.append(b);
      });
    }
    function header(title, description) {
      scene.replaceChildren(); arena.scrollTop = 0; path.textContent = ['1. The desk', '2. Boot room', '3. Driver vault', '4. Escape'].map((text, i) => `${i < room ? '✓' : i === room ? '▸' : '·'} ${text}`).join('  ');
      scene.append(node('h3', '', title), node('p', 'scene-description', description));
    }
    function inspectComputer() {
      remember('Crash report: PRINT95.SYS is the faulting driver. Do not replace MOUSE95.SYS.');
      const error = popup('STOP: 0x00000095', 'Faulting driver: PRINT95.SYS. Recovery needs a boot floppy. The drawer key has been missing since 1998.');
      error.classList.add('blue-error');
      say('Crash report added to your clue notebook. The desk may contain something useful.');
    }
    function drawDesk() {
      room = 0; header('The desk', 'The PC has crashed. Search the desk. Select an item, then click an object to use it.');
      const desk = node('div', 'desk-scene'); scene.append(desk);
      const monitor = button('▧\nBlue-screen PC', () => {
        if (selectedItem === 'disk') { inventory.delete('disk'); selectedItem = ''; renderInventory(); drawBoot(); return; }
        inspectComputer();
      }, 'desk-object desk-monitor');
      const mug = button(mugMoved ? '☕\nCold coffee' : '☕\nCoffee mug', () => {
        if (!mugMoved) { mugMoved = true; say('You moved the mug. There is a bent paperclip underneath.'); drawDesk(); }
        else say('The coffee predates the operating system. Better leave it.');
      }, 'desk-object desk-mug');
      const drawer = button(drawerOpen ? '▱\nOpen drawer' : '▰\nStuck drawer', () => {
        if (drawerOpen) { showDrawer(); return; }
        if (selectedItem !== 'clip') { say('The latch is jammed. A thin piece of metal might reach it.'); remember('The drawer latch needs something thin and metal.'); return; }
        drawerOpen = true; selectedItem = ''; renderInventory(); sound('win'); drawDesk(); showDrawer();
      }, 'desk-object desk-drawer');
      desk.append(monitor, mug, drawer);
      if (mugMoved && !inventory.has('clip')) desk.append(button('⌁ Paperclip', () => { collect('clip', 'Found a paperclip underneath the coffee mug.'); drawDesk(); }, 'desk-object desk-clip'));
      scene.append(button('Power off / on', () => trap('Same blue screen, freshly rebooted. Exploration might help more than optimism.', 3), 'tempting-shortcut'));
      note(scene, 'Nothing here controls your actual computer. This entire disaster is simulated.');
    }
    function showDrawer() {
      const box = popup('Desk drawer', 'A boot floppy, a sticky note, and twelve obsolete loyalty cards.');
      box.append(button('Take recovery floppy', () => {
        if (inventory.has('disk')) { say('You already have the floppy. It cannot become more recovered.'); return; }
        collect('disk', 'Recovery floppy found in the drawer. Insert it into the blue-screen PC.');
      }));
      box.append(button('Read sticky note', () => {
        remember('Boot code: 095. Driver vault: choose the PRINT95 backup dated BEFORE today’s update.');
        say('“Boot code 095. Use yesterday’s driver. Ignore anything marked recommended.” Added to notebook.');
      }));
    }
    function drawBoot() {
      room = 1; header('The boot room', 'The floppy is in. A recovery password protects the recovery from recovery.');
      const terminal = node('div', 'boot-terminal');
      terminal.innerHTML = '<b>ERRAND BIOS v0.95</b><p>Boot device: A: RECOVERY FLOPPY ✓</p><p>Enter the three-digit code from the drawer note.</p>';
      const codeLabel = node('label', 'game-field', 'Boot code');
      const input = document.createElement('input'); input.type = 'text'; input.inputMode = 'numeric'; input.maxLength = 3; input.autocomplete = 'off'; input.setAttribute('aria-label', 'Boot code');
      input.oninput = () => { if (running) action(); }; codeLabel.append(input); terminal.append(codeLabel);
      terminal.append(button('Unlock safe mode', () => {
        if (input.value.trim() !== '095') { trap('Incorrect boot code. Three digits. Check the notebook, or go back to the desk.', 3); animate(input, 'wrong-shake'); return; }
        selectedItem = ''; renderInventory(); sound('win'); drawVault();
      }, 'primary'));
      scene.append(terminal);
      scene.append(button('Back to desk', () => { inventory.add('disk'); renderInventory(); drawDesk(); }), button('Online recovery (recommended)', () => trap('You need a working computer to download the fix for your non-working computer.', 3)));
    }
    function drawVault() {
      room = 2; repairing = false; stalled = false; progress = 0; warned = false;
      header('The driver vault', 'Find the backup, install it in the broken slot, then restart. Inspect the dates and names.');
      const vault = node('div', 'driver-vault'); scene.append(vault);
      vault.append(button('▰ Backups folder', () => {
        const folder = popup('Driver backups', 'Choose the driver from before today’s update. Similar names do not mean similar jobs.');
        folder.classList.add('backup-folder');
        folder.append(button('MOUSE95.SYS — yesterday', () => trap('That fixes a different problem. Your mouse is doing an excellent job.', 2)));
        folder.append(button('PRINT95.SYS — today 09:01', () => trap('That is the driver that caused the crash. “Newer” is doing a lot of work here.', 2)));
        folder.append(button('PRINT95.SYS — yesterday 16:59', () => { collect('driver', 'Known-good PRINT95.SYS backup: yesterday, 16:59. Install in the broken driver slot.'); folder.remove(); }));
      }, 'vault-object'));
      const slot = button('▧ Broken driver slot', () => {
        if (selectedItem !== 'driver') return say('Select the PRINT95 backup in your inventory, then click this slot.');
        if (repairing || stalled) return;
        if (arena.querySelector('.office-error')) return say('Close the open folder or error window first.');
        inventory.delete('driver'); selectedItem = ''; renderInventory(); repairing = true; slot.disabled = true;
        say('Backup installed. Repairing the part of Windows that knows how to finish repairing.');
      }, 'vault-object'); vault.append(slot);
      const updatePolicy = checkbox('Automatically install the newest driver after repair', true); scene.append(updatePolicy.label);
      fill = meter(scene, 'Driver restoration'); repairText = node('p', 'recovery-percent', 'Waiting for a known-good driver.'); scene.append(repairText);
      reboot = button('Restart anyway', () => {
        if (!stalled) return say('Install the backup first. Then let the progress bar develop trust issues.');
        if (recoveryError && recoveryError.isConnected) return trap('Close the error about the recovered error first.');
        if (updatePolicy.input.checked) {
          trap('Automatic update reinstalled the bad driver. The backup is available again.', 3); drawVault(); return;
        }
        drawDesktop();
      }); reboot.disabled = true; scene.append(reboot);
    }
    function drawDesktop() {
      room = 3; repairing = false; header('The desktop. Almost.', 'You made it back. One notification stands between you and the meeting.');
      const restored = node('div', 'restored-desktop'); restored.innerHTML = '<span>▥</span><h3>Welcome back.</h3><p>Your files are exactly where you left them.<br>Your problems are also exactly where you left them.</p>'; scene.append(restored);
      const card = node('div', 'update-notification');
      card.append(node('b', '', '⚠ The latest printer driver is ready to install.'), node('p', '', 'This is the same update that caused the crash. We remain very excited about it.'));
      card.append(button('Install now (recommended)', () => { trap('You reinstalled the villain. Back to the driver vault.', 4); drawVault(); }), button('Remind me in 2095', () => end(true, 'You found the tools, recovered the machine, and postponed the villain until 2095. Meeting survived.'), 'primary')); scene.append(card);
    }
    remember('The computer is blue. Your meeting starts soon.'); renderInventory(); drawDesk();
    update = dt => {
      if (!repairing) return;
      progress = Math.min(99, progress + dt * (cursed ? 25 : 45)); fill(progress);
      repairText.textContent = `${Math.floor(progress)}% · ${progress < 60 ? 'Recovering driver…' : 'Preparing to prepare the final preparation…'}`;
      if (cursed && progress > 65 && !warned) { warned = true; recoveryError = popup('Recovery recovered an error', 'The error was fixed. Reporting that fix caused this error. Close it.'); }
      if (progress === 99) { repairing = false; stalled = true; repairText.textContent = '99% · Estimated time remaining: 6 years'; reboot.disabled = false; say('Repair has reached the traditional 99% stopping point. Check the update checkbox, then Restart anyway.'); }
    };
  }
  const builders = [printGame, gymGame, projectorGame, emailGame, parcelGame, documentGame, attachmentGame, bluescreenGame];
  window.openGame = index => { selector.value = String(index); start(); if (!dialog.open) dialog.showModal(); };
  $('#start-game').onclick = start;
  $('#close-game').onclick = () => dialog.close();
  dialog.addEventListener('close', stop); dialog.addEventListener('cancel', stop);
  selector.onchange = difficulty.onchange = start;
  $('#hint-button').onclick = () => {
    const hint = $('#game-hint'); hint.hidden = !hint.hidden; hint.textContent = clues[Number(selector.value)];
    $('#hint-button').setAttribute('aria-expanded', String(!hint.hidden));
  };
  $('#sound-button').onclick = () => { sounds = !sounds; $('#sound-button').textContent = sounds ? 'Sound: on' : 'Sound: off'; $('#sound-button').setAttribute('aria-pressed', String(sounds)); sound('tap'); };
})();
