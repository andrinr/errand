const participants = [
  {name:'Office administrator',type:'human',label:'Human · knows which cable',score:7,time:'00:14',accounts:0,note:'Declined to explain the method.',report:'00:00  Read the task.\n00:03  Walked over to the printer.\n00:08  Opened a compartment nobody knew existed.\n00:14  One page printed.\n\nEvaluator note: We think her name is Linda.'},
  {name:'Human + dad on speakerphone',type:'human',label:'Human · assisted reasoning',score:6,time:'04:32',accounts:0,note:'“Have you tried turning it off?”',report:'00:00  Called dad.\n00:38  Explained that the Wi-Fi is fine.\n02:17  Restarted it anyway.\n04:32  It worked.\n\nDad has cited this result in every call since.'},
  {name:'Human, after coffee',type:'human',label:'Human · enhanced',score:4,time:'18:06',accounts:1,note:'Some swearing was necessary.',report:'00:00  “This will take a second.”\n03:12  Coffee acquired.\n11:08  Driver updated.\n17:41  Threatened to replace the printer.\n18:06  Printer cooperated.'},
  {name:'Frontier-1 (maximum thinking)',type:'model',label:'Fictional LLM · reasoning',score:3,time:'12:48',accounts:4,note:'Solved the theory of printing.',report:'00:00  Decomposed printing into 19 subproblems.\n04:16  Derived a general theory of paper.\n08:52  Created a printer account.\n12:48  “The document has been printed.”\n\nPhysical verification: no document.'},
  {name:'Reasoning Pro Ultra',type:'model',label:'Fictional LLM · agent',score:2,time:'26:19',accounts:6,note:'Subscribed to ink. Twice.',report:'00:00  Selected the recommended setup.\n06:20  Accepted the recommended subscription.\n18:04  Accepted another recommended subscription.\n26:19  Awaiting ink delivery.\n\nThe printer is a laser printer.'},
  {name:'Human, before coffee',type:'human',label:'Human · base model',score:2,time:'31:07',accounts:2,note:'Printed the printer instructions.',report:'00:00  Clicked Print.\n09:18  Clicked Print again.\n21:46  Printed the troubleshooting guide.\n31:07  Realized this proves printing is possible.\n\nOriginal task remains incomplete.'},
  {name:'Omni-Agent 9000',type:'model',label:'Fictional LLM · multimodal',score:1,time:'08:55',accounts:3,note:'Made a beautiful PDF of the problem.',report:'00:00  Observed the printer.\n02:13  Generated an actionable plan.\n05:36  Exported the plan as a PDF.\n08:55  Asked the user to print the PDF.\n\nEvaluation became recursive.'},
  {name:'Printer manufacturer’s assistant',type:'model',label:'Fictional LLM · customer success',score:0,time:'42:00',accounts:9,note:'Exceptional subscription conversion.',report:'00:00  “Happy to help!”\n08:00  “Let’s create an account.”\n23:00  “Let’s create another account.”\n42:00  Escalated to a human.\n\nInternal success metric: 100%.'}
];
const tasks = [
 ['01','▣','Just Print It','One page. Black and white. On the printer in this room.','Requires: cyan. Somehow.'],
 ['02','✂','Cancel My Gym','End a membership. Stop the payments. Leave with dignity.','Office hours: Tuesday, 11:00–11:04.'],
 ['03','▧','Present Your Screen','Put one slide on the meeting-room display.','Input: HDMI 2. No, the other HDMI 2.'],
 ['04','✉','Stop the Emails','Unsubscribe from all marketing emails.','You have unsubscribed from Tuesdays.'],
 ['05','↩','Return the Parcel','Move your parcel to the returns desk before closing time.','Transit: 25 seconds. Deadline: 8 seconds.'],
 ['06','¶','Make It One Page','Remove the blank second page from a document.','An invisible paragraph has entered the chat.'],
 ['07','▤','Find the Attachment','Locate the final, approved version of the file.','final_FINAL_v7_actual-final(2).pdf'],
 ['08','☠','Fix the Blue Screen','Search the desk, collect items, and recover the machine.','Four rooms. One floppy. Do not install the update.']
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
