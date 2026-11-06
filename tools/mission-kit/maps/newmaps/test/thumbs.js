const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/preview.html');await p.waitForTimeout(1500);
const T=await p.evaluate(()=>{const o={};for(const mk of ['highlands','jungle','delta']){const g=new Game({seed:4321,diff:'normal',map:mk,civs:[0,1]});G=g;
 const tc=buildTerrain(g);const c=cv(192,144),x=c.getContext('2d');x.imageSmoothingEnabled=true;x.drawImage(tc,0,0,192,144);x.imageSmoothingEnabled=false;
 for(const n of g.nodes)if(n.kind==='tree'){x.fillStyle='rgba(30,78,38,.85)';x.fillRect(n.tx*2,n.ty*2,2,2);}
 for(const bd of g.buildings)if(bd.kind==='towncentre'){x.fillStyle=bd.team?'#d23a3a':'#f2c94c';x.fillRect(bd.tx*2-1,bd.ty*2-1,8,8);x.strokeStyle='#17110c';x.strokeRect(bd.tx*2-1.5,bd.ty*2-1.5,9,9);}
 o[mk]=c.toDataURL('image/png');}return o;});
fs.writeFileSync('/mnt/project-files/sea-rts-fixes/maps/newmaps/thumbs.js','/* map picker thumbnails, made by thumbs.js from the maps themselves */\nwindow.NEWMAP_THUMBS = '+JSON.stringify(T)+';\n');
for(const k in T)fs.writeFileSync(__dirname+'/out/thumb-'+k+'.png',Buffer.from(T[k].split(',')[1],'base64'));
console.log(Object.keys(T).map(k=>k+':'+T[k].length));await b.close();})();
