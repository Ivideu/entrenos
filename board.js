function Board(el,a){
const S=a.pasos,ids=Object.keys(S[0]).filter(k=>k!="c"),P=[];
S.forEach((s,i)=>{const o={};ids.forEach(k=>o[k]=s[k]||P[i-1][k]);P.push(o)});
el.className="board";
el.innerHTML='<h4>'+a.t+'</h4><svg viewBox="0 0 300 180" role="img" aria-label="'+a.t+'"><rect width="300" height="180" fill="#1e4fa3"/><g fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"><rect x=".6" y=".6" width="298.8" height="178.8"/><path d="M300 52A38 38 0 0 0 262 90 38 38 0 0 0 300 128"/></g><rect x="295" y="75" width="5" height="30" fill="#fff"/>'+
ids.map(k=>k=="ball"?'<g data-k="ball"><circle r="4" fill="#ff6a00" stroke="#fff"/></g>':'<g data-k="'+k+'"><circle r="8" class="'+k[0]+'"/><text y="2.5">'+k+'</text></g>').join("")+'</svg><p class="cap"></p>';
const E={},cap=el.querySelector(".cap"),N=S.length,D=2400;
ids.forEach(k=>E[k]=el.querySelector('[data-k="'+k+'"]'));
let i=0,t0=performance.now();cap.textContent=S[0].c;
const set=(f,t,m)=>ids.forEach(k=>E[k].setAttribute("transform","translate("+(f[k][0]+(t[k][0]-f[k][0])*m)+" "+(f[k][1]+(t[k][1]-f[k][1])*m)+")"));
set(P[0],P[0],0);
if(matchMedia("(prefers-reduced-motion:reduce)").matches){let j=0;el.onclick=()=>{j=(j+1)%N;set(P[j],P[j],0);cap.textContent=S[j].c};cap.textContent+=" (toca para avanzar)";return}
(function f(now){let t=(now-t0)/D;if(t>=1){i=(i+1)%N;t0=now;t=0;cap.textContent=S[i].c}
let m=Math.min(1,t/.55);m=m*m*(3-2*m);const a=i?P[i-1]:P[0];set(a,P[i],m);requestAnimationFrame(f)})(t0);
}
