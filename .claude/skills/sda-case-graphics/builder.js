// sda-case-graphics builder (paste into use_figma on the website file, then call build(config) up to 3 times per call)
const page=await figma.getNodeByIdAsync('398:28244'); await figma.setCurrentPageAsync(page);
const BG={r:.0431,g:.0431,b:.0588}; const FALLBACK='469a3902b6a0f537030e632e3276a699e0c88ca9';
await figma.loadFontAsync({family:'Inter',style:'Regular'});
function depth(f,w,radius){const k=w/789; f.fills=[{type:'SOLID',color:BG}]; f.clipsContent=true; f.cornerRadius=radius??21.9*k; const c={r:.1843,g:.1176,b:.7569};
 const ds=[[33.25,12.67,7.92,.10],[60.17,50.67,33.25,.09],[80.76,112.42,72.84,.05],[95.01,199.51,129.84,.01],[104.51,313.52,202.68,0]].map(([r,x,y,a])=>({type:'DROP_SHADOW',color:{...c,a},offset:{x:x*k,y:y*k},radius:r*k,spread:0,visible:true,blendMode:'NORMAL'}));
 f.effects=[...ds,{type:'INNER_SHADOW',color:{r:1,g:1,b:1,a:.25},offset:{x:12.67*k,y:12.67*k},radius:11.4*k,spread:-4.75*k,visible:true,blendMode:'NORMAL'}];}
async function raw(srcId,s){const src=await figma.getNodeByIdAsync(srcId); const cl=src.clone();
 const fonts=new Set(); cl.findAll(n=>n.type==='TEXT').forEach(t=>{try{t.getStyledTextSegments(['fontName']).forEach(x=>fonts.add(JSON.stringify(x.fontName)))}catch(e){}});
 for(const fn of fonts){try{await figma.loadFontAsync(JSON.parse(fn))}catch(e){}}
 let inst,guard=0; while((inst=cl.findAll(n=>n.type==='INSTANCE')).length&&guard++<20){inst.forEach(i=>{try{if(!i.removed)i.detachInstance()}catch(e){}});}
 const texts=cl.findAll(n=>n.type==='TEXT'); const hs=texts.map(t=>t.height); cl.rescale(s); texts.forEach((t,i)=>{try{t.resize(t.width,hs[i]*s)}catch(e){}}); return {cl,src};}
async function screen(srcId,w,radius){const src=await figma.getNodeByIdAsync(srcId); const s=w/src.width; const {cl}=await raw(srcId,s);
 const wrap=figma.createFrame(); depth(wrap,w,radius); wrap.resize(w,src.height*s); wrap.appendChild(cl); cl.x=0; cl.y=0; wrap.name=src.name; return wrap;}
async function panel(parent,srcId,w,h,s,ox,oy,x,y){const {cl,src}=await raw(srcId,s); const f=figma.createFrame(); depth(f,w*2); f.cornerRadius=10; f.resize(w,h); f.name='UI panel · '+src.name; f.appendChild(cl); cl.x=ox; cl.y=oy; parent.appendChild(f); f.x=x; f.y=y; return f;}
function img(parent,hash,x,y,w,h,name){const r=figma.createRectangle(); r.name=name; r.resize(w,h); r.fills=[{type:'IMAGE',imageHash:hash,scaleMode:'FILL'}]; parent.appendChild(r); r.x=x; r.y=y; return r;}
function glow(parent,x,y,w,h,color,op){const e=figma.createEllipse(); e.name='glow'; e.resize(w,h); e.fills=[{type:'SOLID',color,opacity:op}]; e.effects=[{type:'LAYER_BLUR',radius:Math.max(w,h)*0.35,visible:true}]; parent.appendChild(e); e.x=x; e.y=y; return e;}
// Hero: the device (plus the phone, if any) sits in the centre, because the site puts the title on top.
// Where the cover image stops short of the slot edge, a dark fill and a soft gradient hide the seam.
function heroFade(parent,side,W,H,edge,len,after){const r=figma.createRectangle(); r.name='edge fade';
 if(side==='left'){r.resize(len,H); r.x=edge; r.y=0;} if(side==='right'){r.resize(len,H); r.x=edge-len; r.y=0;}
 if(side==='top'){r.resize(W,len); r.x=0; r.y=edge;} if(side==='bottom'){r.resize(W,len); r.x=0; r.y=edge-len;}
 const from={...BG,a:1}, to={...BG,a:0}; const t=(side==='left'||side==='right')?[[1,0,0],[0,1,0]]:[[0,1,0],[1,0,0]];
 const stops=(side==='left'||side==='top')?[{position:0,color:from},{position:1,color:to}]:[{position:0,color:to},{position:1,color:from}];
 r.fills=[{type:'GRADIENT_LINEAR',gradientTransform:t,gradientStops:stops}]; parent.insertChild(parent.children.indexOf(after)+1,r); return r;}
function heroFill(parent,x,y,w,h,after){const r=figma.createRectangle(); r.name='bg'; r.resize(Math.max(1,w),Math.max(1,h)); r.x=x; r.y=y; r.fills=[{type:'SOLID',color:BG}]; parent.insertChild(parent.children.indexOf(after)+1,r); return r;}
function centerHero(slot,L,maxH,maxW,withPhone){
 const img=slot.children.find(n=>n.type==='RECTANGLE'&&/^(device|laptop)/.test(n.name));
 const phone=withPhone?slot.children.find(n=>n.type==='FRAME'):null; const glows=slot.children.filter(n=>n.name==='glow');
 const W=slot.width,H=slot.height; const s=Math.min(maxH/L.h,maxW/L.w); const Dw=L.w*s,Dh=L.h*s;
 const groupW=phone?Dw-70+phone.width:Dw; const gx=(W-groupW)/2; const ty=(H-Dh)/2;
 img.resize(1920*s,1080*s); img.x=gx-L.x*s; img.y=ty-L.y*s;
 if(phone){phone.x=gx+Dw-70; phone.y=(H-phone.height)/2+6; glows.forEach(g=>{g.x=phone.x-80; g.y=(H-g.height)/2;});}
 const F=Math.min(180,W*0.15); let last=img;
 if(img.x>0){last=heroFill(slot,0,0,img.x,H,last); last=heroFade(slot,'left',W,H,img.x,F,last);}
 if(img.x+img.width<W){last=heroFill(slot,img.x+img.width,0,W-img.x-img.width,H,last); last=heroFade(slot,'right',W,H,img.x+img.width,F,last);}
 if(img.y>0){last=heroFill(slot,0,0,W,img.y,last); last=heroFade(slot,'top',W,H,img.y,F*0.6,last);}
 if(img.y+img.height<H){last=heroFill(slot,0,img.y+img.height,W,H-img.y-img.height,last); last=heroFade(slot,'bottom',W,H,img.y+img.height,F*0.6,last);}}
async function build(C){
 const P=C.P; const svc=await figma.getNodeByIdAsync('3351:262928');
 const sec=figma.createSection(); sec.name='Case images · '+P; page.appendChild(sec); sec.x=C.X; sec.y=-707; sec.resizeWithoutConstraints(4400,4300);
 try{sec.fills=JSON.parse(JSON.stringify(svc.fills));}catch(e){}
 const grp=(name,x,y,w,h)=>{const g=figma.createFrame(); g.name=name; g.fills=[]; g.clipsContent=false; g.resize(w,h); sec.appendChild(g); g.x=x; g.y=y; return g;};
 const slot=(parent,name,w,h,x,y)=>{const f=figma.createFrame(); f.name=name; f.resize(w,h); f.fills=[{type:'SOLID',color:BG}]; f.clipsContent=true; f.cornerRadius=8; parent.appendChild(f); f.x=x; f.y=y; return f;};
 const note=figma.createText(); note.fontName={family:'Inter',style:'Regular'}; note.fontSize=28; note.characters='Case page: '+C.url; note.fills=[{type:'SOLID',color:{r:1,g:1,b:1}}]; sec.appendChild(note); note.x=100; note.y=30; note.name='Case page URL';
 const srcG=grp('Sources (from case-presentation)',100,100,4100,1100); const S={}; let sx=0;
 for(const [key,id,nm] of C.src){const n=await figma.getNodeByIdAsync(id); n.name='src · '+nm; srcG.appendChild(n); n.x=sx; n.y=0; sx+=n.width+60; const sz=await figma.getImageByHash(n.fills[0].imageHash).getSizeAsync(); S[key]={h:n.fills[0].imageHash,w:sz.width,ht:sz.height};} // real image size: upload frames are not always image-shaped, FILL would crop heads
 const L=C.L, COV=S.cover&&S.cover.h, PER=S.person;
 const DASH=C.tall||C.desk, WIDE=C.desk||C.tall;
 function cover(parent,s,tx,ty,W,H){let x=tx-L.x*s,y=ty-L.y*s; let w=1920*s,h=1080*s; const k0=Math.max(1,W/w,H/h); if(k0>1){s*=k0; w*=k0; h*=k0; x=tx-L.x*s; y=ty-L.y*s;} x=Math.min(0,Math.max(W-w,x)); y=Math.min(0,Math.max(H-h,y)); return img(parent,COV,x,y,w,h,'device (presentation cover)');}
 async function phone(parent,w,x,y,rot){ if(!C.mob) return null; const m=await screen(C.mob,w,w*0.12); parent.appendChild(m); m.x=x; m.y=y; m.rotation=rot||0; return m;}
 async function uiCard(parent,x,y,w){ if(WIDE){ return panel(parent,WIDE,w,w*0.68,0.5,-(C.px??40),-(C.py??60),x,y);} return phone(parent,w*0.55,x+20,y,-6);}
 // Hero
 const hero=grp('Hero',100,1400,2000,520); const hd=slot(hero,`Hero · ${P} · 1360x510`,1360,510,0,0);
 if(COV){img(hd,COV,0,0,10,10,'device (presentation cover)'); if(!C.coverPhones&&C.mob){glow(hd,1000,110,380,320,C.acc,.2); await phone(hd,200,1060,70,-6);} centerHero(hd,L,420,900,!C.coverPhones&&!!C.mob);}
 else {glow(hd,300,40,700,420,C.acc,.18); const d=await screen(WIDE,820); hd.appendChild(d); d.x=90; d.y=70; d.rotation=-4; glow(hd,1000,110,380,320,C.acc,.2); await phone(hd,200,1060,70,-6);}
 const hm=slot(hero,`Hero · ${P} · 343x240 · mobile`,343,240,1460,0);
 if(COV){img(hm,COV,0,0,10,10,'device (presentation cover)'); centerHero(hm,L,190,290,false);} else {glow(hm,60,20,220,200,C.acc,.2); const d=await screen(WIDE,300); hm.appendChild(d); d.x=21.5; d.y=(240-d.height)/2;}
 // Overview
 const ov=grp('Overview card',100,2050,760,600); const od=slot(ov,`Overview · ${P} · 716x573`,716,573,0,0);
 glow(od,330,260,520,380,C.acc,.2);
 if(DASH){const dash=await screen(C.tall||C.desk,760); od.appendChild(dash); dash.rotation=-7; dash.x=230; dash.y=215; await uiCard(od,24,300,260);}
 else {await phone(od,230,250,215,-7); await phone(od,230,450,250,5); if(PER) img(od,PER.h,10,573-340,340*PER.w/PER.ht,340,'person');}
 // Related case card
 const cdg=grp('Related case card',2300,2050,900,460);
 const c1=slot(cdg,`Card · ${P} · 440x440`,440,440,0,0), c2=slot(cdg,`Card · ${P} · 343x343 · mobile`,343,343,500,0);
 if(COV){let s=Math.min(400/L.w,250/L.h); cover(c1,s,(440-L.w*s)/2,40,440,440); s=Math.min(310/L.w,195/L.h); cover(c2,s,(343-L.w*s)/2,30,343,343);}
 else {glow(c1,60,20,320,260,C.acc,.22); let d=await screen(WIDE,760); c1.appendChild(d); d.rotation=-8; d.x=-40; d.y=50; glow(c2,40,10,260,220,C.acc,.22); d=await screen(WIDE,600); c2.appendChild(d); d.rotation=-8; d.x=-30; d.y=40;}
 // Solution tabs
 const g=grp('Solution tabs',100,2900,4300,900); const W=636,H=509; const tabs=[];
 for(const [i,[title,kind]] of C.sol.entries()){
  const t=slot(g,`Solution ${i+1} · ${title} · ${P} · 636x509`,W,H,i*700,0);
  if(kind==='whole'){const src=await figma.getNodeByIdAsync(DASH); const sc=Math.max(W/src.width,H/src.height); const d=await screen(DASH,src.width*sc,0); t.appendChild(d); d.effects=[]; d.x=0; d.y=0;}
  if(kind==='zoom'){const d=await screen(DASH,1100,0); t.appendChild(d); d.effects=[]; d.x=C.zoomX??-40; d.y=H-d.height; d.name+=' (zoom)';}
  if(kind==='desk'){glow(t,120,80,420,320,C.acc,.2); const d=await screen(WIDE,600); t.appendChild(d); d.rotation=-5; d.x=40; d.y=90;}
  if(kind==='phones'){glow(t,170,90,300,330,C.acc,.2); await phone(t,220,110,40,-5); await phone(t,220,330,110,6);}
  if(kind==='phone1'){glow(t,150,60,340,380,C.acc,.22); await phone(t,240,300,50,-4); await uiCard(t,30,230,250);}
  if(kind==='phonezoom'){glow(t,100,40,440,400,C.acc,.2); await phone(t,440,98,60,0);}
  if(kind==='person'){glow(t,260,120,360,360,C.acc,.3); {const pw=490*PER.w/PER.ht; img(t,PER.h,Math.max(250,W-pw+10),H-486,pw,490,'person');} await uiCard(t,24,230,260);}
  if(kind==='scene'){img(t,PER.h,0,0,Math.max(W,H*PER.w/PER.ht),Math.max(H,W*PER.ht/PER.w),'scene photo'); await phone(t,170,40,80,-6);}
  if(kind==='cover'){const s=Math.min(600/L.w,470/L.h)*1.15; cover(t,s,(W-L.w*s)/2,(H-L.h*s)/2,W,H);}
  tabs.push(t);}
 tabs.forEach((tb,i)=>{const c=tb.clone(); g.appendChild(c); c.name=tb.name.replace('636x509','319x260 · mobile'); c.rescale(319/W); c.resize(319,260); c.x=i*700; c.y=600; c.cornerRadius=8;});
 // Challenge slots (photos come from generate_image; mobile copies of the first two are added after generation)
 const ch=grp('Challenges',900,2050,1200,800); const ph=COV||(PER&&PER.h)||FALLBACK;
 const slots=C.ch.map((n,i)=>{const r=figma.createRectangle(); r.name=`Challenge ${i+1} · ${n} · ${P} · 334x334`; r.resize(334,334); r.cornerRadius=8; r.fills=[{type:'IMAGE',imageHash:ph,scaleMode:'FILL'}]; ch.appendChild(r); r.x=i*400; r.y=0; return r.id;});
 return {section:sec.id, slots};}
