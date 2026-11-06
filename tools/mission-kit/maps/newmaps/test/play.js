const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:560}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/preview.html');await p.waitForTimeout(1500);
// menu: open skirmish screen and screenshot the map picker
await p.evaluate(()=>showMenu('skirmish'));await p.waitForTimeout(300);
const seg=await p.$('#m-mapk');if(seg)await seg.screenshot({path:__dirname+'/out/menu.png'});
for(const [mk,tx,ty] of JSON.parse(process.argv[2]||'[]')){
 const info=await p.evaluate(([mk,tx,ty])=>{mapKind=mk;showMenu(null);startGame(777);
  cam.x=tx*TILE-view.w/2/view.zoom;cam.y=ty*TILE-view.h/2/view.zoom;
  const a=G.units.find(u=>u.team===2&&u.kind!=='deer');let panel='';if(a){sel.length=0;sel.push(a);try{buildPanel();panel=document.getElementById('panel').innerText.slice(0,80);}catch(e){panel='ERR '+e.message;}sel.length=0;}
  const fd=G.nodes.find(n=>n.kind==='durian'||n.kind==='pisang');let fp='';if(fd){sel.push(fd);try{buildPanel();fp=document.getElementById('panel').innerText.slice(0,80);}catch(e){fp='ERR '+e.message;}sel.length=0;}
  if(typeof refreshFog==='function'){G.explored&&G.explored.fill(1);}
  G.updateFog=function(){this.visible.fill(1);this.explored.fill(1);this.fogV=(this.fogV||0)+1;};G.updateFog();return {vill:G.villages.length,panel,fp,zoom:view.zoom};},[mk,tx,ty]);
 console.log(mk,JSON.stringify(info));
 await p.waitForTimeout(1200);await p.screenshot({path:__dirname+'/out/play-'+mk+'.png'});
}
await b.close();})();
