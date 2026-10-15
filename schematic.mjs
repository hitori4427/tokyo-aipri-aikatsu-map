export function zoomView(v,f,anchor=[v[0]+v[2]/2,v[1]+v[3]/2]){const w=Math.max(200,Math.min(4000,v[2]/f)),ratio=w/v[2];return[anchor[0]-(anchor[0]-v[0])*ratio,anchor[1]-(anchor[1]-v[1])*ratio,w,w*2500/3200];}
export async function drawSchematic(routes,stations,onPick){
 const host=document.querySelector('#map'),response=await fetch('network.svg');if(!response.ok)throw Error('network.svg');host.innerHTML=await response.text();const svg=host.querySelector('svg');let view=[0,0,3200,2500],drag=null,moved=false;
 const apply=()=>svg.setAttribute('viewBox',view.join(' '));
 const geometry=()=>{const r=svg.getBoundingClientRect(),w=r.width||1000,h=r.height||540,scale=Math.min(w/view[2],h/view[3]);return{r,scale,px:(w-view[2]*scale)/2,py:(h-view[3]*scale)/2};};
 const point=e=>{const {r,scale,px,py}=geometry();return[view[0]+(e.clientX-r.left-px)/scale,view[1]+(e.clientY-r.top-py)/scale];};
 function zoom(f,anchor){view=zoomView(view,f,anchor);apply();}
 svg.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.2:1/1.2,point(e));},{passive:false});
 svg.addEventListener('pointerdown',e=>{if(e.button&&e.button!==0)return;moved=false;drag={x:e.clientX,y:e.clientY,v:[...view],scale:geometry().scale};svg.setPointerCapture?.(e.pointerId);});
 svg.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)moved=true;if(moved){view=[drag.v[0]-dx/drag.scale,drag.v[1]-dy/drag.scale,...drag.v.slice(2)];apply();}});
 svg.addEventListener('pointerup',()=>{drag=null;});svg.addEventListener('pointercancel',()=>{drag=null;});
 for(const g of host.querySelectorAll('[data-station]')){g.addEventListener('click',()=>{if(!moved)onPick(g.dataset.station);});g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onPick(g.dataset.station);}});}
 const selector=document.querySelector('#route-select');selector.innerHTML='<option value="">全網總覽 · 14 線 229 站</option>'+routes.map(r=>`<option value="${r.code}">${r.code} · ${r.name}</option>`).join('');selector.onchange=()=>{const code=selector.value;for(const el of svg.querySelectorAll('[data-line]'))el.classList.toggle('route-dim',!!code&&el.dataset.line!==code);for(const el of svg.querySelectorAll('[data-lines]'))el.classList.toggle('station-dim',!!code&&!el.dataset.lines.split(' ').includes(code));};
 return{zoomIn:()=>zoom(1.5),zoomOut:()=>zoom(1/1.5),reset:()=>{view=[0,0,3200,2500];apply();},focusStation:name=>{const g=[...svg.querySelectorAll('[data-station]')].find(x=>x.dataset.station===name),c=g?.querySelector('circle');if(c){const w=Math.min(view[2],900),h=w*2500/3200;view=[+c.getAttribute('cx')-w/2,+c.getAttribute('cy')-h/2,w,h];apply();}},getView:()=>[...view]};
}
