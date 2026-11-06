const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const IMG=__dirname+'/draft/img/';
const save=(n,d)=>fs.writeFileSync(IMG+n+'.png',Buffer.from(d.split(',')[1],'base64'));
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:960,height:600}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/preview.html');await p.waitForTimeout(1500);
// 1. whole-map illustrations drawn with the real sprites, and the sprite sheet
const R=await p.evaluate(()=>{const out={};
 for(const mk of ['highlands','jungle','delta']){const g=new Game({seed:4321,diff:'normal',map:mk,civs:[0,1]});G=g;
  const tc=buildTerrain(g);const c=ctx.canvas,ow=c.width,oh=c.height;c.width=W*TILE;c.height=H*TILE;ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(tc,0,0);
  const items=[];for(const n of g.nodes)items.push([n.ty+1,'n',n]);for(const bd of g.buildings)items.push([bd.ty+bd.size,'b',bd]);for(const u of g.units)items.push([u.y,'u',u]);
  items.sort((a,b)=>a[0]-b[0]);for(const [,k,o] of items){try{k==='n'?paintNode(o):k==='b'?paintBuilding(o):paintUnit(o);}catch(e){}}
  const o=cv(W*8,H*8),x=o.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(c,0,0,W*8,H*8);out['map-'+mk]=o.toDataURL();
  c.width=ow;c.height=oh;}
 const NM=window.NEWMAPS,sc=(s,k)=>{const o=cv(s.width*k,s.height*k),x=o.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(s,0,0,o.width,o.height);return o.toDataURL();};
 for(const a of ['kancil','boar','seladang']){out['an-'+a]=sc(NM.wildSprite(a,0),2);out['an-'+a+'-run']=sc(NM.wildSprite(a,1),2);}
 out['an-deer']=sc(deerSprite(0),2);
 for(const f of ['durian','pisang'])out['food-'+f]=sc(NM.foodSprite(f),2);out['food-berry']=sc(bushSprite(),2);
 for(const pl of ['jungle','bamboo','pine','mangrove','nipa','karst','karstS'])out['pl-'+pl]=sc(CALM.plant(pl),2);
 out['pl-angsana']=sc(CALM.tree('angsana'),2);out['pl-mango']=sc(CALM.tree('mango'),2);out['pl-palm']=sc(treeSprite(0),2);out['pl-round']=sc(treeSprite(2),2);
 return out;});
for(const k in R)save(k,R[k]);
// 2. in-game close views (HUD hidden)
await p.addStyleTag({content:'body *{visibility:hidden!important} #view{visibility:visible!important}'});
const SH={highlands:[[44,22],[70,30],[16,52]],jungle:[[14,54],[46,34],[30,22]],delta:[[14,12],[30,40],[48,52]]};
for(const mk in SH){let i=0;for(const [tx,ty] of SH[mk]){await p.evaluate(([mk,tx,ty])=>{if(!G||G.map!==mk||!window._st){mapKind=mk;showMenu(null);startGame(4321);window._st=1;}
  G.updateFog=function(){this.visible.fill(1);this.explored.fill(1);this.fogV=(this.fogV||0)+1;};G.updateFog();
  view.zoom=1.25;cam.x=tx*TILE-view.w/2/view.zoom;cam.y=ty*TILE-view.h/2/view.zoom;},[mk,tx,ty]);
 await p.waitForTimeout(900);await p.screenshot({path:IMG+'shot-'+mk+'-'+(i++)+'.png'});}
 await p.evaluate(()=>{window._st=0;});}
console.log('done',Object.keys(R).length);await b.close();})();
