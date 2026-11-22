/* Japanese audio controls. Offline-capable if the device has a ja voice. */
(function(){
'use strict';
const JP=/[\u3040-\u30ff\u3400-\u9fff々ヶヵ]/;
const JP_RUN=/([\u3040-\u30ff\u3400-\u9fff々ヶヵー～]+)/g;
const GOOD=/nanami|mayu|haruka|google.*(日本語|japan)|kyoko|otoya|mizuki|siri|natural|neural|premium|enhanced|online|sayaka|yuna|keita|sakura|aoi/i;
const BAD=/espeak|compact|basic|robot|synthetic/i;
let voices=[],current=null,currentButton=null,lastText='',lastButton=null,chosenVoice='',speed=1,scanQueued=false,scanRunning=false;
const speakIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5ZM15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12"/></svg>';
const e=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function toast(msg){const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),4000)}
function rank(v){const name=v.name||'';return (GOOD.test(name)?70:0)+(v.localService?4:12)-(BAD.test(name)?100:0)+(v.lang.toLowerCase()==='ja-jp'?6:0)}
function refreshVoices(){
 if(!('speechSynthesis' in window))return;
 voices=window.speechSynthesis.getVoices().filter(v=>(v.lang||'').toLowerCase().startsWith('ja')).sort((a,b)=>rank(b)-rank(a));
 const select=document.getElementById('voiceSelect'),quality=document.getElementById('voiceQuality');if(!select)return;
 const preferred=chosenVoice||getSaved('nihongo_voice_v3','');
 select.innerHTML=voices.length?voices.map((v,i)=>`<option value="${i}">${e(v.name)}${GOOD.test(v.name)?' · direkomendasikan':''}${v.localService?' · lokal':''}</option>`).join(''):'<option value="">Tidak ditemukan suara bahasa Jepang</option>';
 const chosenIndex=voices.findIndex(v=>v.name===preferred);select.value=String(chosenIndex<0?0:chosenIndex);
 chosenVoice=voices[Number(select.value)]?.name||'';
 if(quality)quality.textContent=voices.length?`${voices.length} suara Jepang tersedia. ${GOOD.test(chosenVoice)?'Suara dengan karakter natural diprioritaskan.':'Coba pilihan suara lain untuk hasil yang lebih nyaman.'}`:'Belum ada suara Jepang. Di Windows, coba Edge dan instal suara Jepang pada pengaturan bahasa; di perangkat lain, instal suara Jepang yang tersedia.';
 document.getElementById('voiceSample')?.toggleAttribute('disabled',!voices.length);
}
function getSaved(key,fallback){try{return localStorage.getItem(key)||fallback}catch{return fallback}}
function save(key,val){try{localStorage.setItem(key,String(val))}catch{}}
function stop(){if('speechSynthesis' in window)window.speechSynthesis.cancel();current=null;currentButton?.classList.remove('is-speaking');currentButton=null;}
function play(text,button){
 text=String(text||'').trim();if(!text)return;
 if(!('speechSynthesis' in window)){toast('Browser ini belum menyediakan pemutar suara.');return}
 refreshVoices();
 if(!voices.length){open();toast('Suara Jepang belum tersedia. Pilih atau pasang suara Jepang pada perangkat.');return}
 stop();lastText=text;lastButton=button||null;
 const spokenText=text.replace(/[（(][\s　…⋯]*[）)]/g,'、').replace(/…{2,}/g,'、');const u=new SpeechSynthesisUtterance(spokenText);u.lang='ja-JP';u.voice=voices.find(v=>v.name===chosenVoice)||voices[0];u.rate=speed;u.pitch=1;u.volume=1;current=u;currentButton=button||null;
 u.onstart=()=>{if(current!==u)return;currentButton?.classList.add('is-speaking');currentButton?.setAttribute('aria-label','Sedang memutar pengucapan Jepang')};
 u.onend=()=>{if(current===u)stop()};
 u.onerror=ev=>{if(current===u){stop();if(ev.error!=='interrupted'&&ev.error!=='canceled')toast('Suara tidak dapat diputar. Coba pilihan suara yang lain.')}};
 try{window.speechSynthesis.speak(u)}catch{stop();toast('Suara tidak dapat diputar. Coba browser lain atau pasang suara Jepang.')}
}
function open(){const over=document.getElementById('voiceOverlay');if(!over)return;over.classList.add('open');over.setAttribute('aria-hidden','false');refreshVoices();document.getElementById('voiceClose')?.focus()}
function close(){const over=document.getElementById('voiceOverlay');over?.classList.remove('open');over?.setAttribute('aria-hidden','true');document.getElementById('voiceLaunch')?.focus()}
function button(text,label='Dengarkan pengucapan Jepang'){
 const b=document.createElement('button');b.type='button';b.className='audio-play';b.setAttribute('data-speak',text);b.setAttribute('aria-label',label);b.title='Dengarkan dalam bahasa Jepang';b.innerHTML=speakIcon;return b;
}
function attachToJapanese(el){
 if(el.dataset.audioReady)return;
 el.dataset.audioReady='1';const text=(el.textContent||'').trim();if(!JP.test(text))return;
 // Cards that already have a play button for the Japanese expression.
 const group=el.closest('.number-card,.large-card,.phrase');
 if(group&&group.querySelector('[data-speak]'))return;
 if(el.closest('.choice-jp-block,.search-result,.japanese-audio-token'))return;
 const inline=el.closest('.jp-inline-pair');
 if(inline){if(inline.dataset.audioReady)return;inline.dataset.audioReady='1';inline.append(button(text));return}
 if(el.closest('.milestone')){
   const card=el.closest('.milestone');if(card.dataset.audioReady)return;
   card.dataset.audioReady='1';card.append(button('ごまん','Dengarkan 50.000 dalam bahasa Jepang'));return;
 }
 // Attached as sibling instead of inside a Japanese text span.
 if(el.matches('td.jp')){el.append(button(text));return}
 el.insertAdjacentElement('afterend',button(text));
}
const glossary=()=>window.CONTENT?.readingGlossary||{};
function rawJapaneseTextNodes(root){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const found=[];
 while(walker.nextNode()){
   const node=walker.currentNode,anc=node.parentElement;
   if(!anc||!JP.test(node.nodeValue||''))continue;
   if(anc.closest('.jp,.jp-inline-pair,.choice-jp-block,.audio-play,[data-speak],.number-card,.large-card,.phrase,.japanese-audio-token,script,style,svg,button,a,select,option'))continue;
   found.push(node);
 }
 return found;
}
function annotateLoose(node){
 const txt=node.nodeValue,parts=txt.split(JP_RUN);if(parts.length<=1)return;
 const fr=document.createDocumentFragment();
 parts.forEach(part=>{
   if(!part)return;
   if(JP.test(part)){
     const span=document.createElement('span');span.className='japanese-audio-token';
     const word=document.createElement('span');word.className='jp';word.textContent=part;
     span.append(word);
     const read=glossary()[part];if(read){const rom=document.createElement('span');rom.className='inline-romaji';rom.textContent=read;span.append(rom)}
     span.append(button(part));fr.append(span)
   }else fr.append(document.createTextNode(part));
 });
 node.replaceWith(fr);
}
function decorate(root){if(!root||scanRunning)return;scanRunning=true;
 try{
   root.querySelectorAll('.jp').forEach(attachToJapanese);
   rawJapaneseTextNodes(root).forEach(annotateLoose);
 }finally{scanRunning=false}
}
function schedule(){if(scanQueued)return;scanQueued=true;queueMicrotask(()=>{scanQueued=false;const main=document.getElementById('mainContent'),sr=document.getElementById('searchResults');decorate(main);decorate(sr)})}
function init(){
 chosenVoice=getSaved('nihongo_voice_v3','');speed=Number(getSaved('nihongo_speed_v3','1'))||1;
 const slider=document.getElementById('voiceSpeed');if(slider){slider.value=String(speed);document.getElementById('voiceSpeedValue').textContent=`${speed.toFixed(2).replace('.',',')}×`}
 document.getElementById('voiceLaunch')?.addEventListener('click',open);
 document.getElementById('voiceClose')?.addEventListener('click',close);
 document.getElementById('voiceOverlay')?.addEventListener('click',e=>{if(e.target.id==='voiceOverlay')close()});
 document.getElementById('voiceSelect')?.addEventListener('change',ev=>{chosenVoice=voices[Number(ev.target.value)]?.name||'';save('nihongo_voice_v3',chosenVoice);stop();refreshVoices()});
 slider?.addEventListener('input',ev=>{speed=Number(ev.target.value);save('nihongo_speed_v3',speed);document.getElementById('voiceSpeedValue').textContent=`${speed.toFixed(2).replace('.',',')}×`});
 document.getElementById('voiceSample')?.addEventListener('click',e=>play('こんにちは。はじめまして。よろしくお願いします。',e.currentTarget));
 document.getElementById('voiceStop')?.addEventListener('click',stop);
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&document.getElementById('voiceOverlay')?.classList.contains('open')){ev.stopPropagation();close()}});
 if('speechSynthesis' in window){window.speechSynthesis.addEventListener?.('voiceschanged',refreshVoices);refreshVoices();setTimeout(refreshVoices,450)}else document.getElementById('voiceQuality').textContent='Browser ini belum mendukung suara otomatis.';
 const main=document.getElementById('mainContent');if(main){const obs=new MutationObserver(schedule);obs.observe(main,{subtree:true,childList:true});decorate(main)}
 const search=document.getElementById('searchResults');if(search){const obs2=new MutationObserver(schedule);obs2.observe(search,{subtree:true,childList:true})}
}
window.NihongoVoice={init,play,stop,decorate,refreshVoices};
})();
