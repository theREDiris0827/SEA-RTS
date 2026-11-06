const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const OUT=__dirname+'/out';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:600}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CON',m.text());});
await p.goto('file://'+__dirname+'/preview.html');await p.waitForTimeout(1500);
const maps=process.argv[2]?process.argv[2].split(','):['highlands','jungle','delta'];
for(const mk of maps){
 const r=await p.evaluate(async(mk)=>{const t0=performance.now();
  const g=new Game({seed:12345,diff:'normal',map:mk,civs:[0,1]});const tg=performance.now()-t0;
  const conn=g.landConnected(g.starts[0].x+1,g.starts[0].y+3,g.starts[1].x+1,g.starts[1].y+3);
  const cnt={};for(const n of g.nodes)cnt[n.kind]=(cnt[n.kind]||0)+1;const an={};for(const u of g.units)if(u.team===2)an[u.kind]=(an[u.kind]||0)+1;
  const t1=performance.now();const tc=buildTerrain(g);const tb=performance.now()-t1;
  // overview: terrain + nodes as dots + TCs
  const ov=cv(W*4,H*4),x=ov.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(tc,0,0,W*4,H*4);
  const col={tree:'#1e5a28',gold:'#f2c94c',berry:'#d6303a',durian:'#c8c040',pisang:'#9ad048',fish:'#e4f4fa'};
  for(const n of g.nodes){x.fillStyle=col[n.kind]||'#fff';x.fillRect(n.tx*4,n.ty*4,4,4);}
  for(const u of g.units){x.fillStyle=u.team===2?'#ff8c00':u.team===0?'#3060ff':'#ff3030';x.fillRect(u.x*4-2,u.y*4-2,4,4);}
  for(const bd of g.buildings){x.strokeStyle='#fff';x.strokeRect(bd.tx*4,bd.ty*4,bd.size*4,bd.size*4);}
  // run the sim for 6 minutes on hard to be sure nothing throws
  let err=null;try{for(let i=0;i<30*60*6;i++)g.update(1/30);}catch(e){err=e.message+' '+e.stack.split('\n')[1];}
  return {tg,tb,conn,cnt,an,err,starts:g.starts,ov:ov.toDataURL()};},mk);
 fs.writeFileSync(OUT+'/'+mk+'-ov.png',Buffer.from(r.ov.split(',')[1],'base64'));delete r.ov;console.log(mk,JSON.stringify(r));
}
await b.close();})();
