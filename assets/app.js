/* Works locally without a framework. */
(() => {
'use strict';
const page = document.body.dataset.page || 'home';
const nav = [
  {key:'home',title:'Beranda',url:'index.html',icon:'home'},
  {key:'angka',title:'Angka Jepang',url:'angka.html',icon:'hash',count:'60'},
  {key:'salam',title:'Salam & Perkenalan',url:'salam.html',icon:'users'},
  {key:'dapur',title:'Kosakata Dapur',url:'dapur.html',icon:'book',count:'22'},
  {key:'tatabahasa',title:'Tata Bahasa',url:'tata-bahasa.html',icon:'layers'},
  {key:'latihan',title:'Latihan per Sesi',url:'latihan.html',icon:'zap',count:'22'}
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
  if(!reading) throw new Error('Romaji belum tersedia untuk '+japanese);
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
    throw new Error('Belum ada bacaan romaji untuk fragmen: '+text.slice(i,i+24));
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
function setDone(key){const cur=completion();cur[key]=!cur[key];progressCache=cur;try{localStorage.setItem(statusKey,JSON.stringify(cur))}catch{};document.querySelectorAll('[data-done-key]').forEach(btn=>{const item=btn.dataset.doneKey;btn.innerHTML=done(item)?`${ic('check')} Sudah dipelajari`:`${ic('check')} Tandai sudah dipelajari`});updateProgress();}
function updateProgress(){const count=lessons.filter(done).length;document.querySelectorAll('.progress-fraction').forEach(el=>el.textContent=`${count} / ${lessons.length}`);document.querySelectorAll('.progress-percent').forEach(el=>el.style.width=(count/lessons.length*100)+'%');}
function shell(){const links=nav.map((n,i)=>`${i===1?'<div class="nav-label">MODUL PEMBELAJARAN</div>':''}<a class="nav-link ${page===n.key?'active':''}" href="${n.url}" ${page===n.key?'aria-current="page"':''}>${ic(n.icon)}<span>${e(n.title)}</span>${n.count?`<span class="count">${n.count}</span>`:''}</a>`).join('');return `<div class="shell"><aside class="sidebar" id="sidebar"><a class="brand" href="index.html" aria-label="Ke beranda Nihongo Studio"><div class="brand-mark">N</div><div><span class="brand-name">Nihongo Studio</span><span class="brand-sub">BAHASA JEPANG • SMK</span></div></a><nav aria-label="Navigasi utama">${links}</nav><div class="sidebar-bottom"><div class="sidebar-rule"></div><div class="sidebar-kicker">PROGRES BELAJAR</div><div class="sidebar-progress progress-fraction">0 / 4</div><div class="meter"><span class="progress-percent"></span></div><div class="sidebar-footnote">Tersimpan di perangkat ini</div></div></aside><div class="mobile-shade" id="mobileShade"></div><div class="main"><header class="topbar"><div class="top-title"><button class="icon-button mobile-menu" id="menuToggle" aria-label="Buka menu" aria-expanded="false">${ic('menu')}</button><span>Materi Bahasa Jepang</span><span class="dot"></span><strong>${e(titles[page])}</strong></div><div class="top-actions"><button class="top-search" id="searchLaunch" title="Cari seluruh materi (/)" aria-label="Cari materi">${ic('search')}<span>Cari materi...</span><kbd class="kbd">/</kbd></button><button class="voice-top-trigger" id="voiceLaunch" type="button" aria-label="Atur suara Jepang dan pengucapan" title="Pilih suara Jepang">${ic('volume')}<span>Suara Jepang</span></button><button class="icon-button" id="homeLink" title="Beranda" aria-label="Ke beranda">${ic('home')}</button></div></header><main class="content" id="mainContent"></main></div></div><div class="search-overlay" id="searchOverlay" role="dialog" aria-modal="true" aria-label="Pencarian materi"><div class="search-modal"><div class="search-modal-top">${ic('search')}<input id="globalSearch" type="search" aria-label="Cari" placeholder="Cari angka, salam, romaji, peralatan..." autocomplete="off"><button id="closeSearch">ESC</button></div><div id="searchResults" class="search-results"></div></div></div><button class="back-to-top" aria-label="Kembali ke atas" id="topButton">${ic('arrowup')}</button><div class="voice-overlay" id="voiceOverlay" aria-hidden="true"><section class="voice-panel" role="dialog" aria-modal="true" aria-labelledby="voicePanelTitle"><div class="voice-panel-head"><div><div class="voice-eyebrow">PENGUCAPAN</div><h2 id="voicePanelTitle">Suara Bahasa Jepang</h2><p>Pilih suara yang paling nyaman didengar. Klik ikon pengeras suara di dekat tulisan Jepang untuk memutarnya.</p></div><button type="button" class="voice-close" id="voiceClose" aria-label="Tutup pengaturan suara">✕</button></div><label class="voice-field-label" for="voiceSelect">Pilihan suara Jepang</label><select id="voiceSelect" class="voice-select"><option>Memeriksa suara tersedia…</option></select><div class="voice-quality" id="voiceQuality" role="status">Memeriksa dukungan suara pada perangkat.</div><label class="voice-field-label" for="voiceSpeed">Kecepatan baca <output id="voiceSpeedValue">Normal (1,00×)</output></label><input id="voiceSpeed" type="range" min="0.80" max="1.12" step="0.04" value="1"/><div class="voice-controls"><button type="button" class="btn btn-primary" id="voiceSample">${ic('volume')} Coba dengarkan</button><button type="button" class="btn btn-line" id="voiceStop">Hentikan suara</button></div><p class="voice-note"><strong>Tentang kualitas audio.</strong> Website memakai suara Jepang yang tersedia pada browser dan perangkat. Suara natural/neural lebih diutamakan jika ada. Hasilnya bisa berbeda antarperangkat; penggunaan tanpa internet juga bergantung pada suara Jepang yang telah terpasang.</p></section></div><div class="toast" id="toast" role="status" aria-live="polite"></div>`;}
function hero(kicker,title,description,kanji,metas=[],opts={}){return `<section class="hero ${opts.home?'hero-home':''}"><div class="eyebrow">${e(kicker)}</div><h1>${title}</h1><p>${description}</p><div class="hero-meta">${metas.map(x=>`<span>${ic(x.icon||'book')}${e(x.text)}</span>`).join('')}</div><div class="hero-kanji" aria-hidden="true">${ic("spark")}</div>${opts.buttons||''}</section>`;}
function heading(kicker,title,subtitle='',aside=''){return `<div class="section-heading"><div><div class="eyebrow">${e(kicker)}</div><h2>${e(title)}</h2>${subtitle?`<p>${e(subtitle)}</p>`:''}</div>${aside?`<span class="section-aside">${e(aside)}</span>`:''}</div>`;}
function footer(){return `<footer class="footer"><span>© Nihongo Studio · Materi pembelajaran Bahasa Jepang SMK</span><span>Belajar sedikit demi sedikit, lalu coba sendiri.</span></footer>`;}
function completeBtn(key){return `<div class="completion"><div><strong>Sudah menyelesaikan materi ini?</strong><p>Tandai materi yang telah dipelajari. Progres hanya tersimpan di browser perangkat ini.</p></div><button class="btn btn-light" data-done-key="${key}">${ic('check')} ${done(key)?'Sudah dipelajari':'Tandai sudah dipelajari'}</button></div>`;}
function audio(text){return `<button class="speak" data-speak="${e(text)}" title="Dengarkan pengucapan" aria-label="Dengarkan pengucapan bahasa Jepang">${ic('volume')}</button>`;}
function note(text){return `<div class="notice">${pairedHTML(text)}</div>`;}
function home(){const cards=[
['angka','01','Angka Jepang','Bilangan dasar hingga 50.000, lengkap dengan kanji, hiragana, dan romaji.','hash'],
['salam','02','Salam & Perkenalan','Belajar menyapa, bertanya, memperkenalkan diri, dan ungkapan sehari-hari.','users'],
['dapur','03','Kosakata Dapur','22 nama peralatan restoran, tujuh kata kerja, serta instruksi keselamatan.','book'],
['tatabahasa','04','Contoh & Tata Bahasa','Susun kalimat dengan partikel de, o, ni dan bentuk permintaan te kudasai.','layers'],
['latihan','05','Latihan per Sesi','Pilih subbab, kerjakan 10 soal, lalu lihat nilainya.','zap']];
const buttons=`<div class="hero-buttons"><a href="angka.html" class="btn btn-primary">Mulai belajar ${ic('arrow')}</a><a href="latihan.html" class="btn btn-ghost">Coba latihan ${ic('zap')}</a></div>`;
return hero('PUSAT PEMBELAJARAN BAHASA JEPANG','Belajar bahasa Jepang,<br>mulai dari yang dekat.', 'Kita mulai dari angka dan percakapan sehari-hari. Setelah itu, pelajari kosakata, instruksi, dan kalimat yang digunakan saat praktik di dapur.', '学', [{text:'Level A1–A2',icon:'book'},{text:'Materi kuliner SMK',icon:'grid'},{text:'Belajar mandiri',icon:'clock'}],{home:true,buttons})+
`<div class="stat-grid"><div class="stat"><strong>60</strong><small>Bilangan Jepang</small></div><div class="stat"><strong>22</strong><small>Peralatan dapur</small></div><div class="stat"><strong>7</strong><small>Kata kerja inti</small></div><div class="stat"><strong>220</strong><small>Soal dalam 22 sesi</small></div></div>`+
heading('PILIH MATERI','Jelajahi modul belajar','Ikuti urutan dari dasar, atau buka materi yang sedang dibutuhkan.')+
`<div class="tile-grid">${cards.map(([key,num,title,desc,iconName])=>`<a class="tile" href="${nav.find(n=>n.key===key).url}"><div class="tile-top"><div class="tile-icon">${ic(iconName)}</div><span class="tile-num">MODUL ${num}</span></div><h3>${title}</h3><p>${desc}</p><div class="tile-link">Buka materi ${ic('arrow')}</div></a>`).join('')}</div>`+
heading('PANDUAN','Cara belajar di sini')+
`<div class="info-layout"><div class="panel"><h3>Pilih materi yang ingin dipelajari</h3><p>Gunakan menu untuk pindah materi. Kalau ingin mencari kata tertentu, pakai kolom pencarian. Kamu juga bisa mencoba tombol suara atau menyembunyikan romaji saat menghafal angka.</p></div><div class="panel"><h3>Belajar dan latihan kapan saja</h3><p>Materi dan soal bisa dibuka tanpa internet. Latihan dibagi per subbab, masing-masing 10 soal, sehingga kamu bisa mengerjakan sedikit demi sedikit. Gunakan tombol dengar di samping tulisan Jepang. Jika ingin mengganti suara atau tempo, buka menu Suara Jepang di kanan atas.</p></div></div>`+footer();}
function numberBasic(n){return `<article class="number-card" data-number-card data-number-group="basic" data-search="${e(`${n.value} ${n.romaji} ${n.kanji} ${n.kana}`.toLowerCase())}"><span class="number-tag">${fmt(n.value)}</span>${audio(n.kana)}<span class="number-kanji jp">${e(n.kanji)}</span><span class="number-kana jp">${e(n.kana)}</span><span class="romaji-text">${e(n.romaji)}</span></article>`;}
function numberLarge(n){return `<article class="large-card" data-number-card data-number-group="${e(n.group)}" data-search="${e(`${n.value} ${fmt(n.value)} ${n.romaji} ${n.kanji} ${n.kana}`.toLowerCase())}"><div class="large-top"><span class="number-tag">${fmt(n.value)}</span><span class="number-kanji jp">${e(n.kanji)}</span></div><span class="romaji-text">${e(n.romaji)}</span><div class="number-kana jp">${e(n.kana)}</div>${audio(n.kana)}</article>`;}
function angka(){let n=CONTENT.numbers;let groups=[['10k','10.000–19.000'],['20k','20.000–29.000'],['30k','30.000–39.000'],['40k','40.000–49.000']];let sections=groups.map(([key,label])=>`<div class="range-section number-section" data-group-section="${key}"><div class="range-title">${label}<span>10 angka</span></div><div class="large-grid">${n.filter(x=>x.group===key).map(numberLarge).join('')}</div></div>`).join('');
return hero('MODUL 01 · SUUJI','Angka Jepang 1–50.000','Perhatikan angka dan bacaan Jepangnya. Cari angka yang ingin dipelajari, atau aktifkan mode hafalan untuk mencoba membaca tanpa melihat romaji.','数',[{text:'60 angka',icon:'hash'},{text:'Kanji, hiragana, romaji',icon:'book'}])+
`<div class="section-tools"><div class="filters" id="numberFilters"><button class="chip active" data-group="all">Semua angka</button><button class="chip" data-group="basic">1–10</button><button class="chip" data-group="thousand">Ribuan</button><button class="chip" data-group="big">10.000–50.000</button></div><button class="btn btn-line" id="memorizeToggle" aria-pressed="false">${ic('eye')} Mode hafalan: Mati</button></div><div class="field" style="max-width:380px;margin-bottom:18px">${ic('search')}<input type="search" id="numberSearch" placeholder="Cari: 8.000, sanzen, goman..." aria-label="Cari angka"></div>`+
`<div id="numberArea"><div class="number-section" data-group-section="basic">${heading('BILANGAN DASAR','Angka 1–10','Pelajari sepuluh angka dasar ini terlebih dahulu.') }<div class="number-grid">${n.filter(x=>x.group==='basic').map(numberBasic).join('')}</div></div><div class="number-section" data-group-section="thousand">${heading('BILANGAN RIBUAN','Angka 1.000–9.000','Perhatikan perubahan bunyi pada angka 3.000 dan 8.000.') }<div class="large-grid">${n.filter(x=>x.group==='thousand').map(numberLarge).join('')}</div></div><div class="number-section" data-group-section="big">${heading('PULUHAN RIBU','Angka 10.000–49.000','Perhatikan pola yang berubah setiap kelipatan seribu.')} ${sections}</div><div class="number-section" data-group-section="50k">${heading('BATAS MATERI','50.000')}<div class="milestone" data-number-card data-number-group="50k" data-search="50000 50.000 goman 五万 ごまん"><strong>50.000</strong><span class="jp">五万</span><span class="romaji-text">goman</span><span class="jp">ごまん</span><small>LIMA PULUH RIBU</small></div></div></div>`+
`<div style="margin-top:22px">${note(`<strong>Catatan pelafalan.</strong> 3.000 dibaca <strong>sanzen</strong> dan 8.000 dibaca <strong>hassen</strong>. Untuk 10.000, gunakan <strong>ichiman</strong>, bukan <em>jūsen</em>. Bacaan utama angka 4, 7, 9 adalah yon, nana, kyū (alternatif: shi, shichi, ku).`)}</div>`+
heading('LATIHAN RINGAN','Coba ucapkan dalam hati','6 · 8.000 · 13.000 · 25.000 · 38.000 · 49.000')+
`<div class="panel"><p>Gunakan mode hafalan untuk menyembunyikan romaji, lalu klik bacaan yang ingin diperiksa. Jika sudah siap, buka latihan interaktif.</p><div style="margin-top:15px"><a class="btn btn-light" href="latihan.html?topik=angka">Latihan angka ${ic('arrow')}</a></div></div>`+completeBtn('angka')+footer();}
function pair(j,r,m){return `<article class="phrase">${audio(j)}${jp(j)}<span class="romaji-text">${e(r)}</span><span class="meaning">${e(m)}</span></article>`;}
function convo(lines){return `<div class="dialogue">${lines.map(([who,j,r,m])=>`<div class="chat"><div class="avatar">${e(who)}</div><div>${jp(j)}<span class="romaji-text">${e(r)}</span><span class="meaning">${e(m)}</span></div></div>`).join('')}</div>`;}
function salam(){return hero('MODUL 02 · AISATSU & JIKOSHŌKAI','Salam & Perkenalan Diri','Di bagian ini kita berlatih menyapa, berkenalan, dan bertanya sederhana. Baca contoh yang tersedia, lalu coba gunakan bersama teman.','話',[{text:'Salam sehari-hari',icon:'users'},{text:'Contoh percakapan',icon:'book'}])+
heading('BAGIAN 01','Salam dan ungkapan sopan','Pilih salam sesuai waktu dan lawan bicara. Kepada guru atau tamu, gunakan bentuk yang lebih sopan.')+
`<div class="phrase-grid">${CONTENT.salams.map(x=>pair(...x)).join('')}</div>`+
`<div style="margin-top:16px">${note('<strong>Ingat.</strong> こんばんは digunakan untuk menyapa pada malam hari; おやすみなさい untuk mengucapkan selamat tidur. さようなら biasanya untuk perpisahan yang cukup lama. Kepada teman, またね terasa lebih santai.')}</div>`+
heading('BAGIAN 02','Ungkapan di rumah dan saat makan')+
`<div class="phrase-grid">${CONTENT.house.map(x=>pair(...x)).join('')}</div><div style="margin-top:16px">${note('Ungkapan <strong>いただきます</strong> dan <strong>ごちそうさまでした</strong> menunjukkan penghargaan terhadap makanan dan orang yang menyiapkannya. Maknanya tidak selalu diterjemahkan secara harfiah.')}</div>`+
heading('BAGIAN 03','Perkenalan diri','Ubah nama, asal, tempat tinggal, dan hobi sesuai dengan identitasmu.')+
`<div class="phrase-grid">${CONTENT.introductions.map(x=>pair(...x)).join('')}</div><div style="margin-top:16px">${note('Ungkapan <strong>よろしくおねがいします</strong> dipakai untuk memulai hubungan atau kerja sama. Dalam perkenalan, maknanya mendekati “senang berkenalan”.')}</div>`+
heading('BAGIAN 04','Bertanya tentang teman baru')+`<div class="phrase-grid">${CONTENT.questions.map(x=>pair(...x)).join('')}</div>`+
heading('BAGIAN 05','Contoh percakapan singkat','Bacakan dialog ini secara bergantian dengan teman sebangku.')+convo(CONTENT.dialogIntro)+
`<div class="section-heading"><div><div class="eyebrow">PRAKTIK</div><h2>Perkenalkan dirimu</h2><p>Dalam 30–45 detik, sebutkan nama, asal, tempat tinggal, dan hobi. Tanyakan dua hal tentang temanmu.</p></div></div><div class="panel-note">${ic('info')}<p><strong>Tips membaca:</strong> Romaji membantu pada tahap awal. Huruf ō dan ū menandai bunyi panjang. Ucapkan keseluruhan ungkapan secara wajar, bukan huruf Latin satu per satu.</p></div>`+
completeBtn('salam')+footer();}
function kitchenRow(group,x){return `<tr class="kitchen-item" data-search="${e(x.join(' ').toLowerCase())}"><td>${e(x[1])}</td><td class="romaji-text">${e(x[2])}</td><td class="jp">${e(x[3])}</td></tr>`;}
function dapur(){let groups=[...new Set(CONTENT.kitchen.map(x=>x[0]))];return hero('MODUL 03 · KULINER','Kosakata Dapur Restoran','Kenali nama alat dan kata kerja yang biasa dipakai saat praktik. Ada juga instruksi keselamatan dan dialog antara koki dan staf dapur.','厨',[{text:'22 nama peralatan',icon:'grid'},{text:'7 kata kerja',icon:'book'}])+
heading('BAGIAN 01','Nama peralatan restoran','Gunakan kolom pencarian untuk menemukan arti, romaji, atau huruf Jepang.')+
`<div class="section-tools"><div class="filters" id="kitchenFilters"><button class="chip active" data-kitchen-group="all">Semua</button>${groups.map((g,i)=>`<button class="chip" data-kitchen-group="${i}">${e(g)}</button>`).join('')}</div><div class="field">${ic('search')}<input id="kitchenSearch" type="search" placeholder="Cari peralatan..." aria-label="Cari peralatan dapur"></div></div>`+
`<div class="table-scroll"><table class="data-table"><thead><tr><th>Bahasa Indonesia</th><th>Romaji</th><th>Huruf Jepang</th></tr></thead><tbody>${groups.map(g=>`<tr class="group-row" data-group-row="${e(g)}"><td colspan="3">${e(g)}</td></tr>${CONTENT.kitchen.filter(x=>x[0]===g).map(x=>kitchenRow(g,x)).join('')}`).join('')}</tbody></table></div>`+
`<div style="margin-top:16px">${note('<strong>Catatan Sensei:</strong> フライ返し (furaigaeshi) digunakan untuk membalik makanan; へら (hera) untuk spatula/pengaduk. お椀 (owan) juga digunakan untuk mangkuk kuah.')}</div>`+
heading('BAGIAN 02','Kata kerja untuk praktik dapur','Ketujuh kata kerja ini sering digunakan saat praktik kuliner.')+
`<div class="vocab-grid">${CONTENT.verbs.map(([j,r,m])=>`<article class="vocab-card">${jp(j)}<span class="romaji-text">${e(r)}</span><span class="meaning">${e(m)}</span></article>`).join('')}</div><div style="margin-top:14px">${note('Pada bagian kosakata dapur, materi sumber menggunakan vokal ganda untuk bunyi panjang, contohnya <strong>oo</strong> pada <strong>chuuboo</strong>.')}</div>`+
heading('BAGIAN 03','Keselamatan dan kebersihan','Gunakan ungkapan ini saat mengikuti instruksi praktik di dapur.')+
`<div class="phrase-grid">${CONTENT.safety.map(x=>pair(...x)).join('')}</div><div style="margin-top:15px">${note('Saat praktik, cuci tangan, berhati-hati saat memakai alat, serta patuhi aturan kebersihan dan keselamatan kerja di dapur sekolah.')}</div>`+
heading('BAGIAN 04','Dialog koki dan staf dapur','Bacakan bergantian, lalu tukar peran.')+convo(CONTENT.dialogKitchen)+
`<div class="panel" style="margin-top:16px"><h3>Praktik berpasangan</h3><p>Satu siswa menjadi koki dan memberi dua instruksi: cuci talenan dan bersihkan meja kerja. Teman menjawab ${jpInline("はい、わかりました。", "Hai, wakarimashita.")} Setelah itu, tukar peran.</p></div>`+
completeBtn('dapur')+footer();}
function tatabahasa(){return hero('MODUL 04 · KALIMAT & PARTIKEL','Contoh Kalimat & Tata Bahasa','Setelah mengenal nama alat dan kata kerja, sekarang kita belajar menyusun kalimat. Perhatikan penggunaan partikel dan cara meminta bantuan dengan sopan.','文',[{text:'8 contoh kalimat',icon:'book'},{text:'4 pola dasar',icon:'layers'}])+
heading('BAGIAN 01','Contoh kalimat','Baca artinya, lalu perhatikan romaji dan huruf Jepangnya.')+
`<div class="example-grid">${CONTENT.sentences.map(([m,r,j],i)=>`<article class="example"><div class="example-num">CONTOH ${String(i+1).padStart(2,'0')}</div><div class="example-meaning">${e(m)}</div>${jp(j)}<div class="romaji-text">${e(r)}</div></article>`).join('')}</div>`+
heading('BAGIAN 02','Pola tata bahasa dasar','Bandingkan fungsi partikel dan contoh kalimat di bawahnya.')+
`<div class="grammar-grid">${CONTENT.grammar.map((g,i)=>`<article class="grammar-card"><div class="example-num">POLA ${String(i+1).padStart(2,'0')}</div><h3>${pairedText(g.title)}</h3><p>${e(g.description)}</p><div class="pattern">${pairedText(g.pattern)}</div>${g.examples.map(([j,r,m])=>`<div class="grammar-example">${jp(j)}<div class="romaji-text">${e(r)}</div><small>${e(m)}</small></div>`).join('')}</article>`).join('')}</div>`+
heading('BAGIAN 03','Perubahan ke bentuk te (て)')+`<div class="panel"><p>Bentuk te (て) tidak selalu diperoleh dengan mengganti masu (ます) menjadi te (て). Perhatikan perubahan berikut dari materi.</p><div class="vocab-grid" style="margin-top:17px">${[['洗います','Araimasu','洗って','Aratte'],['切ります','Kirimasu','切って','Kitte'],['入れます','Iremasu','入れて','Irete'],['掃除します','Soojishimasu','掃除して','Soojishite']].map(([a,ar,b,br])=>`<div class="vocab-card form-change">${jpInline(a,ar)}<span class="form-arrow">→</span>${jpInline(b,br)}</div>`).join('')}</div></div>`+
heading('BAGIAN 04','Coba lengkapi partikelnya','Terapkan partikel de, o, dan ni pada contoh di bawah.')+
`<div class="grammar-grid"><div class="panel"><h3>A. Isi partikel yang tepat</h3><div class="practice-jp-list">${[["包丁（　）切ります。","Hoochoo (…) kirimasu."],["お皿（　）洗います。","Osara (…) araimasu."],["厨房（　）冷蔵庫があります。","Chuuboo (…) reizooko ga arimasu."],["厨房（　）料理をします。","Chuuboo (…) ryoori o shimasu."]].map(([j,r],i)=>`<div class="practice-jp-row"><span class="practice-index">${i+1}.</span>${jpInline(j,r)}</div>`).join("")}</div></div><div class="panel"><h3>B. Coba gunakan dalam kalimat</h3><p>Pilih dua peralatan dapur. Buat satu kalimat untuk menyatakan kegiatan, lalu satu kalimat permintaan sopan menggunakan te kudasai (～てください).</p><a href="latihan.html?topik=dapur" class="btn btn-light" style="margin-top:18px">Latihan partikel ${ic('arrow')}</a></div></div>`+
completeBtn('tatabahasa')+footer();}

let quizState=null;
let sessionFilter='semua';
const sessionGroups=[
  ['angka','Angka Jepang','Angka dasar, ribuan, sampai 50.000'],
  ['salam','Salam & Perkenalan','Salam, ungkapan di rumah, perkenalan, dan percakapan'],
  ['dapur','Kosakata & Percakapan Dapur','Nama peralatan, kata kerja, keselamatan, dan dialog'],
  ['tatabahasa','Kalimat & Tata Bahasa','Contoh kalimat, partikel, dan bentuk te']
];
const sessionBank=LESSON_SESSIONS.sessions;
const scoresKey='nihongo_studio_scores_v2';
let scoresFallback={};
function savedScores(){try{return JSON.parse(localStorage.getItem(scoresKey)||'{}')}catch{return scoresFallback}}
function saveScore(id,score){const data=savedScores();const prev=data[id];data[id]={best:Math.max(prev?.best||0,score),last:score,attempts:(prev?.attempts||0)+1};scoresFallback=data;try{localStorage.setItem(scoresKey,JSON.stringify(data))}catch{}}
function quizPage(){return hero('LATIHAN BAHASA JEPANG','Latihan per Subbab','Pilih subbab yang sedang dipelajari. Setiap sesi berisi 10 soal. Setelah menjawab, baca pembahasannya sebelum lanjut ke soal berikutnya.','答',[{text:'22 sesi',icon:'book'},{text:'10 soal per sesi',icon:'zap'},{text:'Nilai tiap sesi',icon:'check'}])+
`<div class="session-overview" id="sessionOverview">
 ${heading('PILIH SESI','Mulai dari subbab yang ingin dilatih','Kamu bisa mengerjakan sesi mana saja. Tidak harus berurutan.')}
 <div class="session-filter" id="sessionFilters"><button class="chip active" data-topic-filter="semua">Semua subbab</button>${sessionGroups.map(([id,title])=>`<button class="chip" data-topic-filter="${id}">${e(title)}</button>`).join('')}</div>
 <div id="sessionCatalog" class="session-catalog"></div>
 </div>
 <div id="activeSession" class="active-session" hidden>
  <div class="quiz-backrow"><button class="btn btn-line" id="backSessions">${ic('arrowup')} Kembali ke daftar sesi</button><div class="quiz-session-title" id="quizSessionTitle"></div></div>
  <div class="quiz-layout"><section class="quiz-card" id="quizMount" aria-live="polite"></section><aside class="quiz-side"><h3>Petunjuk</h3><p>Pilih satu jawaban yang paling tepat. Setelah itu akan muncul jawaban benar beserta penjelasannya.</p><p>Setiap sesi berisi <strong>10 soal</strong>. Nilaimu akan disimpan pada browser ini.</p><div class="divider"></div><p>Gunakan tombol angka <strong>1–4</strong> untuk memilih jawaban. Tekan <strong>Enter</strong> untuk lanjut.</p></aside></div>
 </div>`+footer();}
function renderSessionCatalog(){
  const root=document.getElementById('sessionCatalog');if(!root)return;
  const scores=savedScores();
  root.innerHTML=sessionGroups.filter(([g])=>sessionFilter==='semua'||sessionFilter===g).map(([g,title,description])=>{
    const list=sessionBank.filter(x=>x.group===g);
    const completed=list.filter(x=>scores[x.id]).length;
    return `<section class="session-group" data-section="${g}"><div class="session-group-head"><div><span class="eyebrow">${e(title)}</span><h2>${e(description)}</h2></div><span class="session-progress">${completed} dari ${list.length} sesi dikerjakan</span></div><div class="session-grid">${list.map((x,i)=>{
      const score=scores[x.id];return `<button class="session-card" data-session-start="${e(x.id)}"><span class="session-card-top"><span class="session-index">SESI ${String(i+1).padStart(2,'0')}</span><span class="session-score">${score?`Nilai terbaik ${score.best}/10`:'Belum dikerjakan'}</span></span><strong>${e(x.title)}</strong><span class="session-description">${e(x.description)}</span><span class="session-card-bottom"><span>${ic('book')} 10 soal</span><span class="session-start">${score?'Kerjakan lagi':'Mulai latihan'} ${ic('arrow')}</span></span></button>`
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
  document.getElementById('quizSessionTitle').textContent=`${session.title} · 10 soal`;
  const url=new URL(location.href);url.searchParams.set('sesi',id);url.searchParams.delete('topik');try{history.replaceState(null,'',url.toString())}catch{}
  renderQuiz();
  document.getElementById('activeSession').scrollIntoView({behavior:'auto',block:'start'});
}
function renderQuiz(){
  const mount=document.getElementById('quizMount');if(!mount||!quizState)return;
  const {questions,index,selected,score,finished,session}=quizState;
  if(finished){const pct=Math.round(score/questions.length*100);
    const following=sessionBank[sessionBank.findIndex(s=>s.id===session.id)+1];
    mount.innerHTML=`<div class="results"><div class="eyebrow">SESI SELESAI</div><strong>${score} / 10</strong><h2>${pct>=80?'Siap lanjut!':pct>=60?'Sudah cukup baik':'Coba pelajari lagi, ya'}</h2><p>${score} jawaban benar dari 10 soal. ${pct>=80?'Kamu bisa melanjutkan ke sesi berikutnya.':'Baca ulang materi yang belum dikuasai, lalu ulangi sesi ini.'}</p><div class="result-actions"><button class="btn btn-light" id="restartQuiz">${ic('refresh')} Ulangi sesi</button>${following?`<button class="btn btn-primary" data-session-start="${e(following.id)}">Sesi berikutnya ${ic('arrow')}</button>`:''}<button class="btn btn-line" id="backSessionsResult">Pilih sesi lain</button></div></div>`;return;
  }
  const q=questions[index],answered=selected!==null;
  mount.innerHTML=`<div class="quiz-header"><span>SOAL ${String(index+1).padStart(2,'0')} / 10</span><span>Benar: ${score}</span></div><div class="quiz-progress"><span style="width:${index/10*100}%"></span></div><div class="quiz-category">${e(session.title)}</div><h2 class="quiz-question">${quizQuestion(q)}</h2><div class="choices">${q.choices.map((choice,i)=>`<div class="choice-row"><button class="choice ${answered?(i===q.answer?'correct':i===selected?'incorrect':'') : ''}" data-choice="${i}" ${answered?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span class="choice-content">${quizChoice(q,choice,i)}</span></button>${hasJapanese(choice)?`<button type="button" class="audio-play choice-audio" data-speak="${e(choice)}" title="Dengarkan pilihan ${String.fromCharCode(65+i)}" aria-label="Dengarkan tulisan Jepang pada pilihan ${String.fromCharCode(65+i)}">${ic('volume')}</button>`:''}</div>`).join('')}</div>${answered?`<div class="feedback"><strong>${selected===q.answer?'Benar.':'Belum tepat.'}</strong> ${e(q.explanation)}</div><div class="quiz-action"><button class="btn btn-primary" id="nextQuestion">${index===9?'Lihat nilai':'Soal berikutnya'} ${ic('arrow')}</button></div>`:'<p class="quiz-hint">Pilih satu jawaban untuk melihat pembahasannya.</p>'}`;
}
function answer(index){if(!quizState||quizState.finished||quizState.selected!==null)return;if(index<0||index>3)return;const q=quizState.questions[quizState.index];quizState.selected=index;if(index===q.answer)quizState.score++;renderQuiz();}
function nextQuestion(){if(!quizState||quizState.selected===null)return;if(quizState.index===9){quizState.finished=true;saveScore(quizState.id,quizState.score);}else{quizState.index++;quizState.selected=null;}renderQuiz();}
function setupNumberFilters(){const chips=document.getElementById('numberFilters');if(!chips)return;let active='all';let search='';const filter=()=>{let visible=0;document.querySelectorAll('[data-number-card]').forEach(card=>{const key=card.dataset.numberGroup;const passGroup=active==='all'||key===active||(active==='big'&&(key.endsWith('k')||key==='50k'));const passText=card.dataset.search.includes(search)||fmt(Number(card.querySelector('.number-tag')?.textContent?.replace(/\./g,'')||0)).includes(search);const show=passGroup&&passText;card.style.display=show?'':'none';if(show)visible++;});document.querySelectorAll('[data-group-section]').forEach(section=>{const has=[...section.querySelectorAll('[data-number-card]')].some(x=>x.style.display!=='none');section.style.display=has?'':'none';});if(!document.getElementById('numberEmpty')){document.getElementById('numberArea').insertAdjacentHTML('beforeend','<div class="empty" id="numberEmpty" style="display:none">Tidak ada angka yang cocok. Coba kata kunci lain.</div>')}document.getElementById('numberEmpty').style.display=visible?'none':'';};chips.addEventListener('click',event=>{const b=event.target.closest('[data-group]');if(!b)return;active=b.dataset.group;chips.querySelectorAll('[data-group]').forEach(c=>c.classList.toggle('active',c===b));filter();});document.getElementById('numberSearch')?.addEventListener('input',ev=>{search=ev.target.value.toLowerCase().trim();filter()});document.getElementById('memorizeToggle')?.addEventListener('click',ev=>{const area=document.getElementById('numberArea');const active=area.classList.toggle('memorize');const btn=ev.currentTarget;btn.setAttribute('aria-pressed',active?'true':'false');btn.innerHTML=`${ic('eye')} Mode hafalan: ${active?'Aktif':'Mati'}`;area.querySelectorAll('.romaji-text').forEach(x=>x.classList.remove('revealed'))});document.getElementById('numberArea')?.addEventListener('click',ev=>{const roman=ev.target.closest('.romaji-text');if(roman&&document.getElementById('numberArea').classList.contains('memorize'))roman.classList.toggle('revealed')});filter();}
function setupKitchenFilters(){const section=document.getElementById('kitchenFilters');if(!section)return;const labels=[...new Set(CONTENT.kitchen.map(x=>x[0]))];let group='all',search='';const run=()=>{const rows=[...document.querySelectorAll('.kitchen-item')];let visible=0;rows.forEach(row=>{const i=CONTENT.kitchen.findIndex(x=>x.join(' ').toLowerCase()===row.dataset.search);const g=CONTENT.kitchen[i]?.[0];const pass=(group==='all'||g===labels[Number(group)])&&row.dataset.search.includes(search);row.style.display=pass?'':'none';if(pass)visible++;});document.querySelectorAll('[data-group-row]').forEach(r=>{const title=r.dataset.groupRow;r.style.display=rows.some(x=>x.style.display!=='none'&&x.dataset.search.startsWith(title.toLowerCase()))?'':'none'});};section.addEventListener('click',ev=>{let btn=ev.target.closest('[data-kitchen-group]');if(!btn)return;group=btn.dataset.kitchenGroup;section.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));run()});document.getElementById('kitchenSearch')?.addEventListener('input',ev=>{search=ev.target.value.toLowerCase().trim();run()});}
const searchIndex=()=>[
  ...CONTENT.numbers.map(n=>({title:`${fmt(n.value)} · ${n.romaji}`,sub:`${n.kanji} / ${n.kana} · Angka Jepang`,voice:n.kana,url:`angka.html?q=${encodeURIComponent(n.romaji)}`})),
  ...CONTENT.salams.map(([j,r,m])=>({title:r,sub:`${j} · ${m}`,voice:j,url:'salam.html'})),
  ...CONTENT.house.map(([j,r,m])=>({title:r,sub:`${j} · ${m}`,voice:j,url:'salam.html'})),
  ...CONTENT.introductions.map(([j,r,m])=>({title:r,sub:`${j} · ${m}`,voice:j,url:'salam.html'})),
  ...CONTENT.kitchen.map(([g,m,r,j])=>({title:m,sub:`${r} · ${j}`,voice:j,url:`dapur.html?q=${encodeURIComponent(r)}`})),
  ...CONTENT.verbs.map(([j,r,m])=>({title:m,sub:`${r} · ${j}`,voice:j,url:'dapur.html'})),
  ...CONTENT.grammar.map(g=>({title:g.title,sub:g.description,voice:hasJapanese(g.title)?g.title:null,url:'tata-bahasa.html'}))
];
function setSearch(open){const overlay=document.getElementById('searchOverlay');if(!overlay)return;overlay.classList.toggle('open',open);document.body.style.overflow=open?'hidden':'';if(open){const f=document.getElementById('globalSearch');f.focus();renderSearch(f.value)}else document.getElementById('searchLaunch')?.focus();}
function renderSearch(query){const mount=document.getElementById('searchResults');const words=query.toLowerCase().trim();const items=searchIndex().filter(item=>!words||`${item.title} ${item.sub}`.toLowerCase().includes(words)).slice(0,17);mount.innerHTML=items.length?items.map(item=>`<div class="search-audio-row"><a class="search-result" href="${e(item.url)}"><strong>${e(item.title)}</strong><small>${e(item.sub)}</small></a>${item.voice?`<button class="audio-play" data-speak="${e(item.voice)}" title="Dengarkan bahasa Jepang" aria-label="Dengarkan pengucapan Jepang">${ic('volume')}</button>`:''}</div>`).join(''):'<div class="empty">Tidak ditemukan. Coba angka, kata Jepang, atau arti dalam bahasa Indonesia.</div>';}
let toastTimer;
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3400)}
function speak(text,button){if(window.NihongoVoice)window.NihongoVoice.play(text,button);else toast('Fitur suara belum siap. Coba muat ulang halaman.');}
function mobile(open){document.getElementById('sidebar').classList.toggle('open',open);document.getElementById('mobileShade').classList.toggle('open',open);document.getElementById('menuToggle').setAttribute('aria-expanded',open?'true':'false');}
function bind(){document.getElementById('menuToggle')?.addEventListener('click',()=>mobile(!document.getElementById('sidebar').classList.contains('open')));document.getElementById('mobileShade')?.addEventListener('click',()=>mobile(false));document.getElementById('homeLink')?.addEventListener('click',()=>location.href='index.html');document.getElementById('searchLaunch')?.addEventListener('click',()=>setSearch(true));document.getElementById('closeSearch')?.addEventListener('click',()=>setSearch(false));document.getElementById('searchOverlay')?.addEventListener('click',ev=>{if(ev.target.id==='searchOverlay')setSearch(false)});document.getElementById('globalSearch')?.addEventListener('input',ev=>renderSearch(ev.target.value));document.getElementById('topButton')?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));window.addEventListener('scroll',()=>document.getElementById('topButton')?.classList.toggle('show',scrollY>550),{passive:true});document.addEventListener('click',ev=>{const doneBtn=ev.target.closest('[data-done-key]');if(doneBtn)setDone(doneBtn.dataset.doneKey);const speakBtn=ev.target.closest('[data-speak]');if(speakBtn)speak(speakBtn.dataset.speak,speakBtn);const filt=ev.target.closest('[data-topic-filter]');if(filt)showSessionList(filt.dataset.topicFilter);const sessionBtn=ev.target.closest('[data-session-start]');if(sessionBtn)initQuiz(sessionBtn.dataset.sessionStart);if(ev.target.closest('#backSessions')||ev.target.closest('#backSessionsResult'))showSessionList(quizState?.group||'semua');const choice=ev.target.closest('[data-choice]');if(choice)answer(Number(choice.dataset.choice));if(ev.target.closest('#nextQuestion'))nextQuestion();if(ev.target.closest('#restartQuiz'))initQuiz(quizState.id);});document.addEventListener('keydown',ev=>{const inputFocused=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);if(ev.key==='Escape'){setSearch(false);mobile(false)}if(ev.key==='/'&&!inputFocused&&!document.getElementById('searchOverlay').classList.contains('open')){ev.preventDefault();setSearch(true)}if(page==='latihan'&&!inputFocused&&!document.getElementById('searchOverlay').classList.contains('open')){if('1234'.includes(ev.key)&&ev.key.length===1)answer(Number(ev.key)-1);if(ev.key==='Enter'&&quizState?.selected!==null&&!quizState.finished)nextQuestion()}});}
function init(){document.getElementById('app').innerHTML=shell();const views={home,angka,salam,dapur,tatabahasa,latihan:quizPage};document.getElementById('mainContent').innerHTML=(views[page]||home)();bind();window.NihongoVoice?.init();updateProgress();if(page==='angka'){setupNumberFilters();const q=new URLSearchParams(location.search).get('q');if(q){const input=document.getElementById('numberSearch');input.value=q;input.dispatchEvent(new Event('input'))}}if(page==='dapur'){setupKitchenFilters();const q=new URLSearchParams(location.search).get('q');if(q){const input=document.getElementById('kitchenSearch');input.value=q;input.dispatchEvent(new Event('input'))}}if(page==='latihan'){const p=new URLSearchParams(location.search);showSessionList(p.get('topik')||'semua');if(p.get('sesi'))initQuiz(p.get('sesi'));}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
