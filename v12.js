(()=>{
'use strict';

// ===== V1.2: 학습 계통도 강화 =====
if(typeof svg==='undefined' || typeof NODES==='undefined' || typeof EDGES==='undefined' || typeof focusNode==='undefined') return;

const v12_NS='http://www.w3.org/2000/svg';
const v12_card=document.querySelector('.graphCard');
const v12_side=document.getElementById('side');
const v12_modeBtn=document.getElementById('modeBtn');
const v12_brand=document.querySelector('.brand h1');

// 버전 표기: V1.1 배지는 숨기고 V1.2로 갱신
if(v12_brand){
  const old=v12_brand.querySelector('.v11Badge');
  if(old) old.textContent='V1.2';
  else if(!v12_brand.querySelector('.v12Badge')) v12_brand.insertAdjacentHTML('beforeend',' <span class="v12Badge">V1.2</span>');
}

const v12_style=document.createElement('style');
v12_style.textContent=`
.v12Badge{display:inline-block;margin-left:5px;font-size:10px;vertical-align:middle;padding:3px 6px;border-radius:999px;background:#ecfdf3;color:#067647;border:1px solid #abefc6}
.v12FlowGuide{position:absolute;left:0;right:0;top:66px;bottom:44px;z-index:2;pointer-events:none;display:none}
.v12FlowGuide .lane{position:absolute;top:0;bottom:0;width:31%;border-radius:14px;border:1px dashed #e5eaf1;background:linear-gradient(180deg,rgba(248,250,252,.82),rgba(255,255,255,.18))}
.v12FlowGuide .lane:nth-child(1){left:2%}.v12FlowGuide .lane:nth-child(2){left:34.5%}.v12FlowGuide .lane:nth-child(3){right:2%}
.v12FlowGuide .laneTitle{position:absolute;left:50%;transform:translateX(-50%);top:8px;padding:6px 10px;border-radius:999px;background:#fff;border:1px solid #e4eaf2;box-shadow:0 3px 10px rgba(17,24,39,.06);font-size:11px;font-weight:900;color:#344054;white-space:nowrap}
.v12FlowGuide .laneSub{position:absolute;left:50%;transform:translateX(-50%);top:38px;font-size:10px;color:#98a2b3;white-space:nowrap}
.v12RelationToggle.active{background:#1f2b4d!important;color:#fff!important}
.v12ConceptStrip{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.v12ConceptChip{border:1px solid #c7d7fe;background:#eff4ff;color:#3448a5;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:800;cursor:pointer}
.v12ConceptChip:hover{background:#e4ebff}
.v12FlowCard{border:1px solid #e4eaf2;background:#fbfcfe;border-radius:12px;padding:10px}
.v12FlowCard b{font-size:11px;color:#344054}.v12FlowCard span{display:block;margin-top:4px;font-size:11px;color:#667085;line-height:1.45}
.v12EdgeText{font-size:9px;font-weight:800;fill:#667085;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round;pointer-events:none}
.v12EdgeText.progression{fill:#15803d}.v12EdgeText.alignment{fill:#4f46e5}.v12EdgeText.path{fill:#ea580c;font-size:10px}
.v12PathNum{font-size:10px;font-weight:900;fill:#fff;paint-order:stroke;stroke:#f97316;stroke-width:7px;stroke-linejoin:round;pointer-events:none}
.v12FlowHint{position:absolute;left:50%;top:82px;transform:translateX(-50%);z-index:7;display:none;background:rgba(31,41,55,.92);color:#fff;border-radius:999px;padding:7px 11px;font-size:10px;font-weight:800;pointer-events:none}
@media(max-width:980px){.v12FlowGuide{top:54px}.v12FlowGuide .laneTitle{font-size:10px;padding:5px 7px}.v12FlowGuide .laneSub{display:none}.v12FlowHint{top:68px;max-width:80%;text-align:center}}
`;
document.head.appendChild(v12_style);

// 계통도 3개 레인 안내
let v12_guide=document.getElementById('v12FlowGuide');
if(!v12_guide && v12_card){
  v12_guide=document.createElement('div');
  v12_guide.id='v12FlowGuide';v12_guide.className='v12FlowGuide';
  v12_guide.innerHTML=`
    <div class="lane"><div class="laneTitle">← 선수학습</div><div class="laneSub">이전에 형성되는 개념·성취기준</div></div>
    <div class="lane"><div class="laneTitle">현재학습</div><div class="laneSub">선택한 요소와 직접 관련된 내용</div></div>
    <div class="lane"><div class="laneTitle">후속학습 →</div><div class="laneSub">이후 확장되는 개념·성취기준</div></div>`;
  v12_card.insertBefore(v12_guide,svg);
}
let v12_hint=document.getElementById('v12FlowHint');
if(!v12_hint && v12_card){v12_hint=document.createElement('div');v12_hint.id='v12FlowHint';v12_hint.className='v12FlowHint';v12_hint.textContent='선수 → 현재 → 후속 학습의 흐름을 정리해서 보여줍니다';v12_card.appendChild(v12_hint);}

// 관계명 표시 토글
const v12_tools=document.getElementById('graphTools');
let v12_relationBtn=document.getElementById('v12RelationBtn');
if(!v12_relationBtn && v12_tools){
  v12_relationBtn=document.createElement('button');
  v12_relationBtn.id='v12RelationBtn';v12_relationBtn.className='v12RelationToggle active';v12_relationBtn.textContent='관계명 ON';
  v12_tools.appendChild(v12_relationBtn);
}
let v12_showRelations=true;
if(v12_relationBtn) v12_relationBtn.addEventListener('click',e=>{e.stopPropagation();v12_showRelations=!v12_showRelations;v12_relationBtn.classList.toggle('active',v12_showRelations);v12_relationBtn.textContent=v12_showRelations?'관계명 ON':'관계명 OFF';v12_refreshEdgeLabels();});

// SVG 관계명 레이어 (확대/이동과 같이 움직임)
const v12_viewport=document.getElementById('v11Viewport') || svg;
const v12_edgeLayer=document.createElementNS(v12_NS,'g');
v12_edgeLayer.setAttribute('id','v12EdgeLabelLayer');
if(v12_viewport===svg) svg.appendChild(v12_edgeLayer); else v12_viewport.appendChild(v12_edgeLayer);
const v12_pathNumberLayer=document.createElementNS(v12_NS,'g');
v12_pathNumberLayer.setAttribute('id','v12PathNumberLayer');
if(v12_viewport===svg) svg.appendChild(v12_pathNumberLayer); else v12_viewport.appendChild(v12_pathNumberLayer);
let v12_labelItems=[];
let v12_pathIds=[];

function v12_shortReason(e){
  if(!e) return '';
  if(e.relation==='progression') return '선수 → 후속';
  if(e.relation==='alignment') return e.reason?.includes('과정')?'과정·기능':e.reason?.includes('가치')?'가치·태도':'개념 연계';
  if(e.relation==='idea') return '핵심아이디어';
  if(e.relation==='structure') return '교육과정 구조';
  return e.reason||'연결';
}
function v12_edgeFor(a,b){return EDGES.find(e=>(e.source===a&&e.target===b)||(e.source===b&&e.target===a));}
function v12_clearEdgeLabels(){v12_edgeLayer.replaceChildren();v12_labelItems=[];v12_pathNumberLayer.replaceChildren();}
function v12_addEdgeLabel(e,klass=''){
  if(!e) return;
  const t=document.createElementNS(v12_NS,'text');t.classList.add('v12EdgeText');if(klass)t.classList.add(klass);else if(e.relation)t.classList.add(e.relation);
  t.setAttribute('text-anchor','middle');t.textContent=v12_shortReason(e);v12_edgeLayer.appendChild(t);v12_labelItems.push({el:t,e});
}
function v12_refreshEdgeLabels(){
  v12_clearEdgeLabels();
  if(!v12_showRelations) return;
  if(v12_pathIds.length>1){
    for(let i=0;i<v12_pathIds.length-1;i++)v12_addEdgeLabel(v12_edgeFor(v12_pathIds[i],v12_pathIds[i+1]),'path');
    v12_pathIds.forEach((id,i)=>{const t=document.createElementNS(v12_NS,'text');t.classList.add('v12PathNum');t.setAttribute('text-anchor','middle');t.textContent=String(i+1);t.dataset.node=id;v12_pathNumberLayer.appendChild(t);});
    return;
  }
  if(!selected) return;
  if(viewMode==='flow'){
    const sets=v12_buildFlowSets(selected);
    const vis=sets.visible;
    EDGES.forEach(e=>{
      if(!vis.has(e.source)||!vis.has(e.target))return;
      if(e.relation==='progression' || e.source===selected || e.target===selected) v12_addEdgeLabel(e);
    });
  }else{
    EDGES.forEach(e=>{if((e.source===selected||e.target===selected) && e.relation!=='structure')v12_addEdgeLabel(e);});
  }
}
function v12_labelLoop(){
  v12_labelItems.forEach(({el,e})=>{const a=positions[e.source],b=positions[e.target];if(!a||!b)return;el.setAttribute('x',(a.x+b.x)/2);el.setAttribute('y',(a.y+b.y)/2-5);});
  v12_pathNumberLayer.querySelectorAll('[data-node]').forEach(t=>{const p=positions[t.dataset.node];if(!p)return;t.setAttribute('x',p.x);t.setAttribute('y',p.y+4);});
  requestAnimationFrame(v12_labelLoop);
}
v12_labelLoop();

// progression 방향 그래프
const v12_inProg=new Map(NODES.map(n=>[n.id,[]]));
const v12_outProg=new Map(NODES.map(n=>[n.id,[]]));
EDGES.forEach(e=>{if(e.relation==='progression'){v12_outProg.get(e.source)?.push(e.target);v12_inProg.get(e.target)?.push(e.source);}});

function v12_bfs(start,map,maxDepth=2){
  const d=new Map([[start,0]]),q=[start];
  while(q.length){const cur=q.shift(),cd=d.get(cur);if(cd>=maxDepth)continue;for(const nx of (map.get(cur)||[])){if(!d.has(nx)){d.set(nx,cd+1);q.push(nx);}}}
  d.delete(start);return d;
}
function v12_topicScore(root,n){const a=new Set(root.topics||[]);let s=0;(n.topics||[]).forEach(t=>{if(a.has(t))s+=3});if(n.type==='standard')s+=2;if(n.type==='concept')s+=1;return s;}
function v12_rankIds(root,dist,max=9){return [...dist.entries()].sort((a,b)=>a[1]-b[1] || v12_topicScore(root,nodeMap.get(b[0]))-v12_topicScore(root,nodeMap.get(a[0])) || nodeMap.get(a[0]).label.localeCompare(nodeMap.get(b[0]).label,'ko')).slice(0,max).map(([id])=>id);}
function v12_directRelated(id){
  const out=[];for(const e of EDGES){if(e.source!==id&&e.target!==id)continue;const oid=e.source===id?e.target:e.source;const n=nodeMap.get(oid);if(!n)continue;out.push({id:oid,e,n});}return out;
}
function v12_relatedConcepts(id){return v12_directRelated(id).filter(x=>x.n.type==='concept' && x.e.relation==='alignment').map(x=>x.n);}

function v12_fallbackProgression(root,dir){
  // 직접 progression이 없는 성취기준은 연결된 개념의 계통을 보조 경로로 사용
  if(root.type!=='standard')return [];
  const cs=v12_relatedConcepts(root.id);const ids=[];
  for(const c of cs){const m=dir==='pre'?v12_inProg:v12_outProg;for(const nx of (m.get(c.id)||[])){const cn=nodeMap.get(nx);if(!cn)continue;const stds=v12_directRelated(nx).filter(x=>x.n.type==='standard'&&x.e.relation==='alignment').map(x=>x.id);ids.push(...stds);}}
  return [...new Set(ids)].slice(0,6);
}
function v12_buildFlowSets(rootId){
  const root=nodeMap.get(rootId);if(!root)return {pre:[],post:[],current:[],visible:new Set()};
  let pre=v12_rankIds(root,v12_bfs(rootId,v12_inProg,2),9);
  let post=v12_rankIds(root,v12_bfs(rootId,v12_outProg,2),9);
  if(!pre.length)pre=v12_fallbackProgression(root,'pre');
  if(!post.length)post=v12_fallbackProgression(root,'post');
  const direct=v12_directRelated(rootId)
    .filter(x=>x.e.relation!=='progression')
    .sort((a,b)=>(b.e.weight||0)-(a.e.weight||0));
  const concept=direct.filter(x=>x.n.type==='concept').slice(0,4).map(x=>x.id);
  const core=direct.filter(x=>x.n.type==='core').slice(0,2).map(x=>x.id);
  const process=direct.filter(x=>x.n.type==='process').slice(0,2).map(x=>x.id);
  const value=direct.filter(x=>x.n.type==='value').slice(0,1).map(x=>x.id);
  const current=[rootId,...concept,...core,...process,...value];
  const visible=new Set([...pre,...current,...post]);
  return {pre,post,current,visible,concept};
}

function v12_placeColumn(ids,x,centerY,spacing=54){
  const n=ids.length;if(!n)return;
  const start=centerY-(n-1)*spacing/2;
  ids.forEach((id,i)=>{const wobble=(i%2?13:-13);targets[id]={x:x+wobble,y:start+i*spacing};});
}
function v12_applyFlow(rootId){
  const root=nodeMap.get(rootId);if(!root)return;
  const sets=v12_buildFlowSets(rootId),pre=sets.pre,post=sets.post,current=sets.current;
  const xL=W*.18,xC=W*.50,xR=W*.82;
  targets[rootId]={x:xC,y:H*.40};
  v12_placeColumn(pre,xL,H*.48,Math.max(44,Math.min(62,390/Math.max(pre.length,1))));
  v12_placeColumn(post,xR,H*.48,Math.max(44,Math.min(62,390/Math.max(post.length,1))));
  const extras=current.filter(id=>id!==rootId);
  extras.forEach((id,i)=>{const row=Math.floor(i/3),col=i%3;targets[id]={x:xC+(col-1)*72,y:H*.58+row*58};});

  NODES.forEach(n=>{
    const g=nodeEls.get(n.id),c=g.querySelector('circle'),lab=labelEls.get(n.id);const on=sets.visible.has(n.id)&&passesFilters(n);
    g.style.opacity=on?'1':'.025';g.style.pointerEvents=on?'auto':'none';
    const isRoot=n.id===rootId,isConcept=sets.concept.includes(n.id),isProg=pre.includes(n.id)||post.includes(n.id);
    c.setAttribute('r',typeStyle[n.type].r+(isRoot?8:isConcept?5:isProg?2:0));
    c.setAttribute('stroke-width',isRoot?'4.5':isConcept?'4':n.grade?'2.5':'3');
    if(isConcept)c.setAttribute('stroke','#2563eb');else c.setAttribute('stroke',gradeStroke[n.grade]||'#fff');
    lab.style.opacity=on?'1':'0';
  });
  lineEls.forEach(({el,data})=>{
    const both=sets.visible.has(data.source)&&sets.visible.has(data.target);if(!both){el.setAttribute('opacity','0');return;}
    const direct=data.source===rootId||data.target===rootId;
    if(data.relation==='progression'){
      el.setAttribute('opacity','.92');el.setAttribute('stroke','#16a34a');el.setAttribute('stroke-width','2.4');el.setAttribute('stroke-dasharray','6 5');
    }else if(direct){
      el.setAttribute('opacity','.62');el.setAttribute('stroke','#6366f1');el.setAttribute('stroke-width','1.8');el.setAttribute('stroke-dasharray','');
    }else el.setAttribute('opacity','0');
  });
  if(v12_guide)v12_guide.style.display='block';if(v12_hint){v12_hint.style.display='block';setTimeout(()=>{if(v12_hint)v12_hint.style.display='none'},1800);}
  v12_refreshEdgeLabels();
}

// 오른쪽 패널에 관련 개념을 강조
const v12_baseRenderSide=renderSide;
renderSide=function(node){
  v12_baseRenderSide(node);
  if(!node)return;
  const concepts=v12_relatedConcepts(node.id);
  if(concepts.length){
    const meta=v12_side.querySelector('.meta');
    const sec=document.createElement('div');sec.className='section';
    sec.innerHTML=`<h3>관련 개념 · 지식·이해 내용요소</h3><div class="v12ConceptStrip">${concepts.slice(0,6).map(n=>`<button class="v12ConceptChip" data-v12concept="${n.id}">${n.label}</button>`).join('')}</div>`;
    if(meta)meta.insertAdjacentElement('afterend',sec);else v12_side.prepend(sec);
    sec.querySelectorAll('[data-v12concept]').forEach(b=>b.addEventListener('click',()=>focusNode(b.dataset.v12concept)));
  }
  if(viewMode==='flow'){
    const sets=v12_buildFlowSets(node.id);const flow=document.createElement('div');flow.className='section';
    const labels=ids=>ids.slice(0,5).map(id=>`• ${nodeMap.get(id).label}`).join('<br>')||'직접 연결된 항목이 없습니다.';
    flow.innerHTML=`<h3>V1.2 학습 계통 요약</h3><div class="cols3"><div class="v12FlowCard"><b>선수학습</b><span>${labels(sets.pre)}</span></div><div class="v12FlowCard"><b>현재학습</b><span>${labels(sets.current)}</span></div><div class="v12FlowCard"><b>후속학습</b><span>${labels(sets.post)}</span></div></div>`;
    const first=v12_side.querySelector('.section');if(first)first.insertAdjacentElement('beforebegin',flow);else v12_side.appendChild(flow);
  }
};

// focus/reset 래핑
const v12_baseFocus=focusNode;
const v12_baseReset=reset;
focusNode=function(id){
  v12_pathIds=[];
  v12_baseFocus(id);
  if(viewMode==='flow')v12_applyFlow(id);else{if(v12_guide)v12_guide.style.display='none';v12_refreshEdgeLabels();}
};
reset=function(){v12_pathIds=[];v12_baseReset();if(v12_guide)v12_guide.style.display='none';v12_refreshEdgeLabels();};

// 모드 전환 직후 계통도 정리 적용
if(v12_modeBtn){v12_modeBtn.addEventListener('click',()=>setTimeout(()=>{if(selected)focusNode(selected);else{if(v12_guide)v12_guide.style.display='none';v12_refreshEdgeLabels();}},0));}

// V1.1 학습경로가 만들어지면 관계명과 단계 번호를 자동 보강
let v12_mutating=false;
const v12_observer=new MutationObserver(()=>{
  if(v12_mutating)return;
  const steps=[...v12_side.querySelectorAll('.pathStep[data-v11goto]')];
  if(steps.length){
    const ids=steps.map(x=>x.dataset.v11goto).filter(Boolean);
    if(ids.join('|')!==v12_pathIds.join('|')){
      v12_pathIds=ids;v12_refreshEdgeLabels();
      v12_mutating=true;
      const notice=v12_side.querySelector('.notice');
      if(notice && !v12_side.querySelector('.v12PathExplain')){
        const box=document.createElement('div');box.className='section v12PathExplain';
        box.innerHTML=`<h3>경로 읽는 법</h3><div class="tip">그래프의 <b>숫자</b>는 이동 순서, 선 위의 <b>관계명</b>은 두 요소가 연결된 이유를 뜻합니다.</div>`;
        notice.insertAdjacentElement('beforebegin',box);
      }
      v12_mutating=false;
    }
  }else if(v12_pathIds.length){v12_pathIds=[];v12_refreshEdgeLabels();}
});
v12_observer.observe(v12_side,{childList:true,subtree:true});

// 초기 상태
v12_refreshEdgeLabels();
})();
