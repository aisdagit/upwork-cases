// Usage: node shoot.js /abs/path/proposal.html /abs/path/shots
const {chromium}=require('playwright');
const fs=require('fs');
const [html,out]=[process.argv[2],process.argv[3]||'shots'];
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1280,height:720},deviceScaleFactor:2});
await p.goto('file://'+html);await p.evaluate(()=>document.fonts.ready);
const secs=await p.$$('section');const links=[];
for(let i=0;i<secs.length;i++){await secs[i].screenshot({path:`${out}/s${String(i+1).padStart(2,'0')}.png`});
 const ls=await secs[i].$$eval('a',as=>as.map(a=>{const r=a.getBoundingClientRect(),s=a.closest('section').getBoundingClientRect();
   return {href:a.href,x:r.left-s.left,y:r.top-s.top,w:r.width,h:r.height}}));
 for(const l of ls) links.push({page:i,...l});}
fs.writeFileSync(`${out}/links.json`,JSON.stringify(links));await b.close();})();
