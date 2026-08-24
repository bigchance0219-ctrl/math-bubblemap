(()=>{
'use strict';
if(window.__mathBubbleV15)return; window.__mathBubbleV15=true;
if(typeof NODES==='undefined'||typeof EDGES==='undefined'||typeof nodeMap==='undefined'||typeof nodeEls==='undefined'||typeof lineEls==='undefined'||typeof neighbors==='undefined'||typeof focusNode==='undefined'||typeof reset==='undefined'||typeof svg==='undefined')return;

const VERSION='V1.5';
const STORE_KEY='mathBubbleV15State';
const NS='http://www.w3.org/2000/svg';
const side=document.getElementById('side');
const controls=document.querySelector('.controls');
const tools=document.getElementById('graphTools');
const legend=document.querySelector('.legend');
const brand=document.querySelector('.brand h1');

if(brand){
  const badge=brand.querySelector('.v11Badge,.v12Badge,.v13Badge,.v14Badge');
  if(badge) badge.textContent=VERSION;
  else brand.insertAdjacentHTML('beforeend',' <span class="v15Badge">'+VERSION+'</span>');
}

const style=document.createElement('style');
style.textContent=`
.v15Badge,.v11Badge,.v12Badge,.v13Badge,.v14Badge{display:inline-block;margin-left:5px;font-size:10px;vertical-align:middle;padding:3px 6px;border-radius:999px;background:#ecfdf3!important;color:#067647!important;border:1px solid #abefc6!important}
#v15EditBtn.active{background:#067647!important;color:#fff!important;border-color:#067647!important}.v15TrustSelect{max-width:150px}
.v15Prov{display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:900;padding:4px 7px;border-radius:999px;border:1px solid transparent}.v15Prov.official{background:#ecfdf3;color:#067647;border-color:#abefc6}.v15Prov.design{background:#fff7ed;color:#c2410c;border-color:#fed7aa}.v15Prov.inferred{background:#f5f3ff;color:#6d28d9;border-color:#ddd6fe}.v15Prov.user{background:#eff8ff;color:#175cd3;border-color:#b2ddff}
.v15EdgeCard{border:1px solid #e4eaf2;border-radius:12px;background:#fff;padding:10px;margin-top:8px}.v15EdgeCard h3{margin:0 0 8px;font-size:12px;color:#1d2939}.v15Pair{display:grid;grid-template-columns:1fr 24px 1fr;gap:5px;align-items:center}.v15NodeBtn{border:1px solid #dfe5ee;background:#fbfcfe;border-radius:10px;padding:8px;text-align:left;cursor:pointer;min-width:0}.v15NodeBtn b{font-size:10px;color:#344054}.v15NodeBtn span{display:block;margin-top:3px;font-size:10px;color:#667085;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v15Arrow{text-align:center;font-weight:900;color:#98a2b3}.v15Basis{margin-top:8px;padding:9px;border-radius:10px;background:#f8fafc;border:1px solid #e7ebf0}.v15Basis b{font-size:10px;color:#475467}.v15Basis p{font-size:11px;line-height:1.5;color:#344054;margin:4px 0 0}.v15Actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.v15Actions button{border:1px solid #dfe5ee;background:#fff;border-radius:9px;padding:7px 9px;font-size:10px;font-weight:850;color:#344054;cursor:pointer}.v15Actions button:hover{background:#f8fafc}.v15Actions .danger{color:#b42318;border-color:#fecdca;background:#fff6f5}.v15Actions .primary{color:#067647;border-color:#abefc6;background:#f6fef9}.v15Note{font-size:9px;line-height:1.45;color:#667085;margin-top:8px;padding:7px 8px;border-radius:9px;background:#fffcf5;border:1px solid #fedf89}
.v15EditBanner{position:absolute;left:50%;top:72px;transform:translateX(-50%);z-index:20;display:none;padding:8px 12px;border-radius:999px;background:#064e3b;color:#fff;font-size:11px;font-weight:850;box-shadow:0 7px 20px rgba(6,78,59,.2);pointer-events:none;max-width:80%;text-align:center}.v15EditBanner.show{display:block}
.v15HiddenList{display:grid;gap:6px;margin-top:8px}.v15HiddenItem{border:1px solid #e4eaf2;border-radius:9px;padding:8px;background:#fff}.v15HiddenItem b{font-size:10px;color:#344054}.v15HiddenItem span{display:block;font-size:9px;line-height:1.4;color:#667085;margin-top:3px}.v15HiddenItem button{margin-top:6px;border:1px solid #dfe5ee;background:#fff;border-radius:8px;padding:5px 7px;font-size:9px;font-weight:800;cursor:pointer}.v15Legend{display:flex;align-items:center;gap:5px}.v15LegendLine{width:18px;height:0;border-top:2px solid}.v15LegendLine.design{border-top-style:dashed;border-color:#c2410c}.v15LegendLine.inferred{border-top-style:dotted;border-color:#6d28d9}.v15LegendLine.user{border-top-style:dashed;border-color:#175cd3}.v15LegendLine.official{border-color:#067647}
@media(max-width:980px){.v15EditBanner{top:62px}.v15Pair{grid-template-columns:1fr}.v15Arrow{transform:rotate(90deg)}}
`;
document.head.appendChild(style);

function loadState(){
  try{
    const x=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');
    return {hidden:x.hidden||{},custom:Array.isArray(x.custom)?x.custom:[],conceptNames:x.conceptNames||{}};
  }catch(_){return {hidden:{},custom:[],conceptNames:{}};}
}
let state=loadState();
function saveState(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch(_){}}

function edgeKey(e){return [e.source,e.target,e.relation||'',e.reason||'',e.customId||''].join('¦');}
function provenance(e){
  if(e._custom) return {key:'user',label:'사용자 연결',strength:'사용자 지정',desc:'이 브라우저에서 사용자가 직접 추가한 연결입니다.'};
  const a=nodeMap.get(e.source), b=nodeMap.get(e.target);
  if(e.relation==='structure'){
    const types=new Set([a?.type,b?.type]);
    const directTable=(types.has('domain')&&(types.has('core')||types.has('category'))) || (types.has('category')&&(types.has('concept')||types.has('process')||types.has('value')));
    if(directTable) return {key:'official',label:'공식 교육과정',strength:'높음',desc:'교육과정 내용 체계의 직접적인 구조를 옮긴 연결입니다.'};
    return {key:'design',label:'설계 연결',strength:'설계 판단',desc:'교육과정 탐색 편의를 위해 구성한 구조적 연결입니다.'};
  }
  if(e.relation==='progression') return {key:'design',label:'설계 연결',strength:'설계 판단',desc:'학년군과 공통 개념을 바탕으로 선수·후속 흐름을 구성한 연결입니다.'};
  if(e.relation==='idea') return {key:'design',label:'설계 연결',strength:'설계 판단',desc:'핵심아이디어와 관련 요소를 탐색하기 위해 구성한 연결입니다.'};
  if(e.relation==='alignment') return {key:'inferred',label:'자동 추론',strength:'검토 권장',desc:'공통 개념어·영역·학년군 등의 유사성을 이용해 자동으로 추론한 연결입니다.'};
  return {key:'inferred',label:'자동 추론',strength:'검토 권장',desc:'현재 버블맵의 규칙으로 자동 생성된 연결입니다.'};
}
function relationLabel(e){
  if(e._custom)return '사용자 연결';
  if(e.relation==='progression')return '선수·후속학습';
  if(e.relation==='alignment')return '성취기준 연계';
  if(e.relation==='idea')return '핵심아이디어 연계';
  if(e.relation==='structure')return '교육과정 구조';
  return e.relation||'연결';
}

for(const [id,g] of nodeEls){
  g.dataset.id=id;
  g.querySelectorAll('*').forEach(x=>x.dataset.id=id);
  const t=typeof labelEls!=='undefined'?labelEls.get(id):null; if(t)t.dataset.id=id;
}

const originalConceptNames={};
for(const n of NODES){
  if(n.type==='designConcept'){
    originalConceptNames[n.id]=n.label;
    if(state.conceptNames[n.id]) n.label=state.conceptNames[n.id];
    const t=typeof labelEls!=='undefined'?labelEls.get(n.id):null; if(t&&state.conceptNames[n.id])t.textContent=state.conceptNames[n.id];
  }
}

function addNeighbor(a,b){const arr=neighbors.get(a);if(arr&&!arr.includes(b))arr.push(b);}
function removeNeighborIfUnused(a,b){
  const still=EDGES.some(e=>((e.source===a&&e.target===b)||(e.source===b&&e.target===a))&&!state.hidden[edgeKey(e)]);
  if(still)return; const arr=neighbors.get(a);if(arr){const i=arr.indexOf(b);if(i>=0)arr.splice(i,1);}
}
function makeLine(e){
  const el=document.createElementNS(NS,'line');
  el.setAttribute('stroke','#175cd3');el.setAttribute('stroke-width','2.4');el.setAttribute('stroke-linecap','round');el.setAttribute('opacity','.9');
  const layer=typeof lineLayer!=='undefined'?lineLayer:svg; layer.appendChild(el);
  lineEls.push({el,data:e});
  return el;
}
function restoreCustom(){
  for(const raw of state.custom){
    if(EDGES.some(e=>e._custom&&e.customId===raw.customId))continue;
    if(!nodeMap.has(raw.source)||!nodeMap.has(raw.target))continue;
    const e={source:raw.source,target:raw.target,relation:'alignment',reason:raw.reason||'사용자 연결',weight:9,_custom:true,customId:raw.customId};
    EDGES.push(e); addNeighbor(e.source,e.target);addNeighbor(e.target,e.source);makeLine(e);
  }
}
restoreCustom();

let trustFilter='all';
function styleOne(item){
  const {el,data:e}=item,p=provenance(e),hidden=!!state.hidden[edgeKey(e)],filtered=trustFilter!=='all'&&p.key!==trustFilter;
  el.dataset.v15Prov=p.key;el.dataset.v15Key=edgeKey(e);
  if(p.key==='official')el.setAttribute('stroke-dasharray','');
  else if(p.key==='design')el.setAttribute('stroke-dasharray','7 4');
  else if(p.key==='inferred')el.setAttribute('stroke-dasharray','2 4');
  else {el.setAttribute('stroke','#175cd3');el.setAttribute('stroke-dasharray','9 3');}
  if(hidden||filtered){el.setAttribute('opacity','0');el.style.pointerEvents='none';}
  else {el.style.pointerEvents='stroke';el.style.cursor='pointer';}
}
function applyStyles(){lineEls.forEach(styleOne);updateHiddenButton();}

function nodeTitle(n){return n?((n.code?n.code+' · ':'')+n.label):'알 수 없음';}
function renderEdgePanel(e){
  if(!side)return;
  const a=nodeMap.get(e.source),b=nodeMap.get(e.target),p=provenance(e),key=edgeKey(e),hidden=!!state.hidden[key];
  side.innerHTML=`
    <h2>연결 근거</h2>
    <p>이 선이 왜 연결되어 있는지 확인하고, 개인 보기에서 숨기거나 사용자 연결을 관리할 수 있습니다.</p>
    <div class="v15EdgeCard">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><h3>${relationLabel(e)}</h3><span class="v15Prov ${p.key}">${p.label}</span></div>
      <div class="v15Pair">
        <button class="v15NodeBtn" data-v15node="${e.source}"><b>출발 요소</b><span>${nodeTitle(a)}</span></button>
        <div class="v15Arrow">→</div>
        <button class="v15NodeBtn" data-v15node="${e.target}"><b>연결 요소</b><span>${nodeTitle(b)}</span></button>
      </div>
      <div class="v15Basis"><b>연결 근거</b><p>${e.reason||p.desc}</p></div>
      <div class="v15Basis"><b>신뢰도 안내 · ${p.strength}</b><p>${p.desc}</p></div>
      <div class="v15Actions">
        <button id="v15HideThis" class="${hidden?'primary':''}">${hidden?'연결 다시 보이기':'이 연결 숨기기'}</button>
        ${e._custom?'<button id="v15DeleteThis" class="danger">사용자 연결 삭제</button>':''}
      </div>
      <div class="v15Note">‘공식 교육과정’은 내용 체계 표의 직접 구조를 옮긴 선에만 표시합니다. ‘설계 연결’과 ‘자동 추론’은 교육부가 공식 선수학습 관계로 제시한 선이 아닙니다.</div>
    </div>`;
  side.querySelectorAll('[data-v15node]').forEach(btn=>btn.addEventListener('click',()=>focusNode(btn.dataset.v15node)));
  document.getElementById('v15HideThis')?.addEventListener('click',()=>{
    if(hidden)delete state.hidden[key];else state.hidden[key]=true;saveState();
    if(selected)focusNode(selected);else reset();setTimeout(()=>{applyStyles();renderEdgePanel(e)},0);
  });
  document.getElementById('v15DeleteThis')?.addEventListener('click',()=>deleteCustom(e));
}
function bindLine(item){
  if(item.el.dataset.v15Bound)return;item.el.dataset.v15Bound='1';
  item.el.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();renderEdgePanel(item.data);});
  item.el.addEventListener('mouseenter',()=>{if(!state.hidden[edgeKey(item.data)])item.el.setAttribute('stroke-width','4');});
  item.el.addEventListener('mouseleave',()=>{item.el.setAttribute('stroke-width',item.data._custom?'2.4':'2');});
}
lineEls.forEach(bindLine);

let editBtn=document.getElementById('v15EditBtn');
if(!editBtn&&controls){editBtn=document.createElement('button');editBtn.id='v15EditBtn';editBtn.textContent='연결 편집';controls.appendChild(editBtn);}
let trustSel=document.getElementById('v15TrustFilter');
if(!trustSel&&tools){
  trustSel=document.createElement('select');trustSel.id='v15TrustFilter';trustSel.className='v15TrustSelect';trustSel.title='연결 출처 필터';
  trustSel.innerHTML='<option value="all">출처 전체</option><option value="official">공식 교육과정</option><option value="design">설계 연결</option><option value="inferred">자동 추론</option><option value="user">사용자 연결</option>';tools.appendChild(trustSel);
}
let hiddenBtn=document.getElementById('v15HiddenBtn');
if(!hiddenBtn&&tools){hiddenBtn=document.createElement('button');hiddenBtn.id='v15HiddenBtn';hiddenBtn.textContent='숨긴 선 0';tools.appendChild(hiddenBtn);}
function updateHiddenButton(){if(hiddenBtn)hiddenBtn.textContent='숨긴 선 '+Object.keys(state.hidden).length;}
trustSel?.addEventListener('change',()=>{trustFilter=trustSel.value;if(selected)focusNode(selected);else reset();setTimeout(applyStyles,0);});
hiddenBtn?.addEventListener('click',e=>{e.stopPropagation();renderHiddenManager();});

if(legend&&!document.getElementById('v15Legend')){
  const wrap=document.createElement('span');wrap.id='v15Legend';wrap.style.display='contents';
  wrap.innerHTML='<span class="v15Legend"><i class="v15LegendLine official"></i>공식</span><span class="v15Legend"><i class="v15LegendLine design"></i>설계</span><span class="v15Legend"><i class="v15LegendLine inferred"></i>추론</span><span class="v15Legend"><i class="v15LegendLine user"></i>사용자</span>';
  legend.appendChild(wrap);
}

const card=document.querySelector('.graphCard');
let banner=document.getElementById('v15EditBanner');
if(!banner&&card){banner=document.createElement('div');banner.id='v15EditBanner';banner.className='v15EditBanner';card.appendChild(banner);}
let addMode=false,addStart=null;
function setBanner(text){if(!banner)return;banner.textContent=text;banner.classList.toggle('show',!!text);}
function setAddMode(on){
  addMode=on;addStart=null;editBtn?.classList.toggle('active',on);
  if(on){editBtn.textContent='연결 선택 중';setBanner(selected?'현재 선택 요소를 출발점으로 사용합니다. 연결할 두 번째 버블을 누르세요.':'연결할 첫 번째 버블을 누르세요.');if(selected)addStart=selected;}
  else{editBtn.textContent='연결 편집';setBanner('');}
}
editBtn?.addEventListener('click',e=>{e.stopPropagation();setAddMode(!addMode);});

function createCustom(a,b){
  if(!a||!b||a===b){setAddMode(false);return;}
  if(state.custom.some(x=>(x.source===a&&x.target===b)||(x.source===b&&x.target===a))){alert('이미 추가한 사용자 연결입니다.');setAddMode(false);return;}
  const reason=prompt('이 연결의 근거/메모를 입력하세요.','교사 설계 연결')||'교사 설계 연결';
  const raw={source:a,target:b,reason,customId:'user-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)};
  state.custom.push(raw);saveState();
  const e={source:a,target:b,relation:'alignment',reason,weight:9,_custom:true,customId:raw.customId};
  EDGES.push(e);addNeighbor(a,b);addNeighbor(b,a);makeLine(e);bindLine(lineEls[lineEls.length-1]);styleOne(lineEls[lineEls.length-1]);
  setAddMode(false);focusNode(b);setTimeout(()=>renderEdgePanel(e),0);
}
function deleteCustom(e){
  if(!e._custom)return;
  state.custom=state.custom.filter(x=>x.customId!==e.customId);delete state.hidden[edgeKey(e)];saveState();
  const idx=EDGES.indexOf(e);if(idx>=0)EDGES.splice(idx,1);
  const li=lineEls.findIndex(x=>x.data===e);if(li>=0){lineEls[li].el.remove();lineEls.splice(li,1);}
  removeNeighborIfUnused(e.source,e.target);removeNeighborIfUnused(e.target,e.source);
  if(selected)focusNode(selected);else reset();
}

svg.addEventListener('click',e=>{
  if(!addMode)return;
  const el=e.target.closest?.('[data-id]');if(!el)return;
  const id=el.dataset.id;if(!nodeMap.has(id))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(!addStart){addStart=id;setBanner('출발: '+nodeTitle(nodeMap.get(id))+' · 연결할 두 번째 버블을 누르세요.');focusNode(id);}
  else createCustom(addStart,id);
},true);

function renderHiddenManager(){
  if(!side)return;
  const found=[];
  for(const item of lineEls){if(state.hidden[edgeKey(item.data)])found.push(item.data);}
  side.innerHTML=`<h2>숨긴 연결 관리</h2><p>이 브라우저에서 숨긴 연결입니다. 원본 교육과정 데이터는 삭제되지 않습니다.</p>
    <div class="v15Actions"><button id="v15RestoreAll" class="primary">모두 다시 보이기</button></div>
    <div class="v15HiddenList">${found.length?found.map(e=>{const p=provenance(e);return `<div class="v15HiddenItem"><b>${nodeTitle(nodeMap.get(e.source))} → ${nodeTitle(nodeMap.get(e.target))}</b><span>${relationLabel(e)} · ${p.label} · ${e.reason||''}</span><button data-v15restore="${encodeURIComponent(edgeKey(e))}">다시 보이기</button></div>`}).join(''):'<div class="v15Note">숨긴 연결이 없습니다.</div>'}</div>`;
  document.getElementById('v15RestoreAll')?.addEventListener('click',()=>{state.hidden={};saveState();if(selected)focusNode(selected);else reset();setTimeout(renderHiddenManager,0);});
  side.querySelectorAll('[data-v15restore]').forEach(btn=>btn.addEventListener('click',()=>{delete state.hidden[decodeURIComponent(btn.dataset.v15restore)];saveState();if(selected)focusNode(selected);else reset();setTimeout(renderHiddenManager,0);}));
}

function appendConceptEditor(id){
  const n=nodeMap.get(id);if(!side||!n||n.type!=='designConcept'||document.getElementById('v15ConceptEdit'))return;
  const box=document.createElement('div');box.id='v15ConceptEdit';box.className='v15EdgeCard';
  box.innerHTML=`<h3>설계 개념 편집</h3><div class="v15Note">이 수정은 ‘설계 개념’의 개인 표시명만 바꾸며 교육과정 원문은 변경하지 않습니다.</div><div class="v15Actions"><button id="v15RenameConcept">표시명 수정</button>${state.conceptNames[id]?'<button id="v15RestoreConcept">원래 이름 복원</button>':''}</div>`;
  side.appendChild(box);
  document.getElementById('v15RenameConcept')?.addEventListener('click',()=>{
    const next=(prompt('설계 개념 표시명을 입력하세요.',n.label)||'').trim();if(!next)return;
    state.conceptNames[id]=next;n.label=next;saveState();const t=typeof labelEls!=='undefined'?labelEls.get(id):null;if(t)t.textContent=next;focusNode(id);
  });
  document.getElementById('v15RestoreConcept')?.addEventListener('click',()=>{
    delete state.conceptNames[id];n.label=originalConceptNames[id]||n.label;saveState();const t=typeof labelEls!=='undefined'?labelEls.get(id):null;if(t)t.textContent=n.label;focusNode(id);
  });
}

const prevFocus=focusNode,prevReset=reset;
focusNode=function(id){prevFocus(id);setTimeout(()=>{applyStyles();lineEls.forEach(bindLine);appendConceptEditor(id);},0);};
reset=function(){prevReset();setTimeout(()=>{applyStyles();lineEls.forEach(bindLine);},0);};

applyStyles();
})();
