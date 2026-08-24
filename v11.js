(()=>{
'use strict';

// ===== V1.1: 기존 UI를 유지하면서 탐색 기능만 확장 =====
const v11_card = document.querySelector('.graphCard');
const v11_modeBtn = document.getElementById('modeBtn');
const v11_depthBtn = document.getElementById('depthBtn');
if (!v11_card || !v11_modeBtn || !v11_depthBtn || typeof svg === 'undefined') return;

// 버전 표시
const v11_brand = document.querySelector('.brand h1');
if (v11_brand && !v11_brand.querySelector('.v11Badge')) {
  v11_brand.insertAdjacentHTML('beforeend',' <span class="v11Badge">V1.1</span>');
}

// 추가 스타일
const v11_style = document.createElement('style');
v11_style.textContent = `
.v11Badge{display:inline-block;margin-left:5px;font-size:10px;vertical-align:middle;padding:3px 6px;border-radius:999px;background:#eef2ff;color:#4f46e5;border:1px solid #dfe3ff}
.graphTools{position:absolute;left:12px;bottom:12px;z-index:6;display:flex;gap:6px;align-items:center;flex-wrap:wrap;max-width:calc(100% - 24px)}
.graphTools button,.graphTools select{background:rgba(255,255,255,.95);border:1px solid #e4eaf2;box-shadow:0 4px 14px rgba(17,24,39,.08);padding:8px 10px;border-radius:10px;font-size:11px;font-weight:800;color:#344054}
.graphTools button{cursor:pointer}.graphTools button:hover{background:#f5f7fb}.graphTools button.active{background:#1f2b4d;color:#fff}
.pathBanner{position:absolute;left:50%;transform:translateX(-50%);bottom:58px;z-index:7;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;padding:8px 12px;border-radius:999px;font-size:11px;font-weight:800;display:none;box-shadow:0 6px 18px rgba(17,24,39,.10);white-space:nowrap}
.graphCard:fullscreen{width:100vw;height:100vh;border-radius:0;border:0}.graphCard:fullscreen #graph{height:100vh}
.pathChain{display:flex;flex-direction:column;gap:7px}.pathStep{border:1px solid #fed7aa;background:#fffaf5;border-radius:11px;padding:9px 10px;text-align:left;cursor:pointer}.pathStep b{font-size:12px;color:#9a3412}.pathStep span{display:block;margin-top:3px;font-size:11px;line-height:1.45;color:#667085}.pathArrow{text-align:center;color:#f97316;font-weight:900}
@media(max-width:980px){.graphTools{bottom:8px}.pathBanner{bottom:52px;max-width:90%;white-space:normal;text-align:center}}
`;
document.head.appendChild(v11_style);

// 상단 버튼
function v11_headerButton(id, text, afterEl){
  let b=document.getElementById(id); if(b) return b;
  b=document.createElement('button'); b.id=id; b.textContent=text;
  afterEl.insertAdjacentElement('afterend',b); return b;
}
const v11_pathBtn = v11_headerButton('pathBtn','학습경로',v11_modeBtn);
const v11_fullscreenBtn = v11_headerButton('fullscreenBtn','전체화면',v11_pathBtn);

// 그래프 도구
if(!document.getElementById('graphTools')){
  v11_card.insertAdjacentHTML('beforeend',`
    <div class="graphTools" id="graphTools">
      <button id="zoomOutBtn" title="축소">−</button>
      <button id="zoomResetBtn" title="확대/이동 초기화">100%</button>
      <button id="zoomInBtn" title="확대">＋</button>
      <select id="edgeFilter" title="연결선 종류">
        <option value="all">연결선 전체</option>
        <option value="progression">선수·후속학습</option>
        <option value="alignment">성취기준 연계</option>
        <option value="idea">핵심아이디어 연계</option>
        <option value="structure">교육과정 구조</option>
      </select>
    </div>
    <div class="pathBanner" id="pathBanner"></div>`);
}
const v11_pathBanner=document.getElementById('pathBanner');
const v11_edgeFilter=document.getElementById('edgeFilter');

// ===== 확대/축소 + 화면 이동 =====
const v11_NS='http://www.w3.org/2000/svg';
const v11_viewport=document.createElementNS(v11_NS,'g');
v11_viewport.setAttribute('id','v11Viewport');
svg.insertBefore(v11_viewport,lineLayer);
v11_viewport.append(lineLayer,nodeLayer,labelLayer);

let v11_view={x:0,y:0,k:1};
function v11_applyView(){
  v11_viewport.setAttribute('transform',`translate(${v11_view.x} ${v11_view.y}) scale(${v11_view.k})`);
  document.getElementById('zoomResetBtn').textContent=Math.round(v11_view.k*100)+'%';
}
function v11_svgPoint(clientX,clientY){
  const r=svg.getBoundingClientRect();
  return {x:(clientX-r.left)*(W/r.width),y:(clientY-r.top)*(H/r.height)};
}
function v11_zoomTo(nextK,cx=W/2,cy=H/2){
  nextK=Math.max(.45,Math.min(3.2,nextK));
  const ratio=nextK/v11_view.k;
  v11_view.x=cx-(cx-v11_view.x)*ratio;
  v11_view.y=cy-(cy-v11_view.y)*ratio;
  v11_view.k=nextK; v11_applyView();
}
document.getElementById('zoomInBtn').addEventListener('click',e=>{e.stopPropagation();v11_zoomTo(v11_view.k*1.2)});
document.getElementById('zoomOutBtn').addEventListener('click',e=>{e.stopPropagation();v11_zoomTo(v11_view.k/1.2)});
document.getElementById('zoomResetBtn').addEventListener('click',e=>{e.stopPropagation();v11_view={x:0,y:0,k:1};v11_applyView()});
svg.addEventListener('wheel',e=>{
  e.preventDefault();
  const p=v11_svgPoint(e.clientX,e.clientY);
  v11_zoomTo(v11_view.k*(e.deltaY<0?1.12:1/1.12),p.x,p.y);
},{passive:false});

let v11_pan=null, v11_panMoved=false, v11_suppressClick=false;
svg.addEventListener('pointerdown',e=>{
  if(e.target!==svg) return;
  const p=v11_svgPoint(e.clientX,e.clientY);
  v11_pan={px:p.x,py:p.y,x:v11_view.x,y:v11_view.y};v11_panMoved=false;
  svg.setPointerCapture?.(e.pointerId);
});
svg.addEventListener('pointermove',e=>{
  if(!v11_pan) return;
  const p=v11_svgPoint(e.clientX,e.clientY);
  const dx=p.x-v11_pan.px,dy=p.y-v11_pan.py;
  if(Math.hypot(dx,dy)>3)v11_panMoved=true;
  v11_view.x=v11_pan.x+dx;v11_view.y=v11_pan.y+dy;v11_applyView();
});
svg.addEventListener('pointerup',()=>{if(v11_panMoved)v11_suppressClick=true;v11_pan=null});
svg.addEventListener('click',e=>{
  if(v11_suppressClick){e.stopImmediatePropagation();v11_suppressClick=false;}
},true);

// ===== 연결 단계 1 → 2 → 3 =====
v11_depthBtn.addEventListener('click',e=>{
  e.preventDefault();e.stopImmediatePropagation();
  depth = depth>=3 ? 1 : depth+1;
  v11_depthBtn.textContent=`연결 ${depth}단계`;
  v11_depthBtn.classList.toggle('active',depth>1);
  if(selected) focusNode(selected); else reset();
},true);

// 3단계에서도 보기 좋게 재배치하기 위해 focusNode를 감싼다.
const v11_baseFocus=focusNode;
const v11_baseReset=reset;
let v11_activePath=null;
let v11_pathRendering=false;

function v11_distances(root,maxDepth){
  const d=new Map([[root,0]]),q=[root];
  while(q.length){const cur=q.shift(),cd=d.get(cur);if(cd>=maxDepth)continue;(neighbors.get(cur)||[]).forEach(nx=>{if(!d.has(nx)){d.set(nx,cd+1);q.push(nx)}})}
  return d;
}
focusNode=function(id){
  if(!v11_pathRendering)v11_activePath=null;
  v11_baseFocus(id);
  if(depth>=2 && viewMode==='bubble'){
    const d=v11_distances(id,depth),cx=W*.48,cy=H*.48;
    for(let level=2;level<=depth;level++){
      const arr=[...d].filter(([,v])=>v===level).map(([nid])=>nid);
      const radius=Math.min(Math.min(W,H)*(.28+.10*(level-2)), level===2?300:410);
      arr.forEach((nid,i)=>{const a=Math.PI*2*i/Math.max(arr.length,1)-Math.PI/2;targets[nid]={x:cx+Math.cos(a)*radius,y:cy+Math.sin(a)*radius};});
    }
  }
  v11_applyEdgeFilter();
};
reset=function(){
  if(!v11_pathRendering)v11_activePath=null;
  v11_baseReset();v11_applyEdgeFilter();
};

// ===== 연결선 필터 =====
function v11_applyEdgeFilter(){
  if(v11_activePath)return;
  const val=v11_edgeFilter.value;
  lineEls.forEach(({el,data})=>{
    if(val!=='all' && data.relation!==val)el.setAttribute('opacity','0');
  });
}
v11_edgeFilter.addEventListener('change',()=>{if(selected)focusNode(selected);else reset()});

// ===== 전체화면 =====
v11_fullscreenBtn.addEventListener('click',async e=>{
  e.stopPropagation();
  try{if(!document.fullscreenElement)await v11_card.requestFullscreen();else await document.exitFullscreen();}catch(_){ }
});
document.addEventListener('fullscreenchange',()=>{
  v11_fullscreenBtn.textContent=document.fullscreenElement?'전체화면 종료':'전체화면';
  setTimeout(()=>{resize();if(selected)focusNode(selected);else reset()},80);
});

// ===== 학습경로 찾기 =====
let v11_pathMode=false,v11_pathStart=null;
for(const [id,t] of labelEls){t.dataset.id=id;}
function v11_setPathMode(on){
  v11_pathMode=on;v11_pathStart=null;v11_pathBtn.classList.toggle('active',on);
  if(on){v11_pathBtn.textContent='경로 선택 중';v11_pathBanner.style.display='block';v11_pathBanner.textContent='시작할 버블을 선택하세요';}
  else{v11_pathBtn.textContent='학습경로';v11_pathBanner.style.display='none';}
}
v11_pathBtn.addEventListener('click',e=>{e.stopPropagation();v11_setPathMode(!v11_pathMode)});

function v11_pathAdj(allowStructure){
  const a=new Map(NODES.map(n=>[n.id,[]]));
  EDGES.forEach(e=>{if(!allowStructure && e.relation==='structure')return;a.get(e.source)?.push(e.target);a.get(e.target)?.push(e.source)});return a;
}
function v11_shortestPath(start,end,allowStructure=false){
  const adj=v11_pathAdj(allowStructure),q=[start],prev=new Map([[start,null]]);
  while(q.length){const cur=q.shift();if(cur===end)break;for(const nx of (adj.get(cur)||[])){if(!prev.has(nx)){prev.set(nx,cur);q.push(nx)}}}
  if(!prev.has(end))return null;const out=[];for(let cur=end;cur!==null;cur=prev.get(cur))out.push(cur);return out.reverse();
}
function v11_edgeBetween(a,b){return EDGES.find(e=>(e.source===a&&e.target===b)||(e.source===b&&e.target===a));}
function v11_showPath(path){
  v11_activePath=path;selected=path[path.length-1];
  const set=new Set(path),pairs=new Set();for(let i=0;i<path.length-1;i++)pairs.add([path[i],path[i+1]].sort().join('|'));
  const left=Math.max(90,W*.10),right=Math.min(W-90,W*.88),y=H*.47;
  path.forEach((id,i)=>{targets[id]={x:path.length===1?W*.5:left+(right-left)*i/(path.length-1),y:y+(i%2?28:-28)}});
  NODES.forEach(n=>{
    const g=nodeEls.get(n.id),c=g.querySelector('circle'),lab=labelEls.get(n.id),on=set.has(n.id);
    g.style.opacity=on?'1':'.035';g.style.pointerEvents=on?'auto':'none';
    c.setAttribute('r',typeStyle[n.type].r+(on?4:0));c.setAttribute('stroke-width',on?'4':'2');
    if(on)c.setAttribute('stroke','#f97316');else c.setAttribute('stroke',gradeStroke[n.grade]||'#fff');
    lab.style.opacity=on?'1':'0';
  });
  lineEls.forEach(({el,data})=>{
    const key=[data.source,data.target].sort().join('|'),on=pairs.has(key);
    el.setAttribute('opacity',on?'1':'0');el.setAttribute('stroke','#f97316');el.setAttribute('stroke-width',on?'3.5':'1');el.setAttribute('stroke-dasharray','');
  });
  side.innerHTML=`<h2>학습경로</h2><p><b>${nodeMap.get(path[0]).label}</b>에서 <b>${nodeMap.get(path[path.length-1]).label}</b>까지의 가장 짧은 교육과정 연결 경로입니다.</p><div class="section"><h3>연결 경로 ${path.length}단계</h3><div class="pathChain">${path.map((id,i)=>{const n=nodeMap.get(id);const e=i<path.length-1?v11_edgeBetween(id,path[i+1]):null;return `<button class="pathStep" data-v11goto="${id}"><b>${i+1}. ${n.label} · ${typeName(n.type)}</b><span>${n.detail}</span></button>${e?`<div class="pathArrow">↓ ${e.reason}</div>`:''}`}).join('')}</div></div><div class="notice">교육과정의 공식 선수학습 그래프가 아니라, 현재 버블맵에 설정된 연계 관계를 따라 계산한 탐색 경로입니다.</div>`;
  side.querySelectorAll('[data-v11goto]').forEach(b=>b.addEventListener('click',()=>{v11_pathRendering=true;v11_activePath=null;focusNode(b.dataset.v11goto);v11_pathRendering=false;}));
}

// 캡처 단계에서 기존 노드 클릭보다 먼저 경로 선택을 처리한다.
svg.addEventListener('click',e=>{
  if(!v11_pathMode)return;
  const el=e.target.closest?.('[data-id]');if(!el)return;
  const id=el.dataset.id;if(!nodeMap.has(id))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(!v11_pathStart){
    v11_pathStart=id;v11_pathBanner.textContent=`시작: ${nodeMap.get(id).label} → 도착 버블을 선택하세요`;
    v11_pathRendering=true;focusNode(id);v11_pathRendering=false;
  }else{
    const start=v11_pathStart,end=id;
    let path=v11_shortestPath(start,end,false);if(!path)path=v11_shortestPath(start,end,true);
    v11_setPathMode(false);
    if(path)v11_showPath(path);else alert('두 버블을 연결하는 경로를 찾지 못했습니다.');
  }
},true);

// UI 클릭이 그래프 배경 reset으로 번지지 않도록 보호
for(const el of [document.getElementById('graphTools'),v11_pathBanner]) el?.addEventListener('click',e=>e.stopPropagation());

v11_applyView();
})();
