(()=>{
'use strict';
if(window.__mathBubbleV23)return; window.__mathBubbleV23=true;
if(typeof NODES==='undefined'||typeof nodeMap==='undefined'||typeof focusNode==='undefined'||typeof svg==='undefined')return;

const VERSION='V2.3';
const LS='mathBubbleUnitsV23';
const controls=document.querySelector('.controls');
const sideEl=typeof side!=='undefined'?side:document.querySelector('.side');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const label=n=>n?(n.label||n.code||n.id):'';
const detail=n=>n?(n.detail||n.desc||n.label||''):'';
const grade=n=>n?(n.grade||n.gradeKey||''):'';
const domain=n=>n?(n.domain||''):'';

const brand=document.querySelector('.brand h1');
if(brand){
  const badge=brand.querySelector('.v11Badge,.v12Badge,.v13Badge,.v14Badge,.v15Badge,.v16Badge,.v17Badge,.v18Badge');
  if(badge)badge.textContent=VERSION;
}

const style=document.createElement('style');
style.textContent=`
.v23Btn{border:1px solid #dfe5ee!important;background:#fff!important;color:#344054!important;border-radius:10px!important;padding:8px 10px!important;font-size:11px!important;font-weight:850!important;cursor:pointer!important}
.v23Btn:hover{background:#f8fafc!important}.v23Btn.active{background:#175cd3!important;color:#fff!important;border-color:#175cd3!important}
.v23Overlay{position:fixed;inset:0;z-index:12000;background:rgba(15,23,42,.56);display:none;align-items:center;justify-content:center;padding:18px}.v23Overlay.open{display:flex}
.v23Modal{width:min(1180px,97vw);height:min(820px,95vh);background:#fff;border-radius:18px;box-shadow:0 26px 90px rgba(15,23,42,.3);display:flex;flex-direction:column;overflow:hidden}
.v23Head{padding:15px 18px;border-bottom:1px solid #e8edf4;background:#fbfcfe;display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.v23Head h2{margin:0;font-size:18px;color:#1d2939}.v23Head p{margin:4px 0 0;font-size:11px;color:#667085;line-height:1.5}.v23Close{border:1px solid #dfe5ee;background:#fff;border-radius:10px;padding:8px 10px;font-weight:900;cursor:pointer}
.v23Body{display:grid;grid-template-columns:1.15fr .85fr;min-height:0;flex:1}.v23Pane{padding:16px 18px;overflow:auto}.v23Pane+.v23Pane{border-left:1px solid #eef2f6;background:#fcfdff}
.v23Field{display:grid;gap:6px;margin-bottom:10px}.v23Field label{font-size:10px;font-weight:800;color:#667085}.v23Input,.v23Text{width:100%;border:1px solid #d5dde8;border-radius:11px;padding:10px 11px;font:inherit;color:#344054;background:#fff}.v23Text{min-height:84px;resize:vertical}
.v23Actions{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0 12px}.v23Action{border:1px solid #dbe3ec;background:#fff;border-radius:9px;padding:8px 10px;font-size:11px;font-weight:850;color:#344054;cursor:pointer}.v23Action.primary{background:#175cd3;color:#fff;border-color:#175cd3}.v23Action.warn{background:#fff7ed;color:#9a3412;border-color:#fed7aa}.v23Action.danger{background:#fff1f2;color:#be123c;border-color:#fecdd3}
.v23Status{font-size:10px;color:#667085;margin:5px 0 10px}.v23List{display:flex;flex-direction:column;gap:8px}.v23Item{border:1px solid #e4eaf1;background:#fff;border-radius:12px;padding:10px}.v23Item strong{font-size:11px;color:#344054}.v23Item .txt{font-size:11px;color:#667085;line-height:1.45;margin-top:4px}.v23Mini{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}.v23Mini button{border:1px solid #dce3ec;background:#f8fafc;border-radius:8px;padding:5px 7px;font-size:10px;color:#475467;cursor:pointer}.v23Pill{display:inline-flex;padding:4px 7px;border-radius:999px;border:1px solid #fed7aa;background:#fff7ed;color:#9a3412;font-size:9px;font-weight:850}
.v23Notice{margin-top:12px;background:#fff8e8;border:1px solid #f3dfad;border-radius:11px;padding:10px;font-size:10px;color:#715d2e;line-height:1.5}
.v23Ring{pointer-events:none}
#v23PresExit{display:none;position:fixed;right:14px;top:12px;z-index:13000;border:0;background:rgba(17,24,39,.85);color:#fff;border-radius:999px;padding:9px 12px;font-size:11px;font-weight:850;cursor:pointer}
body.v23Presentation #v23PresExit{display:block}
body.v23Presentation header{display:none!important}body.v23Presentation main{grid-template-columns:1fr!important;padding:0!important;height:100vh!important}body.v23Presentation .side{display:none!important}body.v23Presentation .graphCard{border-radius:0!important;border:0!important;box-shadow:none!important;height:100vh!important}body.v23Presentation .domainLabels{opacity:.5}body.v23Presentation .topStats{top:10px!important;left:10px!important}
@media(max-width:800px){.v23Overlay{padding:4px}.v23Modal{width:100vw;height:100vh;border-radius:0}.v23Body{grid-template-columns:1fr}.v23Pane+.v23Pane{border-left:0;border-top:1px solid #eef2f6}}
`;
document.head.appendChild(style);

function addBtn(id,text){
 if(document.getElementById(id))return document.getElementById(id);
 const b=document.createElement('button');b.id=id;b.className='v23Btn';b.textContent=text;controls?.appendChild(b);return b;
}
const unitBtn=addBtn('v23UnitBtn','단원 설계');
const shareBtn=addBtn('v23ShareBtn','공유 링크');
const pngBtn=addBtn('v23PngBtn','PNG 저장');
const printBtn=addBtn('v23PrintBtn','인쇄');
const presBtn=addBtn('v23PresBtn','발표 모드');

const exitPres=document.createElement('button');exitPres.id='v23PresExit';exitPres.textContent='발표 모드 종료 ✕';document.body.appendChild(exitPres);

const overlay=document.createElement('div');overlay.className='v23Overlay';overlay.id='v23Overlay';
overlay.innerHTML=`<div class="v23Modal">
 <div class="v23Head"><div><h2>나만의 단원 설계</h2><p>버블을 여러 개 선택해 프로젝트·단원 묶음을 만들고 저장·공유·출력할 수 있습니다.</p></div><button class="v23Close" id="v23Close">닫기 ✕</button></div>
 <div class="v23Body">
  <div class="v23Pane">
   <div class="v23Field"><label>단원/프로젝트 이름</label><input class="v23Input" id="v23Name" placeholder="예: 6학년 비와 비율 프로젝트"></div>
   <div class="v23Field"><label>메모</label><textarea class="v23Text" id="v23Memo" placeholder="핵심아이디어, 탐구 방향, 평가 메모 등을 기록하세요."></textarea></div>
   <div class="v23Actions"><button class="v23Action primary" id="v23Pick">선택 모드 켜기</button><button class="v23Action" id="v23Save">단원 저장</button><button class="v23Action warn" id="v23Clear">선택 비우기</button><button class="v23Action" id="v23UnitShare">단원 링크 복사</button><button class="v23Action" id="v23UnitPrint">단원 인쇄</button></div>
   <div class="v23Status" id="v23Status"></div><div class="v23List" id="v23Draft"></div>
   <div class="v23Notice">단원 저장은 현재 브라우저에 보관됩니다. 공유 링크는 선택 상태와 단원 내용을 URL에 담아 다른 기기에서도 열 수 있습니다.</div>
  </div>
  <div class="v23Pane"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px"><strong style="font-size:14px">저장된 단원</strong><span class="v23Pill" id="v23PickState">선택 모드 OFF</span></div><div class="v23List" id="v23Saved"></div></div>
 </div></div>`;
document.body.appendChild(overlay);

const $=id=>document.getElementById(id);
let saved=[];let draft={name:'',memo:'',ids:[]};let pickMode=false;let currentSelected=null;
try{saved=JSON.parse(localStorage.getItem(LS)||'[]')||[]}catch(_){saved=[]}
const persist=()=>{try{localStorage.setItem(LS,JSON.stringify(saved))}catch(_){}};
const getNode=id=>nodeMap.get(id)||NODES.find(n=>n.id===id);
const uniq=a=>[...new Set(a)];

function setPick(on){pickMode=!!on;$('v23Pick').textContent=pickMode?'선택 모드 끄기':'선택 모드 켜기';$('v23Pick').classList.toggle('primary',pickMode);$('v23PickState').textContent='선택 모드 '+(pickMode?'ON':'OFF');$('v23PickState').style.background=pickMode?'#ecfdf3':'#fff7ed';$('v23PickState').style.color=pickMode?'#067647':'#9a3412';$('v23PickState').style.borderColor=pickMode?'#abefc6':'#fed7aa';}
function syncFields(){draft.name=$('v23Name').value.trim();draft.memo=$('v23Memo').value;}
function open(){overlay.classList.add('open');$('v23Name').value=draft.name||'';$('v23Memo').value=draft.memo||'';renderDraft();renderSaved();}
function close(){syncFields();overlay.classList.remove('open');}
unitBtn?.addEventListener('click',open);$('v23Close').addEventListener('click',close);overlay.addEventListener('click',e=>{if(e.target===overlay)close()});$('v23Pick').addEventListener('click',()=>setPick(!pickMode));$('v23Name').addEventListener('input',syncFields);$('v23Memo').addEventListener('input',syncFields);

function nodeCard(n,id){return `<div class="v23Item"><strong>${esc(label(n))}</strong><div class="txt">${esc(detail(n))}</div><div class="txt">${esc(grade(n))}${grade(n)&&domain(n)?' · ':''}${esc(domain(n))}</div><div class="v23Mini"><button data-goto="${esc(id)}">버블로 이동</button><button data-remove="${esc(id)}">제거</button></div></div>`;}
function renderDraft(){const box=$('v23Draft');$('v23Status').textContent=`선택된 요소 ${draft.ids.length}개`;if(!draft.ids.length){box.innerHTML='<div class="v23Status">선택 모드를 켠 뒤 버블을 클릭해 요소를 담아보세요.</div>';applyRings();return;}box.innerHTML=draft.ids.map(id=>nodeCard(getNode(id),id)).join('');box.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>{close();focusNode(b.dataset.goto)});box.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{draft.ids=draft.ids.filter(x=>x!==b.dataset.remove);renderDraft()});applyRings();}
function renderSaved(){const box=$('v23Saved');if(!saved.length){box.innerHTML='<div class="v23Status">저장된 단원이 없습니다.</div>';return;}box.innerHTML=saved.map(u=>`<div class="v23Item"><strong>${esc(u.name||'이름 없는 단원')}</strong><div class="txt">${esc(u.memo||'메모 없음')}</div><div class="txt">포함 요소 ${u.ids?.length||0}개 · ${esc(u.savedAt||'')}</div><div class="v23Mini"><button data-load="${u.id}">불러오기</button><button data-share="${u.id}">링크 복사</button><button data-print="${u.id}">인쇄</button><button data-del="${u.id}">삭제</button></div></div>`).join('');box.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>loadUnit(b.dataset.load));box.querySelectorAll('[data-share]').forEach(b=>b.onclick=()=>copyShare(saved.find(x=>x.id===b.dataset.share)));box.querySelectorAll('[data-print]').forEach(b=>b.onclick=()=>printUnit(saved.find(x=>x.id===b.dataset.print)));box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(confirm('이 단원을 삭제할까요?')){saved=saved.filter(x=>x.id!==b.dataset.del);persist();renderSaved()}});}
function loadUnit(id){const u=saved.find(x=>x.id===id);if(!u)return;draft={name:u.name||'',memo:u.memo||'',ids:[...(u.ids||[])]};$('v23Name').value=draft.name;$('v23Memo').value=draft.memo;renderDraft();if(draft.ids[0]){close();setTimeout(()=>focusNode(draft.ids[0]),30)}}
$('v23Clear').onclick=()=>{draft.ids=[];renderDraft()};
$('v23Save').onclick=()=>{syncFields();if(!draft.name)return alert('단원 이름을 입력해 주세요.');if(!draft.ids.length)return alert('하나 이상의 버블을 선택해 주세요.');saved.unshift({id:'u'+Date.now(),name:draft.name,memo:draft.memo,ids:uniq(draft.ids),savedAt:new Date().toLocaleDateString('ko-KR')});persist();renderSaved();alert('단원이 저장되었습니다.')};

function applyRings(){if(typeof nodeEls==='undefined')return;NODES.forEach(n=>{const g=nodeEls.get(n.id);if(!g)return;let r=g.querySelector('.v23Ring');const c=g.querySelector('circle');if(!c)return;if(!r){r=document.createElementNS('http://www.w3.org/2000/svg','circle');r.classList.add('v23Ring');r.setAttribute('fill','none');r.setAttribute('stroke','#f59e0b');r.setAttribute('stroke-width','3');g.insertBefore(r,c)}const cr=parseFloat(c.getAttribute('r')||8);r.setAttribute('r',String(cr+5));r.setAttribute('opacity',draft.ids.includes(n.id)?'1':'0')})}

svg.addEventListener('click',e=>{if(!pickMode)return;const g=e.target.closest('g[data-id]');if(!g)return;e.preventDefault();e.stopImmediatePropagation();const id=g.dataset.id;if(!nodeMap.has(id))return;draft.ids=draft.ids.includes(id)?draft.ids.filter(x=>x!==id):[...draft.ids,id];renderDraft();},true);

const prevFocus=focusNode;focusNode=function(id){currentSelected=id;prevFocus(id);setTimeout(applyRings,0)};
const prevReset=typeof reset==='function'?reset:null;if(prevReset){reset=function(){currentSelected=null;prevReset();setTimeout(applyRings,0)}}

function enc(obj){const s=encodeURIComponent(JSON.stringify(obj)).replace(/%([0-9A-F]{2})/g,(_,p)=>String.fromCharCode(parseInt(p,16)));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function dec(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const bin=atob(s);let pct='';for(let i=0;i<bin.length;i++)pct+='%'+bin.charCodeAt(i).toString(16).padStart(2,'0');return JSON.parse(decodeURIComponent(pct))}
function state(unit){return {v:23,selected:currentSelected,draft:unit?{name:unit.name,memo:unit.memo,ids:unit.ids}:{name:$('v23Name').value.trim()||draft.name,memo:$('v23Memo').value||draft.memo,ids:draft.ids},presentation:document.body.classList.contains('v23Presentation')}}
async function copyShare(unit){try{const u=new URL(location.href);u.searchParams.set('state',enc(state(unit)));await navigator.clipboard.writeText(u.toString());alert('공유 링크가 복사되었습니다.')}catch(_){alert('공유 링크 복사에 실패했습니다.')}}
shareBtn?.addEventListener('click',()=>copyShare());$('v23UnitShare').onclick=()=>copyShare();

function restore(){try{const raw=new URL(location.href).searchParams.get('state');if(!raw)return;const s=dec(raw);if(s.draft)draft={name:s.draft.name||'',memo:s.draft.memo||'',ids:Array.isArray(s.draft.ids)?s.draft.ids.filter(id=>nodeMap.has(id)):[]};if(s.presentation)setPresentation(true);setTimeout(()=>{renderDraft();if(s.selected&&nodeMap.has(s.selected))focusNode(s.selected);else applyRings()},80)}catch(e){console.warn('share state restore failed',e)}}

function svgPng(){try{const clone=svg.cloneNode(true);clone.setAttribute('xmlns','http://www.w3.org/2000/svg');const box=svg.getBoundingClientRect(),w=Math.max(900,Math.round(box.width)),h=Math.max(600,Math.round(box.height));clone.setAttribute('width',w);clone.setAttribute('height',h);const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'});const url=URL.createObjectURL(blob);const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=w*2;c.height=h*2;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.scale(2,2);ctx.drawImage(img,0,0,w,h);URL.revokeObjectURL(url);const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='math-curriculum-bubblemap.png';a.click()};img.src=url}catch(_){alert('PNG 저장에 실패했습니다.')}}
pngBtn?.addEventListener('click',svgPng);

function unitHtml(u){const ns=(u?.ids||[]).map(getNode).filter(Boolean);const groups={};ns.forEach(n=>(groups[domain(n)||'기타']??=[]).push(n));return `<h1>${esc(u?.name||'나만의 단원')}</h1><p><b>메모</b><br>${esc(u?.memo||'없음').replace(/\n/g,'<br>')}</p><p><b>포함 요소</b> ${ns.length}개</p>${Object.entries(groups).map(([d,a])=>`<h2>${esc(d)}</h2><ul>${a.map(n=>`<li><b>${esc(label(n))}</b> — ${esc(detail(n))}</li>`).join('')}</ul>`).join('')}<p style="font-size:11px;color:#667085">설계 개념 및 일부 연결은 교육과정 탐색을 위한 재구성·분석 요소입니다.</p>`}
function printHtml(html,title){const w=window.open('','_blank');if(!w)return alert('팝업이 차단되었습니다.');w.document.write(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:system-ui,sans-serif;line-height:1.65;padding:28px;color:#1f2937}h1{font-size:24px}h2{font-size:16px;margin-top:24px}li{margin:7px 0}</style></head><body>${html}<script>window.onload=()=>window.print()<\/script></body></html>`);w.document.close()}
function printUnit(u){if(!u)return;printHtml(unitHtml(u),u.name||'단원 요약')}
$('v23UnitPrint').onclick=()=>{syncFields();printUnit({name:draft.name||'현재 단원',memo:draft.memo,ids:draft.ids})};
printBtn?.addEventListener('click',()=>{if(draft.ids.length)return printUnit({name:draft.name||'현재 단원',memo:draft.memo,ids:draft.ids});if(currentSelected&&nodeMap.has(currentSelected)){const n=getNode(currentSelected);return printHtml(`<h1>${esc(label(n))}</h1><p>${esc(detail(n))}</p><p>${esc(grade(n))} · ${esc(domain(n))}</p>`,label(n))}window.print()});

function setPresentation(on){document.body.classList.toggle('v23Presentation',!!on);presBtn?.classList.toggle('active',!!on);if(presBtn)presBtn.textContent=on?'발표 모드 종료':'발표 모드';setTimeout(()=>window.dispatchEvent(new Event('resize')),60)}
function setPresentationFromToggle(){setPresentation(!document.body.classList.contains('v23Presentation'))}
presBtn?.addEventListener('click',setPresentationFromToggle);exitPres.addEventListener('click',()=>setPresentation(false));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('v23Presentation'))setPresentation(false)});

setPick(false);renderDraft();renderSaved();restore();setTimeout(applyRings,100);
})();