(()=>{
'use strict';
if(window.__mathBubbleV18)return; window.__mathBubbleV18=true;
if(typeof NODES==='undefined'||typeof EDGES==='undefined'||typeof nodeMap==='undefined'||typeof focusNode==='undefined')return;

const VERSION='V1.8';
const brand=document.querySelector('.brand h1');
if(brand){
  const badge=brand.querySelector('.v11Badge,.v12Badge,.v13Badge,.v14Badge,.v15Badge,.v16Badge,.v17Badge');
  if(badge) badge.textContent=VERSION;
}
const controls=document.querySelector('.controls');
const style=document.createElement('style');
style.textContent=`
#v18MatrixBtn.active{background:#175cd3!important;color:#fff!important;border-color:#175cd3!important}
.v18Overlay{position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.55);display:none;align-items:center;justify-content:center;padding:22px}
.v18Overlay.open{display:flex}.v18Modal{width:min(1500px,97vw);height:min(900px,94vh);background:#fff;border-radius:18px;box-shadow:0 24px 80px rgba(15,23,42,.28);display:flex;flex-direction:column;overflow:hidden}
.v18Head{padding:16px 18px 12px;border-bottom:1px solid #e8edf4;background:#fbfcfe}.v18TitleRow{display:flex;align-items:center;justify-content:space-between;gap:12px}.v18TitleRow h2{margin:0;font-size:18px;color:#1d2939}.v18Close{border:1px solid #dfe5ee;background:#fff;border-radius:10px;padding:8px 11px;font-weight:900;cursor:pointer}
.v18Sub{margin-top:4px;font-size:11px;color:#667085}.v18Filters{display:grid;grid-template-columns:minmax(210px,1.8fr) repeat(3,minmax(120px,.8fr)) auto;gap:8px;margin-top:12px}
.v18Filters input,.v18Filters select,.v18Filters button{border:1px solid #dfe5ee;background:#fff;border-radius:10px;padding:9px 10px;font-size:11px;color:#344054}.v18Filters button{font-weight:850;cursor:pointer}
.v18Stats{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.v18Stat{font-size:10px;font-weight:800;border:1px solid #e4eaf2;border-radius:999px;padding:5px 8px;background:#fff;color:#475467}
.v18Body{flex:1;overflow:auto}.v18Table{width:100%;border-collapse:separate;border-spacing:0;font-size:11px;min-width:1220px}.v18Table th{position:sticky;top:0;z-index:3;background:#f8fafc;color:#475467;text-align:left;padding:9px 8px;border-bottom:1px solid #dfe5ee;font-size:10px}.v18Table td{vertical-align:top;padding:8px;border-bottom:1px solid #eef2f6;color:#344054;line-height:1.45}.v18Table tr:hover td{background:#f9fbff}
.v18Code{font-weight:900;color:#175cd3;cursor:pointer;white-space:nowrap}.v18Std{min-width:300px}.v18Domain{font-weight:850;white-space:nowrap}.v18Grade{font-weight:850;white-space:nowrap}.v18Chip{display:inline-block;padding:3px 6px;margin:1px 2px 1px 0;border-radius:999px;border:1px solid #dfe5ee;background:#fff;font-size:9px;color:#475467;cursor:pointer}.v18Chip.dc{background:#fff7ed;border-color:#fed7aa;color:#9a3412}.v18Chip.core{background:#eef2ff;border-color:#c7d2fe;color:#4338ca}.v18Empty{padding:35px;text-align:center;color:#98a2b3}
.v18Foot{padding:10px 16px;border-top:1px solid #e8edf4;background:#fbfcfe;font-size:10px;color:#667085;display:flex;justify-content:space-between;gap:10px;align-items:center}
@media(max-width:800px){.v18Overlay{padding:6px}.v18Modal{width:100vw;height:100vh;border-radius:0}.v18Filters{grid-template-columns:1fr 1fr}.v18Filters input{grid-column:1/-1}.v18Filters button{grid-column:1/-1}.v18TitleRow h2{font-size:15px}}
`;
document.head.appendChild(style);

let btn=document.getElementById('v18MatrixBtn');
if(!btn&&controls){btn=document.createElement('button');btn.id='v18MatrixBtn';btn.textContent='매트릭스 보기';controls.appendChild(btn);}

const overlay=document.createElement('div');overlay.className='v18Overlay';overlay.id='v18Overlay';
overlay.innerHTML=`
<div class="v18Modal" role="dialog" aria-modal="true" aria-label="교육과정 매트릭스">
 <div class="v18Head">
   <div class="v18TitleRow"><div><h2>교육과정 매트릭스</h2><div class="v18Sub">성취기준 × 학년군 × 영역 × 핵심아이디어 × 설계개념 × 학습요소를 표로 탐색합니다.</div></div><button class="v18Close" id="v18Close">닫기 ✕</button></div>
   <div class="v18Filters">
    <input id="v18Search" placeholder="성취기준 코드·내용·분수·비율·평균 등 검색">
    <select id="v18Grade"><option value="">학년군 전체</option><option>1~2</option><option>3~4</option><option>5~6</option></select>
    <select id="v18Domain"><option value="">영역 전체</option><option>수와 연산</option><option>변화와 관계</option><option>도형과 측정</option><option>자료와 가능성</option></select>
    <select id="v18Focus"><option value="">연결요소 전체</option><option value="designConcept">설계개념 있음</option><option value="core">핵심아이디어 있음</option><option value="process">과정·기능 있음</option><option value="value">가치·태도 있음</option></select>
    <button id="v18CopyCsv">현재 표 CSV 복사</button>
   </div>
   <div class="v18Stats" id="v18Stats"></div>
 </div>
 <div class="v18Body"><table class="v18Table"><thead><tr><th>학년군</th><th>영역</th><th>성취기준</th><th>지식·이해</th><th>설계 개념</th><th>과정·기능</th><th>가치·태도</th><th>핵심아이디어</th></tr></thead><tbody id="v18Tbody"></tbody></table></div>
 <div class="v18Foot"><span>코드나 칩을 누르면 버블맵의 해당 요소로 이동합니다.</span><span>설계 개념·일부 연계는 공식 교육과정이 아닌 설계·분석 요소입니다.</span></div>
</div>`;
document.body.appendChild(overlay);

const $=id=>document.getElementById(id);
const tbody=$('v18Tbody'), search=$('v18Search'), grade=$('v18Grade'), domain=$('v18Domain'), focus=$('v18Focus'), stats=$('v18Stats');
const standards=NODES.filter(n=>n.type==='standard');
function uniqNodes(a){const seen=new Set();return a.filter(n=>n&&!seen.has(n.id)&&seen.add(n.id));}
function linked(id,type){
 const out=[];
 for(const e of EDGES){
  if(e.source!==id&&e.target!==id)continue;
  const oid=e.source===id?e.target:e.source,n=nodeMap.get(oid);
  if(n&&n.type===type)out.push(n);
 }
 return uniqNodes(out);
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function chips(nodes,klass=''){return nodes.length?nodes.map(n=>`<button class="v18Chip ${klass}" data-node="${esc(n.id)}" title="${esc(n.detail||n.label)}">${esc(n.label)}</button>`).join(''):'<span style="color:#98a2b3">—</span>';}
function rowData(n){
 return {
  n,
  k:linked(n.id,'concept'),
  dc:linked(n.id,'designConcept'),
  p:linked(n.id,'process'),
  v:linked(n.id,'value'),
  c:linked(n.id,'core')
 };
}
let current=[];
function passes(d){
 const q=search.value.trim().toLowerCase();
 const hay=[d.n.id,d.n.label,d.n.detail,d.n.domain,d.n.grade,...d.k.map(x=>x.label),...d.dc.map(x=>x.label),...d.p.map(x=>x.label),...d.v.map(x=>x.label),...d.c.map(x=>x.label)].join(' ').toLowerCase();
 if(q&&!hay.includes(q))return false;
 if(grade.value&&d.n.grade!==grade.value)return false;
 if(domain.value&&d.n.domain!==domain.value)return false;
 if(focus.value==='designConcept'&&!d.dc.length)return false;
 if(focus.value==='core'&&!d.c.length)return false;
 if(focus.value==='process'&&!d.p.length)return false;
 if(focus.value==='value'&&!d.v.length)return false;
 return true;
}
function render(){
 current=standards.map(rowData).filter(passes).sort((a,b)=>{
  const ga=(a.n.grade||'').localeCompare(b.n.grade||'','ko');
  if(ga)return ga; const da=(a.n.domain||'').localeCompare(b.n.domain||'','ko'); if(da)return da;
  return a.n.id.localeCompare(b.n.id,'ko');
 });
 if(!current.length){tbody.innerHTML='<tr><td colspan="8" class="v18Empty">조건에 맞는 성취기준이 없습니다.</td></tr>';}
 else tbody.innerHTML=current.map(d=>`<tr>
  <td class="v18Grade">${esc(d.n.grade||'—')}</td>
  <td class="v18Domain">${esc(d.n.domain||'—')}</td>
  <td class="v18Std"><button class="v18Code" data-node="${esc(d.n.id)}">${esc(d.n.id)}</button><div style="margin-top:4px">${esc(d.n.detail||d.n.label)}</div></td>
  <td>${chips(d.k)}</td><td>${chips(d.dc,'dc')}</td><td>${chips(d.p)}</td><td>${chips(d.v)}</td><td>${chips(d.c,'core')}</td>
 </tr>`).join('');
 const grades=[...new Set(current.map(x=>x.n.grade).filter(Boolean))];
 const domains=[...new Set(current.map(x=>x.n.domain).filter(Boolean))];
 stats.innerHTML=`<span class="v18Stat">성취기준 ${current.length}개</span><span class="v18Stat">학년군 ${grades.length}개</span><span class="v18Stat">영역 ${domains.length}개</span><span class="v18Stat">설계개념 연결 ${current.reduce((s,x)=>s+x.dc.length,0)}개</span>`;
}
function open(){overlay.classList.add('open');btn?.classList.add('active');render();setTimeout(()=>search.focus(),30);}
function close(){overlay.classList.remove('open');btn?.classList.remove('active');}
btn?.addEventListener('click',e=>{e.stopPropagation();overlay.classList.contains('open')?close():open();});
$('v18Close').addEventListener('click',close);
overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))close();});
[search,grade,domain,focus].forEach(el=>el.addEventListener(el===search?'input':'change',render));
tbody.addEventListener('click',e=>{
 const t=e.target.closest('[data-node]'); if(!t)return;
 const id=t.dataset.node;if(!nodeMap.has(id))return;
 close();setTimeout(()=>focusNode(id),30);
});
$('v18CopyCsv').addEventListener('click',async()=>{
 const head=['학년군','영역','성취기준','성취기준 내용','지식·이해','설계 개념','과정·기능','가치·태도','핵심아이디어'];
 const quote=s=>'"'+String(s??'').replace(/"/g,'""')+'"';
 const lines=[head.map(quote).join(',')];
 current.forEach(d=>lines.push([d.n.grade,d.n.domain,d.n.id,d.n.detail||d.n.label,d.k.map(x=>x.label).join(' | '),d.dc.map(x=>x.label).join(' | '),d.p.map(x=>x.label).join(' | '),d.v.map(x=>x.label).join(' | '),d.c.map(x=>x.label).join(' | ')].map(quote).join(',')));
 try{await navigator.clipboard.writeText(lines.join('\n'));$('v18CopyCsv').textContent='CSV 복사됨 ✓';setTimeout(()=>$('v18CopyCsv').textContent='현재 표 CSV 복사',1200);}catch(_){alert('클립보드 복사가 허용되지 않았습니다.');}
});
})();