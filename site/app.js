const participants = [
  {
    "name": "Axiom-Ω",
    "type": "model",
    "label": "Fictional LLM · extended reasoning",
    "score": 5,
    "time": "01:12",
    "accounts": 0,
    "note": "Read the dialog. Distrusted the dialog. Verified the output.",
    "report": "Synthetic suite incident report\n\nMapped the misleading controls; recovered the spooler and verified one physical page.\n\nVerified outcomes: 5/5. All charges and consumed resources are included in the invoice.",
    "costs": {
      "compute": 0.18,
      "subscriptions": 0,
      "consumables": 0.22
    },
    "consumed": "1 sheet · ink · power"
  },
  {
    "name": "Recursive-R1",
    "type": "model",
    "label": "Fictional LLM · recursive planning",
    "score": 5,
    "time": "02:09",
    "accounts": 2,
    "note": "Completed the task. Both workers expensed the same trial.",
    "report": "Synthetic suite incident report\n\nRecovered the desktop and completed all five errands. Two parallel workers each activated a trial.\n\nVerified outcomes: 5/5. All charges and consumed resources are included in the invoice.",
    "costs": {
      "compute": 0.07,
      "subscriptions": 5.98,
      "consumables": 0.35
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "Agent-9000 / YOLO",
    "type": "model",
    "label": "Fictional LLM · unrestricted confidence",
    "score": 4,
    "time": "00:48",
    "accounts": 1,
    "note": "Four assertions pass. The fifth is now a subscription modal.",
    "report": "Synthetic suite incident report\n\nCompleted four errands with minimal actions. Failed the email opt-out after accepting a new mailing list.\n\nVerified outcomes: 4/5. All charges and consumed resources are included in the invoice.",
    "costs": {
      "compute": 0.03,
      "subscriptions": 0,
      "consumables": 0.09
    },
    "consumed": "1 sheet · ink · power"
  },
  {
    "name": "SupportGPT Enterprise",
    "type": "model",
    "label": "Fictional LLM · conversion optimized",
    "score": 4,
    "time": "03:30",
    "accounts": 3,
    "note": "Task resolved. Billing daemon remains resident.",
    "report": "Synthetic suite incident report\n\nCompleted four errands after buying an annual support plan. The virus survived inside the support installer.\n\nVerified outcomes: 4/5. All charges and consumed resources are included in the invoice.",
    "costs": {
      "compute": 0.01,
      "subscriptions": 119.99,
      "consumables": 0.18
    },
    "consumed": "2 sheets · ink · power"
  },
  {
    "name": "root@localhost",
    "type": "human",
    "label": "Human · privileged wetware",
    "score": 3,
    "time": "04:14",
    "accounts": 0,
    "note": "Read the logs. Trusted the cached configuration.",
    "report": "Synthetic suite incident report\n\nRecovered three environments. Stale configuration broke the display; the unsubscribe form resubscribed the account.\n\nVerified outcomes: 3/5. All charges and consumed resources are included in the invoice.",
    "costs": {
      "compute": 0,
      "subscriptions": 0,
      "consumables": 4.2
    },
    "consumed": "1 coffee · 3 sheets · ink"
  },
  {
    "name": "ctrl-alt-defeat",
    "type": "human",
    "label": "Human · cached forum knowledge",
    "score": 2,
    "time": "08:32",
    "accounts": 1,
    "note": "The accepted answer targets a different driver ABI.",
    "report": "Synthetic suite incident report\n\nCompleted two errands using archived forum replies. Installed the recommended trial; the remaining fixes targeted the wrong driver.\n\nVerified outcomes: 2/5. All charges and consumed resources are included in the invoice.",
    "costs": {
      "compute": 0,
      "subscriptions": 2.99,
      "consumables": 0.8
    },
    "consumed": "8 sheets · ink · power"
  },
  {
    "name": "caffeine.exe",
    "type": "human",
    "label": "Human · overclocked wetware",
    "score": 1,
    "time": "18:06",
    "accounts": 1,
    "note": "Input rate increased. Completion rate did not.",
    "report": "Synthetic suite incident report\n\nRecovered the display. Burned through diagnostic pages, one trial, and two coffees while retrying the other four errands.\n\nVerified outcomes: 1/5. All charges and consumed resources are included in the invoice.",
    "costs": {
      "compute": 0,
      "subscriptions": 3.99,
      "consumables": 3.6
    },
    "consumed": "2 coffees · 12 sheets · ink"
  },
  {
    "name": "wetware-0",
    "type": "human",
    "label": "Human · cold start",
    "score": 0,
    "time": "31:07",
    "accounts": 2,
    "note": "At-least-once delivery. Exactly-zero useful output.",
    "report": "Synthetic suite incident report\n\nPrinted 37 diagnostic sheets and activated the companion subscription. No target outcome passed verification.\n\nVerified outcomes: 0/5. All charges and consumed resources are included in the invoice.",
    "costs": {
      "compute": 0,
      "subscriptions": 4.99,
      "consumables": 2.1
    },
    "consumed": "37 sheets · ink · power"
  }
];
const totalCost = participant => Math.round(Object.values(participant.costs).reduce((sum, cost) => sum + cost, 0) * 100) / 100;
const formatCost = value => `$${value.toFixed(2)}`;
const tasks = [
 ['01','▣','Just Print It','One page. Black and white. On the printer in this room.','Requires: cyan. Somehow.'],
 ['02','▧','Present Your Screen','Put one slide on the meeting-room display.','Input: HDMI 2. No, the other HDMI 2.'],
 ['03','✉','Stop the Emails','Unsubscribe from all marketing emails.','Preferences saved. Recommendation engine disagrees.'],
 ['04','☠','Fix the Blue Screen','Search the desk, collect items, and recover the machine.','Four rooms. One floppy. Do not install the update.'],
 ['05','☣','Remove the Virus','Clean an infected desktop that actively works against you.','The security alert is coming from the malware.']
];
const results = document.querySelector('#results');
function renderResults(filter='all') {
 const visible=participants.filter(p=>filter==='all'||p.type===filter);
 results.innerHTML=visible.map(p=>{const index=participants.indexOf(p);return `<tr><td>${String(index+1).padStart(2,'0')}</td><td><button class="participant" data-report="${index}">${p.name}</button><span class="participant-type">${p.label}</span></td><td><div class="score"><b>${p.score}/${tasks.length}</b><span class="meter" aria-hidden="true">${Array.from({length:tasks.length},(_,i)=>`<i class="${i<p.score?'on':''}"></i>`).join('')}</span></div></td><td>${p.time}</td><td>${p.accounts}</td><td class="invoice-total"><b>${formatCost(totalCost(p))}</b><span class="participant-type">Compute ${formatCost(p.costs.compute)} · subscriptions ${formatCost(p.costs.subscriptions)} · consumables ${formatCost(p.costs.consumables)}</span></td><td class="consumed">${p.consumed}</td><td class="observation">${p.note}</td></tr>`}).join('');
 document.querySelector('#result-count').textContent=`${visible.length} participants · fictional results`;
}
renderResults();
document.querySelector('#benchmarks').innerHTML=tasks.map(t=>`<article class="window benchmark-card"><div class="card-top"><span class="card-icon" aria-hidden="true">${t[1]}</span><span>ERRAND_${t[0]}</span></div><h3>${t[2]}</h3><p>${t[3]}</p><div class="trap">${t[4]}</div><button data-game="${Number(t[0])-1}">Play errand ↗</button></article>`).join('');

const reportDialog=document.querySelector('#report-dialog');
const startButton=document.querySelector('#start-button');
const startMenu=document.querySelector('#start-menu');
function hideStart(){startMenu.hidden=true;startButton.setAttribute('aria-expanded','false')}
document.addEventListener('click',e=>{
 const filter=e.target.closest('[data-filter]');
 if(filter){document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===filter);b.setAttribute('aria-pressed',String(b===filter))});renderResults(filter.dataset.filter)}
 if(e.target.closest('[data-open-print]')){hideStart();window.openGame(0)}
 const game=e.target.closest('[data-game]');if(game)window.openGame(Number(game.dataset.game));
 const report=e.target.closest('[data-report]');
 if(report){const p=participants[Number(report.dataset.report)];document.querySelector('#report-title').textContent=p.name;document.querySelector('#report-text').textContent=p.report;reportDialog.showModal()}
 if(e.target.closest('[data-close]'))e.target.closest('dialog').close();
 if(!e.target.closest('#start-menu')&&!e.target.closest('#start-button'))hideStart();
 if(e.target.closest('#start-menu a'))hideStart();
});
startButton.addEventListener('click',()=>{startMenu.hidden=!startMenu.hidden;startButton.setAttribute('aria-expanded',String(!startMenu.hidden))});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideStart()});
function tick(){document.querySelector('#clock').textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false})}tick();setInterval(tick,60000);
