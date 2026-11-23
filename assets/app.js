/* Works locally without a framework. */
(() => {
'use strict';
const page = document.body.dataset.page || 'home';
const nav = [
  {key:'angka',title:'Japanese Numbers',url:'angka.html',icon:'hash',count:'60'},
  {key:'salam',title:'Greetings & Introductions',url:'salam.html',icon:'users'},
  {key:'dapur',title:'Kitchen Vocabulary',url:'dapur.html',icon:'book',count:'22'},
  {key:'tatabahasa',title:'Grammar & Sentences',url:'tata-bahasa.html',icon:'layers'},
  {key:'latihan',title:'Practice Sessions',url:'latihan.html',icon:'zap',count:'22'}
];
const titles = Object.fromEntries(nav.map(x=>[x.key,x.title]));
const lessons = ['angka','salam','dapur','tatabahasa'];
const statusKey = 'nihongo_studio_completed_v1';
let progressCache = {};
const e = text=>String(text??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const fmt = n=>new Intl.NumberFormat('id-ID').format(n);
const jp = (s,cls='')=>`<span class="jp ${cls}">${e(s)}</span>`;
// A Japanese expression must have a nearby, visible reading. No on-the-fly guesswork:
// readings are verified and stored in CONTENT.readingGlossary / quiz metadata.
const hasJapanese = s => /[\u3040-\u30ff\u3400-\u9fff々ヶヵ]/.test(String(s));
const jpReadings = CONTENT.readingGlossary || {};
function jpInline(japanese, reading) {
  if(!reading) throw new Error('Romaji unavailable for '+japanese);
  return `<span class="jp-inline-pair"><span class="jp">${e(japanese)}</span><span class="jp-inline-reading">${e(reading)}</span></span>`;
}
// Match complete Japanese expressions first, then fall back to isolated particles.
function pairedText(text){
  text=String(text??'');
  if(!hasJapanese(text)) return e(text);
  const terms=Object.keys(jpReadings).filter(hasJapanese).sort((a,b)=>b.length-a.length);
  const out=[];let i=0;
  while(i<text.length){
    if(!hasJapanese(text[i]) && text[i]!=='～') {out.push(e(text[i++]));continue;}
    const found=terms.find(s=>text.startsWith(s,i));
    if(found){out.push(jpInline(found,jpReadings[found]));i+=found.length;continue;}
    throw new Error('Romaji reading unavailable for: '+text.slice(i,i+24));
  }
  return out.join('');
}
// For note blocks containing bold / emphasis, annotate only text nodes, not HTML tags.
function pairedHTML(html){
  const tpl=document.createElement('template');tpl.innerHTML=html;
  const walker=document.createTreeWalker(tpl.content,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
    if(!hasJapanese(node.textContent))continue;
    const wrap=document.createElement('span');wrap.innerHTML=pairedText(node.textContent);
    node.replaceWith(...wrap.childNodes);
  }
  return tpl.innerHTML;
}
function quizQuestion(q){
  if(!q.questionRomaji) return e(q.question);
  const text=q.question;
  const pos=text.search(/[\u3040-\u30ff\u3400-\u9fff々ヶヵ]/);
  const endFromJapanese=text.lastIndexOf('。')>=pos ? text.lastIndexOf('。')+1 :
    Math.max(...[...text.matchAll(/[\u3040-\u30ff\u3400-\u9fff々ヶヵ]/g)].map(x=>x.index+1));
  return e(text.slice(0,pos))+jpInline(text.slice(pos,endFromJapanese),q.questionRomaji)+e(text.slice(endFromJapanese));
}
function quizChoice(q,choice,i){
  const reading=q.choicesRomaji?.[i];
  return reading?`<span class="choice-jp-block"><span class="jp">${e(choice)}</span><span class="choice-romaji">${e(reading)}</span></span>`:e(choice);
}

const iconPaths={home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',hash:'<path d="M5 9h14M4 15h14M11 4 7 20M17 4l-4 16"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',layers:'<path d="m12 2 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5"/>',zap:'<path d="m13 2-3 8h8l-7 12 1-9H5l8-11Z"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',volume:'<path d="M11 5 6 9H3v6h3l5 4V5ZM15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',check:'<path d="M5 12l4 4L19 6"/>',circle:'<circle cx="12" cy="12" r="9"/>',eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',arrowup:'<path d="m5 14 7-7 7 7"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',spark:'<path d="m12 3 1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9L12 3z"/>',keyboard:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h.01M18 13h.01M7 16h10"/>',refresh:'<path d="M3 11a9 9 0 0 1 15.4-5.4L21 8M21 3v5h-5M21 13a9 9 0 0 1-15.4 5.4L3 16M3 21v-5h5"/>',heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'};
function ic(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]||iconPaths.circle}</svg>`;}
const completion=()=>{try {return JSON.parse(localStorage.getItem(statusKey)||'{}')}catch{return progressCache}};
const done=key=>Boolean(completion()[key]);
function setDone(key){const cur=completion();cur[key]=!cur[key];progressCache=cur;try{localStorage.setItem(statusKey,JSON.stringify(cur))}catch{};document.querySelectorAll('[data-done-key]').forEach(btn=>{const item=btn.dataset.doneKey;btn.innerHTML=done(item)?`${ic('check')} Completed`:`${ic('check')} Mark as complete`});updateProgress();}
function updateProgress(){const count=lessons.filter(done).length;document.querySelectorAll('.progress-fraction').forEach(el=>el.textContent=`${count} / ${lessons.length}`);document.querySelectorAll('.progress-percent').forEach(el=>el.style.width=(count/lessons.length*100)+'%');}
function shell(){const links=nav.map((n,i)=>`<a class="nav-link ${page===n.key?'active':''}" href="${n.url}" ${page===n.key?'aria-current="page"':''}>${ic(n.icon)}<span>${e(n.title)}</span>${n.count?`<span class="count">${n.count}</span>`:''}</a>`).join('');return `<div class="shell"><aside class="sidebar" id="sidebar"><a class="brand" href="index.html" aria-label="Nihongo Studio homepage"><span class="brand-mark">N</span><span class="brand-copy"><strong class="brand-name">Nihongo Studio</strong><small class="brand-sub">JAPANESE · PHASE F</small></span></a><div class="nav-label">PHASE F MODULES</div><nav aria-label="Phase F navigation"><a class="nav-link" href="fase-f/index.html">${ic('grid')}<span>Phase F Overview</span></a>${links}</nav><div class="sidebar-bottom"><a class="phase-navlink" href="index.html">${ic('home')}<span>Back to Homepage</span></a><a class="phase-navlink" href="fase-e/index.html">${ic('arrow')}<span>Switch to Phase E</span></a><div class="sidebar-rule"></div><div class="sidebar-kicker">LEARNING PROGRESS</div><div class="sidebar-progress progress-fraction">0 / 4</div><div class="meter"><span class="progress-percent"></span></div><div class="sidebar-footnote">Saved on this device only</div></div></aside><div class="mobile-shade" id="mobileShade"></div><div class="main"><header class="topbar"><div class="top-title"><button class="icon-button mobile-menu" id="menuToggle" aria-label="Open menu" aria-expanded="false">${ic('menu')}</button><span>Phase F</span><span class="dot"></span><strong>${e(titles[page])}</strong></div><div class="top-actions"><button class="top-search" id="searchLaunch" title="Search materials (/)" aria-label="Search lessons">${ic('search')}<span>Search lessons...</span><kbd class="kbd">/</kbd></button><button class="voice-top-trigger" id="voiceLaunch" type="button" aria-label="Japanese voice settings" title="Japanese voice settings">${ic('volume')}<span>Japanese Voice</span></button><button class="icon-button" id="homeLink" title="Homepage" aria-label="Back to Homepage">${ic('home')}</button></div></header><main class="content" id="mainContent"></main></div></div><div class="search-overlay" id="searchOverlay" role="dialog" aria-modal="true" aria-label="Search lessons"><div class="search-modal"><div class="search-modal-top">${ic('search')}<input id="globalSearch" type="search" aria-label="Search" placeholder="Search numbers, phrases, romaji, or meanings..." autocomplete="off"><button id="closeSearch">ESC</button></div><div id="searchResults" class="search-results"></div></div></div><button class="back-to-top" aria-label="Back to top" id="topButton">${ic('arrowup')}</button><div class="voice-overlay" id="voiceOverlay" aria-hidden="true"><section class="voice-panel" role="dialog" aria-modal="true" aria-labelledby="voicePanelTitle"><div class="voice-panel-head"><div><div class="voice-eyebrow">PRONUNCIATION</div><h2 id="voicePanelTitle">Japanese Voice Settings</h2><p>Select an available Japanese voice. Use the speaker icons throughout the lessons to hear examples.</p></div><button type="button" class="voice-close" id="voiceClose" aria-label="Close voice settings">✕</button></div><label class="voice-field-label" for="voiceSelect">Available Japanese voices</label><select id="voiceSelect" class="voice-select"><option>Checking available voices…</option></select><div class="voice-quality" id="voiceQuality" role="status">Checking voice support on this device.</div><label class="voice-field-label" for="voiceSpeed">Playback speed <output id="voiceSpeedValue">1.00×</output></label><input id="voiceSpeed" type="range" min="0.80" max="1.12" step="0.04" value="1"/><div class="voice-controls"><button type="button" class="btn btn-primary" id="voiceSample">${ic('volume')} Play sample</button><button type="button" class="btn btn-line" id="voiceStop">Stop audio</button></div><p class="voice-note"><strong>Audio availability.</strong> Pronunciation uses Japanese voices provided by the browser or operating system. Voice quality and availability depend on the device.</p></section></div><div class="toast" id="toast" role="status" aria-live="polite"></div>`;}
function hero(kicker,title,description,kanji,metas=[],opts={}){return `<section class="hero ${opts.home?'hero-home':''}"><div class="eyebrow">${e(kicker)}</div><h1>${title}</h1><p>${description}</p><div class="hero-meta">${metas.map(x=>`<span>${ic(x.icon||'book')}${e(x.text)}</span>`).join('')}</div><div class="hero-kanji" aria-hidden="true">${ic("spark")}</div>${opts.buttons||''}</section>`;}
function heading(kicker,title,subtitle='',aside=''){return `<div class="section-heading"><div><div class="eyebrow">${e(kicker)}</div><h2>${e(title)}</h2>${subtitle?`<p>${e(subtitle)}</p>`:''}</div>${aside?`<span class="section-aside">${e(aside)}</span>`:''}</div>`;}
function footer(){return `<footer class="footer"><span>© Nihongo Studio · Phase F</span><span><a href="index.html">Back to Homepage</a> · <a href="fase-e/index.html">Switch to Phase E</a></span></footer>`;}
function completeBtn(key){return `<div class="completion"><div><strong>Finished this lesson?</strong><p>Mark this lesson as complete. Progress is stored in this browser only.</p></div><button class="btn btn-light" data-done-key="${key}">${ic('check')} ${done(key)?'Completed':'Mark as complete'}</button></div>`;}
function audio(text){return `<button class="speak" data-speak="${e(text)}" title="Play pronunciation" aria-label="Play Japanese pronunciation">${ic('volume')}</button>`;}
function note(text){return `<div class="notice">${pairedHTML(text)}</div>`;}
function home(){return '<a href="fase-f/index.html">Phase F Overview</a>';}
function numberBasic(n){return `<article class="number-card" data-number-card data-number-group="basic" data-search="${e(`${n.value} ${n.romaji} ${n.kanji} ${n.kana}`.toLowerCase())}"><span class="number-tag">${fmt(n.value)}</span>${audio(n.kana)}<span class="number-kanji jp">${e(n.kanji)}</span><span class="number-kana jp">${e(n.kana)}</span><span class="romaji-text">${e(n.romaji)}</span></article>`;}
function numberLarge(n){return `<article class="large-card" data-number-card data-number-group="${e(n.group)}" data-search="${e(`${n.value} ${fmt(n.value)} ${n.romaji} ${n.kanji} ${n.kana}`.toLowerCase())}"><div class="large-top"><span class="number-tag">${fmt(n.value)}</span><span class="number-kanji jp">${e(n.kanji)}</span></div><span class="romaji-text">${e(n.romaji)}</span><div class="number-kana jp">${e(n.kana)}</div>${audio(n.kana)}</article>`;}
function angka(){let n=CONTENT.numbers;let groups=[['10k','10.000–19.000'],['20k','20.000–29.000'],['30k','30.000–39.000'],['40k','40.000–49.000']];let sections=groups.map(([key,label])=>`<div class="range-section number-section" data-group-section="${key}"><div class="range-title">${label}<span>10 numbers</span></div><div class="large-grid">${n.filter(x=>x.group===key).map(numberLarge).join('')}</div></div>`).join('');
return hero('MODULE 01 · SUUJI','Japanese Numbers · 1–50,000','Study each number and its Japanese reading. Use search to find a number, or enable memorization mode to recall the pronunciation without romaji.','数',[{text:'60 numbers',icon:'hash'},{text:'Kanji, hiragana, romaji',icon:'book'}])+
`<div class="section-tools"><div class="filters" id="numberFilters"><button class="chip active" data-group="all">All numbers</button><button class="chip" data-group="basic">1–10</button><button class="chip" data-group="thousand">Thousands</button><button class="chip" data-group="big">10.000–50.000</button></div><button class="btn btn-line" id="memorizeToggle" aria-pressed="false">${ic('eye')} Memorization: Off</button></div><div class="field" style="max-width:380px;margin-bottom:18px">${ic('search')}<input type="search" id="numberSearch" placeholder="Search: 8,000, sanzen, goman..." aria-label="Search numbers"></div>`+
`<div id="numberArea"><div class="number-section" data-group-section="basic">${heading('FOUNDATIONS','Numbers 1–10','Start with these ten essential numbers.') }<div class="number-grid">${n.filter(x=>x.group==='basic').map(numberBasic).join('')}</div></div><div class="number-section" data-group-section="thousand">${heading('THOUSANDS','Numbers 1,000–9,000','Notice the pronunciation changes for 3,000 and 8,000.') }<div class="large-grid">${n.filter(x=>x.group==='thousand').map(numberLarge).join('')}</div></div><div class="number-section" data-group-section="big">${heading('TEN THOUSANDS','Numbers 10,000–49,000','Observe how the pattern changes in increments of one thousand.')} ${sections}</div><div class="number-section" data-group-section="50k">${heading('FINAL NUMBER','50.000')}<div class="milestone" data-number-card data-number-group="50k" data-search="50000 50.000 goman 五万 ごまん"><strong>50.000</strong><span class="jp">五万</span><span class="romaji-text">goman</span><span class="jp">ごまん</span><small>FIFTY THOUSAND</small></div></div></div>`+
`<div style="margin-top:22px">${note(`<strong>Pronunciation note.</strong> 3,000 is pronounced <strong>sanzen</strong>, and 8,000 is <strong>hassen</strong>. Use <strong>ichiman</strong> for 10,000, not <em>jūsen</em>. Common readings for 4, 7 and 9 are yon, nana and kyū (alternatives: shi, shichi and ku).`)}</div>`+
heading('PRACTICE','Recall the pronunciations','6 · 8.000 · 13.000 · 25.000 · 38.000 · 49.000')+
`<div class="panel"><p>Hide romaji using memorization mode, then select any reading to reveal it. Continue to the practice questions when ready.</p><div style="margin-top:15px"><a class="btn btn-light" href="latihan.html?topik=angka">Number practice ${ic('arrow')}</a></div></div>`+completeBtn('angka')+footer();}
function pair(j,r,m){return `<article class="phrase">${audio(j)}${jp(j)}<span class="romaji-text">${e(r)}</span><span class="meaning" lang="id">${e(m)}</span></article>`;}
function convo(lines){return `<div class="dialogue">${lines.map(([who,j,r,m])=>`<div class="chat"><div class="avatar">${e(who)}</div><div>${jp(j)}<span class="romaji-text">${e(r)}</span><span class="meaning" lang="id">${e(m)}</span></div></div>`).join('')}</div>`;}
function salam(){return hero('MODULE 02 · AISATSU & JIKOSHŌKAI','Greetings & Self-Introduction','Learn to greet others, introduce yourself, and ask simple questions. Review the examples before practising a short conversation.','話',[{text:'Everyday greetings',icon:'users'},{text:'Conversation example',icon:'book'}])+
heading('SECTION 01','Greetings and polite expressions','Choose a greeting that matches the time of day and the person you are addressing. Use polite forms with teachers and guests.')+
`<div class="phrase-grid">${CONTENT.salams.map(x=>pair(...x)).join('')}</div>`+
`<div style="margin-top:16px">${note('<strong>Usage note.</strong> こんばんは is used when greeting someone in the evening, while おやすみなさい is said before sleep. さようなら is generally used for longer farewells; またね is more casual.')}</div>`+
heading('SECTION 02','Expressions at home and during meals')+
`<div class="phrase-grid">${CONTENT.house.map(x=>pair(...x)).join('')}</div><div style="margin-top:16px">${note('The expressions <strong>いただきます</strong> and <strong>ごちそうさまでした</strong> show appreciation for a meal and the people who prepared it. They do not have exact word-for-word translations.')}</div>`+
heading('SECTION 03','Self-introduction','Adapt the name, hometown, place of residence, and hobbies in these examples.')+
`<div class="phrase-grid">${CONTENT.introductions.map(x=>pair(...x)).join('')}</div><div style="margin-top:16px">${note('<strong>よろしくおねがいします</strong> is commonly used when establishing a new relationship or starting to work together. Its meaning depends on the situation.')}</div>`+
heading('SECTION 04','Asking about a new friend')+`<div class="phrase-grid">${CONTENT.questions.map(x=>pair(...x)).join('')}</div>`+
heading('SECTION 05','Conversation example singkat','Read the dialogue with a partner, alternating the roles.')+convo(CONTENT.dialogIntro)+
`<div class="section-heading"><div><div class="eyebrow">PRACTICE</div><h2>Introduce yourself</h2><p>Introduce yourself in 30–45 seconds, then ask your partner two questions.</p></div></div><div class="panel-note">${ic('info')}<p><strong>Tips membaca:</strong> Romaji membantu pada tahap awal. Huruf ō dan ū menandai bunyi panjang. Ucapkan keseluruhan ungkapan secara wajar, bukan huruf Latin satu per satu.</p></div>`+
completeBtn('salam')+footer();}
function kitchenRow(group,x){return `<tr class="kitchen-item" data-search="${e(x.join(' ').toLowerCase())}"><td>${e(x[1])}</td><td class="romaji-text">${e(x[2])}</td><td class="jp">${e(x[3])}</td></tr>`;}
function dapur(){let groups=[...new Set(CONTENT.kitchen.map(x=>x[0]))];return hero('MODULE 03 · CULINARY JAPANESE','Restaurant Kitchen Vocabulary','Learn the names of kitchen equipment and common actions, followed by safety instructions and a short workplace dialogue.','厨',[{text:'22 equipment terms',icon:'grid'},{text:'7 essential verbs',icon:'book'}])+
heading('SECTION 01','Restaurant equipment','Search by Indonesian meaning, romaji, or Japanese script.')+
`<div class="section-tools"><div class="filters" id="kitchenFilters"><button class="chip active" data-kitchen-group="all">All</button>${groups.map((g,i)=>`<button class="chip" data-kitchen-group="${i}">${e(g)}</button>`).join('')}</div><div class="field">${ic('search')}<input id="kitchenSearch" type="search" placeholder="Search equipment..." aria-label="Search kitchen equipment"></div></div>`+
`<div class="table-scroll"><table class="data-table"><thead><tr><th>Indonesian</th><th>Romaji</th><th>Japanese script</th></tr></thead><tbody>${groups.map(g=>`<tr class="group-row" data-group-row="${e(g)}"><td colspan="3">${e(g)}</td></tr>${CONTENT.kitchen.filter(x=>x[0]===g).map(x=>kitchenRow(g,x)).join('')}`).join('')}</tbody></table></div>`+
`<div style="margin-top:16px">${note('<strong>Vocabulary note.</strong> フライ返し (furaigaeshi) refers to a food turner; へら (hera) is a spatula or mixing tool. お椀 (owan) can also refer to a soup bowl.')}</div>`+
heading('SECTION 02','Kitchen action verbs','These seven verbs are commonly used in culinary practice.')+
`<div class="vocab-grid">${CONTENT.verbs.map(([j,r,m])=>`<article class="vocab-card">${jp(j)}<span class="romaji-text">${e(r)}</span><span class="meaning" lang="id">${e(m)}</span></article>`).join('')}</div><div style="margin-top:14px">${note('The source material uses doubled vowels to show long sounds, such as <strong>oo</strong> in <strong>chuuboo</strong>.')}</div>`+
heading('SECTION 03','Safety and hygiene','Use these expressions to follow instructions during kitchen practice.')+
`<div class="phrase-grid">${CONTENT.safety.map(x=>pair(...x)).join('')}</div><div style="margin-top:15px">${note('Wash your hands, handle equipment carefully, and follow workplace hygiene and safety procedures.')}</div>`+
heading('SECTION 04','Chef and kitchen staff dialogue','Read the lines with a partner, then switch roles.')+convo(CONTENT.dialogKitchen)+
`<div class="panel" style="margin-top:16px"><h3>Partner practice</h3><p>Take turns as chef and kitchen assistant. Give two instructions: wash the cutting board and clean the worktable. The assistant replies ${jpInline("はい、わかりました。", "Hai, wakarimashita.")} Then switch roles.</p></div>`+
completeBtn('dapur')+footer();}
function tatabahasa(){return hero('MODULE 04 · SENTENCES & PARTICLES','Example Sentences & Grammar','Build simple sentences using familiar equipment and verbs. Focus on particle use and polite requests.','文',[{text:'8 example sentences',icon:'book'},{text:'4 core patterns',icon:'layers'}])+
heading('SECTION 01','Example sentences','Read the Indonesian translation, then review the romaji and Japanese script.')+
`<div class="example-grid">${CONTENT.sentences.map(([m,r,j],i)=>`<article class="example"><div class="example-num">EXAMPLE ${String(i+1).padStart(2,'0')}</div><div class="example-meaning" lang="id">${e(m)}</div>${jp(j)}<div class="romaji-text">${e(r)}</div></article>`).join('')}</div>`+
heading('SECTION 02','Core grammar patterns','Compare each particle with the examples below.')+
`<div class="grammar-grid">${CONTENT.grammar.map((g,i)=>`<article class="grammar-card"><div class="example-num">PATTERN ${String(i+1).padStart(2,'0')}</div><h3>${pairedText(g.title)}</h3><p>${e(g.description)}</p><div class="pattern">${pairedText(g.pattern)}</div>${g.examples.map(([j,r,m])=>`<div class="grammar-example">${jp(j)}<div class="romaji-text">${e(r)}</div><small>${e(m)}</small></div>`).join('')}</article>`).join('')}</div>`+
heading('SECTION 03','Forming the te-form (て)')+`<div class="panel"><p>The te-form (て) is not always formed by simply replacing masu (ます) with te (て). Review these examples.</p><div class="vocab-grid" style="margin-top:17px">${[['洗います','Araimasu','洗って','Aratte'],['切ります','Kirimasu','切って','Kitte'],['入れます','Iremasu','入れて','Irete'],['掃除します','Soojishimasu','掃除して','Soojishite']].map(([a,ar,b,br])=>`<div class="vocab-card form-change">${jpInline(a,ar)}<span class="form-arrow">→</span>${jpInline(b,br)}</div>`).join('')}</div></div>`+
heading('SECTION 04','Complete the particles','Choose the appropriate particle: de, o, or ni.')+
`<div class="grammar-grid"><div class="panel"><h3>A. Choose the correct particle</h3><div class="practice-jp-list">${[["包丁（　）切ります。","Hoochoo (…) kirimasu."],["お皿（　）洗います。","Osara (…) araimasu."],["厨房（　）冷蔵庫があります。","Chuuboo (…) reizooko ga arimasu."],["厨房（　）料理をします。","Chuuboo (…) ryoori o shimasu."]].map(([j,r],i)=>`<div class="practice-jp-row"><span class="practice-index">${i+1}.</span>${jpInline(j,r)}</div>`).join("")}</div></div><div class="panel"><h3>B. Use the pattern in a sentence</h3><p>Choose two kitchen tools. Write one sentence describing an action and one polite request using te kudasai (～てください).</p><a href="latihan.html?topik=dapur" class="btn btn-light" style="margin-top:18px">Particle practice ${ic('arrow')}</a></div></div>`+
completeBtn('tatabahasa')+footer();}

let quizState=null;
let sessionFilter='semua';
const sessionGroups=[
  ['angka','Japanese Numbers','Basic numbers, thousands, and 50,000'],
  ['salam','Greetings & Introductions','Greetings, everyday expressions, and conversations'],
  ['dapur','Kitchen Vocabulary & Dialogue','Equipment, verbs, safety, and workplace communication'],
  ['tatabahasa','Sentences & Grammar','Particles, sentence patterns, and the te-form']
];
const sessionBank=LESSON_SESSIONS.sessions;
const scoresKey='nihongo_studio_scores_v2';
let scoresFallback={};
function savedScores(){try{return JSON.parse(localStorage.getItem(scoresKey)||'{}')}catch{return scoresFallback}}
function saveScore(id,score){const data=savedScores();const prev=data[id];data[id]={best:Math.max(prev?.best||0,score),last:score,attempts:(prev?.attempts||0)+1};scoresFallback=data;try{localStorage.setItem(scoresKey,JSON.stringify(data))}catch{}}
function quizPage(){return hero('JAPANESE PRACTICE','Practice by Topic','Choose a topic to practise. Each session has 10 questions with explanations shown after you answer.','答',[{text:'22 sessions',icon:'book'},{text:'10 questions per session',icon:'zap'},{text:'Session scores',icon:'check'}])+
`<div class="session-overview" id="sessionOverview">
 ${heading('SELECT A SESSION','Practice at your own pace','Choose any session; you do not need to complete them in order.')}
 <div class="session-filter" id="sessionFilters"><button class="chip active" data-topic-filter="semua">All topics</button>${sessionGroups.map(([id,title])=>`<button class="chip" data-topic-filter="${id}">${e(title)}</button>`).join('')}</div>
 <div id="sessionCatalog" class="session-catalog"></div>
 </div>
 <div id="activeSession" class="active-session" hidden>
  <div class="quiz-backrow"><button class="btn btn-line" id="backSessions">${ic('arrowup')} Back to sessions</button><div class="quiz-session-title" id="quizSessionTitle"></div></div>
  <div class="quiz-layout"><section class="quiz-card" id="quizMount" aria-live="polite"></section><aside class="quiz-side"><h3>Instructions</h3><p>Select the best answer. The correct choice and its explanation appear after you respond.</p><p>Each session contains <strong>10 questions</strong>. Your score is saved in this browser.</p><div class="divider"></div><p>Press <strong>1–4</strong> to select an answer, then <strong>Enter</strong> to continue.</p></aside></div>
 </div>`+footer();}
function renderSessionCatalog(){
  const root=document.getElementById('sessionCatalog');if(!root)return;
  const scores=savedScores();
  root.innerHTML=sessionGroups.filter(([g])=>sessionFilter==='semua'||sessionFilter===g).map(([g,title,description])=>{
    const list=sessionBank.filter(x=>x.group===g);
    const completed=list.filter(x=>scores[x.id]).length;
    return `<section class="session-group" data-section="${g}"><div class="session-group-head"><div><span class="eyebrow">${e(title)}</span><h2>${e(description)}</h2></div><span class="session-progress">${completed} of ${list.length} sessions completed</span></div><div class="session-grid">${list.map((x,i)=>{
      const score=scores[x.id];return `<button class="session-card" data-session-start="${e(x.id)}"><span class="session-card-top"><span class="session-index">SESSION ${String(i+1).padStart(2,'0')}</span><span class="session-score">${score?`Best score ${score.best}/10`:'Not attempted'}</span></span><strong>${e(x.title)}</strong><span class="session-description">${e(x.description)}</span><span class="session-card-bottom"><span>${ic('book')} 10 questions</span><span class="session-start">${score?'Try again':'Start session'} ${ic('arrow')}</span></span></button>`
    }).join('')}</div></section>`;
  }).join('');
  document.querySelectorAll('#sessionFilters [data-topic-filter]').forEach(b=>b.classList.toggle('active',b.dataset.topicFilter===sessionFilter));
}
function showSessionList(group='semua'){
  sessionFilter=sessionGroups.some(g=>g[0]===group)?group:'semua';
  quizState=null;
  document.getElementById('sessionOverview').hidden=false;
  document.getElementById('activeSession').hidden=true;
  renderSessionCatalog();
  const url=new URL(location.href);url.searchParams.delete('sesi');
  if(sessionFilter==='semua')url.searchParams.delete('topik');else url.searchParams.set('topik',sessionFilter);
  try{history.replaceState(null,'',url.toString())}catch{}
}
function initQuiz(id){
  const session=sessionBank.find(s=>s.id===id);
  if(!session){showSessionList(sessionFilter);return}
  quizState={id,group:session.group,session,questions:session.questions,index:0,selected:null,score:0,finished:false};
  document.getElementById('sessionOverview').hidden=true;
  document.getElementById('activeSession').hidden=false;
  document.getElementById('quizSessionTitle').textContent=`${session.title} · 10 questions`;
  const url=new URL(location.href);url.searchParams.set('sesi',id);url.searchParams.delete('topik');try{history.replaceState(null,'',url.toString())}catch{}
  renderQuiz();
  document.getElementById('activeSession').scrollIntoView({behavior:'auto',block:'start'});
}
function renderQuiz(){
  const mount=document.getElementById('quizMount');if(!mount||!quizState)return;
  const {questions,index,selected,score,finished,session}=quizState;
  if(finished){const pct=Math.round(score/questions.length*100);
    const following=sessionBank[sessionBank.findIndex(s=>s.id===session.id)+1];
    mount.innerHTML=`<div class="results"><div class="eyebrow">SESSION COMPLETE</div><strong>${score} / 10</strong><h2>${pct>=80?'Ready for the next session':pct>=60?'Good progress':'Review and retry'}</h2><p>${score} correct answers out of 10. ${pct>=80?'You can continue to the next session.':'Review the lesson and try this session again.'}</p><div class="result-actions"><button class="btn btn-light" id="restartQuiz">${ic('refresh')} Retry session</button>${following?`<button class="btn btn-primary" data-session-start="${e(following.id)}">Next session ${ic('arrow')}</button>`:''}<button class="btn btn-line" id="backSessionsResult">Choose another session</button></div></div>`;return;
  }
  const q=questions[index],answered=selected!==null;
  mount.innerHTML=`<div class="quiz-header"><span>QUESTION ${String(index+1).padStart(2,'0')} / 10</span><span>Correct: ${score}</span></div><div class="quiz-progress"><span style="width:${index/10*100}%"></span></div><div class="quiz-category">${e(session.title)}</div><h2 class="quiz-question" lang="id">${quizQuestion(q)}</h2><div class="choices">${q.choices.map((choice,i)=>`<div class="choice-row"><button class="choice ${answered?(i===q.answer?'correct':i===selected?'incorrect':'') : ''}" data-choice="${i}" ${answered?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span class="choice-content">${quizChoice(q,choice,i)}</span></button>${hasJapanese(choice)?`<button type="button" class="audio-play choice-audio" data-speak="${e(choice)}" title="Play option ${String.fromCharCode(65+i)}" aria-label="Play Japanese in option ${String.fromCharCode(65+i)}">${ic('volume')}</button>`:''}</div>`).join('')}</div>${answered?`<div class="feedback"><strong>${selected===q.answer?'Correct.':'Not quite.'}</strong> <span lang="id">${e(q.explanation)}</span></div><div class="quiz-action"><button class="btn btn-primary" id="nextQuestion">${index===9?'View results':'Next question'} ${ic('arrow')}</button></div>`:'<p class="quiz-hint">Select one answer to see the explanation.</p>'}`;
}
function answer(index){if(!quizState||quizState.finished||quizState.selected!==null)return;if(index<0||index>3)return;const q=quizState.questions[quizState.index];quizState.selected=index;if(index===q.answer)quizState.score++;renderQuiz();}
function nextQuestion(){if(!quizState||quizState.selected===null)return;if(quizState.index===9){quizState.finished=true;saveScore(quizState.id,quizState.score);}else{quizState.index++;quizState.selected=null;}renderQuiz();}
function setupNumberFilters(){const chips=document.getElementById('numberFilters');if(!chips)return;let active='all';let search='';const filter=()=>{let visible=0;document.querySelectorAll('[data-number-card]').forEach(card=>{const key=card.dataset.numberGroup;const passGroup=active==='all'||key===active||(active==='big'&&(key.endsWith('k')||key==='50k'));const passText=card.dataset.search.includes(search)||fmt(Number(card.querySelector('.number-tag')?.textContent?.replace(/\./g,'')||0)).includes(search);const show=passGroup&&passText;card.style.display=show?'':'none';if(show)visible++;});document.querySelectorAll('[data-group-section]').forEach(section=>{const has=[...section.querySelectorAll('[data-number-card]')].some(x=>x.style.display!=='none');section.style.display=has?'':'none';});if(!document.getElementById('numberEmpty')){document.getElementById('numberArea').insertAdjacentHTML('beforeend','<div class="empty" id="numberEmpty" style="display:none">No matching numbers. Try a different search term.</div>')}document.getElementById('numberEmpty').style.display=visible?'none':'';};chips.addEventListener('click',event=>{const b=event.target.closest('[data-group]');if(!b)return;active=b.dataset.group;chips.querySelectorAll('[data-group]').forEach(c=>c.classList.toggle('active',c===b));filter();});document.getElementById('numberSearch')?.addEventListener('input',ev=>{search=ev.target.value.toLowerCase().trim();filter()});document.getElementById('memorizeToggle')?.addEventListener('click',ev=>{const area=document.getElementById('numberArea');const active=area.classList.toggle('memorize');const btn=ev.currentTarget;btn.setAttribute('aria-pressed',active?'true':'false');btn.innerHTML=`${ic('eye')} Memorization: ${active?'On':'Off'}`;area.querySelectorAll('.romaji-text').forEach(x=>x.classList.remove('revealed'))});document.getElementById('numberArea')?.addEventListener('click',ev=>{const roman=ev.target.closest('.romaji-text');if(roman&&document.getElementById('numberArea').classList.contains('memorize'))roman.classList.toggle('revealed')});filter();}
function setupKitchenFilters(){const section=document.getElementById('kitchenFilters');if(!section)return;const labels=[...new Set(CONTENT.kitchen.map(x=>x[0]))];let group='all',search='';const run=()=>{const rows=[...document.querySelectorAll('.kitchen-item')];let visible=0;rows.forEach(row=>{const i=CONTENT.kitchen.findIndex(x=>x.join(' ').toLowerCase()===row.dataset.search);const g=CONTENT.kitchen[i]?.[0];const pass=(group==='all'||g===labels[Number(group)])&&row.dataset.search.includes(search);row.style.display=pass?'':'none';if(pass)visible++;});document.querySelectorAll('[data-group-row]').forEach(r=>{const title=r.dataset.groupRow;r.style.display=rows.some(x=>x.style.display!=='none'&&x.dataset.search.startsWith(title.toLowerCase()))?'':'none'});};section.addEventListener('click',ev=>{let btn=ev.target.closest('[data-kitchen-group]');if(!btn)return;group=btn.dataset.kitchenGroup;section.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));run()});document.getElementById('kitchenSearch')?.addEventListener('input',ev=>{search=ev.target.value.toLowerCase().trim();run()});}
const searchIndex=()=>[
  ...CONTENT.numbers.map(n=>({title:`${fmt(n.value)} · ${n.romaji}`,sub:`${n.kanji} / ${n.kana} · Japanese Numbers`,voice:n.kana,url:`angka.html?q=${encodeURIComponent(n.romaji)}`})),
  ...CONTENT.salams.map(([j,r,m])=>({title:r,sub:`${j} · ${m}`,voice:j,url:'salam.html'})),
  ...CONTENT.house.map(([j,r,m])=>({title:r,sub:`${j} · ${m}`,voice:j,url:'salam.html'})),
  ...CONTENT.introductions.map(([j,r,m])=>({title:r,sub:`${j} · ${m}`,voice:j,url:'salam.html'})),
  ...CONTENT.kitchen.map(([g,m,r,j])=>({title:m,sub:`${r} · ${j}`,voice:j,url:`dapur.html?q=${encodeURIComponent(r)}`})),
  ...CONTENT.verbs.map(([j,r,m])=>({title:m,sub:`${r} · ${j}`,voice:j,url:'dapur.html'})),
  ...CONTENT.grammar.map(g=>({title:g.title,sub:g.description,voice:hasJapanese(g.title)?g.title:null,url:'tata-bahasa.html'}))
];
function setSearch(open){const overlay=document.getElementById('searchOverlay');if(!overlay)return;overlay.classList.toggle('open',open);document.body.style.overflow=open?'hidden':'';if(open){const f=document.getElementById('globalSearch');f.focus();renderSearch(f.value)}else document.getElementById('searchLaunch')?.focus();}
function renderSearch(query){const mount=document.getElementById('searchResults');const words=query.toLowerCase().trim();const items=searchIndex().filter(item=>!words||`${item.title} ${item.sub}`.toLowerCase().includes(words)).slice(0,17);mount.innerHTML=items.length?items.map(item=>`<div class="search-audio-row"><a class="search-result" href="${e(item.url)}"><strong>${e(item.title)}</strong><small>${e(item.sub)}</small></a>${item.voice?`<button class="audio-play" data-speak="${e(item.voice)}" title="Play Japanese audio" aria-label="Play Japanese pronunciation">${ic('volume')}</button>`:''}</div>`).join(''):'<div class="empty">No results. Search by number, Japanese phrase, romaji, or Indonesian meaning.</div>';}
let toastTimer;
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3400)}
function speak(text,button){if(window.NihongoVoice)window.NihongoVoice.play(text,button);else toast('Audio is temporarily unavailable. Refresh the page and try again.');}
function mobile(open){document.getElementById('sidebar').classList.toggle('open',open);document.getElementById('mobileShade').classList.toggle('open',open);document.getElementById('menuToggle').setAttribute('aria-expanded',open?'true':'false');}
function bind(){document.getElementById('menuToggle')?.addEventListener('click',()=>mobile(!document.getElementById('sidebar').classList.contains('open')));document.getElementById('mobileShade')?.addEventListener('click',()=>mobile(false));document.getElementById('homeLink')?.addEventListener('click',()=>location.href='index.html');document.getElementById('searchLaunch')?.addEventListener('click',()=>setSearch(true));document.getElementById('closeSearch')?.addEventListener('click',()=>setSearch(false));document.getElementById('searchOverlay')?.addEventListener('click',ev=>{if(ev.target.id==='searchOverlay')setSearch(false)});document.getElementById('globalSearch')?.addEventListener('input',ev=>renderSearch(ev.target.value));document.getElementById('topButton')?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));window.addEventListener('scroll',()=>document.getElementById('topButton')?.classList.toggle('show',scrollY>550),{passive:true});document.addEventListener('click',ev=>{const doneBtn=ev.target.closest('[data-done-key]');if(doneBtn)setDone(doneBtn.dataset.doneKey);const speakBtn=ev.target.closest('[data-speak]');if(speakBtn)speak(speakBtn.dataset.speak,speakBtn);const filt=ev.target.closest('[data-topic-filter]');if(filt)showSessionList(filt.dataset.topicFilter);const sessionBtn=ev.target.closest('[data-session-start]');if(sessionBtn)initQuiz(sessionBtn.dataset.sessionStart);if(ev.target.closest('#backSessions')||ev.target.closest('#backSessionsResult'))showSessionList(quizState?.group||'semua');const choice=ev.target.closest('[data-choice]');if(choice)answer(Number(choice.dataset.choice));if(ev.target.closest('#nextQuestion'))nextQuestion();if(ev.target.closest('#restartQuiz'))initQuiz(quizState.id);});document.addEventListener('keydown',ev=>{const inputFocused=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);if(ev.key==='Escape'){setSearch(false);mobile(false)}if(ev.key==='/'&&!inputFocused&&!document.getElementById('searchOverlay').classList.contains('open')){ev.preventDefault();setSearch(true)}if(page==='latihan'&&!inputFocused&&!document.getElementById('searchOverlay').classList.contains('open')){if('1234'.includes(ev.key)&&ev.key.length===1)answer(Number(ev.key)-1);if(ev.key==='Enter'&&quizState?.selected!==null&&!quizState.finished)nextQuestion()}});}
function init(){document.getElementById('app').innerHTML=shell();const views={home,angka,salam,dapur,tatabahasa,latihan:quizPage};document.getElementById('mainContent').innerHTML=(views[page]||home)();bind();window.NihongoVoice?.init();updateProgress();if(page==='angka'){setupNumberFilters();const q=new URLSearchParams(location.search).get('q');if(q){const input=document.getElementById('numberSearch');input.value=q;input.dispatchEvent(new Event('input'))}}if(page==='dapur'){setupKitchenFilters();const q=new URLSearchParams(location.search).get('q');if(q){const input=document.getElementById('kitchenSearch');input.value=q;input.dispatchEvent(new Event('input'))}}if(page==='latihan'){const p=new URLSearchParams(location.search);showSessionList(p.get('topik')||'semua');if(p.get('sesi'))initQuiz(p.get('sesi'));}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
