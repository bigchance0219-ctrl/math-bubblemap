(()=>{
'use strict';
if(window.__mathBubbleV13) return;
window.__mathBubbleV13=true;
if(typeof svg==='undefined'||typeof NODES==='undefined'||typeof EDGES==='undefined'||typeof focusNode==='undefined'||typeof reset==='undefined') return;

const V13_NS='http://www.w3.org/2000/svg';
const brand=document.querySelector('.brand h1');
const subtitle=document.querySelector('.brand p');
const controls=document.querySelector('.controls');
const legend=document.querySelector('.legend');
const depthBtn=document.getElementById('depthBtn');

if(brand){
  const badge=brand.querySelector('.v11Badge,.v12Badge');
  if(badge) badge.textContent='V1.3';
  else brand.insertAdjacentHTML('beforeend',' <span class="v13Badge">V1.3</span>');
}
if(subtitle) subtitle.textContent='성취기준 · 설계 개념 · 지식·이해 · 과정·기능 · 가치·태도 · 핵심아이디어 · 선수/후속학습 계통';

const style=document.createElement('style');
style.textContent=`
.v13Badge,.v11Badge,.v12Badge{display:inline-block;margin-left:5px;font-size:10px;vertical-align:middle;padding:3px 6px;border-radius:999px;background:#fff7ed!important;color:#c2410c!important;border:1px solid #fed7aa!important}
.typeFilter[data-type="designConcept"],#v13LensBtn{border-color:#fed7aa!important}.typeFilter[data-type="designConcept"].active,#v13LensBtn.active{background:#c2410c!important;color:#fff!important;border-color:#c2410c!important}
.v13LegendRing{width:13px;height:13px;border-radius:50%;display:inline-block;border:3px solid #c2410c;background:#fff}
.v13ConceptNote{border:1px solid #fed7aa;background:#fff7ed;color:#9a3412;border-radius:12px;padding:10px 11px;font-size:11px;line-height:1.55;margin:10px 0}
.v13ConceptGrid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.v13Mini{border:1px solid #e4eaf2;background:#fbfcfe;border-radius:10px;padding:8px;text-align:left;cursor:pointer}.v13Mini b{font-size:11px;color:#344054}.v13Mini span{display:block;margin-top:3px;font-size:10px;line-height:1.4;color:#667085}
.v13Tag{display:inline-block;border-radius:999px;padding:4px 7px;margin:2px 3px 2px 0;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;font-size:10px;font-weight:800}
@media(max-width:980px){.v13ConceptGrid{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

const oldConceptBtn=document.querySelector('.typeFilter[data-type="concept"]');
if(oldConceptBtn) oldConceptBtn.textContent='지식·이해';

let designBtn=document.querySelector('.typeFilter[data-type="designConcept"]');
if(!designBtn && oldConceptBtn){
  designBtn=document.createElement('button');
  designBtn.className='typeFilter'; designBtn.dataset.type='designConcept'; designBtn.textContent='설계 개념';
  oldConceptBtn.insertAdjacentElement('beforebegin',designBtn);
}
let lensBtn=document.getElementById('v13LensBtn');
if(!lensBtn && controls){
  lensBtn=document.createElement('button'); lensBtn.id='v13LensBtn'; lensBtn.textContent='개념 렌즈';
  const mode=document.getElementById('modeBtn');
  if(mode) mode.insertAdjacentElement('afterend',lensBtn); else controls.appendChild(lensBtn);
}
if(legend && !document.getElementById('v13LegendRow')){
  const row=document.createElement('div'); row.className='row'; row.id='v13LegendRow';
  row.innerHTML='<span class="v13LegendRing"></span>설계 개념(탐색용)'; legend.appendChild(row);
}
const edgeFilter=document.getElementById('edgeFilter');
if(edgeFilter && !edgeFilter.querySelector('option[value="designConcept"]')){
  const op=document.createElement('option');op.value='designConcept';op.textContent='설계 개념 연계';edgeFilter.appendChild(op);
}

const DESIGN=[
 {id:'DC_NUM',label:'수',domain:'01',detail:'양과 순서 등을 수로 나타내고, 수 체계가 확장되며 서로 다른 수 표현 사이의 관계를 이해하는 개념.',keywords:['자연수','분수','소수','자리','수의 범위','약수','배수','수 감각'],cores:['KI01_1','KI01_3']},
 {id:'DC_QUANTITY',label:'양',domain:'01',detail:'비교하거나 측정할 수 있는 속성의 크기를 수와 단위로 나타내는 개념.',keywords:['양','길이','들이','무게','시간','넓이','부피','비율'],cores:['KI01_3','KI03_3']},
 {id:'DC_OPERATION',label:'연산',domain:'01',detail:'수와 양을 합치고, 덜어 내고, 반복하고, 나누는 관계를 계산과 구조로 나타내는 개념.',keywords:['덧셈','뺄셈','곱셈','나눗셈','사칙','계산','연산'],cores:['KI01_2','KI01_3']},
 {id:'DC_EQUIV',label:'동치',domain:'02',detail:'표현이나 모양이 달라도 같은 값이나 같은 관계를 나타낼 수 있다는 개념.',keywords:['등호','동치','같은','합동','분수와 소수의 관계'],cores:['KI02_2','KI01_2']},
 {id:'DC_EST',label:'어림',domain:'01',detail:'정확한 값 대신 목적과 상황에 알맞은 근삿값을 사용하여 판단하는 개념.',keywords:['어림','올림','버림','반올림','수의 범위'],cores:['KI01_3','KI03_3']},
 {id:'DC_PATTERN',label:'규칙성',domain:'02',detail:'수, 모양, 계산, 현상의 반복과 변화에서 일정한 질서를 발견하는 개념.',keywords:['규칙','배열','반복'],cores:['KI02_1']},
 {id:'DC_RELATION',label:'관계',domain:'02',detail:'두 대상이나 두 양, 두 표현 사이의 연결을 비교하고 나타내는 개념.',keywords:['관계','대응','비례','비율','등호','식'],cores:['KI02_2','KI02_4']},
 {id:'DC_CHANGE',label:'변화',domain:'02',detail:'한 양이나 상태가 달라질 때 다른 양이나 상태가 어떻게 함께 달라지는지 살피는 개념.',keywords:['변화','변함','대응 관계','달라'],cores:['KI02_4']},
 {id:'DC_PROPORTION',label:'비례',domain:'02',detail:'두 양이 일정한 곱셈적 관계를 유지하며 함께 변하는 관계를 다루는 개념.',keywords:['비와 비율','비율','백분율','비례','비례배분'],cores:['KI02_2']},
 {id:'DC_GENERAL',label:'일반화',domain:'02',detail:'여러 사례에서 공통 구조를 찾아 말, 수, 식 등으로 넓혀 표현하는 사고 개념.',keywords:['규칙','문자','식','일반화','추측'],cores:['KI02_1','KI02_3']},
 {id:'DC_SHAPE',label:'형태',domain:'03',detail:'평면도형과 입체도형을 구성 요소와 성질에 따라 구별하고 범주화하는 개념.',keywords:['도형','삼각형','사각형','다각형','원','입체','직육면체','각기둥','원기둥'],cores:['KI03_1','KI03_2']},
 {id:'DC_SPACE',label:'공간',domain:'03',detail:'위치, 방향, 이동, 구성과 같은 공간적 관계를 파악하고 표현하는 개념.',keywords:['공간','쌓기','이동','밀기','뒤집기','돌리기','전개도','겨냥도'],cores:['KI03_1','KI03_2']},
 {id:'DC_MEASURE',label:'측정',domain:'03',detail:'속성의 양을 비교하고 단위를 이용하여 수치화하는 개념.',keywords:['측정','길이','들이','무게','시간','각도','넓이','부피','겉넓이','둘레','단위'],cores:['KI03_3']},
 {id:'DC_SYMM',label:'합동·대칭',domain:'03',detail:'이동이나 변환 속에서도 보존되는 형태와 규칙적인 균형을 탐구하는 개념.',keywords:['합동','대칭','선대칭','점대칭'],cores:['KI03_2']},
 {id:'DC_DATA',label:'자료',domain:'04',detail:'질문에 답하기 위해 정보를 수집하고 분류하며 표나 그래프로 표현·해석하는 개념.',keywords:['자료','표','그래프','분류','수집'],cores:['KI04_1','KI04_3']},
 {id:'DC_REP',label:'대표성',domain:'04',detail:'여러 자료의 특징을 하나의 값이나 적절한 표현으로 요약하여 전체의 특성을 파악하는 개념.',keywords:['평균','대푯값','대표'],cores:['KI04_1','KI04_3']},
 {id:'DC_CHANCE',label:'가능성',domain:'04',detail:'사건이 일어날 수 있는 정도를 비교하고 표현하는 개념.',keywords:['가능성','사건이 일어날','예상'],cores:['KI04_2','KI04_3']},
 {id:'DC_UNCERT',label:'불확실성',domain:'04',detail:'결과가 확정되지 않은 상황을 가능성에 근거하여 비교하고 판단하는 개념.',keywords:['불확실','가능성','예상','판단'],cores:['KI04_2']}
];
const CROSS=[
 ['DC_NUM','DC_QUANTITY','수로 양을 표현'],['DC_NUM','DC_OPERATION','수에 연산을 적용'],['DC_OPERATION','DC_EQUIV','연산과 동치 관계'],['DC_EST','DC_MEASURE','측정값의 어림'],['DC_QUANTITY','DC_MEASURE','양을 측정하여 수치화'],
 ['DC_PATTERN','DC_RELATION','규칙에서 관계 발견'],['DC_RELATION','DC_CHANGE','관계 속 변화'],['DC_RELATION','DC_PROPORTION','곱셈적 관계'],['DC_PATTERN','DC_GENERAL','규칙을 일반화'],['DC_GENERAL','DC_EQUIV','식과 동치 관계'],
 ['DC_SHAPE','DC_SPACE','형태의 공간적 구성'],['DC_SHAPE','DC_SYMM','형태의 보존과 대칭'],['DC_SPACE','DC_MEASURE','공간 속 양의 측정'],
 ['DC_DATA','DC_REP','자료의 특징 요약'],['DC_CHANCE','DC_UNCERT','가능성으로 불확실성 판단'],['DC_NUM','DC_DATA','자료를 수로 표현']
];

if(!typeStyle.designConcept) typeStyle.designConcept={r:15,label:true};
const baseTypeName=typeName;
typeName=function(t){return t==='designConcept'?'설계 개념':t==='concept'?'지식·이해':baseTypeName(t);};
const baseGroupY=groupY;
groupY=function(g){return g==='designConcept'?232:baseGroupY(g);};

function textOf(n){return `${n.label||''} ${n.detail||''} ${(n.topics||[]).join(' ')}`.toLowerCase();}
function keywordHit(def,n){
  const tx=textOf(n);
  return def.keywords.some(k=>tx.includes(k.toLowerCase()));
}
function addEdge(source,target,reason,weight=1.6){
  if(!nodeMap.has(source)||!nodeMap.has(target)) return;
  if(EDGES.some(e=>(e.source===source&&e.target===target)||(e.source===target&&e.target===source))) return;
  const e={source,target,reason,weight,relation:'designConcept'};
  EDGES.push(e);
  neighbors.get(source)?.add(target);neighbors.get(target)?.add(source);
  const l=document.createElementNS(V13_NS,'line');l.setAttribute('stroke','#c2410c');l.setAttribute('stroke-width','1.3');l.setAttribute('stroke-dasharray','3 4');l.setAttribute('opacity','.18');
  lineLayer.appendChild(l);lineEls.push({el:l,data:e});
}
function makeNode(def){
  const n={id:def.id,label:def.label,type:'designConcept',domain:def.domain,domainName:({'01':'수와 연산','02':'변화와 관계','03':'도형과 측정','04':'자료와 가능성'})[def.domain],grade:'',gradeName:'공통',detail:def.detail,topics:def.keywords.slice(0,4),ideas:['설계 개념은 교육과정 원문에 별도 분류로 제시된 용어가 아니라 탐색을 돕기 위해 재구성한 층입니다.']};
  NODES.push(n);nodeMap.set(n.id,n);neighbors.set(n.id,new Set());
  const cx=domainX(n.domain),cy=groupY('designConcept');
  const i=DESIGN.filter(d=>d.domain===n.domain).findIndex(d=>d.id===n.id);
  const a=(i/Math.max(1,DESIGN.filter(d=>d.domain===n.domain).length))*Math.PI*2-Math.PI/2;
  targets[n.id]={x:cx+Math.cos(a)*58,y:cy+Math.sin(a)*32};positions[n.id]={...targets[n.id]};
  const g=document.createElementNS(V13_NS,'g');g.dataset.id=n.id;g.style.cursor='pointer';g.classList.add('v13DesignNode');
  const c=document.createElementNS(V13_NS,'circle');c.setAttribute('r','15');c.setAttribute('fill',domainColors[n.domain]||'#c2410c');c.setAttribute('stroke','#fff');c.setAttribute('stroke-width','4');c.style.filter='drop-shadow(0 5px 10px rgba(20,31,55,.18))';
  const t=document.createElementNS(V13_NS,'text');t.setAttribute('text-anchor','middle');t.setAttribute('font-size','11');t.setAttribute('font-weight','900');t.setAttribute('fill','#7c2d12');t.style.pointerEvents='none';t.textContent=n.label;
  g.appendChild(c);nodeLayer.appendChild(g);labelLayer.appendChild(t);nodeEls.set(n.id,g);labelEls.set(n.id,t);
  g.addEventListener('mouseenter',()=>{tooltip.innerHTML=`<b>${n.label}</b><br>${n.detail}<br><small>설계 개념 · 탐색용 재구성</small>`;tooltip.style.display='block';});
  g.addEventListener('mousemove',e=>{tooltip.style.left=(e.clientX+14)+'px';tooltip.style.top=(e.clientY+14)+'px';});
  g.addEventListener('mouseleave',()=>tooltip.style.display='none');
  g.addEventListener('click',e=>{e.stopPropagation();focusNode(n.id);});
  g.addEventListener('pointerdown',e=>{dragId=n.id;g.setPointerCapture?.(e.pointerId);tooltip.style.display='none';});
  g.addEventListener('pointermove',e=>{if(dragId!==n.id)return;const r=svg.getBoundingClientRect();positions[n.id]={x:e.clientX-r.left,y:e.clientY-r.top};targets[n.id]={...positions[n.id]};});
  g.addEventListener('pointerup',()=>dragId=null);
  return n;
}

DESIGN.forEach(def=>{if(!nodeMap.has(def.id))makeNode(def);});
DESIGN.forEach(def=>def.cores.forEach(id=>addEdge(id,def.id,'핵심아이디어 → 설계 개념',2.2)));
DESIGN.forEach(def=>{
  const matches=NODES.filter(n=>n.type==='concept' && (n.domain===def.domain || (def.id==='DC_QUANTITY'&&n.domain==='03') || (def.id==='DC_EQUIV'&&n.domain==='01')) && keywordHit(def,n));
  matches.slice(0,14).forEach(n=>addEdge(def.id,n.id,'설계 개념 → 지식·이해',2.0));
});
CROSS.forEach(([a,b,r])=>addEdge(a,b,r,1.4));

function relatedStandards(def){
  return NODES.filter(n=>n.type==='standard' && keywordHit(def,n) && (n.domain===def.domain || (def.id==='DC_QUANTITY'&&n.domain==='03') || (def.id==='DC_EQUIV'&&n.domain==='01')))
    .sort((a,b)=>(Number(a.grade)||0)-(Number(b.grade)||0)||a.label.localeCompare(b.label,'ko')).slice(0,18);
}
function directOfficial(def){
  return [...(neighbors.get(def.id)||[])].map(id=>nodeMap.get(id)).filter(n=>n&&n.type==='concept').sort((a,b)=>(Number(a.grade)||0)-(Number(b.grade)||0)||a.label.localeCompare(b.label,'ko'));
}
function directCore(def){return [...(neighbors.get(def.id)||[])].map(id=>nodeMap.get(id)).filter(n=>n&&n.type==='core');}
function neighborDesign(def){return [...(neighbors.get(def.id)||[])].map(id=>nodeMap.get(id)).filter(n=>n&&n.type==='designConcept');}

function renderDesignSide(id){
  const def=DESIGN.find(d=>d.id===id); if(!def)return;
  const k=directOfficial(def),s=relatedStandards(def),cores=directCore(def),others=neighborDesign(def);
  side.innerHTML=`
    <h2>${def.label}</h2>
    <p>${def.detail}</p>
    <div class="v13ConceptNote"><b>설계 개념</b><br>이 개념 층은 교육과정 원문에 별도 목록으로 제시된 공식 분류가 아니라, 핵심아이디어·지식과 이해·성취기준의 연결을 탐색하기 위해 재구성한 것입니다.</div>
    <div class="section"><h3>연결 구조</h3><div class="related">
      <div class="rel"><strong>핵심아이디어</strong><span>${cores.map(n=>n.label).join(' · ')||'같은 영역의 핵심아이디어와 연결'}</span></div>
      <div class="rel"><strong>지식·이해</strong><span>${k.length}개 내용 요소와 직접 연결</span></div>
      <div class="rel"><strong>성취기준</strong><span>핵심어 기준 ${s.length}개 주요 성취기준 탐색</span></div>
    </div></div>
    ${others.length?`<div class="section"><h3>함께 보는 설계 개념</h3><div>${others.map(n=>`<button class="v13Tag" data-v13goto="${n.id}">${n.label}</button>`).join('')}</div></div>`:''}
    <div class="section"><h3>지식·이해 내용 요소</h3><div class="v13ConceptGrid">${k.slice(0,10).map(n=>`<button class="v13Mini" data-v13goto="${n.id}"><b>${n.label}</b><span>${n.gradeName||'공통'} · ${n.domainName}</span></button>`).join('')||'<span>직접 연결된 내용 요소가 없습니다.</span>'}</div></div>
    <div class="section"><h3>관련 성취기준</h3><div class="v13ConceptGrid">${s.slice(0,12).map(n=>`<button class="v13Mini" data-v13goto="${n.id}"><b>${n.label}</b><span>${n.detail}</span></button>`).join('')||'<span>핵심어로 연결된 성취기준이 없습니다.</span>'}</div></div>
    <div class="notice">V1.3에서는 기존의 ‘개념’ 노드를 ‘지식·이해’로 명확히 구분하고, 그 위에 탐색용 ‘설계 개념’ 층을 추가했습니다.</div>`;
  side.querySelectorAll('[data-v13goto]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();focusNode(b.dataset.v13goto);}));
}

const baseFocus=focusNode;
focusNode=function(id){
  const isDesign=nodeMap.get(id)?.type==='designConcept';
  if(isDesign){
    typeFilter='all';
    document.querySelectorAll('.typeFilter').forEach(b=>b.classList.toggle('active',b.dataset.type==='all'));
    if(depth<2){depth=2;if(depthBtn)depthBtn.textContent='연결 2단계';}
  }
  baseFocus(id);
  NODES.filter(n=>n.type==='designConcept').forEach(n=>{
    const g=nodeEls.get(n.id),c=g?.querySelector('circle'),lab=labelEls.get(n.id);if(!g||!c||!lab)return;
    if(g.style.opacity!=='0' && g.style.opacity!=='.04' && g.style.opacity!=='.025' && g.style.opacity!=='.035') lab.style.opacity='1';
    if(n.id===id){c.setAttribute('stroke','#c2410c');c.setAttribute('stroke-width','5');}
  });
  if(isDesign) renderDesignSide(id);
};

const baseReset=reset;
reset=function(){
  baseReset();
  NODES.filter(n=>n.type==='designConcept').forEach(n=>{const g=nodeEls.get(n.id),lab=labelEls.get(n.id);if(g&&lab&&passesFilters(n))lab.style.opacity='1';});
  if(lensBtn) lensBtn.classList.toggle('active',typeFilter==='designConcept');
};

if(designBtn) designBtn.addEventListener('click',e=>{
  e.stopPropagation();typeFilter='designConcept';document.querySelectorAll('.typeFilter').forEach(b=>b.classList.toggle('active',b===designBtn));if(lensBtn)lensBtn.classList.add('active');reset();
});
if(lensBtn) lensBtn.addEventListener('click',e=>{
  e.stopPropagation();
  const on=typeFilter!=='designConcept';
  typeFilter=on?'designConcept':'all';
  document.querySelectorAll('.typeFilter').forEach(b=>b.classList.toggle('active',b.dataset.type===typeFilter));
  lensBtn.classList.toggle('active',on);reset();
});
controls?.addEventListener('click',e=>{const b=e.target.closest?.('.typeFilter');if(b&&b!==designBtn&&lensBtn)setTimeout(()=>lensBtn.classList.toggle('active',typeFilter==='designConcept'),0);});

layoutOverview();reset();
})();