(()=>{
'use strict';
if(window.__mathBubbleV16)return;window.__mathBubbleV16=true;
if(typeof NODES==='undefined'||typeof EDGES==='undefined'||typeof nodeMap==='undefined'||typeof svg==='undefined')return;

const VERSION='V1.6';
const controls=document.querySelector('.controls');
const card=document.querySelector('.graphCard');
const brand=document.querySelector('.brand h1');
if(brand){
  const b=brand.querySelector('.v11Badge,.v12Badge,.v13Badge,.v14Badge,.v15Badge');
  if(b)b.textContent=VERSION;
  else brand.insertAdjacentHTML('beforeend',' <span class="v16Badge">'+VERSION+'</span>');
}
const st=document.createElement('style');
st.textContent=`
.v16Badge,.v11Badge,.v12Badge,.v13Badge,.v14Badge,.v15Badge{display:inline-block;margin-left:5px;font-size:10px;vertical-align:middle;padding:3px 6px;border-radius:999px;background:#eff8ff!important;color:#175cd3!important;border:1px solid #b2ddff!important}
#v16CompareBtn.active{background:#175cd3!important;color:#fff!important;border-color:#175cd3!important}
.v16Banner{position:absolute;z-index:20;top:10px;left:50%;transform:translateX(-50%);background:#eff8ff;color:#175cd3;border:1px solid #b2ddff;border-radius:999px;padding:8px 12px;font-size:11px;font-weight:900;box-shadow:0 5px 16px rgba(16,24,40,.10);display:none;max-width:85%;text-align:center}
.v16Overlay{position:fixed;inset:0;background:rgba(16,24,40,.48);z-index:9998;display:none;align-items:center;justify-content:center;padding:20px}
.v16Modal{width:min(1120px,96vw);max-height:92vh;overflow:auto;background:#fff;border-radius:18px;box-shadow:0 28px 70px rgba(16,24,40,.28);border:1px solid #e4e7ec}
.v16Top{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;background:rgba(255,255,255,.96);border-bottom:1px solid #eaecf0;backdrop-filter:blur(8px)}
.v16Top h2{margin:0;font-size:16px;color:#101828}.v16Top p{margin:2px 0 0;font-size:10px;color:#667085}
.v16Close{border:1px solid #d0d5dd;background:#fff;border-radius:9px;padding:7px 10px;cursor:pointer;font-weight:850}
.v16Body{padding:14px}.v16Pair{display:grid;grid-template-columns:1fr 44px 1fr;gap:10px;align-items:stretch}.v16Arrow{display:grid;place-items:center;font-size:22px;color:#98a2b3;font-weight:900}
.v16Std{border:1px solid #d0d5dd;background:#f9fafb;border-radius:14px;padding:12px}.v16Std h3{margin:0 0 6px;font-size:14px;color:#101828}.v16Std p{margin:0;font-size:11px;line-height:1.55;color:#475467}
.v16Meta{display:flex;gap:5px;flex-wrap:wrap;margin:6px 0 8px}.v16Pill{font-size:9px;font-weight:850;border-radius:999px;padding:4px 7px;background:#fff;border:1px solid #d0d5dd;color:#475467}
.v16Grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.v16Box{border:1px solid #e4e7ec;border-radius:13px;padding:11px;background:#fff}.v16Box h4{margin:0 0 8px;font-size:11px;color:#344054}.v16Box small{color:#98a2b3}
.v16Rows{display:grid;gap:6px}.v16Row{display:grid;grid-template-columns:120px 1fr 1fr;gap:8px;align-items:start;border-top:1px solid #f0f2f5;padding-top:7px}.v16Row:first-child{border-top:0;padding-top:0}.v16Label{font-size:10px;font-weight:900;color:#667085}.v16Cell{font-size:10px;line-height:1.5;color:#344054}
.v16Common{display:inline-block;margin:2px;padding:4px 6px;border-radius:999px;background:#ecfdf3;color:#067647;border:1px solid #abefc6;font-size:9px;font-weight:850}
.v16Only{display:inline-block;margin:2px;padding:4px 6px;border-radius:999px;background:#f9fafb;color:#475467;border:1px solid #e4e7ec;font-size:9px;font-weight:800}
.v16Path{border-left:3px solid #12b76a;background:#ecfdf3;border-radius:0 10px 10px 0;padding:9px 10px;font-size:10px;line-height:1.55;color:#05603a}
.v16Analysis{border-left:3px solid #f79009;background:#fffaeb;border-radius:0 10px 10px 0;padding:9px 10px;font-size:10px;line-height:1.55;color:#93370d}
.v16Actions{display:flex;gap:7px;justify-content:flex-end;margin-top:12px}.v16Actions button{border:1px solid #d0d5dd;background:#fff;border-radius:9px;padding:8px 10px;font-size:10px;font-weight:850;cursor:pointer}
@media(max-width:800px){.v16Pair{grid-template-columns:1fr}.v16Arrow{transform:rotate(90deg)}.v16Grid{grid-template-columns:1fr}.v16Row{grid-template-columns:1fr}.v16Label{margin-top:2px}}
`;
document.head.appendChild(st);

let btn=document.getElementById('v16CompareBtn');
if(!btn&&controls){btn=document.createElement('button');btn.id='v16CompareBtn';btn.textContent='성취기준 비교';controls.appendChild(btn);}
let banner=document.getElementById('v16Banner');
if(!banner&&card){banner=document.createElement('div');banner.id='v16Banner';banner.className='v16Banner';card.appendChild(banner);}
let overlay=document.getElementById('v16Overlay');
if(!overlay){overlay=document.createElement('div');overlay.id='v16Overlay';overlay.className='v16Overlay';document.body.appendChild(overlay);}

let mode=false,a=null,b=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const uniqBy=(arr,key='id')=>{const seen=new Set();return arr.filter(x=>x&&!seen.has(x[key])&&seen.add(x[key]));};
function direct(id,type){
  const out=[];
  for(const e of EDGES){
    if(e.source!==id&&e.target!==id)continue;
    const oid=e.source===id?e.target:e.source,n=nodeMap.get(oid);
    if(n&&(!type||n.type===type))out.push({n,e});
  }
  return uniqBy(out.map(x=>x.n));
}
function heuristicDesign(n){
  const ts=new Set(n.topics||[]);
  return NODES.filter(x=>x.type==='designConcept'&&(!x.domain||!n.domain||x.domain===n.domain))
    .map(x=>({n:x,s:(x.topics||[]).reduce((q,t)=>q+(ts.has(t)?1:0),0)}))
    .filter(x=>x.s>0).sort((x,y)=>y.s-x.s).slice(0,6).map(x=>x.n);
}
function rel(n,type){const d=direct(n.id,type);return d.length?d:(type==='designConcept'?heuristicDesign(n):[]);}
function common(xs,ys){const sy=new Set(ys.map(x=>x.label));return xs.filter(x=>sy.has(x.label));}
function only(xs,ys){const sy=new Set(ys.map(x=>x.label));return xs.filter(x=>!sy.has(x.label));}
function chips(xs,cls='v16Only'){return xs.length?xs.map(x=>`<span class="${cls}">${esc(x.label)}</span>`).join(''):'<small>없음</small>';}
function gradeRank(g){const s=String(g||'');if(/1\s*[~∼–-]\s*2/.test(s))return 1;if(/3\s*[~∼–-]\s*4/.test(s))return 2;if(/5\s*[~∼–-]\s*6/.test(s))return 3;const m=s.match(/\d/);return m?Math.ceil(+m[0]/2):0;}
function progressionPath(start,end){
  const adj=new Map(NODES.map(n=>[n.id,[]]));
  EDGES.forEach(e=>{if(e.relation==='progression')adj.get(e.source)?.push(e.target);});
  const q=[start],prev=new Map([[start,null]]);
  while(q.length){const cur=q.shift();if(cur===end)break;for(const nx of (adj.get(cur)||[])){if(!prev.has(nx)){prev.set(nx,cur);q.push(nx);}}}
  if(!prev.has(end))return null;const out=[];for(let cur=end;cur!==null;cur=prev.get(cur))out.push(cur);return out.reverse();
}
function relationSummary(A,B){
  let p=progressionPath(A.id,B.id),dir='forward';
  if(!p){p=progressionPath(B.id,A.id);dir='reverse';}
  if(!p)return '현재 설정된 선수·후속학습 연결만으로는 두 성취기준 사이의 직접적인 계통 경로를 확인하지 못했습니다.';
  const labs=p.map(id=>nodeMap.get(id)?.label||id);
  return `${dir==='forward'?esc(A.label)+' → '+esc(B.label):esc(B.label)+' → '+esc(A.label)} 방향의 설계 계통이 있습니다.<br><b>${labs.map(esc).join(' → ')}</b>`;
}
function row(label,xa,xb){
  const ca=common(xa,xb),oa=only(xa,xb),ob=only(xb,xa);
  return `<div class="v16Row"><div class="v16Label">${esc(label)}</div><div class="v16Cell">${ca.length?'<b>공통</b> '+chips(ca,'v16Common')+'<br>':''}${chips(oa)}</div><div class="v16Cell">${ca.length?'<b>공통</b> '+chips(ca,'v16Common')+'<br>':''}${chips(ob)}</div></div>`;
}
function meta(n){return `<div class="v16Meta"><span class="v16Pill">${esc(n.grade||'')}</span><span class="v16Pill">${esc(n.domain||'')}</span>${(n.topics||[]).slice(0,4).map(t=>`<span class="v16Pill">${esc(t)}</span>`).join('')}</div>`;}
function stdCard(n){return `<div class="v16Std"><h3>${esc(n.label)}</h3>${meta(n)}<p>${esc(n.detail||'')}</p></div>`;}
function expansionAnalysis(A,B){
  const ra=gradeRank(A.grade),rb=gradeRank(B.grade);
  if(!ra||!rb||ra===rb)return '두 성취기준이 같은 학년군이거나 학년군 순서를 판별하기 어려워, 학년군 간 확장 분석은 제시하지 않습니다.';
  const early=ra<rb?A:B,late=ra<rb?B:A;
  const kEarly=rel(early,'concept'),kLate=rel(late,'concept');
  const dEarly=rel(early,'designConcept'),dLate=rel(late,'designConcept');
  const newK=only(kLate,kEarly).map(x=>x.label),newD=only(dLate,dEarly).map(x=>x.label);
  const parts=[];
  if(newK.length)parts.push(`후속 학년군에서 새롭게 연결되는 지식·이해: <b>${newK.map(esc).join(', ')}</b>`);
  if(newD.length)parts.push(`설계 분석에서 새롭게 강조되는 개념: <b>${newD.map(esc).join(', ')}</b>`);
  if(!parts.length)parts.push('현재 연결 데이터에서는 후속 학년군의 새로운 요소가 뚜렷하게 분리되지 않습니다.');
  return `<b>${esc(early.grade)} → ${esc(late.grade)}</b><br>${parts.join('<br>')}`;
}
function render(A,B){
  const sets={dc:[rel(A,'designConcept'),rel(B,'designConcept')],k:[rel(A,'concept'),rel(B,'concept')],p:[rel(A,'process'),rel(B,'process')],v:[rel(A,'value'),rel(B,'value')],c:[rel(A,'core'),rel(B,'core')]};
  const ta=(A.topics||[]).map(x=>({label:x,id:'ta:'+x})),tb=(B.topics||[]).map(x=>({label:x,id:'tb:'+x}));
  overlay.innerHTML=`<div class="v16Modal" role="dialog" aria-modal="true">
    <div class="v16Top"><div><h2>성취기준 비교 · V1.6</h2><p>공식 교육과정 요소와 설계 연결을 나란히 비교합니다.</p></div><button class="v16Close" id="v16Close">닫기</button></div>
    <div class="v16Body">
      <div class="v16Pair">${stdCard(A)}<div class="v16Arrow">↔</div>${stdCard(B)}</div>
      <div class="v16Grid">
        <div class="v16Box"><h4>공통점·차이점</h4><div class="v16Rows">
          ${row('핵심아이디어',sets.c[0],sets.c[1])}
          ${row('설계 개념',sets.dc[0],sets.dc[1])}
          ${row('지식·이해',sets.k[0],sets.k[1])}
          ${row('과정·기능',sets.p[0],sets.p[1])}
          ${row('가치·태도',sets.v[0],sets.v[1])}
          ${row('주제 태그',ta,tb)}
        </div></div>
        <div class="v16Box"><h4>선수·후속학습 연결 <small>설계 분석</small></h4><div class="v16Path">${relationSummary(A,B)}</div>
          <h4 style="margin-top:12px">학년군 간 확장 포인트 <small>설계 분석</small></h4><div class="v16Analysis">${expansionAnalysis(A,B)}</div>
          <div class="v16Actions"><button id="v16Swap">좌우 바꾸기</button><button id="v16New">다른 기준 비교</button></div>
        </div>
      </div>
    </div></div>`;
  overlay.style.display='flex';
  overlay.querySelector('#v16Close').onclick=()=>{overlay.style.display='none';setMode(false);};
  overlay.querySelector('#v16Swap').onclick=()=>{const t=a;a=b;b=t;render(nodeMap.get(a),nodeMap.get(b));};
  overlay.querySelector('#v16New').onclick=()=>{overlay.style.display='none';a=b=null;setMode(true);};
}
function setMode(on){
  mode=on;if(btn)btn.classList.toggle('active',on);
  if(!on){a=b=null;if(banner)banner.style.display='none';if(btn)btn.textContent='성취기준 비교';}
  else{if(btn)btn.textContent='비교 선택 중';if(banner){banner.style.display='block';banner.textContent='비교할 첫 번째 성취기준을 선택하세요';}}
}
if(btn)btn.addEventListener('click',e=>{e.stopPropagation();setMode(!mode);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){overlay.style.display='none';setMode(false);}});
overlay.addEventListener('click',e=>{if(e.target===overlay){overlay.style.display='none';setMode(false);}});
document.addEventListener('click',e=>{
  if(!mode)return;
  const el=e.target.closest?.('[data-id]');if(!el||!svg.contains(el))return;
  const id=el.dataset.id,n=nodeMap.get(id);if(!n)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(n.type!=='standard'){if(banner)banner.textContent='성취기준 버블을 선택해 주세요';return;}
  if(!a){a=id;if(banner)banner.textContent='첫 번째: '+n.label+' · 두 번째 성취기준을 선택하세요';}
  else if(id===a){if(banner)banner.textContent='같은 성취기준입니다. 다른 기준을 선택해 주세요';}
  else{b=id;render(nodeMap.get(a),nodeMap.get(b));}
},true);

})();