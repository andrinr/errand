(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const arena = $('#game-arena');
  const dialog = $('#game-dialog');
  const message = $('#game-message');
  const selector = $('#game-select');
  const difficulty = $('#difficulty');
  const names = ['Just Print It', 'Present Your Screen', 'Stop the Emails', 'Fix the Blue Screen', 'Remove the Virus', 'Plug In a USB', 'Save Past the Goose', 'Finish the Update'];
  const clues = [
    'Driver: disable automatic recovery, use Application-managed, K channel only, Tray 1, Force single-sided. Document: local printer, page 1, one copy, A4, portrait, Raw 100%. Hardware: clear the crumpled sheet. After crashes, restart spooler and recheck profile/copies. Diagnostics reveals the real payload. Print, release with PIN 042, then collect.',
    'Use the DP Alt Mode adapter, wall HDMI 2, connect cable and adapter power, open shutter. Signal lab: HDMI 2, Duplicate, 1920×1080, 60 Hz, RGB; disable Auto source, negotiate and wait two seconds. Audience: choose calibration pattern, disable Overscan, verify four corners, then release_demo.ppt. Disable notifications, unfreeze, keep lid open, close overlays and defer the optional update. Any signal change requires a new handshake and calibration.',
    'Disable personalization and marketing. “Do not send partner offers” should stay ON. Keep receipts. Save and close the confirmation popup. Open Spam, open the confirmation email, choose Entire account, all devices, and Confirm unsubscribe.',
    'Move the mug, take the paperclip, select it and open the drawer. Take the floppy and read the note (code 095). Select the floppy and click the PC. In safe mode, find yesterday’s PRINT95 backup, select it, and install it in the broken slot. Disable automatic updates, close errors, restart at 99%, and postpone the update.',
    'In Task Manager, disable Updatr at startup, stop Updatr, then stop AdBuddy. In My Files, show extensions, select invoice.pdf.exe, and quarantine it. Close every fake Virus detected window (minimizing does not count). Open Security and Verify cleanup. Never trust the red antivirus ads.'
  ];
  clues.push('Flip contacts down, attempt insertion to reveal tools, remove dust, power the hub, insert, then open report.txt without the .exe extension.', 'Try Save. Offer peas, create /tmp/nest, ring the bell, dismiss any honking dialogs, and Save again.', 'There is no winning state. Explore updater phases, cancel, skip, restart, or end the session. This sandbox is excluded from wins.');
  selector.innerHTML = names.map((name, i) => `<option value="${i}">${String(i + 1).padStart(2, '0')} / ${name}</option>`).join('');
  let running = false, frame = 0, previous = 0, deadline = 0, began = 0;
  let actions = 0, traps = 0, game = 0, cursed = true, clockStarted = false, update = () => {};
  let disposers = [], sounds = false, audioContext;
  const wins = { cursed: new Set(), practice: new Set() };
  const durations = [75, 120, 75, 120, 150, 60, 60, 90];
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
  function action() { if (!clockStarted) { clockStarted = true; began = previous = performance.now(); deadline = began + (cursed ? durations[game] : game === 4 ? 180 : 120) * 1000; $('#game-time').textContent = `TIME: ${((deadline - began) / 1000).toFixed(1)}s`; say('Clock running. Inspect the details before committing the next action.'); } actions++; $('#game-actions').textContent = `ACTIONS: ${actions}`; sound('tap'); }
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
    $('#game-progress').textContent = `${wins[mode()].size} / ${names.length - 1} ${cursed ? 'cursed' : 'practice'} wins`;
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
    card.append(node('div', 'titlebar', game === 7 ? 'Update session report' : success ? 'Competence detected' : 'Assertion failed'));
    const body = node('div', 'result-body');
    body.append(node('div', 'result-symbol', success ? '✓' : '⌛'), node('h3', '', game === 7 ? 'Session ended.' : success ? 'Task resolved.' : 'Trivial task. Nontrivial failure.'), node('p', '', text));
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
      end(false, 'Deadline exceeded. The error has been routed to the human layer. Hint contains the repro steps.');
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
    $('#game-time').textContent = `TIME: ${cursed ? durations[game] : game === 4 ? 180 : 120}s · ready`;
    $('#game-time').classList.remove('time-danger');
    say('Ready to play. Your first game action starts the clock.');
    builders[game](); arena.focus(); frame = requestAnimationFrame(beginFrame);
  }

  // 01 — The visible controls and the driver payload intentionally disagree.
  function printGame() {
    const office = panel('Print — benchmark.pdf', 'Print one page, in black and white, on the printer beside you.');
    const specification = node('div', 'printer-specification'); specification.hidden = true; office.append(specification);
    note(specification, 'JOB SPEC / Desk LaserJet · page 1 · 1 copy · A4 · portrait · 100% · black ink only · single-sided. Release PIN: 042.');
    const tabs = node('div', 'printer-tabs'); tabs.hidden = true; office.append(tabs);
    const panes = {};
    for (const name of ['Document', 'Driver', 'Diagnostics', 'Hardware']) {
      const pane = node('div', 'printer-pane'); pane.hidden = name !== 'Document'; panes[name] = pane; office.append(pane);
      const tab = button(name, () => {
        for (const [key, item] of Object.entries(panes)) item.hidden = key !== name;
        tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.textContent === name)));
        if (name === 'Diagnostics') { renderDiagnostics(); revealHardware(); }
      }); tab.setAttribute('aria-pressed', String(name === 'Document')); tabs.append(tab);
      if (name !== 'Document') tab.hidden = true;
    }
    let jammed = true, spooler = true, printing = false, progress = 0, held = false, released = false, finished = false;
    const log = ['Driver loaded: UniversalPrint_95_beta_FINAL.dll', 'INFO: UI values may differ from effective settings.'];
    const target = select('Printer', [['pdf', 'Save to PDF (recommended)'], ['remote', 'Office LaserJet — floor 6'], ['local', 'Desk LaserJet (Copy 2) — this room']]);
    const pages = select('Pages', [['all', 'All pages (2)'], ['one', 'Page 1 only'], ['current', 'Current page (page 2, blank)']]);
    const paper = select('Paper size', [['letter', 'Letter'], ['a4', 'A4']]);
    const copies = select('Copies', [['2', '2'], ['1', '1'], ['99', '99 (stress test)']]);
    const orientation = select('Orientation', [['landscape', 'Landscape'], ['portrait', 'Portrait']]);
    const scale = select('Scaling', [['fit', 'Fit to page'], ['actual', 'Actual size (driver optimized)'], ['raw', 'Raw 100% — disable fit']]);
    const docGrid = node('div', 'field-grid'); docGrid.append(target.label, pages.label); panes.Document.append(docGrid);
    const documentDetails = node('div', 'field-grid printer-document-details'); documentDetails.hidden = true; documentDetails.append(paper.label, copies.label, orientation.label, scale.label); panes.Document.append(documentDetails);
    const properties = button('Printer properties…', () => revealDocument()); panes.Document.append(properties);
    function revealDocument() { documentDetails.hidden = false; specification.hidden = false; properties.hidden = true; }
    function revealHardware() { tabs.querySelectorAll('button').forEach(tab => { if (tab.textContent === 'Hardware') tab.hidden = false; }); }
    function revealTroubleshooting() {
      revealDocument(); tabs.hidden = false; queue.hidden = false;
      tabs.querySelectorAll('button').forEach(tab => { if (tab.textContent !== 'Hardware') tab.hidden = false; });
      controls.firstElementChild.hidden = false;
    }
    const profile = select('Driver profile', [['auto', 'Recommended / automatic'], ['photo', 'Photo enhancement'], ['app', 'Application-managed / no overrides']]);
    const ink = select('Color mode', [['bw', 'Black & white (composite CMY)'], ['gray', 'Grayscale (photo pipeline)'], ['k', 'Advanced: K channel only']]);
    const tray = select('Paper source', [['auto', 'Auto select'], ['tray1', 'Tray 1 — A4']]);
    const sides = select('Duplex', [['auto', 'Off (inherit driver default)'], ['simplex', 'Force single-sided'], ['double', 'Long-edge duplex']]);
    const recovery = checkbox('Automatic driver recovery (recommended)', true);
    const preserve = checkbox('Preserve settings after a spooler crash', false);
    const driverGrid = node('div', 'field-grid'); driverGrid.append(profile.label, ink.label, tray.label, sides.label); panes.Driver.append(driverGrid, recovery.label, preserve.label);
    panes.Driver.append(node('p', 'fine-print', '“Recommended” is a configuration source, not a quality guarantee. Auto recovery reloads the same broken driver.'));
    const diagnostic = node('pre', 'effective-settings'); panes.Diagnostics.append(node('h4', '', 'Effective device payload'), diagnostic);
    const crashLog = node('pre', 'printer-crash-log'); panes.Diagnostics.append(node('h4', '', 'Spooler log'), crashLog);
    const effective = () => ({
      destination: target.input.value,
      pages: pages.input.value === 'one' ? '1' : pages.input.value === 'current' ? '2 (blank)' : '1–2',
      copies: profile.input.value === 'auto' ? '2' : copies.input.value,
      paper: profile.input.value === 'auto' || tray.input.value === 'auto' ? 'Letter' : paper.input.value === 'a4' ? 'A4' : 'Letter',
      orientation: orientation.input.value,
      scale: scale.input.value === 'raw' && profile.input.value === 'app' ? '100%' : '97%',
      ink: ink.input.value === 'k' && profile.input.value === 'app' ? 'K only' : 'CMY composite',
      sides: sides.input.value === 'simplex' && profile.input.value === 'app' ? 'single-sided' : 'duplex'
    });
    function renderDiagnostics() {
      diagnostic.textContent = Object.entries(effective()).map(([key, value]) => `${key.padEnd(13)} ${value}`).join('\n');
      crashLog.textContent = log.slice(-6).join('\n');
    }
    const hardware = node('div', 'printer-hardware');
    hardware.innerHTML = '<div class="hardware-printer">▣<span>DESK LASERJET / TRAY 1</span></div><p>Paper path: <b class="jam-state">BLOCKED</b></p>';
    hardware.append(button('Open paper tray', () => {
      if (arena.querySelector('.tray-dialog')) return;
      const box = popup('Paper tray', 'The flat sheet is the supply. The crumpled sheet is stuck in the feed rollers.'); box.classList.add('tray-dialog');
      box.append(button('Pull the flat sheet', () => trap('Paper supply removed and reloaded. The jam is a different sheet.', 2)));
      const clear = button('Remove crumpled sheet', b => { jammed = false; b.textContent = '✓ Jam cleared'; b.disabled = true; hardware.querySelector('.jam-state').textContent = 'CLEAR'; say('Physical obstruction removed. The driver remains a separate problem.'); });
      clear.disabled = !jammed; box.append(clear);
    })); panes.Hardware.append(hardware);
    const queue = node('div', 'queue-status', 'Job not submitted · spooler running · effective settings unverified'); queue.hidden = true; office.append(queue);
    const progressBar = meter(office, 'Print queue'); office.querySelector('.task-meter').hidden = true;
    const output = node('div', 'paper-output'); output.innerHTML = '<span class="output-slot"></span><span class="printed-sheet">BENCHMARK<br>ONE PAGE.<br><small>VERIFIED</small></span>'; office.append(output);
    const controls = node('div', 'inline-controls'); office.append(controls);
    function crash(reason) {
      revealTroubleshooting();
      spooler = false; printing = false;
      const reset = !preserve.input.checked;
      if (reset) { profile.input.value = 'auto'; copies.input.value = '2'; }
      log.push(`CRASH: ${reason}`, reset ? 'RESET: profile=auto, copies=2. Preserve settings was off.' : 'RECOVER: settings preserved.'); renderDiagnostics();
      queue.textContent = 'spoolsv.exe has stopped. Manual restart required.';
      popup('spoolsv.exe crashed', 'Automatic recovery reloads the broken driver. Disable it in Driver, inspect Diagnostics, then restart the spooler.', () => {}, true);
      trap('Spooler crash. ' + (reset ? 'Driver profile and copies silently reverted to defaults.' : 'Your settings survived.'), 2);
    }
    controls.append(button('Restart spooler', () => {
      if (recovery.input.checked) return crash('RECOVERY_LOOP');
      spooler = true; log.push('SERVICE: manual restart OK'); renderDiagnostics(); queue.textContent = 'Spooler running. Recheck settings after the crash.'; say('Service restarted. Disabled auto recovery breaks the crash loop.');
    }));
    const print = button('Print', () => {
      if (printing || held || finished) return say('One job is already active. Queue duplication is not progress.');
      if (arena.querySelector('.office-error')) return trap('Close the modal stack before submitting another job.');
      if (!spooler) return trap('Service stopped. Use Restart spooler after disabling automatic recovery.');
      if (recovery.input.checked) return crash('AUTO_RECOVERY_REENTERED_ITSELF');
      const e = effective();
      if (e.destination === 'pdf') return trap('Exported benchmark.pdf to benchmark(1).pdf. E_PAPER_NOT_FOUND.', 2);
      if (e.destination !== 'local') return trap('Job routed to the wrong environment. Diagnostics shows the resolved destination.', 2);
      const wrong = [];
      if (e.pages !== '1') wrong.push('pages'); if (e.copies !== '1') wrong.push('copies'); if (e.paper !== 'A4') wrong.push('paper');
      if (e.orientation !== 'portrait') wrong.push('orientation'); if (e.scale !== '100%') wrong.push('scale'); if (e.ink !== 'K only') wrong.push('ink'); if (e.sides !== 'single-sided') wrong.push('sides');
      if (wrong.length) { log.push('PREFLIGHT_MISMATCH: ' + wrong.join(', ')); renderDiagnostics(); return trap('Output does not match the spec. Check the effective payload in Diagnostics. Visible labels are not authoritative.', 1); }
      if (jammed) { revealHardware(); return trap('PAPER_JAM. Hardware tab. No software setting can uncrumple a sheet.'); }
      printing = true; office.querySelector('.task-meter').hidden = false; queue.textContent = 'Job accepted. Spooling…';
    }, 'primary'); controls.append(print); controls.firstElementChild.hidden = true;
    const release = node('div', 'secure-release'); release.hidden = true;
    release.append(node('h4', '', 'Secure release / one more gate'));
    const pinLabel = node('label', 'game-field', 'Release PIN');
    const pin = document.createElement('input'); pin.type = 'text'; pin.inputMode = 'numeric'; pin.maxLength = 3; pin.setAttribute('aria-label', 'Release PIN'); pin.oninput = () => { if (running) action(); }; pinLabel.append(pin); release.append(pinLabel);
    release.append(button('Release print job', () => {
      if (pin.value !== '042') return trap('PIN mismatch. The note includes the leading zero.', 2);
      released = true; held = false; printing = true; progress = 70; release.hidden = true; say('Release accepted. Collect the page when it actually exits the printer.');
    })); office.append(release);
    const collect = button('Collect output', () => {
      if (!finished) return trap('Output tray empty. A successful RPC is not proof of paper.');
      end(true, 'One page. Every parameter correct. No CMY used. The physical world finally passed an assertion.');
    }); collect.hidden = true; office.append(collect);
    output.hidden = true;
    renderDiagnostics();
    update = dt => {
      if (!printing || held || finished) return;
      progress = Math.min(100, progress + dt * 36); progressBar(progress);
      queue.textContent = `${Math.floor(progress)}% · ${released ? 'Hardware producing output' : 'Spooling to device'}`;
      output.style.setProperty('--paper-progress', released ? String((progress - 70) / 30) : '0');
      if (!released && progress >= 99) { held = true; release.hidden = false; queue.textContent = 'Job held. Secure release required.'; release.scrollIntoView?.({ block: 'nearest' }); say('Payload is correct. Enter the PIN from the job spec, then collect output.'); }
      if (released && progress >= 100) { finished = true; output.hidden = false; collect.hidden = false; queue.textContent = 'Output tray: 1 correct page. Collect to complete.'; }
    };
  }
  // 02 — Source selection, cable alignment, and the classic extended-desktop trap.
  function projectorGame() {
    const office = panel('Present — release_demo.ppt', 'Show this slide on the meeting-room screen.');
    const screen = node('div', 'projector-screen');
    screen.setAttribute('aria-live', 'polite'); office.append(screen);
    const status = node('p', 'signal-status'); status.hidden = true; office.append(status);
    const tabs = node('div', 'inline-controls'); tabs.hidden = true; office.append(tabs);
    const sections = ['1 / Cable drawer', '2 / Signal lab', '3 / Audience view'].map(title => {
      const section = node('section', 'hdmi-stage'); section.append(node('h4', '', title)); office.append(section); return section;
    });
    const showStage = index => { sections.forEach((section, i) => section.hidden = i !== index); [...tabs.children].forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === index))); };
    sections.forEach((section, i) => tabs.append(button(section.firstChild.textContent, () => showStage(i))));
    tabs.children[1].hidden = true; tabs.children[2].hidden = true;
    const present = button('Present slide', () => {
      present.hidden = true; tabs.hidden = false; status.hidden = false; showStage(0);
      say('No display detected. Check the cable drawer; the laptop has no HDMI port.');
    }, 'primary'); office.append(present);
    let connected = false, powered = false, shutter = true, frozen = false, lidClosed = false;
    let synced = false, syncing = 0, calibrated = false, scanAge = 0, scanTriggered = false, updateOffered = false;
    const hardware = sections[0], lab = sections[1], audience = sections[2];
    const invalidate = reason => { synced = false; syncing = 0; calibrated = false; scanAge = 0; refresh(); say(reason + ' Re-read EDID to negotiate a fresh signal.'); };
    const adapter = select('Adapter from drawer', [['charge', 'USB-C hub · executive edition'], ['reverse', 'HDMI → USB-C · active converter'], ['video', 'USB-C → HDMI · DP Alt Mode']], () => {
      connected = false; invalidate('Adapter swapped; cable disconnected.');
    });
    const socket = select('Wall socket', [['1', 'HDMI 1 · conference capture'], ['2', 'HDMI 2 · room projector']], () => { connected = false; invalidate('Wall route changed; reconnect the cable.'); });
    hardware.append(adapter.label, socket.label);
    note(hardware, 'Drawer inventory: executive hub = charging only. The active converter is directional. DP Alt Mode adapter needs USB power. Wall HDMI 1 records; HDMI 2 projects.');
    hardware.append(button('Connect cable', () => {
      if (adapter.input.value === 'charge') return trap('USB power detected. Video lanes: not installed. The executive hub only charges.', 2);
      if (adapter.input.value === 'reverse') return trap('Converter points from HDMI to USB-C. This signal needs the opposite direction.', 2);
      connected = true; tabs.children[1].hidden = false; invalidate('Cable seated. Physical connection is not a handshake.');
    }));
    const powerButton = button('Connect adapter power', btn => {
      powered = !powered; btn.textContent = powered ? 'Disconnect adapter power' : 'Connect adapter power'; invalidate(powered ? 'Adapter powered.' : 'Adapter lost power.');
    }); hardware.append(powerButton);
    const shutterButton = button('Open lens shutter', btn => {
      shutter = !shutter; btn.textContent = shutter ? 'Open lens shutter' : 'Close lens shutter'; calibrated = false; refresh(); say(shutter ? 'Shutter closed. Signal still exists behind it.' : 'Lens open. Check the actual audience view.');
    }); hardware.append(shutterButton);
    hardware.append(button('Read projector label', () => { popup('Room B / service label', 'Native signal: 1920×1080, 60 Hz, RGB. HDMI 2. Turn off Auto source and Overscan. After any connection or signal-format change, re-read EDID. Calibration requires four visible corner markers.'); }));
    const changed = () => invalidate('Signal settings changed. Cached capabilities are now stale.');
    const source = select('Input source', [['1', 'HDMI 1'], ['2', 'HDMI 2'], ['auto', 'Auto (recommended)']], changed);
    const display = select('Display mode', [['extend', 'Extend'], ['duplicate', 'Duplicate'], ['internal', 'Laptop only']], changed);
    const resolution = select('Resolution', [['4k', '3840×2160 · recommended by laptop'], ['1080', '1920×1080 · projector native']], changed);
    const refreshRate = select('Refresh rate', [['120', '120 Hz · smoother meetings'], ['60', '60 Hz']], changed);
    const color = select('Color format', [['hdr', 'HDR · automatic'], ['rgb', 'RGB · 8-bit']], changed);
    const fields = node('div', 'field-grid'); fields.append(source.label, display.label, resolution.label, refreshRate.label, color.label); lab.append(fields);
    const auto = checkbox('Automatically switch to newly detected sources', true, () => { scanAge = 0; refresh(); });
    lab.append(auto.label);
    const issue = () => !connected ? 'No cable seated.' : !powered ? 'Adapter has no power.' : socket.input.value !== '2' ? 'Wall route goes to the recorder, not the projector.' : source.input.value !== '2' ? 'Projector listening on the wrong input.' : resolution.input.value !== '1080' || refreshRate.input.value !== '60' || color.input.value !== 'rgb' ? 'Unsupported timing: use 1920×1080 / 60 Hz / RGB.' : '';
    const progress = meter(lab, 'HDMI handshake');
    lab.append(button('Read EDID / negotiate signal', () => {
      const problem = issue(); if (problem) { invalidate(problem); return trap(problem, 2); }
      synced = false; calibrated = false; syncing = 2; progress(0); refresh(); say('Reading display capabilities. Keep the cable and signal settings stable for two seconds.');
    }));
    const diagnostics = node('pre', 'hdmi-diagnostics'); lab.append(diagnostics);
    lab.append(button('Inspect signal diagnostics', () => {
      diagnostics.textContent = `PHYSICAL: ${connected ? 'seated' : 'disconnected'} / POWER: ${powered ? 'yes' : 'no'}\nROUTE: wall HDMI ${socket.input.value} → input ${source.input.value}\nTIMING: ${resolution.input.value} / ${refreshRate.input.value} Hz / ${color.input.value}\nEDID: ${synced ? 'negotiated' : syncing ? 'reading' : 'stale or missing'}\n${issue() || 'Transport compatible.'}\nSHUTTER: ${shutter ? 'closed' : 'open'} / AUTO SOURCE: ${auto.input.checked ? 'armed' : 'off'}`;
    }));
    note(lab, 'The laptop advertises 4K/120. The projector does not. A successful handshake survives only until somebody “helps” with a setting.');
    const content = select('Content to share', [['desktop', 'Entire desktop (recommended)'], ['notes', 'speaker_notes.txt'], ['pattern', 'Four-corner calibration pattern'], ['slides', 'release_demo.ppt']], () => { refresh(); });
    const overscan = checkbox('Overscan (recommended: fill screen)', true, () => { calibrated = false; refresh(); });
    const notifications = checkbox('Show desktop notifications while presenting', true, () => refresh());
    audience.append(content.label, overscan.label, notifications.label);
    const freezeButton = button('Freeze projector frame', btn => { frozen = !frozen; btn.textContent = frozen ? 'Unfreeze projector frame' : 'Freeze projector frame'; calibrated = false; refresh(); });
    const lidButton = button('Close laptop lid', btn => { lidClosed = !lidClosed; btn.textContent = lidClosed ? 'Open laptop lid' : 'Close laptop lid'; invalidate(lidClosed ? 'Laptop asleep. The cached frame was not a live signal.' : 'Laptop awake.'); });
    audience.append(freezeButton, lidButton);
    note(audience, 'Show the calibration pattern and confirm all four corners before sharing the deck. Freeze is not a privacy filter. Closing the lid suspends the source.');
    const visibleIssue = () => issue() || (!synced ? 'No current HDMI handshake.' : lidClosed ? 'Laptop asleep.' : shutter ? 'Lens shutter is closed.' : display.input.value !== 'duplicate' ? 'The projector sees an empty extended desktop.' : frozen ? 'Projector frame is frozen.' : '');
    audience.append(button('Verify four corners', () => {
      const problem = visibleIssue(); if (problem) return trap(problem, 2);
      if (content.input.value !== 'pattern') return trap('Load the four-corner calibration pattern first. A slide cannot verify its own missing edges.');
      if (overscan.input.checked) return trap('Only the center of the pattern is visible. Overscan cropped the corner markers.', 2);
      calibrated = true; refresh(); say('Four corners visible. Calibration saved. Switch to release_demo.ppt; keep this signal configuration.');
    }));
    audience.append(button('Go live', () => {
      const problem = visibleIssue(); if (problem) return trap(problem, 2);
      if (!calibrated || overscan.input.checked) return trap('Audience framing unverified. Check all four calibration corners first.', 2);
      if (content.input.value !== 'slides') return trap('Wrong content. The audience needs release_demo.ppt, not your notes or calibration pattern.', 2);
      if (notifications.input.checked) { popup('Notification preview', 'build-bot: production is red. This alert is now on the projector.'); return trap('Disable notifications and dismiss the existing overlay.', 2); }
      if (arena.querySelector('.office-error')) return trap('An overlay is still covering the audience view. Close it.');
      if (auto.input.checked) return trap('Auto source is still armed. Disable it before the conference recorder steals the input.', 2);
      if (cursed && !updateOffered) {
        updateOffered = true;
        const alert = popup('Display driver / optional update', 'Close to defer. Installing resets the signal profile and audience calibration.');
        alert.append(button('Install & restart now', () => {
          alert.remove(); resolution.input.value = '4k'; refreshRate.input.value = '120'; color.input.value = 'hdr'; content.input.value = 'desktop'; notifications.input.checked = true; invalidate('Driver restarted with laptop defaults.'); trap('The optional update invalidated the working configuration.', 4);
        })); return;
      }
      end(true, 'Powered adapter, native timing, stable HDMI handshake, four visible corners, correct live slide. The audience sees what the laptop claimed all along.');
    }, 'primary'));
    function refresh() {
      let text = issue() ? 'NO SIGNAL' : syncing ? 'NEGOTIATING EDID…' : !synced ? 'STALE HANDSHAKE' : lidClosed ? 'SOURCE ASLEEP' : shutter ? 'BLACK SCREEN / SHUTTER CLOSED' : display.input.value !== 'duplicate' ? 'EMPTY EXTENDED DESKTOP' : frozen ? 'FROZEN FRAME / NOT LIVE' : content.input.value === 'pattern' ? (overscan.input.checked ? '… PATTERN EDGES CROPPED …' : '┌ TOP LEFT       TOP RIGHT ┐\n└ BOTTOM LEFT  BOTTOM RIGHT ┘') : content.input.value === 'slides' ? 'HELLO, WORLD. / RELEASE DEMO' : content.input.value === 'notes' ? 'PRIVATE: THE DEMO ONLY WORKS LOCALLY' : '17 TABS. 4 TERMINALS. ONE .ENV FILE.';
      screen.textContent = text; screen.classList.toggle('has-signal', synced && !shutter && !lidClosed);
      status.textContent = `Cable ${connected ? '✓' : '—'} · Power ${powered ? '✓' : '—'} · EDID ${synced ? '✓' : '—'} · Corners ${calibrated ? '✓' : '—'} · Auto source ${auto.input.checked ? 'ARMED' : 'off'}`;
      if (!syncing && !synced) progress(0);
    }
    update = dt => {
      if (syncing > 0) { syncing = Math.max(0, syncing - dt); progress((2 - syncing) / 2 * 100); if (!syncing) { synced = true; tabs.children[2].hidden = false; scanAge = 0; refresh(); say('HDMI handshake complete. Inspect the audience view; a signal alone is not a presentation.'); } }
      if (synced && auto.input.checked && !scanTriggered) { scanAge += dt; if (scanAge >= 4) { scanTriggered = true; source.input.value = '1'; invalidate('Conference recorder woke up; Auto source switched to HDMI 1.'); popup('New source detected', 'Auto source selected the recorder. Disable automatic switching, restore HDMI 2, and negotiate again.'); } }
    };
    sections.forEach(section => section.hidden = true); refresh();
  }

  // 03 — Negative wording, recommendation sabotage, and a button with escape plans.
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
      box.querySelector('.close').onclick = () => { if (!running) return; action(); box.remove(); openConfirmationInbox(); };
      box.append(button('Keep me unsubscribed from unsubscribing', () => { box.remove(); prefs[0].input.checked = true; trap('Double negative detected. Weekly deals restored.', 3); }));
    }, 'save-preferences'); saveArea.append(save);
    let inboxOpened = false;
    function openConfirmationInbox() {
      if (inboxOpened) return;
      inboxOpened = true;
      office.querySelectorAll('input,button').forEach(el => el.disabled = true);
      const mail = node('div', 'confirmation-mail');
      mail.append(node('h4', '', 'Step 2 / confirm by email'));
      note(mail, 'Preferences are staged, not committed. The confirmation email was classified as spam by our own filter.');
      const folders = node('div', 'inline-controls');
      const messages = node('div', 'mock-inbox');
      const showFolder = spam => {
        messages.replaceChildren();
        if (!spam) {
          messages.append(node('p', '', 'Inbox (1): “Before you go: 20% off!”'));
          messages.append(button('Claim farewell offer', () => trap('That link would create a new marketing subscription. Request rejected. Try the Spam folder.', 3)));
        } else {
          messages.append(button('Open: confirm unsubscribe request', () => {
            messages.replaceChildren(node('p', '', 'From: preferences@errand.invalid'), node('b', '', 'Your request is ready to commit.'));
            const scope = select('Apply unsubscribe to', [['browser', 'This browser only'], ['account', 'Entire account, all devices']]);
            messages.append(scope.label);
            messages.append(button('Keep my account subscribed', () => trap('That is the rollback link. You still have a chance to read the other button.', 2)));
            messages.append(button('Confirm unsubscribe', () => {
              if (scope.input.value !== 'account') return trap('Local preference saved. Every other device remains subscribed. Choose the account-wide scope.', 2);
              end(true, 'Account-wide unsubscribe committed. All marketing channels off. Transactional receipts still enabled.');
            }, 'primary'));
          }));
        }
      };
      folders.append(button('Inbox (1)', () => showFolder(false)), button('Spam (1)', () => showFolder(true)));
      mail.append(folders, messages); office.append(mail); showFolder(false); mail.scrollIntoView?.({ block: 'nearest' });
      say('One more verification step. Open the confirmation email; inspect the folder and scope.');
    }
    save.onpointerenter = () => {
      if (!running || !cursed || dodges >= 3) return;
      dodges++; save.style.left = `${dodges % 2 ? 48 : 2}%`; save.style.top = `${dodges % 2 ? 33 : 0}px`;
      say('Save changed coordinates. The avoidance handler has a retry budget of three.');
    };
    update = dt => {
      elapsed += dt;
      if (!inboxOpened && recommender.input.checked && elapsed >= (cursed ? 3 : 7)) { elapsed = 0; const target = prefs.slice(0, 3).find(pref => !pref.input.checked); if (target) { target.input.checked = true; animate(target.label, 'restored-setting'); say('Personalization has restored a subscription. Disable it to stop this.'); } }
      const enabled = prefs.slice(0, 5).filter((pref, i) => pref.input.checked !== (i === 3)).length;
      counter.textContent = `${enabled} marketing permissions active · 1 required receipt channel`;
    };
  }

  // 04 — A four-room recovery adventure. Inventory and clues unlock each room.
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
        else say('Caffeine cache expired. The paperclip underneath was the useful dependency.');
      }, 'desk-object desk-mug');
      const drawer = button(drawerOpen ? '▱\nOpen drawer' : '▰\nStuck drawer', () => {
        if (drawerOpen) { showDrawer(); return; }
        if (selectedItem !== 'clip') { say('The latch is jammed. A thin piece of metal might reach it.'); remember('The drawer latch needs something thin and metal.'); return; }
        drawerOpen = true; selectedItem = ''; renderInventory(); sound('win'); drawDesk(); showDrawer();
      }, 'desk-object desk-drawer');
      desk.append(monitor, mug, drawer);
      if (mugMoved && !inventory.has('clip')) desk.append(button('⌁ Paperclip', () => { collect('clip', 'Found a paperclip underneath the coffee mug.'); drawDesk(); }, 'desk-object desk-clip'));
      scene.append(button('Power off / on', () => trap('Rebooted into the same failure state. This bug is deterministic.', 3), 'tempting-shortcut'));
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
      const restored = node('div', 'restored-desktop'); restored.innerHTML = '<span>▥</span><h3>Welcome back.</h3><p>User session restored.<br>Windows Update has rejoined the incident.</p>'; scene.append(restored);
      const card = node('div', 'update-notification');
      card.append(node('b', '', '⚠ The latest printer driver is ready to install.'), node('p', '', 'This is the same update that caused the crash. We remain very excited about it.'));
      card.append(button('Install now (recommended)', () => { trap('You reinstalled the villain. Back to the driver vault.', 4); drawVault(); }), button('Remind me in 2095', () => end(true, 'Recovery chain complete. Known-good driver restored. Regression deferred until 2095.'), 'primary')); scene.append(card);
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
  // 05 — A sandboxed desktop; every file, process, warning and scan is fictional.
  function virusGame() {
    let startup = true, guardian = true, adware = true, quarantined = false;
    let extensions = false, chosen = null, z = 10, alertSerial = 0, spawnClock = 0;
    let scanning = false, scanProgress = 0, renderScan = () => {};
    const windows = new Map();
    const alerts = new Set();
    const desktop = node('div', 'infected-desktop');
    desktop.innerHTML = '<div class="virus-wallpaper"><b>Errand 95</b><span>Unauthorized background tasks. Authorized suffering.</span></div>';
    const hud = node('div', 'virus-hud'); desktop.append(hud);
    const icons = node('div', 'virus-icons'); desktop.append(icons);
    const taskbar = node('div', 'virus-taskbar');
    const tasks = node('div', 'virus-running-apps');
    const tray = node('span', 'virus-tray', '☣ Infected');
    const startMenu = node('div', 'virus-start-menu window'); startMenu.hidden = true;
    const startButton = button('▦ Start', () => { startMenu.hidden = !startMenu.hidden; startButton.setAttribute('aria-expanded', String(!startMenu.hidden)); });
    startButton.setAttribute('aria-expanded', 'false');
    taskbar.append(startButton, tasks, tray); desktop.append(startMenu, taskbar); arena.append(desktop);
    const targets = [
      ['notes', '▤', 'READ ME', openNotes], ['tasks', '▥', 'Task Manager', openTasks],
      ['files', '▰', 'My Files', openFiles], ['security', '♜', 'Security', openSecurity],
      ['bin', '▧', 'Recycle Bin', () => openWindow('bin', 'Recycle Bin', body => { body.append(node('p', '', 'Empty. Malware does not implement garbage collection.')); })]
    ];
    for (const [, symbol, label, handler] of targets) {
      const icon = button(`${symbol}\n${label}`, handler, 'virus-desktop-icon'); icons.append(icon);
      startMenu.append(button(`${symbol} ${label}`, () => { startMenu.hidden = true; startButton.setAttribute('aria-expanded', 'false'); handler(); }));
    }
    function renderHUD() {
      const stopped = !guardian && !adware;
      hud.textContent = `${startup ? '□' : '✓'} Startup  ${stopped ? '✓' : '□'} Processes  ${quarantined ? '✓' : '□'} Quarantine  ${alerts.size ? '□' : '✓'} Alerts`;
      tray.textContent = quarantined ? '♜ Contained' : '☣ Infected';
      desktop.classList.toggle('virus-contained', quarantined);
    }
    function openWindow(id, title, draw, options = {}) {
      if (windows.has(id)) {
        const existing = windows.get(id); existing.element.hidden = false; existing.element.style.zIndex = String(++z); return existing;
      }
      const element = node('section', `virus-window window ${options.rogue ? 'rogue-window' : ''}`);
      element.setAttribute('aria-label', title);
      const bar = node('div', 'titlebar');
      const caption = node('span', '', title), controls = node('div', 'virus-window-controls');
      const body = node('div', 'virus-window-body');
      const task = button(title, () => { element.hidden = !element.hidden; if (!element.hidden) element.style.zIndex = String(++z); }, 'virus-task');
      task.title = title; tasks.append(task);
      let maximized = false;
      const minimize = button('_', () => element.hidden = true, 'close'); minimize.setAttribute('aria-label', `Minimize ${title}`);
      const maximize = button('□', () => { maximized = !maximized; element.classList.toggle('maximized', maximized); }, 'close'); maximize.setAttribute('aria-label', `Maximize ${title}`);
      const close = button('×', () => closeWindow(id), 'close'); close.setAttribute('aria-label', `Close ${title}`);
      controls.append(minimize, maximize, close); bar.append(caption, controls); element.append(bar, body);
      const offset = windows.size * 17;
      element.style.left = `${Math.min(95 + offset % 70, Math.max(7, desktop.clientWidth - 295))}px`;
      element.style.top = `${51 + offset % 80}px`; element.style.zIndex = String(++z);
      const win = { element, body, task, draw }; windows.set(id, win); desktop.append(element);
      element.onpointerdown = () => element.style.zIndex = String(++z);
      element.addEventListener('focusin', () => element.style.zIndex = String(++z));
      let drag = null;
      bar.onpointerdown = event => {
        if (!running || event.target.closest('button') || maximized) return;
        action(); bar.setPointerCapture(event.pointerId);
        drag = { x: event.clientX, y: event.clientY, left: element.offsetLeft, top: element.offsetTop };
      };
      bar.onpointermove = event => {
        if (!drag || !running) return;
        element.style.left = `${Math.max(0, Math.min(desktop.clientWidth - element.offsetWidth, drag.left + event.clientX - drag.x))}px`;
        element.style.top = `${Math.max(32, Math.min(desktop.clientHeight - 64, drag.top + event.clientY - drag.y))}px`;
      };
      bar.onpointerup = bar.onpointercancel = () => drag = null;
      draw(body); animate(element, 'window-pop'); return win;
    }
    function closeWindow(id) {
      const win = windows.get(id); if (!win) return;
      win.element.remove(); win.task.remove(); windows.delete(id);
      if (alerts.delete(id)) { say(adware ? 'Alert closed. The process that made it is still running.' : 'One less fake warning on your desktop.'); renderHUD(); }
    }
    function redraw(id) {
      const win = windows.get(id); if (!win) return;
      win.body.replaceChildren(); win.draw(win.body);
    }
    function makeAlert() {
      if (!adware || alerts.size >= (cursed ? 3 : 2)) return;
      const id = `alert-${++alertSerial}`;
      alerts.add(id);
      openWindow(id, `Virus detected! (${alertSerial})`, body => {
        body.append(node('div', 'rogue-symbol', '⚠'), node('b', '', 'YOUR COMPUTER HAS 847 VIRUSES'), node('p', '', 'AdBuddy™ Total Security recommends installing AdBuddy™ Total Security.'));
        body.append(button('REMOVE EVERYTHING NOW', () => {
          trap('The fake cleaner installed another fake cleaner. The real Security app is on your desktop.', 3);
          makeAlert();
        }, 'scam-button'));
        body.append(node('small', 'fine-print', 'Publisher: AdBuddy. File protection: mostly theatrical. Close using the title-bar ×.'));
      }, { rogue: true });
      renderHUD();
    }
    function openNotes() {
      openWindow('notes', 'READ ME — Notepad', body => {
        body.append(node('h4', '', 'mira@ops / incident response notes'));
        const lines = [
          '1. The red “antivirus” windows ARE the infection. Use the desktop Security app.',
          '2. Updatr.exe launches at startup and restarts AdBuddy.exe. Stop it first.',
          '3. My Files hides extensions. “invoice.pdf” may not be a PDF.',
          '4. Do not delete System32. That is where the computer keeps being a computer.',
          '5. Quarantine the file, close leftover scam alerts, then verify in Security.'
        ];
        lines.forEach(line => body.append(node('p', '', line)));
      });
    }
    function openTasks() {
      openWindow('tasks', 'Task Manager', body => {
        body.append(node('h4', '', 'Startup & running processes'));
        const boot = checkbox('Launch Updatr.exe when this PC starts', startup, input => {
          startup = input.checked; renderHUD();
          say(startup ? 'Automatic reinfection has been helpfully restored.' : 'Startup disabled. Now stop Updatr, then AdBuddy.');
        }); body.append(boot.label);
        const processes = node('div', 'virus-processes'); body.append(processes);
        for (const [name, alive, description, handler] of [
          ['Updatr.exe', guardian, 'Restarts AdBuddy', () => {
            if (startup) return trap('Updatr immediately restarted from Startup. Uncheck its startup entry first.', 2);
            guardian = false; say('Updatr stopped. AdBuddy no longer has a respawn supervisor.'); renderHUD(); redraw('tasks');
          }],
          ['AdBuddy.exe', adware, 'Generates pop-up ads', () => {
            if (guardian) return trap('Updatr restarted AdBuddy. Stop the parent process first.', 2);
            adware = false; say('AdBuddy stopped. No new pop-ups. The infected file still needs quarantine.'); renderHUD(); redraw('tasks');
          }],
          ['explorer.exe', true, 'Your desktop', () => trap('explorer.exe is the desktop shell. Ending it does not remediate the infection.', 2)]
        ]) {
          const row = node('div', 'virus-process');
          const detail = node('div'); detail.append(node('b', '', name), node('small', '', alive ? description : 'Stopped ✓'));
          const kill = button('End task', handler); kill.setAttribute('aria-label', `End ${name}`); kill.disabled = !alive;
          row.append(detail, kill); processes.append(row);
        }
      });
    }
    function openFiles() {
      openWindow('files', 'My Files', body => {
        const show = checkbox('Show file extensions', extensions, input => { extensions = input.checked; redraw('files'); }); body.append(show.label);
        const fileList = node('div', 'virus-file-list'); body.append(fileList);
        for (const [id, icon, short, full, type] of [
          ['invoice', '▤', 'invoice.pdf', 'invoice.pdf.exe', 'Application disguised as a PDF'],
          ['report', '▤', 'report', 'report.pdf', 'PDF document'],
          ['system', '▰', 'System32', 'System32', 'Essential system folder']
        ]) {
          if (id === 'invoice' && quarantined) continue;
          const b = button(`${icon} ${extensions ? full : short}`, () => {
            chosen = id; redraw('files'); say(extensions ? `${full} — ${type}.` : `${short} selected. The extension is hidden. Check before you trust it.`);
          }, chosen === id ? 'selected' : ''); fileList.append(b);
        }
        const detail = node('p', 'virus-file-detail', !chosen ? 'Select a file to inspect it.' : chosen === 'invoice' ? (extensions ? 'Type: Application (.exe) · Publisher: AdBuddy · Suspicious' : 'Type: hidden · Looks reassuringly like a PDF') : chosen === 'report' ? 'Type: PDF · Actual work. Please leave it alone.' : 'Type: System folder · Required for this computer to exist.'); body.append(detail);
        body.append(button('Quarantine selected file', () => {
          if (!chosen) return say('No target selected. Quarantine(null) is not a remediation strategy.');
          if (chosen !== 'invoice') return trap(chosen === 'system' ? 'System32 is not malware. Delete request rejected: dependency of literally everything.' : 'The report is innocent. The fake PDF has a longer extension.', 3);
          if (!extensions) return trap('Show extensions first. Security needs evidence, not vibes.');
          if (guardian || adware) return trap('File in use by Updatr / AdBuddy. Stop both processes before quarantining.', 2);
          if (startup) return trap('The startup entry would reinstall this file. Disable it in Task Manager.');
          quarantined = true; chosen = null; renderHUD(); redraw('files');
          say('invoice.pdf.exe quarantined. Close remaining fake warnings, then verify cleanup in Security.'); sound('win');
        }, 'primary'));
      });
    }
    function openSecurity() {
      openWindow('security', 'Security — actual protection', body => {
        body.append(node('h4', '', 'Errand Defender'), node('p', '', 'This scanner checks your work. It does not ask for your credit card.'));
        const status = node('div', 'security-checklist'); body.append(status);
        const progress = meter(body, 'Virus scan');
        renderScan = () => {
          status.textContent = scanning ? `Checking processes and files… ${Math.floor(scanProgress)}%` : 'Ready to verify cleanup.';
          progress(scanProgress);
        }; renderScan();
        body.append(button('Verify cleanup', () => {
          if (scanning) return;
          scanning = true; scanProgress = 0; renderScan();
          say('Scanning the simulated desktop. Real computer: completely uninvolved.');
        }, 'primary'));
      });
    }
    renderHUD();
    say('Infected desktop ready. Open an app to start the clock. All files and processes are simulated.');
    let greeted = false;
    update = dt => {
      if (!greeted) { greeted = true; makeAlert(); }
      spawnClock += dt;
      if (spawnClock > (cursed ? 4 : 9)) { spawnClock = 0; makeAlert(); }
      if (!scanning) return;
      scanProgress = Math.min(100, scanProgress + dt * 55); renderScan();
      if (scanProgress < 100) return;
      scanning = false;
      const issues = [startup && 'Startup entry active', (guardian || adware) && 'Malware processes running', !quarantined && 'Disguised executable still present', alerts.size > 0 && `${alerts.size} fake warning(s) still open`].filter(Boolean);
      if (issues.length) {
        const status = windows.get('security')?.body.querySelector('.security-checklist');
        if (status) status.textContent = issues.map(issue => '✕ ' + issue).join('\n');
        trap('Scan incomplete: ' + issues.join('; ') + '.');
      } else end(true, 'Persistence removed. Processes stopped. Payload quarantined. The remaining bugs are vendor-approved.');
    };
  }

  function usbGame() {
    const desk = panel('Connect a USB drive', 'Insert the drive and open report.txt.');
    let flipped = false, clean = false, powered = false, inserted = false;
    const display = node('div', 'projector-screen', 'USB DEVICE NOT FOUND'); desk.append(display);
    const details = node('div', 'bonus-details'); details.hidden = true; desk.append(details);
    const state = node('p', 'signal-status'); desk.append(state);
    const refresh = () => { state.textContent = `${flipped ? 'Contacts down' : 'Contacts up'} · ${clean ? 'Port clear' : 'Dust in port'} · ${powered ? 'Hub powered' : 'Hub asleep'}`; };
    details.append(button('Inspect port', () => say('A dust bunny is blocking the port. The label says CONTACTS DOWN. The hub needs power.')),
      button('Remove dust bunny', () => { clean = true; refresh(); say('Dust bunny relocated to the keyboard ecosystem.'); }),
      button('Power the hub', () => { powered = true; refresh(); say('Hub awake. It has no opinion about orientation.'); }));
    desk.append(button('Flip USB', () => { if (inserted) return say('Drive already mounted.'); flipped = !flipped; refresh(); display.textContent = flipped ? '▰ CONTACTS DOWN' : '▱ CONTACTS UP'; }),
      button('Insert USB', () => {
        if (inserted) return say('Already mounted. Open the file.');
        details.hidden = false;
        if (!flipped) return trap('Wrong orientation. The universal connector requests another attempt.');
        if (!clean) return trap('Something fluffy is occupying the port.');
        if (!powered) return trap('Physical connection detected. Electricity absent.');
        inserted = true; display.textContent = 'DRIVE E: / MOUNTED'; files.hidden = false; say('Drive mounted. Open the text file.');
      }, 'primary'));
    const files = node('div', 'inline-controls'); files.hidden = true;
    files.append(button('report.txt.exe', () => { popup('Executable blocked', 'The second extension won. Close this dialog and open the actual text file.'); trap('That was an executable wearing a text-file costume.'); }),
      button('report.txt', () => { if (arena.querySelector('.office-error')) return trap('Close the executable warning first.'); end(true, 'USB mounted. Text file opened. Only one dust bunny displaced.'); })); desk.append(files); refresh();
  }

  function gooseGame() {
    const desk = panel('Save the document', 'The Save button is currently occupied.');
    let fed = false, nest = false, distracted = false;
    const goose = node('div', 'goose-scene', '🪿\nHONK.'); desk.append(goose);
    const status = node('p', 'signal-status', 'Document: unsaved'); desk.append(status);
    desk.append(button('Save', () => {
      if (!distracted) { tools.hidden = false; return trap('The goose intercepted Ctrl+S. Negotiate access.'); }
      end(true, 'Document saved. Goose migrated to an unrelated directory.');
    }, 'primary'));
    const tools = node('div', 'bonus-details'); tools.hidden = true; desk.append(tools);
    tools.append(button('Read goose.txt', () => say('Give it peas, create a nest in /tmp, then ring the dinner bell. Bread causes additional opinions.')),
      button('Offer bread', () => { popup('HONK_ACCESS_DENIED', 'Bread rejected. Try peas.'); trap('Nutrition policy violation.'); }),
      button('Offer peas', () => { fed = true; goose.textContent = '🪿 🟢\nConsidering your proposal.'; status.textContent = 'Goose: fed · document: still unsaved'; }),
      button('Create /tmp/nest', () => { nest = true; say('Temporary accommodation provisioned.'); }),
      button('Ring dinner bell', () => {
        if (!fed || !nest) return trap(!fed ? 'The goose requires peas before migration.' : 'No nest found. The Save button remains prime real estate.');
        if (arena.querySelector('.office-error')) return trap('Dismiss the honking dialog first.');
        distracted = true; goose.textContent = '🪹 🪿\n/tmp/nest'; status.textContent = 'Save button: available'; say('The goose has released its lock. Save now.');
      }));
  }

  function updateGame() {
    const desk = panel('Finish the update', 'Sandbox challenge · no completion state. See how many phases you can uncover.');
    let phase = 0, percent = 0, elapsed = 0;
    const phases = ['Downloading update', 'Installing update', 'Updating the installer', 'Verifying the verification', 'Migrating the progress bar', 'Waiting for a quorum', 'Rolling back the rollback', 'Preparing the next update'];
    const title = node('h4', '', phases[0]); desk.append(title);
    const progress = meter(desk, 'Update progress');
    const status = node('p', 'signal-status', '0% · estimated time: calculating'); desk.append(status);
    const log = node('pre', 'hdmi-diagnostics', 'Session log ready.'); desk.append(log);
    const advance = reason => {
      phase++; percent = 0; progress(0); title.textContent = phases[phase % phases.length];
      status.textContent = `Phase ${phase + 1} · 0%`;
      log.textContent = `${reason}\n${phase} phases discovered.\n${phases[phase % phases.length]}…`;
      say('Progress preserved. Definition of progress updated.');
    };
    desk.append(button('Start update', () => { if (!phase && !elapsed) say('Update started. Completion is not part of this build.'); else say('Already running. This is the optimal number of updates.'); }),
      button('Resolve dependency', () => advance('Dependency resolved. Transitive dependency discovered.')),
      button('Cancel update', () => advance('Cancellation requires the latest cancellation module.')),
      button('Skip to 100%', () => { percent = 99; progress(99); status.textContent = '99% · final 1% requires a restart'; if (arena.querySelector('.office-error')) return say('A restart is already pending.'); popup('Restart required', 'Restart the updater to install support for completing updates.'); }),
      button('Restart updater', () => { arena.querySelectorAll('.office-error').forEach(error => error.remove()); advance('Restart successful. Uptime reset, backlog preserved.'); }),
      button('End session', () => end(false, `${phase + 1} update phases explored. This sandbox has no winning state; the other games do.`)));
    update = dt => {
      elapsed += dt; percent = Math.min(99, percent + dt * 24); progress(percent);
      status.textContent = `${Math.floor(percent)}% · ${phase + 1} phases · ${Math.floor(elapsed)}s donated to the updater`;
      if (percent >= 99) advance('99% reached. A new mandatory phase has entered the queue.');
    };
  }

  const builders = [printGame, projectorGame, emailGame, bluescreenGame, virusGame, usbGame, gooseGame, updateGame];
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
