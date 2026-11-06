const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/preview.html');await p.waitForTimeout(1500);
for(const mk of ['highlands','jungle','delta']){const r=await p.evaluate((mk)=>{const g=new Game({seed:99,diff:'hard',map:mk,civs:[0,1]});G=g;
 const tc=g.buildings.find(b=>b.team===0&&b.kind==='towncentre');let near=0,first=null,err=null;
 try{for(let i=0;i<30*60*20;i++){g.update(1/30);if(i%30===0){const n=g.units.filter(u=>u.team===1&&u.hp>0&&u.cls!=='vil'&&Math.hypot(u.x-tc.x,u.y-tc.y)<14).length;if(n>near)near=n;if(n>2&&first==null)first=Math.round(g.t);}if(g.over)break;}}catch(e){err=e.message;}
 const ai=g.units.filter(u=>u.team===1&&u.hp>0);return {t:Math.round(g.t),aiUnits:ai.length,aiVil:ai.filter(u=>u.cls==='vil').length,aiBld:g.buildings.filter(b=>b.team===1&&b.hp>0).length,aiAge:g.teamAge?g.teamAge(1):'?',maxNearMyTC:near,firstRaid:first,err,food:g.res?JSON.stringify(g.res[1]):''};},mk);console.log(mk,JSON.stringify(r));}
await b.close();})();
