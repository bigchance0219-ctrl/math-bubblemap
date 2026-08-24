(()=>{
'use strict';
if(window.__mathBubbleV14)return;window.__mathBubbleV14=true;
if(typeof NODES==='undefined'||typeof EDGES==='undefined'||typeof focusNode==='undefined'||typeof nodeMap==='undefined')return;

const V14_VERSION='V1.4';
const brand=document.querySelector('.brand h1');
if(brand){const b=brand.querySelector('.v11Badge,.v12Badge,.v13Badge');if(b)b.textContent=V14_VERSION;else brand.insertAdjacentHTML('beforeend',' <span class="v14Badge">'+V14_VERSION+'</span>');}
const st=document.createElement('style');
st.textContent=`
.v14Badge,.v11Badge,.v12Badge,.v13Badge{display:inline-block;margin-left:5px;font-size:10px;vertical-align:middle;padding:3px 6px;border-radius:999px;background:#eef2ff!important;color:#4338ca!important;border:1px solid #c7d2fe!important}
#v14DesignBtn.active{background:#4338ca!important;color:#fff!important;border-color:#4338ca!important}
.v14Wrap{margin-top:12px;border-top:1px solid #e8edf4;padding-top:12px}.v14Head{display:flex;align-items:center;justify-content:space-between;gap:8px}.v14Head h3{margin:0;font-size:13px;color:#1d2939}.v14Badges{display:flex;gap:5px;flex-wrap:wrap}.v14BadgeOfficial,.v14BadgeSuggest{font-size:9px;font-weight:900;padding:3px 6px;border-radius:999px}.v14BadgeOfficial{background:#ecfdf3;color:#067647;border:1px solid #abefc6}.v14BadgeSuggest{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}
.v14Tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:10px 0}.v14Tab{border:1px solid #e4eaf2;background:#fff;border-radius:9px;padding:7px 4px;font-size:10px;font-weight:850;color:#475467;cursor:pointer}.v14Tab.active{background:#eef2ff;color:#4338ca;border-color:#c7d2fe}.v14Panel{display:none}.v14Panel.active{display:block}.v14Block{border:1px solid #e4eaf2;background:#fbfcfe;border-radius:11px;padding:9px 10px;margin:7px 0}.v14Block h4{font-size:10px;margin:0 0 6px;color:#667085;text-transform:none}.v14Block p{font-size:11px;line-height:1.55;margin:0;color:#344054}.v14Chip{display:inline-block;margin:2px 3px 2px 0;padding:4px 7px;border-radius:999px;background:#fff;border:1px solid #dfe5ee;color:#475467;font-size:10px;font-weight:750;cursor:pointer}.v14Chip.dc{background:#fff7ed;border-color:#fed7aa;color:#9a3412}.v14Chip:hover{filter:brightness(.98)}
.v14Q{border-left:3px solid #818cf8;padding:7px 9px;margin:6px 0;background:#f7f7ff;border-radius:0 9px 9px 0}.v14Q b{font-size:10px;color:#4338ca}.v14Q span{display:block;margin-top:3px;font-size:11px;line-height:1.5;color:#344054}.v14Assess{display:grid;gap:6px}.v14AssessItem{padding:8px;border-radius:9px;background:#fff;border:1px solid #e6eaf0}.v14AssessItem b{font-size:10px;color:#667085}.v14AssessItem span{display:block;font-size:11px;line-height:1.45;color:#344054;margin-top:3px}.v14Tool{display:flex;gap:8px;align-items:flex-start;padding:8px;border-radius:9px;border:1px solid #e4eaf2;background:#fff;margin:5px 0}.v14Tool strong{font-size:11px;color:#344054}.v14Tool span{display:block;font-size:10px;color:#667085;line-height:1.45;margin-top:2px}.v14Actions{display:flex;gap:6px;margin-top:8px}.v14Action{flex:1;border:1px solid #dfe5ee;background:#fff;border-radius:9px;padding:8px;font-size:10px;font-weight:850;color:#344054;cursor:pointer}.v14Action:hover{background:#f8fafc}.v14Notice{font-size:9px;line-height:1.45;color:#667085;background:#fffaf5;border:1px solid #fed7aa;border-radius:9px;padding:7px 8px;margin-top:7px}
@media(max-width:980px){.v14Tabs{grid-template-columns:repeat(2,1fr)}}
`;
document.head.appendChild(st);

// 상단 수업설계 모드 토글
const controls=document.querySelector('.controls');
let designBtn=document.getElementById('v14DesignBtn');
if(!designBtn&&controls){designBtn=document.createElement('button');designBtn.id='v14DesignBtn';designBtn.textContent='수업설계 ON';designBtn.className='active';controls.appendChild(designBtn);}
let designMode=true;
if(designBtn)designBtn.addEventListener('click',e=>{e.stopPropagation();designMode=!designMode;designBtn.classList.toggle('active',designMode);designBtn.textContent=designMode?'수업설계 ON':'수업설계 OFF';if(selected&&nodeMap.get(selected)?.type==='standard'){if(designMode)v14Render(selected);else document.getElementById('v14Wrap')?.remove();}});

const uniq=a=>[...new Set(a.filter(Boolean))];
function direct(id){const out=[];for(const e of EDGES){if(e.source!==id&&e.target!==id)continue;const oid=e.source===id?e.target:e.source;const n=nodeMap.get(oid);if(n)out.push({n,e,id:oid});}return out;}
function related(id,type,max=8){return uniq(direct(id).filter(x=>x.n.type===type).sort((a,b)=>(b.e.weight||0)-(a.e.weight||0)).map(x=>x.id)).slice(0,max).map(x=>nodeMap.get(x));}
function progression(id,dir,max=6){const arr=[];for(const e of EDGES){if(e.relation!=='progression')continue;if(dir==='pre'&&e.target===id)arr.push(nodeMap.get(e.source));if(dir==='post'&&e.source===id)arr.push(nodeMap.get(e.target));}return uniq(arr.map(n=>n?.id)).slice(0,max).map(x=>nodeMap.get(x));}
function designConceptsFor(n){
  let ds=related(n.id,'designConcept',6);
  if(ds.length)return ds;
  const dcs=NODES.filter(x=>x.type==='designConcept'&&(!x.domain||!n.domain||x.domain===n.domain));
  const topics=new Set(n.topics||[]);
  ds=dcs.map(x=>({x,s:(x.topics||[]).reduce((v,t)=>v+(topics.has(t)?3:0),0)+(String(n.detail||'').includes(x.label)?2:0)})).filter(o=>o.s>0).sort((a,b)=>b.s-a.s).slice(0,5).map(o=>o.x);
  return ds;
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function chip(n,cls=''){return `<button class="v14Chip ${cls}" data-v14node="${esc(n.id)}">${esc(n.label)}</button>`;}
function listChips(arr,cls=''){return arr.length?arr.map(n=>chip(n,cls)).join(''):'<span style="font-size:10px;color:#98a2b3">직접 연결된 요소 없음</span>';}

function keyConcept(n,dc,knowledge){return dc[0]?.label||knowledge[0]?.label||(n.topics||[])[0]||n.domain||'수학적 관계';}
function inquiry(n,dc,knowledge,process){
  const k=keyConcept(n,dc,knowledge);const p=process[0]?.label||'탐구하고 설명하기';
  const domain=n.domain||'';
  const fact=domain==='도형과 측정'?`${k}의 특징과 성질은 무엇일까?`:domain==='자료와 가능성'?`${k}을(를) 어떤 방법으로 나타내고 해석할 수 있을까?`:`${k}은(는) 무엇이며 어떻게 표현하거나 구할 수 있을까?`;
  const concept=domain==='변화와 관계'?`${k}에서 변하는 것과 변하지 않는 것은 무엇이며, 그 관계를 어떻게 일반화할 수 있을까?`:domain==='자료와 가능성'?`자료의 표현 방법이 달라지면 우리가 발견하는 특징과 판단은 어떻게 달라질까?`:`${k}의 원리와 관계는 다른 문제 상황에서도 어떻게 연결되어 적용될까?`;
  const debate=`같은 문제라도 서로 다른 방법이 모두 좋은 해결 방법이 될 수 있을까? 어떤 기준으로 판단할 수 있을까?`;
  return {fact,concept,debate,process:p};
}
function assessment(n,dc,process,value){
  const k=keyConcept(n,dc,[]);let task='실생활 또는 새로운 문제 상황을 해결하고, 사용한 수학적 방법과 이유를 표현하기.';
  if(n.domain==='도형과 측정')task=`${k}의 성질이나 측정 원리를 활용해 새로운 상황을 해결하고 그 과정을 그림·식·말로 설명하기.`;
  if(n.domain==='변화와 관계')task=`주어진 상황에서 규칙이나 관계를 찾아 표현하고, 그 관계가 다른 상황에서도 성립하는지 설명하기.`;
  if(n.domain==='자료와 가능성')task=`자료 또는 가능성이 포함된 상황을 적절한 방법으로 표현·해석하고, 근거를 들어 판단하기.`;
  return {task,evidence:`학생의 표현, 해결 과정, 설명 및 정당화, 새로운 상황에의 적용 여부`,criteria:`① 수학적 정확성 ② ${process[0]?.label||'과정·기능의 활용'} ③ 관계 설명·정당화 ④ 전이`,attitude:value[0]?.label||'수학적 판단에서 비판적으로 사고하는 태도'};
}
function tools(n){
  if(n.domain==='도형과 측정')return [['알지오매쓰 / GeoGebra','도형 구성·변형·측정 결과를 동적으로 확인하고 성질을 탐구'],['Polypad','조작물을 이용해 넓이·분수·도형 관계를 시각화']];
  if(n.domain==='자료와 가능성')return [['스프레드시트','자료를 정리하고 표·그래프로 표현하며 비교'],['Desmos','자료와 그래프의 변화를 시각적으로 탐색']];
  if(n.domain==='변화와 관계')return [['Desmos','규칙·대응·비례 관계를 표와 그래프로 연결'],['Polypad','비와 비율, 식의 관계를 조작적으로 표현']];
  return [['Polypad','수와 연산 관계를 구체물·그림으로 조작하고 설명'],['Desmos','수의 패턴과 연산 관계를 다양한 표현으로 탐색']];
}
function summaryText(n,dc,knowledge,process,value,core,q,a){return `[${n.label}] 수업설계 요약\n성취기준: ${n.detail}\n핵심아이디어: ${core.map(x=>x.detail||x.label).join(' / ')}\n설계 개념: ${dc.map(x=>x.label).join(', ')}\n지식·이해: ${knowledge.map(x=>x.label).join(', ')}\n과정·기능: ${process.map(x=>x.label).join(', ')}\n가치·태도: ${value.map(x=>x.label).join(', ')}\n탐구질문(사실): ${q.fact}\n탐구질문(개념): ${q.concept}\n탐구질문(논쟁): ${q.debate}\n평가과제 제안: ${a.task}\n평가준거 제안: ${a.criteria}`;}

function v14Render(id){
  if(!designMode)return;const n=nodeMap.get(id);if(!n||n.type!=='standard')return;
  const side=document.getElementById('side');if(!side)return;document.getElementById('v14Wrap')?.remove();
  const dc=designConceptsFor(n),knowledge=related(id,'concept',8),process=related(id,'process',6),value=related(id,'value',5),core=related(id,'core',4),pre=progression(id,'pre'),post=progression(id,'post');
  const q=inquiry(n,dc,knowledge,process),a=assessment(n,dc,process,value),toolList=tools(n);
  const wrap=document.createElement('div');wrap.id='v14Wrap';wrap.className='v14Wrap';
  wrap.innerHTML=`
    <div class="v14Head"><h3>수업설계 패널</h3><div class="v14Badges"><span class="v14BadgeOfficial">교육과정 연결</span><span class="v14BadgeSuggest">설계 제안</span></div></div>
    <div class="v14Tabs"><button class="v14Tab active" data-tab="curr">교육과정</button><button class="v14Tab" data-tab="inq">탐구질문</button><button class="v14Tab" data-tab="assess">평가</button><button class="v14Tab" data-tab="digital">디지털</button></div>
    <div class="v14Panel active" data-panel="curr">
      <div class="v14Block"><h4>핵심아이디어</h4><p>${core.length?core.map(x=>esc(x.detail||x.label)).join('<br><br>'):'현재 그래프에서 직접 연결된 핵심아이디어가 없습니다.'}</p></div>
      <div class="v14Block"><h4>설계 개념 <span class="v14BadgeSuggest">재구성</span></h4>${listChips(dc,'dc')}</div>
      <div class="v14Block"><h4>지식·이해</h4>${listChips(knowledge)}</div>
      <div class="v14Block"><h4>과정·기능</h4>${listChips(process)}</div>
      <div class="v14Block"><h4>가치·태도</h4>${listChips(value)}</div>
      <div class="v14Block"><h4>선수학습 → 후속학습</h4><p><b>선수</b></p>${listChips(pre)}<p style="margin-top:7px"><b>후속</b></p>${listChips(post)}</div>
    </div>
    <div class="v14Panel" data-panel="inq">
      <div class="v14Q"><b>사실적 질문</b><span>${esc(q.fact)}</span></div>
      <div class="v14Q"><b>개념적 질문</b><span>${esc(q.concept)}</span></div>
      <div class="v14Q"><b>논쟁적 질문</b><span>${esc(q.debate)}</span></div>
      <div class="v14Block"><h4>탐구의 초점</h4><p>${esc(q.process)}</p></div>
      <div class="v14Notice">탐구 질문은 교육과정 원문이 아니라 선택한 성취기준과 연결 요소를 바탕으로 생성한 수업설계 제안입니다.</div>
    </div>
    <div class="v14Panel" data-panel="assess">
      <div class="v14Assess"><div class="v14AssessItem"><b>수행과제 제안</b><span>${esc(a.task)}</span></div><div class="v14AssessItem"><b>관찰·수집할 증거</b><span>${esc(a.evidence)}</span></div><div class="v14AssessItem"><b>평가 준거 제안</b><span>${esc(a.criteria)}</span></div><div class="v14AssessItem"><b>가치·태도 연결</b><span>${esc(a.attitude)}</span></div></div>
      <div class="v14Notice">평가 과제와 준거는 자동 설계 제안이며 학교·학년·수업 맥락에 맞게 교사가 조정해야 합니다.</div>
    </div>
    <div class="v14Panel" data-panel="digital">
      ${toolList.map(t=>`<div class="v14Tool"><div><strong>${esc(t[0])}</strong><span>${esc(t[1])}</span></div></div>`).join('')}
      <div class="v14Notice">디지털 도구는 교육과정에 명시된 필수 도구가 아니라 탐구와 표현을 돕기 위한 활용 제안입니다.</div>
    </div>
    <div class="v14Actions"><button class="v14Action" id="v14CopyBtn">수업설계 요약 복사</button><button class="v14Action" id="v14FlowBtn">계통도 보기</button></div>`;
  side.appendChild(wrap);
  wrap.querySelectorAll('.v14Tab').forEach(b=>b.addEventListener('click',()=>{wrap.querySelectorAll('.v14Tab,.v14Panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');wrap.querySelector(`[data-panel="${b.dataset.tab}"]`)?.classList.add('active');}));
  wrap.querySelectorAll('[data-v14node]').forEach(b=>b.addEventListener('click',()=>focusNode(b.dataset.v14node)));
  wrap.querySelector('#v14CopyBtn')?.addEventListener('click',async e=>{const text=summaryText(n,dc,knowledge,process,value,core,q,a);try{await navigator.clipboard.writeText(text);e.currentTarget.textContent='복사 완료';setTimeout(()=>e.currentTarget.textContent='수업설계 요약 복사',1200);}catch(_){alert(text);}});
  wrap.querySelector('#v14FlowBtn')?.addEventListener('click',()=>{if(typeof viewMode!=='undefined'){viewMode='flow';const mb=document.getElementById('modeBtn');if(mb)mb.textContent='버블맵 보기';focusNode(id);}});
}

const baseFocusV14=focusNode;
focusNode=function(id){baseFocusV14(id);if(designMode&&nodeMap.get(id)?.type==='standard')requestAnimationFrame(()=>v14Render(id));else document.getElementById('v14Wrap')?.remove();};

// 검색·필터 등에서 같은 성취기준을 다시 선택해도 패널 유지
if(typeof selected!=='undefined'&&selected&&nodeMap.get(selected)?.type==='standard')requestAnimationFrame(()=>v14Render(selected));
})();