// sda-case-graphics: drawn compositions for Solution tabs and the Overview card.
// Stored in the website file as shared plugin data ('sda','caselib') and loaded with
//   const LIB = eval(figma.root.getSharedPluginData('sda','caselib'));
// Figma reformats stored code, so to change it re-store the whole file (wrap in a function and store '('+f.toString()+')()').
// Usage: const T = await LIB.theme({...}); await LIB.redoCase(sectionId, T, [[kind,data],...], overviewData|null);
(() => {
const BGC={r:.0431,g:.0431,b:.0588};
const hx=s=>{s=s.replace('#','');return {r:parseInt(s.slice(0,2),16)/255,g:parseInt(s.slice(2,4),16)/255,b:parseInt(s.slice(4,6),16)/255};};
const mix=(a,b,k)=>({r:a.r+(b.r-a.r)*k,g:a.g+(b.g-a.g)*k,b:a.b+(b.b-a.b)*k});
const lum=c=>.2126*c.r+.7152*c.g+.0722*c.b;
async function pick(fam,list){for(const s of list){try{await figma.loadFontAsync({family:fam,style:s});return s;}catch(e){}}return null;}
async function theme(o){
 let F=o.font||'Inter'; let r=await pick(F,['Regular','Book','Roman']);
 if(!r){F='Inter'; r=await pick(F,['Regular']);}
 const m=await pick(F,['Medium','Regular'])||r, s=await pick(F,['SemiBold','Semi Bold','Semibold','DemiBold','Bold'])||m, b=await pick(F,['Bold','ExtraBold','Extra Bold','SemiBold','Semi Bold'])||s;
 const dark=!!o.dark; const W={r:1,g:1,b:1};
 const card=hx(o.card||(dark?'#1c1f26':'#ffffff')), ink=hx(o.ink||(dark?'#f5f7fa':'#111827'));
 const acc=hx(o.acc), accL=o.accL?hx(o.accL):mix(acc,card,.82);
 const accT=o.accT?hx(o.accT):(dark?ink:(lum(acc)>.55?mix(acc,{r:0,g:0,b:0},.5):acc));
 return {F,W:{r,m,s,b},dark,card,ink,grey:hx(o.grey||(dark?'#9aa3b5':'#6b7280')),acc,accL,accT,onAcc:hx(o.onAcc||'#ffffff'),
  line:dark?mix(card,W,.12):hx('#e7eaef'),soft:dark?mix(card,W,.06):hx('#f5f7fa'),
  red:hx('#e5484d'),redL:dark?hx('#3a1f24'):hx('#fde8e8'),amb:hx('#b7791f'),ambL:dark?hx('#3a301b'):hx('#fdf3dc'),
  ok:hx(o.ok||'#16a34a'),okL:dark?hx('#16301f'):hx('#dcfce7'),av:o.av||[],logo:o.logo||null,glow:o.glow?hx(o.glow):acc};}
const sh=(a=.35,y=18,r=40)=>[{type:'DROP_SHADOW',color:{r:0,g:0,b:0,a},offset:{x:0,y},radius:r,spread:0,visible:true,blendMode:'NORMAL'}];
function fr(T,p,name,x,y,w,h,fill,r=14,fx){const f=figma.createFrame(); f.name=name; f.resize(w,h); f.x=x; f.y=y; f.cornerRadius=r; const c=fill===undefined?T.card:fill; f.fills=c?[{type:'SOLID',color:c}]:[]; f.clipsContent=true; if(fx) f.effects=fx; p.appendChild(f); return f;}
function tx(T,p,str,x,y,size=12,w='r',c,width,align){const t=figma.createText(); t.fontName={family:T.F,style:T.W[w]}; t.fontSize=size; t.characters=String(str); t.fills=[{type:'SOLID',color:c||T.ink}]; if(width){t.textAutoResize='HEIGHT'; t.resize(width,t.height);} if(align) t.textAlignHorizontal=align; p.appendChild(t); t.x=x; t.y=y; return t;}
function rect(p,x,y,w,h,c,r=0,op=1){const q=figma.createRectangle(); q.resize(Math.max(1,w),Math.max(1,h)); q.x=x; q.y=y; q.cornerRadius=r; q.fills=[{type:'SOLID',color:c,opacity:op}]; p.appendChild(q); return q;}
function circ(p,x,y,d,c,op=1){const e=figma.createEllipse(); e.resize(d,d); e.x=x; e.y=y; e.fills=[{type:'SOLID',color:c,opacity:op}]; p.appendChild(e); return e;}
function vec(p,d,c,wd=1.8,dash,fill){const v=figma.createVector(); v.vectorPaths=[{windingRule:'NONZERO',data:d}]; v.strokes=c?[{type:'SOLID',color:c}]:[]; v.strokeWeight=wd; v.strokeCap='ROUND'; v.strokeJoin='ROUND'; v.fills=fill?[{type:'SOLID',color:fill}]:[]; if(dash) v.dashPattern=[6,5]; p.appendChild(v); return v;}
function arc(p,cx,cy,r,a0,a1,c,wd){let d=''; const n=64; for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n; d+=(i?' L ':'M ')+(cx+r*Math.cos(a)).toFixed(2)+' '+(cy+r*Math.sin(a)).toFixed(2);} return vec(p,d,c,wd);}
function glow(T,p,x,y,w,h,op=.24){const e=figma.createEllipse(); e.name='glow'; e.resize(w,h); e.x=x; e.y=y; e.fills=[{type:'SOLID',color:T.glow,opacity:op}]; e.effects=[{type:'LAYER_BLUR',radius:Math.max(w,h)*.35,visible:true}]; p.appendChild(e);}
function pill(T,p,str,x,y,bg,fg,size=10){const f=figma.createFrame(); f.name='pill'; f.layoutMode='HORIZONTAL'; f.primaryAxisSizingMode='AUTO'; f.counterAxisSizingMode='AUTO'; f.paddingLeft=f.paddingRight=10; f.paddingTop=f.paddingBottom=4; f.cornerRadius=20; f.fills=[{type:'SOLID',color:bg||T.accL}]; const t=figma.createText(); t.fontName={family:T.F,style:T.W.m}; t.fontSize=size; t.characters=String(str); t.fills=[{type:'SOLID',color:fg||T.ink}]; f.appendChild(t); p.appendChild(f); f.x=x; f.y=y; return f;}
const tone=(T,k)=>({ok:[T.okL,T.ok],bad:[T.redL,T.red],warn:[T.ambL,T.amb],info:[T.accL,T.accT]}[k||'info']);
function check(T,p,x,y,ok=true,d=16){circ(p,x,y,d,ok?T.acc:T.red); const k=d/16; if(ok) vec(p,`M ${x+4.5*k} ${y+8.5*k} L ${x+7*k} ${y+11*k} L ${x+11.5*k} ${y+5.5*k}`,T.onAcc,1.8*k); else {rect(p,x+7*k,y+4*k,2*k,5.5*k,{r:1,g:1,b:1},1); rect(p,x+7*k,y+10.5*k,2*k,2*k,{r:1,g:1,b:1},1);}}
function initials(s){return String(s).split(/\s+/).filter(w=>/^[A-Z]/.test(w)).slice(0,2).map(w=>w[0]).join('')||'•';}
function avatar(T,p,x,y,d,i,name){if(T.av.length){const e=figma.createEllipse(); e.resize(d,d); e.x=x; e.y=y; e.fills=[{type:'IMAGE',imageHash:T.av[i%T.av.length],scaleMode:'FILL'}]; p.appendChild(e); return e;}
 circ(p,x,y,d,T.accL); tx(T,p,initials(name||'A B'),x,y+d/2-d*.22,d*.32,'s',T.accT,d,'CENTER');}
function icon(T,p,kind,x,y,s,c){c=c||T.acc; const k=s/24, sw=1.8*Math.max(1,k*.8);
 const Q=(pts)=>pts.map(([a,b],i)=>(i?'L ':'M ')+(x+a*k).toFixed(1)+' '+(y+b*k).toFixed(1)).join(' ');
 const C=(cx,cy,r)=>arc(p,x+cx*k,y+cy*k,r*k,0,Math.PI*2,c,sw);
 const box=(bx,by,bw,bh,rr)=>{const r=rect(p,x+bx*k,y+by*k,bw*k,bh*k,c,rr*k); r.fills=[]; r.strokes=[{type:'SOLID',color:c}]; r.strokeWeight=sw;};
 if(kind==='shield'){vec(p,`M ${x+12*k} ${y+2*k} L ${x+21*k} ${y+6*k} L ${x+21*k} ${y+12*k} C ${x+21*k} ${y+17*k} ${x+17*k} ${y+21*k} ${x+12*k} ${y+23*k} C ${x+7*k} ${y+21*k} ${x+3*k} ${y+17*k} ${x+3*k} ${y+12*k} L ${x+3*k} ${y+6*k} Z`,c,sw); vec(p,Q([[8,12.5],[11,15.5],[16.5,9.5]]),c,sw);}
 else if(kind==='lock'){box(4,10,16,12,3); vec(p,`M ${x+8*k} ${y+10*k} L ${x+8*k} ${y+7*k} C ${x+8*k} ${y+2*k} ${x+16*k} ${y+2*k} ${x+16*k} ${y+7*k} L ${x+16*k} ${y+10*k}`,c,sw);}
 else if(kind==='users'){C(9,8,3.5); vec(p,Q([[2,20],[3,16],[6,14],[12,14],[15,16],[16,20]]),c,sw); C(17,9,2.8); vec(p,Q([[17,14],[20,15],[22,19]]),c,sw);}
 else if(kind==='cloud'){vec(p,`M ${x+7*k} ${y+19*k} L ${x+18*k} ${y+19*k} C ${x+23*k} ${y+19*k} ${x+23*k} ${y+11*k} ${x+18*k} ${y+11*k} C ${x+17*k} ${y+5*k} ${x+8*k} ${y+5*k} ${x+7.5*k} ${y+11*k} C ${x+2*k} ${y+11*k} ${x+2*k} ${y+19*k} ${x+7*k} ${y+19*k} Z`,c,sw);}
 else if(kind==='bolt'){vec(p,Q([[13,2],[5,14],[11,14],[10,22],[19,9],[13,9],[13,2]]),c,sw);}
 else if(kind==='doc'){vec(p,Q([[6,2],[15,2],[19,6],[19,22],[6,22],[6,2]]),c,sw); vec(p,Q([[9,11],[16,11]]),c,sw); vec(p,Q([[9,15],[16,15]]),c,sw);}
 else if(kind==='home'){vec(p,Q([[3,11],[12,3],[21,11]]),c,sw); vec(p,Q([[5,9.5],[5,21],[19,21],[19,9.5]]),c,sw); vec(p,Q([[10,21],[10,15],[14,15],[14,21]]),c,sw);}
 else if(kind==='chart'){vec(p,Q([[3,21],[21,21]]),c,sw); rect(p,x+5*k,y+12*k,3*k,8*k,c,1); rect(p,x+11*k,y+7*k,3*k,13*k,c,1); rect(p,x+17*k,y+3*k,3*k,17*k,c,1);}
 else if(kind==='mail'){box(3,6,18,13,2); vec(p,Q([[3.5,7],[12,13.5],[20.5,7]]),c,sw);}
 else if(kind==='bell'){vec(p,`M ${x+6*k} ${y+17*k} L ${x+6*k} ${y+11*k} C ${x+6*k} ${y+4*k} ${x+18*k} ${y+4*k} ${x+18*k} ${y+11*k} L ${x+18*k} ${y+17*k} L ${x+20*k} ${y+19*k} L ${x+4*k} ${y+19*k} Z`,c,sw); vec(p,Q([[10,21],[14,21]]),c,sw);}
 else if(kind==='phone'){box(7,2,10,20,3); vec(p,Q([[11,18.5],[13,18.5]]),c,sw);}
 else if(kind==='db'){arc(p,x+12*k,y+6*k,8*k,0,Math.PI*2,c,sw); vec(p,`M ${x+4*k} ${y+6*k} L ${x+4*k} ${y+18*k} C ${x+4*k} ${y+22*k} ${x+20*k} ${y+22*k} ${x+20*k} ${y+18*k} L ${x+20*k} ${y+6*k}`,c,sw); vec(p,`M ${x+4*k} ${y+12*k} C ${x+4*k} ${y+16*k} ${x+20*k} ${y+16*k} ${x+20*k} ${y+12*k}`,c,sw);}
 else if(kind==='gear'){C(12,12,3.5); C(12,12,8);}
 else if(kind==='card'){box(2,5,20,14,3); vec(p,Q([[2,10],[22,10]]),c,sw); vec(p,Q([[6,15],[10,15]]),c,sw);}
 else if(kind==='search'){C(10,10,6.5); vec(p,Q([[15,15],[21,21]]),c,sw);}
 else if(kind==='globe'){C(12,12,9); vec(p,Q([[3,12],[21,12]]),c,sw); vec(p,`M ${x+12*k} ${y+3*k} C ${x+7*k} ${y+8*k} ${x+7*k} ${y+16*k} ${x+12*k} ${y+21*k} C ${x+17*k} ${y+16*k} ${x+17*k} ${y+8*k} ${x+12*k} ${y+3*k}`,c,sw);}
 else if(kind==='chat'){vec(p,`M ${x+4*k} ${y+5*k} L ${x+20*k} ${y+5*k} L ${x+20*k} ${y+16*k} L ${x+10*k} ${y+16*k} L ${x+6*k} ${y+20*k} L ${x+6*k} ${y+16*k} L ${x+4*k} ${y+16*k} Z`,c,sw);}
 else if(kind==='star'){vec(p,Q([[12,2.5],[14.8,8.6],[21.5,9.3],[16.4,13.8],[17.9,20.5],[12,17],[6.1,20.5],[7.6,13.8],[2.5,9.3],[9.2,8.6],[12,2.5]]),c,sw);}
 else if(kind==='code'){vec(p,Q([[8,7],[3,12],[8,17]]),c,sw); vec(p,Q([[16,7],[21,12],[16,17]]),c,sw); vec(p,Q([[13.5,5],[10.5,19]]),c,sw);}
 else if(kind==='rocket'){vec(p,`M ${x+12*k} ${y+2*k} C ${x+17*k} ${y+6*k} ${x+17*k} ${y+13*k} ${x+15*k} ${y+17*k} L ${x+9*k} ${y+17*k} C ${x+7*k} ${y+13*k} ${x+7*k} ${y+6*k} ${x+12*k} ${y+2*k} Z`,c,sw); vec(p,Q([[9,14],[5,18],[9,18]]),c,sw); vec(p,Q([[15,14],[19,18],[15,18]]),c,sw); C(12,9,1.8);}
 else if(kind==='box'){vec(p,Q([[3,7],[12,3],[21,7],[21,17],[12,21],[3,17],[3,7]]),c,sw); vec(p,Q([[3,7],[12,11],[21,7]]),c,sw); vec(p,Q([[12,11],[12,21]]),c,sw);}
 else if(kind==='qr'){box(3,3,7,7,1); box(14,3,7,7,1); box(3,14,7,7,1); rect(p,x+14*k,y+14*k,3*k,3*k,c,0); rect(p,x+18*k,y+18*k,3*k,3*k,c,0);}
 else if(kind==='play'){C(12,12,9); vec(p,Q([[10,8],[16,12],[10,16],[10,8]]),c,sw);}
 else if(kind==='music'){vec(p,Q([[9,18],[9,5],[20,3],[20,16]]),c,sw); C(7,18,2.5); C(18,16,2.5);}
 else if(kind==='heart'){vec(p,`M ${x+12*k} ${y+20*k} C ${x+2*k} ${y+13*k} ${x+3*k} ${y+4*k} ${x+9*k} ${y+5*k} C ${x+11*k} ${y+5.5*k} ${x+12*k} ${y+7*k} ${x+12*k} ${y+7*k} C ${x+12*k} ${y+7*k} ${x+13*k} ${y+5.5*k} ${x+15*k} ${y+5*k} C ${x+21*k} ${y+4*k} ${x+22*k} ${y+13*k} ${x+12*k} ${y+20*k} Z`,c,sw);}
 else if(kind==='calendar'){box(3,5,18,16,2); vec(p,Q([[3,10],[21,10]]),c,sw); vec(p,Q([[8,3],[8,7]]),c,sw); vec(p,Q([[16,3],[16,7]]),c,sw);}
 else if(kind==='pin'){vec(p,`M ${x+12*k} ${y+22*k} C ${x+6*k} ${y+15*k} ${x+5*k} ${y+12*k} ${x+5*k} ${y+9*k} C ${x+5*k} ${y+5*k} ${x+8*k} ${y+2*k} ${x+12*k} ${y+2*k} C ${x+16*k} ${y+2*k} ${x+19*k} ${y+5*k} ${x+19*k} ${y+9*k} C ${x+19*k} ${y+12*k} ${x+18*k} ${y+15*k} ${x+12*k} ${y+22*k} Z`,c,sw); C(12,9,2.5);}
 else {C(12,12,9);}}
function iconBadge(T,p,kind,x,y,d,bg,c){circ(p,x,y,d,bg||T.accL); icon(T,p,kind,x+d*.2,y+d*.2,d*.6,c||T.accT);}
const L={hx,theme,sh,fr,tx,rect,circ,vec,arc,glow,pill,check,avatar,icon,iconBadge,tone};
// ---------------- compositions (slot 636x509) ----------------
L.flow=(T,t,d)=>{glow(T,t,100,40,440,300,.2);
 for(let i=2;i>=1;i--){const s=fr(T,t,'sheet',58+i*14,28+i*10,520,300,T.dark?T.soft:{r:.92,g:.94,b:.96},16,sh(.25,10,30)); s.opacity=.75;}
 const a=fr(T,t,d.title,58,28,520,300,undefined,16,sh());
 tx(T,a,d.title,24,18,15,'s',T.ink,360); tx(T,a,d.sub||'',24,42,10,'r',T.grey,330); if(d.badge){const p=pill(T,a,d.badge,0,20,T.accL,T.accT,10); p.x=496-p.width;}
 const colY=(n,i)=>n===1?143:(n===2?[96,190][i]:[78,143,208][i]);
 const box=(nm,sub,x,y,w,bad)=>{const b=fr(T,a,nm,x,y,w,56,T.soft,10); b.strokes=[{type:'SOLID',color:bad?T.red:T.accL}]; b.strokeWeight=1.5; const tn=tx(T,b,nm,10,8,10,'s',T.ink,w-14); tx(T,b,sub||'',10,tn.y+tn.height+2,8.5,'r',T.grey,w-14);};
 const Ls=d.left.map((n,i)=>[24,colY(d.left.length,i),112]); const H=[204,143,116]; const Rs=d.right.map((n,i)=>[384,colY(d.right.length,i),112]);
 const link=(A,B,bad)=>{const x1=A[0]+A[2],y1=A[1]+28,x2=B[0],y2=B[1]+28,xm=(x1+x2)/2; vec(a,`M ${x1} ${y1} L ${xm} ${y1} L ${xm} ${y2} L ${x2} ${y2}`,bad?T.red:T.acc,1.6,bad);};
 Ls.forEach((A,i)=>link(A,H,d.left[i][2])); Rs.forEach((B,i)=>link(H,B,d.right[i][2]));
 d.left.forEach((n,i)=>box(n[0],n[1],24,Ls[i][1],112,n[2])); box(d.hub[0],d.hub[1],204,143,116); d.right.forEach((n,i)=>box(n[0],n[1],384,Rs[i][1],112,n[2]));
 let cx=24; (d.chips||[]).slice(0,4).forEach(([s,ok],i)=>{const c=fr(T,t,'chip',cx,370+(i%2)*14,140,58,undefined,12,sh(.3,10,24)); check(T,c,14,21,ok!==false,18); tx(T,c,s,40,12,10.5,'s',T.ink,92); cx+=150;});};
L.emblem=(T,t,d)=>{glow(T,t,20,120,320,320,.3);
 circ(t,52,128,236,T.glow,.10); circ(t,82,158,176,T.glow,.16);
 const em=fr(T,t,'emblem',110,186,120,120,T.card,60,sh(.35,14,30)); icon(T,em,d.icon||'shield',30,30,60,T.accT);
 if(d.badge){const p=pill(T,t,d.badge,0,330,T.acc,T.onAcc,11); p.x=170-p.width/2;}
 tx(T,t,d.title,20,368,14,'s',{r:1,g:1,b:1},300,'CENTER'); tx(T,t,d.sub||'',20,392,10.5,'r',{r:.75,g:.8,b:.83},300,'CENTER');
 d.rows.slice(0,5).forEach(([ti,meta,st,k],i)=>{const [bg,fg]=tone(T,k); const r=fr(T,t,'row',330+(i%2?18:0),52+i*84,270,64,undefined,14,sh(.3,10,24)); circ(r,14,18,28,bg); circ(r,24,28,8,fg); tx(T,r,ti,52,13,11.5,'s',T.ink,130); tx(T,r,meta||'',52,33,9.5,'r',T.grey,130); const pl=pill(T,r,st,0,20,bg,fg,9.5); pl.x=256-pl.width;});};
L.gauge=(T,t,d)=>{glow(T,t,170,40,300,300,.3);
 const g=fr(T,t,'gauge',158,30,320,300,undefined,24,sh());
 const a0=Math.PI*.75, sw=Math.PI*1.5; arc(g,160,140,92,a0,a0+sw,T.line,16); arc(g,160,140,92,a0,a0+sw*(d.fill||.9),T.acc,16);
 tx(T,g,d.value,0,104,d.vsize||40,'b',T.ink,320,'CENTER'); tx(T,g,d.label,40,158,11,'r',T.grey,240,'CENTER');
 if(d.pill){const p=pill(T,g,d.pill,0,244,T.acc,T.onAcc,11); p.x=160-p.width/2;}
 const s=fr(T,t,'trend',36,360,564,118,undefined,16,sh(.3,12,30)); tx(T,s,d.chartTitle,20,14,11.5,'s',T.ink,400);
 const up=d.to>d.from, n=10, X=i=>30+i*50, Y=v=>104-v*.62; const pts=[]; for(let i=0;i<=n;i++){const e=1-Math.pow(1-i/n,2.2); pts.push([X(i),Y(d.from+(d.to-d.from)*e)]);}
 vec(s,'M '+pts.map(p=>p[0]+' '+p[1].toFixed(1)).join(' L '),T.acc,2.5);
 circ(s,pts[0][0]-5,pts[0][1]-5,10,T.line); tx(T,s,d.fromLabel,pts[0][0]+10,pts[0][1]+(up?-18:4),10,'s',T.grey,110);
 circ(s,pts[n][0]-6,pts[n][1]-6,12,T.acc); tx(T,s,d.toLabel,pts[n][0]-130,pts[n][1]+(up?4:-22),10,'s',T.accT,120,'RIGHT');
 (d.floats||[]).slice(0,2).forEach(([lab,kind],i)=>{const x=i?500:28, y=i?96:64; if(kind==='avatar') avatar(T,t,x+10,y,56,i,lab); else {const b=fr(T,t,'ic',x+10,y,56,56,T.card,28,sh(.3,8,20)); icon(T,b,kind||'bolt',14,14,28,T.accT);} const b=fr(T,t,'float',x,y+64,110,30,undefined,15,sh(.3,8,20)); circ(b,10,10,10,T.acc); tx(T,b,lab,26,7,10,'s',T.ink,80);});};
L.phone=(T,t,d)=>{glow(T,t,300,40,320,420,.28);
 const em=fr(T,t,'card',30,70,300,330,undefined,16,sh()); em.rotation=4;
 if(T.logo&&!d.brand){const lg=rect(em,20,18,110,28,T.card); lg.fills=[{type:'IMAGE',imageHash:T.logo,scaleMode:'FIT'}];} else {iconBadge(T,em,d.cardIcon||'mail',20,16,32); tx(T,em,d.brand||'',60,22,12,'s',T.ink,200);}
 rect(em,20,58,260,1,T.line); tx(T,em,d.card.title,20,72,14,'s',T.ink,260);
 let y=118; (d.card.lines||[]).slice(0,4).forEach(([k,v])=>{tx(T,em,k,20,y,10,'r',T.grey,110); tx(T,em,v,130,y,10.5,'m',T.ink,150); y+=28;});
 if(d.card.btn){const bt=fr(T,em,'btn',20,262,180,36,T.acc,8); tx(T,bt,d.card.btn,0,9,11,'s',T.onAcc,180,'CENTER');}
 const ph=fr(T,t,'phone',360,26,236,470,{r:.07,g:.08,b:.1},36,sh(.45,20,40)); ph.strokes=[{type:'SOLID',color:{r:.25,g:.27,b:.3}}]; ph.strokeWeight=3;
 const scr=fr(T,ph,'screen',8,8,220,454,null,30); const dk=mix(T.acc,{r:0,g:0,b:0},.45), dk2=mix(T.acc,{r:0,g:0,b:0},.85);
 scr.fills=[{type:'GRADIENT_LINEAR',gradientTransform:[[0,1,0],[-1,0,1]],gradientStops:[{position:0,color:{...dk,a:1}},{position:1,color:{...dk2,a:1}}]}];
 rect(scr,80,10,60,16,{r:.07,g:.08,b:.1},8); tx(T,scr,d.time||'09:41',0,46,40,'m',{r:1,g:1,b:1},220,'CENTER'); tx(T,scr,d.date||'',0,98,10.5,'r',{r:.9,g:.92,b:.95},220,'CENTER');
 d.notes.slice(0,3).forEach(([a,b],i)=>{const n=fr(T,scr,'note',10,140+i*72,200,62,{r:1,g:1,b:1},14); rect(n,10,12,22,22,T.acc,6); tx(T,n,a,40,10,9,'s',{r:.07,g:.08,b:.1},152); tx(T,n,b,40,26,9.5,'r',{r:.07,g:.08,b:.1},152);});
 if(d.chip){const ok=fr(T,t,'chip',40,420,200,40,undefined,20,sh(.3,8,20)); check(T,ok,12,12,true,16); tx(T,ok,d.chip,36,11,11,'s',T.ink,156);}};
L.table=(T,t,d)=>{glow(T,t,60,60,460,360,.2);
 const c=fr(T,t,'table',26,34,470,340,undefined,16,sh()); c.rotation=-2;
 tx(T,c,d.title,20,16,14,'s',T.ink,300); tx(T,c,d.sub||'',20,38,10,'r',T.grey,300); if(d.badge){const p=pill(T,c,d.badge,0,18,T.accL,T.accT,9.5); p.x=450-p.width;}
 const xs=[20,190,330]; d.cols.slice(0,3).forEach((h,i)=>tx(T,c,h.toUpperCase(),xs[i],70,8.5,'m',T.grey,140));
 d.rows.slice(0,5).forEach((r,i)=>{const y=92+i*46; if(i===d.hi) rect(c,10,y-8,450,40,T.accL,8); else rect(c,20,y-8,430,1,T.line);
  tx(T,c,r[0],xs[0],y+3,11,'m',T.ink,160); tx(T,c,r[1],xs[1],y+3,10.5,'r',T.grey,130); const [bg,fg]=tone(T,r[3]); pill(T,c,r[2],xs[2],y,bg,fg,9.5);});
 const p=fr(T,t,'detail',318,286,290,196,undefined,16,sh(.4,16,36));
 iconBadge(T,p,d.pop.icon||'doc',18,18,40); tx(T,p,d.pop.title,68,20,12.5,'s',T.ink,200); tx(T,p,d.pop.sub||'',68,40,9.5,'r',T.grey,200);
 let y=78; d.pop.lines.slice(0,3).forEach(([k,v])=>{tx(T,p,k,18,y,10,'r',T.grey,110); tx(T,p,v,130,y,10.5,'s',T.ink,145); y+=24;});
 if(d.pop.btn){const b=fr(T,p,'btn',18,150,254,32,T.acc,8); tx(T,b,d.pop.btn,0,8,11,'s',T.onAcc,254,'CENTER');}};
L.kpis=(T,t,d)=>{glow(T,t,120,40,400,300,.22);
 const c=fr(T,t,'chart',28,28,580,270,undefined,18,sh()); tx(T,c,d.title,22,18,14,'s',T.ink,400); tx(T,c,d.sub||'',22,40,10,'r',T.grey,360); if(d.badge){const p=pill(T,c,d.badge,0,20,T.accL,T.accT,9.5); p.x=558-p.width;}
 const v=d.bars, mx=Math.max(...v), n=v.length, bw=Math.min(36,(520/n)-10), base=232;
 for(let i=0;i<4;i++) rect(c,22,base-i*42,536,1,T.line);
 v.forEach((x,i)=>{const h=Math.max(6,x/mx*150), X=30+i*(520/n); rect(c,X,base-h,bw,h,i===(d.hi??n-1)?T.acc:T.accL,Math.min(6,bw/3)); if(d.labels) tx(T,c,d.labels[i],X-8,base+8,8.5,'r',T.grey,bw+16,'CENTER');});
 d.tiles.slice(0,3).forEach(([lab,val,delta,k],i)=>{const b=fr(T,t,'kpi',36+i*196,318+(i===1?-12:6),180,128,undefined,16,sh(.35,14,30)); tx(T,b,lab,16,16,10,'r',T.grey,150); tx(T,b,val,16,38,24,'b',T.ink,150); if(delta){const [bg,fg]=tone(T,k||'ok'); pill(T,b,delta,16,86,bg,fg,9.5);}});};
L.steps=(T,t,d)=>{glow(T,t,60,120,520,280,.22);
 tx(T,t,d.title,32,28,16,'s',{r:1,g:1,b:1},560); tx(T,t,d.sub||'',32,52,10.5,'r',{r:.75,g:.8,b:.85},560);
 const s=d.steps.slice(0,5), n=s.length, X=i=>70+i*(496/(n-1)), Y=262, cur=d.current??n-1;
 rect(t,70,Y-1,496,3,{r:1,g:1,b:1},2,.25); rect(t,70,Y-1,(496/(n-1))*cur,3,T.acc,2);
 s.forEach(([nm,sub],i)=>{const done=i<=cur; circ(t,X(i)-12,Y-12,24,done?T.acc:T.card); if(done) check(T,t,X(i)-8,Y-8,true,16); else tx(T,t,String(i+1),X(i)-12,Y-7,11,'s',T.ink,24,'CENTER');
  const up=i%2===0, cw=n>4?116:130, ch=104; const c=fr(T,t,'step',Math.min(636-cw-10,Math.max(10,X(i)-cw/2)),up?Y-30-ch:Y+30,cw,ch,undefined,14,sh(.3,10,24));
  tx(T,c,'0'+(i+1),14,12,10,'s',T.accT); tx(T,c,nm,14,30,11,'s',T.ink,cw-24); tx(T,c,sub||'',14,66,9,'r',T.grey,cw-24);});
 if(d.note){const p=pill(T,t,d.note,0,462,T.acc,T.onAcc,11); p.x=318-p.width/2;}};
L.profiles=(T,t,d)=>{glow(T,t,150,60,340,380,.26);
 const pos=[[36,118,-6],[384,118,6],[198,50,0]];
 [0,1,2].forEach(k=>{const [x,y,rot]=pos[k], c=d.cards[k]; if(!c) return; const w=k===2?240:216, h=k===2?370:320; const f=fr(T,t,'profile',x,y,w,h,undefined,18,sh(.4,16,36)); f.rotation=rot;
  rect(f,0,0,w,70,T.accL); if(d.icon) iconBadge(T,f,d.icon,w/2-36,34,72,T.card); else avatar(T,f,w/2-36,34,72,k,c[0]);
  tx(T,f,c[0],10,118,13,'s',T.ink,w-20,'CENTER'); tx(T,f,c[1],10,140,10,'r',T.grey,w-20,'CENTER');
  let px=16, py=172; (c[2]||[]).slice(0,3).forEach(tg=>{const p=pill(T,f,tg,px,py,T.soft,T.ink,9); if(px+p.width>w-16){px=16; py+=28; p.x=px; p.y=py;} px+=p.width+6;});
  if(c[3]){tx(T,f,c[3],16,h-112,22,'b',T.accT,w-32,'CENTER'); tx(T,f,c[4]||'',16,h-80,9.5,'r',T.grey,w-32,'CENTER');}
  const b=fr(T,f,'btn',16,h-48,w-32,32,k===2?T.acc:T.soft,8); tx(T,b,c[5]||'View profile',0,8,11,'s',k===2?T.onAcc:T.ink,w-32,'CENTER');});
 if(d.badge){const p=pill(T,t,d.badge,0,20,T.acc,T.onAcc,11); p.x=318-p.width/2;}};
L.chat=(T,t,d)=>{glow(T,t,100,40,440,420,.26);
 const c=fr(T,t,'chat',96,30,420,450,undefined,20,sh());
 rect(c,0,0,420,64,T.soft); iconBadge(T,c,d.icon||'chat',16,12,40); tx(T,c,d.title,66,14,13,'s',T.ink,260); tx(T,c,d.sub||'',66,34,9.5,'r',T.ok,260);
 let y=84; d.msgs.slice(0,4).forEach(([side,txt])=>{const me=side==='me', w=250; const b=fr(T,c,'bubble',me?420-w-16:16,y,w,10,me?T.acc:T.soft,14); const tt=tx(T,b,txt,14,10,10.5,'r',me?T.onAcc:T.ink,w-28); b.resize(w,tt.height+20); y+=b.height+12;});
 const inp=fr(T,c,'input',16,450-58,388,42,T.soft,21); tx(T,inp,d.input||'Type a message…',16,12,10.5,'r',T.grey,300); circ(inp,350,6,30,T.acc); vec(inp,'M 358 21 L 372 21 M 366 15 L 372 21 L 366 27',T.onAcc,2);
 if(d.badge){const b=fr(T,t,'badge',466,334,156,74,undefined,16,sh(.35,12,28)); iconBadge(T,b,d.badgeIcon||'bolt',12,17,40); tx(T,b,d.badge[0],60,16,15,'b',T.ink,88); tx(T,b,d.badge[1],60,40,9,'r',T.grey,88);}};
L.compare=(T,t,d)=>{glow(T,t,320,60,300,380,.28);
 const l=fr(T,t,'before',28,92,250,320,T.dark?T.soft:{r:.93,g:.94,b:.95},16,sh(.3,12,30)); l.rotation=-3; l.opacity=.85;
 pill(T,l,d.left.tag||'Before',18,18,T.line,T.grey,9.5); tx(T,l,d.left.title,18,52,13,'s',T.grey,214);
 d.left.items.slice(0,5).forEach((s,i)=>{circ(l,18,96+i*40,14,T.redL); rect(l,23,101+i*40,4,4,T.red,2); tx(T,l,s,42,93+i*40,10.5,'r',T.grey,190);});
 const r=fr(T,t,'after',330,52,280,380,undefined,18,sh(.4,16,36)); pill(T,r,d.right.tag||'After',20,20,T.acc,T.onAcc,9.5); tx(T,r,d.right.title,20,56,14,'s',T.ink,240);
 d.right.items.slice(0,5).forEach((s,i)=>{check(T,r,20,104+i*44,true,18); tx(T,r,s,48,103+i*44,11,'m',T.ink,212);});
 if(d.right.metric){rect(r,20,322,240,1,T.line); tx(T,r,d.right.metric,20,334,16,'b',T.accT,240);}
 const a=fr(T,t,'arrow',286,214,56,56,T.acc,28,sh(.35,10,24)); vec(a,'M 16 28 L 40 28 M 31 19 L 40 28 L 31 37',T.onAcc,2.6);
 if(d.arrow){const p=pill(T,t,d.arrow,0,462,T.card,T.ink,10.5); p.x=318-p.width/2;}};
L.ovcard=(T,od,d)=>{od.children.filter(n=>n.name.startsWith('UI panel')||n.name==='overview card').forEach(n=>n.remove());
 const m=fr(T,od,'overview card',22,262,286,262,undefined,18,sh(.4,16,36));
 tx(T,m,d.title,18,16,13,'s',T.ink,200); tx(T,m,d.sub||'',18,36,9.5,'r',T.grey,200); if(d.icon) iconBadge(T,m,d.icon,232,14,36);
 let y=66;
 if(d.person){avatar(T,m,18,y,52,0,d.person[0]); tx(T,m,d.person[0],80,y+6,12,'s',T.ink,190); tx(T,m,d.person[1]||'',80,y+26,9.5,'r',T.grey,190); y+=66;}
 if(d.big){tx(T,m,d.big[0],18,y,30,'b',T.accT,250); tx(T,m,d.big[1],18,y+40,9.5,'r',T.grey,250); y+=62;}
 (d.rows||[]).slice(0,4-(d.person?1:0)-(d.big?1:0)).forEach(([k,v,kk])=>{tx(T,m,k,18,y,10,'r',T.grey,130); if(kk){const [bg,fg]=tone(T,kk); const p=pill(T,m,v,0,y-3,bg,fg,9.5); p.x=268-p.width;} else tx(T,m,v,150,y,10.5,'s',T.ink,118,'RIGHT'); y+=26;});
 if(d.tags&&y<180){let px=18; d.tags.slice(0,3).forEach(s=>{const p=pill(T,m,s,px,y,T.accL,T.ink,9.5); px+=p.width+6;});}
 const b=fr(T,m,'btn',18,214,250,34,T.acc,8); tx(T,b,d.btn||'Open',0,8,11.5,'s',T.onAcc,250,'CENTER');};
L.redoCase=async(secId,T,tabs,ov)=>{const sec=await figma.getNodeByIdAsync(secId); const G=sec.findOne(n=>n.name==='Solution tabs');
 const slots=G.children.filter(n=>/· 636x509$/.test(n.name)).sort((a,b)=>a.x-b.x); const res=[];
 for(let i=0;i<slots.length&&i<tabs.length;i++){const t=slots[i]; t.children.slice().forEach(c=>c.remove()); t.fills=[{type:'SOLID',color:BGC}]; const [kind,data]=tabs[i]; await L[kind](T,t,data);
  const mname=t.name.replace('636x509','319x260 · mobile'); const old=G.findOne(n=>n.name===mname); const x=old?old.x:t.x, y=old?old.y:600; if(old) old.remove(); const c=t.clone(); G.appendChild(c); c.name=mname; c.rescale(319/636); c.resize(319,260); c.x=x; c.y=y; c.cornerRadius=8; res.push(t.id);}
 if(ov){const od=sec.findOne(n=>/^Overview · .* · 716x573$/.test(n.name)); if(od){L.ovcard(T,od,ov); res.push(od.id);}}
 return res;};
return L;})()
