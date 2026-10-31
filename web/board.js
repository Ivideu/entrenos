function Board(el,a){
const S=a.pasos,ids=Object.keys(S[0]).filter(k=>k!="c"),P=[],N=S.length,D=2600;
S.forEach((s,i)=>{const o={};ids.forEach(k=>o[k]=s[k]||P[i-1][k]);P.push(o)});
el.className="board";
el.innerHTML=`<div class="bh"><h4>${a.t}</h4><div class="ctl"><button data-a="p" aria-label="Paso anterior">◀</button><button data-a="pl" aria-label="Pausa o play">❚❚</button><button data-a="n" aria-label="Paso siguiente">▶</button><button data-a="s" aria-label="Velocidad">1×</button></div></div>
<svg viewBox="0 0 300 180" role="img" aria-label="${a.t}"><defs><linearGradient id="g"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".14"/></linearGradient>
<marker id="aw" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8z" fill="#fff"/></marker><marker id="ao" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="#ff5a1f"/></marker></defs>
<rect width="300" height="180" fill="#1f56b3"/><rect width="300" height="180" fill="url(#g)"/>
<g fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.4"><rect x="1" y="1" width="298" height="178"/><path d="M1 1V179M1 60A30 30 0 0 1 1 120M255 68A45 45 0 0 1 300 23M255 68V112M255 112A45 45 0 0 0 300 157"/></g>
<circle cx="210" cy="90" r="1.8" fill="#fff"/><circle cx="150" cy="90" r="1.8" fill="#fff"/><rect x="296" y="68" width="4" height="44" fill="#fff"/>
<g class="tr"></g>${ids.map(k=>k=="ball"?'<g data-k="ball"><circle r="5.5" fill="#fff"/><circle r="4" fill="#ff5a1f"/></g>':`<g data-k="${k}"><circle r="9" class="${k[0]}" stroke="#fff" stroke-width="1.5"/><text y="3">${k}</text></g>`).join("")}</svg>
<p class="cap"></p><div class="dots">${S.map((_,j)=>`<button data-j="${j}" aria-label="Paso ${j+1}"></button>`).join("")}</div>`;
const q=s=>el.querySelector(s),E={},cap=q(".cap"),tr=q(".tr"),dots=el.querySelectorAll(".dots button"),rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
ids.forEach(k=>E[k]=q(`[data-k="${k}"]`));
let i=0,t=0,play=!rm,sp=1,last=performance.now();
function trail(){tr.innerHTML=i?ids.filter(k=>P[i][k]+""!=P[i-1][k]+"").map(k=>{const f=P[i-1][k],e=P[i][k],dx=e[0]-f[0],dy=e[1]-f[1],l=Math.hypot(dx,dy),r=Math.min(k=="ball"?7:12,l);return `<path d="M${f} L${e[0]-dx/l*r},${e[1]-dy/l*r}" class="${k=="ball"?"bl":"pl"}" marker-end="url(#${k=="ball"?"ao":"aw"})"/>`}).join(""):""}
function go(n){i=(n+N)%N;t=0;cap.textContent=S[i].c;trail();dots.forEach((d,j)=>d.classList.toggle("on",j==i))}
go(0);
el.onclick=e=>{const b=e.target.closest("button");if(!b)return;const x=b.dataset.a;
if(b.dataset.j)go(+b.dataset.j);else if(x=="p")go(i-1);else if(x=="n")go(i+1);
else if(x=="pl"){play=!play;b.textContent=play?"❚❚":"▶"}else if(x=="s"){sp=sp==1?.5:1;b.textContent=sp==1?"1×":"½×"}};
(function f(now){if(!el.isConnected)return;const dt=now-last;last=now;
if(play){t+=dt*sp;if(t>=D)go(i+1)}
let m=rm?1:Math.min(1,t/(D*.55));m*=m*(3-2*m)||0;if(rm)m=1;const A=i?P[i-1]:P[0];
ids.forEach(k=>E[k].setAttribute("transform",`translate(${A[k][0]+(P[i][k][0]-A[k][0])*m} ${A[k][1]+(P[i][k][1]-A[k][1])*m})`));
requestAnimationFrame(f)})(last);
}
