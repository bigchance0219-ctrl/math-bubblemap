(()=>{
'use strict';
if(window.__mathBubbleV17)return;window.__mathBubbleV17=true;
if(typeof NODES==='undefined'||typeof EDGES==='undefined'||typeof nodeMap==='undefined'||typeof focusNode==='undefined'||typeof reset==='undefined')return;

const VERSION='V1.7';
const SOURCE_TITLE='교육부 고시 제2022-33호 [별책 8] 수학과 교육과정';
const DOMAIN_PAGE={'수와 연산':{printed:7,pdf:13},'변화와 관계':{printed:8,pdf:14},'도형과 측정':{printed:9,pdf:15},'자료와 가능성':{printed:10,pdf:16}};
function pageForCode(code){
  let m=code&&code.match(/^([246])수(\d{2})-(\d{2})$/);if(!m)return null;
  const g=+m[1],area=+m[2],n=+m[3];
  if(g===2&&area===1)return {printed:11,pdf:17};
  if(g===2&&area===2)return {printed:13,pdf:19};
  if(g===2&&area===3)return n<=4?{printed:13,pdf:19}:{printed:14,pdf:20};
  if(g===2&&area===4)return {printed:15,pdf:21};
  if(g===4&&area===1)return n<=12?{printed:17,pdf:23}:{printed:18,pdf:24};
  if(g===4&&area===2)return {printed:19,pdf:25};
  if(g===4&&area===3)return n<=10?{printed:20,pdf:26}:{printed:21,pdf:27};
  if(g===4&&area===4)return {printed:23,pdf:29};
  if(g===6&&area===1)return {printed:25,pdf:31};
  if(g===6&&area===2)return {printed:27,pdf:33};
  if(g===6&&area===3)return n<=10?{printed:28,pdf:34}:{printed:29,pdf:35};
  if(g===6&&area===4)return {printed:31,pdf:37};
  return null;
}
const brand=document.querySelector('.brand h1'),controls=document.querySelector('.controls');
if(brand){const b=brand.querySelector('.v11Badge,.v12Badge,.v13Badge,.v14Badge,.v15Badge,.v16Badge');if(b)b.textContent=VERSION;else brand.insertAdjacentHTML('beforeend',' <span class="v17Badge">'+VERSION+'</span>');}
const st=document.createElement('style');
st.textContent=`
.v17Badge,.v11Badge,.v12Badge,.v13Badge,.v14Badge,.v15Badge,.v16Badge{display:inline-block;margin-left:5px;font-size:10px;vertical-align:middle;padding:3px 6px;border-radius:999px;background:#f0fdf4!important;color:#15803d!important;border:1px solid #bbf7d0!important}
#v17SourceBtn.active{background:#15803d!important;color:#fff!important;border-color:#15803d!important}
.v17Source{margin-top:12px;border-top:1px solid #e4e7ec;padding-top:11px}.v17SourceHead{display:flex;align-items:center;justify-content:space-between;gap:8px}.v17SourceHead h3{margin:0;font-size:12px;color:#1d2939}
.v17Status{font-size:9px;font-weight:900;padding:4px 7px;border-radius:999px}.v17Status.official{background:#ecfdf3;color:#067647;border:1px solid #abefc6}.v17Status.design{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}
.v17Card{margin-top:7px;border:1px solid #e4e7ec;border-radius:11px;padding:9px 10px;background:#fbfcfe}.v17Card b{font-size:10px;color:#344054}.v17Card p{font-size:10px;line-height:1.55;color:#475467;margin:5px 0 0}
.v17Quote{margin-top:7px;border-left:3px solid #22c55e;background:#f0fdf4;border-radius:0 9px 9px 0;padding:8px 9px;font-size:10px;line-height:1.55;color:#166534}
.v17Page{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.v17Pill{font-size:9px;font-weight:850;padding:4px 6px;border-radius:999px;background:#fff;border:1px solid #d0d5dd;color:#475467}
.v17Warn{margin-top:7px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:9px;padding:7px 8px;font-size:9px;line-height:1.5}
.v17Copy{border:1px solid #d0d5dd;background:#fff;border-radius:8px;padding:6px 8px;font-size:9px;font-weight:850;cursor:pointer;margin-top:7px}
`;
document.head.appendChild(st);

let btn=document.getElementById('v17SourceBtn');
if(!btn&&controls){btn=document.createElement('button');btn.id='v17SourceBtn';btn.textContent='출처·근거 ON';btn.className='active';controls.appendChild(btn);}
let enabled=true;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function codeOf(n){const s=[n.label,n.id,n.detail].filter(Boolean).join(' '),m=s.match(/([246]수\d{2}-\d{2})/);return m?m[1]:null;}
function sourceInfo(n){
  const code=codeOf(n);
  if(n.type==='standard'&&code){
    const pg=pageForCode(code);
    return {status:'official',label:'공식 교육과정',title:SOURCE_TITLE,page:pg,section:`성취기준 ${code}`,quote:n.detail||'',note:'성취기준 문장은 교육과정 원문을 기준으로 표시합니다.'};
  }
  if(['domain','core','category','concept','process','value'].includes(n.type)){
    const pg=DOMAIN_PAGE[n.domain]||null;
    const nm=n.type==='core'?'핵심 아이디어':n.type==='concept'?'지식·이해':n.type==='process'?'과정·기능':n.type==='value'?'가치·태도':n.type==='domain'?'영역':'범주';
    return {status:'official',label:'공식 교육과정',title:SOURCE_TITLE,page:pg,section:`내용 체계 · ${n.domain||''} · ${nm}`,quote:n.detail||n.label||'',note:'내용 체계의 공식 요소입니다. 개별 버블 사이의 연결선은 공식 구조, 설계 연결, 자동 추론이 섞여 있을 수 있으므로 연결선의 근거 표시를 함께 확인하세요.'};
  }
  if(n.type==='designConcept'){
    return {status:'design',label:'설계 재구성',title:'버블맵 설계 개념',page:null,section:'교육과정 탐색을 위한 설계 층',quote:n.detail||n.label||'',note:'이 설계 개념은 교육부 교육과정의 공식 내용 요소와 구분되는 재구성 개념입니다.'};
  }
  return {status:'design',label:'설계/추론 요소',title:'버블맵 내부 구성',page:null,section:'탐색용 요소',quote:n.detail||n.label||'',note:'교육과정 원문의 직접 요소인지 확인되지 않은 버블맵 설계 요소입니다.'};
}
function citationText(n,info){const pg=info.page?`, p.${info.page.printed} (PDF ${info.page.pdf}쪽)`:'';return `${info.title}, ${info.section}${pg}.`;}
function appendSource(id){
  if(!enabled)return;
  const n=nodeMap.get(id);if(!n)return;
  const side=document.getElementById('side');if(!side)return;
  side.querySelector('#v17Source')?.remove();
  const info=sourceInfo(n),div=document.createElement('div');div.id='v17Source';div.className='v17Source';
  const pageHtml=info.page?`<div class="v17Page"><span class="v17Pill">교육과정 책자 p.${info.page.printed}</span><span class="v17Pill">PDF ${info.page.pdf}쪽</span></div>`:'';
  div.innerHTML=`<div class="v17SourceHead"><h3>출처·근거</h3><span class="v17Status ${info.status}">${info.label}</span></div>
    <div class="v17Card"><b>${esc(info.title)}</b><p>${esc(info.section)}</p>${pageHtml}</div>
    ${info.quote?`<div class="v17Quote">${esc(info.quote)}</div>`:''}
    <div class="v17Warn">${esc(info.note)}</div>
    <button class="v17Copy" id="v17Copy">출처 문구 복사</button>`;
  side.appendChild(div);
  div.querySelector('#v17Copy').onclick=async()=>{const txt=citationText(n,info);try{await navigator.clipboard.writeText(txt);div.querySelector('#v17Copy').textContent='복사됨';setTimeout(()=>{const x=div.querySelector('#v17Copy');if(x)x.textContent='출처 문구 복사';},1200);}catch(_){prompt('복사하세요',txt);}};
}
if(btn)btn.addEventListener('click',e=>{e.stopPropagation();enabled=!enabled;btn.classList.toggle('active',enabled);btn.textContent=enabled?'출처·근거 ON':'출처·근거 OFF';const side=document.getElementById('side');side?.querySelector('#v17Source')?.remove();if(enabled&&typeof selected!=='undefined'&&selected)appendSource(selected);});

const baseFocus=focusNode;
focusNode=function(id){baseFocus(id);setTimeout(()=>appendSource(id),0);};
const baseReset=reset;
reset=function(){baseReset();document.getElementById('v17Source')?.remove();};
if(typeof selected!=='undefined'&&selected)setTimeout(()=>appendSource(selected),0);

})();