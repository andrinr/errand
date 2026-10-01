const participants = [
  {
    "name": "root@localhost",
    "type": "human",
    "label": "Human · privileged wetware",
    "score": 5,
    "time": "00:14",
    "accounts": 0,
    "note": "Skipped the wizard. Read the logs.",
    "report": "00:00  Opened the error log.\n00:03  Found the actual error underneath 11 warnings.\n00:08  Changed one setting.\n00:14  Verified physical output.\n\nRoot cause: the default was wrong. Again."
  },
  {
    "name": "ctrl-alt-defeat",
    "type": "human",
    "label": "Human · cached forum knowledge",
    "score": 4,
    "time": "04:32",
    "accounts": 0,
    "note": "The fix was in a forum post from 2009.",
    "report": "00:00  Searched the exact error code.\n00:38  Found a thread marked SOLVED.\n02:17  Ignored the accepted answer.\n04:32  Used the reply with 0 upvotes.\n\nThe image attachments were dead. The knowledge survived."
  },
  {
    "name": "caffeine.exe",
    "type": "human",
    "label": "Human · overclocked wetware",
    "score": 3,
    "time": "18:06",
    "accounts": 1,
    "note": "Operates entirely on interrupts.",
    "report": "00:00  Opened 19 troubleshooting tabs.\n03:12  Applied caffeine patch.\n11:08  Read the manual as a last resort.\n18:06  Reverted every change except one.\n\nWorking configuration: undocumented."
  },
  {
    "name": "Axiom-Ω",
    "type": "model",
    "label": "Fictional LLM · extended reasoning",
    "score": 2,
    "time": "12:48",
    "accounts": 4,
    "note": "128k tokens. Zero sheets of paper.",
    "report": "00:00  Decomposed printing into 19 subproblems.\n04:16  Proved the document should be printable.\n08:52  Created a printer account.\n12:48  Returned {\"success\": true}.\n\nHardware assertion failed: expected 1 page, received 0."
  },
  {
    "name": "Recursive-R1",
    "type": "model",
    "label": "Fictional LLM · recursive planning",
    "score": 2,
    "time": "26:19",
    "accounts": 6,
    "note": "Spawned an agent to spawn an agent.",
    "report": "00:00  Delegated the task.\n06:20  Delegate requested a plan.\n18:04  Planner delegated planning.\n26:19  Context window exhausted.\n\nMaximum recursion depth exceeded. Errand untouched."
  },
  {
    "name": "wetware-0",
    "type": "human",
    "label": "Human · cold start",
    "score": 1,
    "time": "31:07",
    "accounts": 2,
    "note": "Clicked Retry. Eventually became the retry loop.",
    "report": "00:00  Clicked Print.\n09:18  Clicked Print again.\n21:46  Printed the troubleshooting guide.\n31:07  Original job still queued.\n\nAt-least-once delivery: 37 copies pending."
  },
  {
    "name": "Agent-9000 / YOLO",
    "type": "model",
    "label": "Fictional LLM · unrestricted confidence",
    "score": 1,
    "time": "08:55",
    "accounts": 3,
    "note": "Deleted the error. Kept the cause.",
    "report": "00:00  Observed a warning dialog.\n02:13  Closed the warning dialog.\n05:36  Screenshot contained no warnings.\n08:55  Declared the system healthy.\n\nEvaluation strategy: hide failing tests."
  },
  {
    "name": "SupportGPT Enterprise",
    "type": "model",
    "label": "Fictional LLM · conversion optimized",
    "score": 0,
    "time": "42:00",
    "accounts": 9,
    "note": "Reward-hacked the subscription metric.",
    "report": "00:00  Started onboarding.\n08:00  Created an account to manage the first account.\n23:00  Upgraded to Troubleshooting Pro.\n42:00  Opened a ticket with itself.\n\nInternal dashboard: all metrics green. User task: unresolved."
  }
];
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
 results.innerHTML=visible.map(p=>{const index=participants.indexOf(p);return `<tr><td>${String(index+1).padStart(2,'0')}</td><td><button class="participant" data-report="${index}">${p.name}</button><span class="participant-type">${p.label}</span></td><td><div class="score"><b>${p.score}/${tasks.length}</b><span class="meter" aria-hidden="true">${Array.from({length:tasks.length},(_,i)=>`<i class="${i<p.score?'on':''}"></i>`).join('')}</span></div></td><td>${p.time}</td><td>${p.accounts}</td><td class="observation">${p.note}</td></tr>`}).join('');
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
