import * as THREE from './vendor/three.module.js';
// Inches throughout: a 24 x 36 ft room, 42-inch bar and 30-inch stools.
export function addRoadsideBar(scene,floor,renderer){
 const room=new THREE.Group();room.name='Roadside Bar';scene.add(room);
 scene.background=new THREE.Color('#27221b');scene.fog=new THREE.FogExp2('#27221b',.0005);scene.environment=null;
 scene.userData.roomDimensions={width:288,length:432,floor:-28,height:112,barHeight:42,stoolSeatHeight:30};
 const textures=new Set();
 function texture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();textures.add(t);return t}
 let seed=174;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const wood=texture(256,1024,(c,w,h)=>{c.fillStyle='#734323';c.fillRect(0,0,w,h);for(let i=0;i<460;i++){const x=rnd()*w;c.strokeStyle=i%3?'#c1884823':'#2714093b';c.lineWidth=.3+rnd()*1.2;c.beginPath();c.moveTo(x,0);for(let y=0;y<=h;y+=20)c.lineTo(x+Math.sin(y*.012+i)*2.2,y);c.stroke()}for(let i=0;i<80;i++){c.fillStyle='#d4b48515';c.fillRect(rnd()*w,rnd()*h,.5,4+rnd()*24)}});
 const darkWood=texture(256,1024,(c,w,h)=>{c.drawImage(wood.image,0,0);c.fillStyle='#0008';c.fillRect(0,0,w,h)});
 const oak=new THREE.MeshStandardMaterial({map:wood,roughness:.34});
 const dark=new THREE.MeshStandardMaterial({map:darkWood,color:0xc9bba4,roughness:.68});
 const black=new THREE.MeshStandardMaterial({color:0x211d18,roughness:.72});
 const legWood=new THREE.MeshStandardMaterial({color:0x493423,roughness:.64});
 const cream=new THREE.MeshStandardMaterial({color:0x9e927a,roughness:.93});
 const brass=new THREE.MeshStandardMaterial({color:0xa68445,metalness:.76,roughness:.32});
 const pewter=new THREE.MeshStandardMaterial({color:0x858a85,metalness:.72,roughness:.42,side:THREE.DoubleSide});
 const leatherMap=texture(128,128,(c,w,h)=>{c.fillStyle='#7e2822';c.fillRect(0,0,w,h);for(let i=0;i<7000;i++){c.fillStyle=i%2?'#e6ac8015':'#220b0b22';c.fillRect(rnd()*w,rnd()*h,1,1)}});
 const leather=new THREE.MeshStandardMaterial({map:leatherMap,roughness:.6,bumpMap:leatherMap,bumpScale:.025});
 const ceiling=new THREE.Group();ceiling.name='Ceiling beams and hanging mugs';room.add(ceiling);
 function mesh(geo,mat,x,y,z,name,layer=-20,parent=room){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.name=name;m.userData.layer=layer;m.castShadow=m.receiveShadow=true;parent.add(m);return m}
 function box(w,h,d,x,y,z,mat,name,layer=-20,parent=room){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,name,layer,parent)}
 function rod(a,b,r,mat,name,parent=room){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from);const m=mesh(new THREE.CylinderGeometry(r,r,delta.length(),8),mat,...from.clone().add(to).multiplyScalar(.5).toArray(),name,-19,parent);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m}
 for(const side of [-1,1]){
  box(3,112,432,side*145.5,28,0,dark,'Dark timber side wall',-25);
  box(294,112,3,0,28,side*217.5,dark,'Dark timber end wall',-25);
  box(1.6,35,432,side*143,-10.5,0,oak,'Tongue and groove wainscot',-24);
  box(288,35,1.6,0,-10.5,side*215,oak,'End timber wainscot',-24);
  box(2.5,2,432,side*142.5,8,0,black,'Side chair rail',-23);
  box(288,2,2.5,0,8,side*214.5,black,'End chair rail',-23);
  for(let z=-210;z<=210;z+=12)box(.6,32,.45,side*141.9,-11,z,dark,'Wainscot plank joint',-23);
  // Ceiling strips stay outside the table; all ceiling fittings fade out of overhead view.
  box(84,1,432,side*102,84,0,cream,'Warm plaster ceiling',-26,ceiling);
 }
 box(120,1,432,0,84,0,cream,'Central plaster ceiling',-26,ceiling);
 for(const z of [-176,-88,0,88,176]){
  box(288,6,5,0,80,z,black,'Dark transverse ceiling beam',-21,ceiling);
  for(const x of [-76,76]){
   const ring=mesh(new THREE.CylinderGeometry(3.3,3.3,.5,16),brass,x,82.5,z+21,'Recessed light trim',-19,ceiling);
   mesh(new THREE.CircleGeometry(2.8,16),new THREE.MeshBasicMaterial({color:0xffe6b4,side:THREE.DoubleSide}),x,82.1,z+21,'Warm recessed light',-18,ceiling).rotation.x=Math.PI/2;
  }
 }
 box(31,39,300,97,-8.5,0,dark,'Bar cabinet');
 const top=box(35,2.5,308,95,12.75,0,oak,'Polished 42 inch bar top');
 // Rounded bullnose and carved front panels.
 rod([77.5,12.5,-154],[77.5,12.5,154],1.25,oak,'Rounded bar edge');
 for(let z=-137;z<150;z+=34){box(.8,28,29,80.8,-8,z,oak,'Bar front raised panel');for(const zz of [z-15,z+15])box(1.2,34,1.5,80,-8,zz,black,'Panel stile')}
 rod([72,-17,-150],[72,-17,150],.75,brass,'Brass bar foot rail');
 for(const z of [-132,-66,0,66,132])rod([81,-24,z],[72,-17,z],.45,brass,'Foot rail bracket');
 const seatProfile=[[0,-.8],[7.3,-.8],[7.8,-.5],[8,0],[7.8,.6],[7.1,.85],[0,.85]].map(([x,y])=>new THREE.Vector2(x,y));
 const stoolGeometry=new THREE.LatheGeometry(seatProfile,20);
 for(const z of [-128,-78,-28,22,72,122]){
  mesh(stoolGeometry,leather,56,1.15,z,'Red leather 30 inch stool cushion');
  mesh(new THREE.CylinderGeometry(8,8,.8,16),dark,56,0,z,'Stool wooden seat');
  for(const [dx,dz] of [[-5,-5],[-5,5],[5,-5],[5,5]])rod([56+dx*1.2,-28,z+dz*1.2],[56+dx,0,z+dz],.75,legWood,'Stool leg');
  // Curved wooden backs face the bar, following the reference chairs.
  box(1.3,3.5,16,48,15,z,oak,'Stool curved back rail');
  for(const dz of [-6,0,6])rod([48,.5,z+dz],[48,14,z+dz],.45,legWood,'Stool back spindle');
  for(const dx of [-5,5])rod([56+dx,-15,z-5],[56+dx,-15,z+5],.42,legWood,'Stool lower rung');
 }
 // Backbar bottle shelves, with working-height space behind the counter.
 box(10,2,300,138,14,0,oak,'Backbar worktop');
 for(const y of [29,49]){
  box(9,1.5,294,138,y,0,oak,'Bottle shelf');
  rod([132.8,y+3,-145],[132.8,y+3,145],.18,brass,'Shelf retaining rail');
 }
 const bottleShapes=new THREE.LatheGeometry([[0,0],[1,0],[1.1,.6],[1.1,5],[.65,6.3],[.38,7],[.38,9],[0,9]].map(([x,y])=>new THREE.Vector2(x,y)),8);
 const bottleMats=[0x38492d,0x62401b,0x31504a,0x754c20].map(color=>new THREE.MeshStandardMaterial({color,roughness:.28,metalness:.08}));
 const labelMats=[0xd8c79b,0xb2a17b,0xe2d8ba].map(color=>new THREE.MeshStandardMaterial({color,roughness:.88}));
 function bottle(x,y,z,i){const b=mesh(bottleShapes,bottleMats[i%4],x,y,z,'Backbar bottle',-19);b.scale.y=.85+(i%3)*.12;mesh(new THREE.CylinderGeometry(1.13,1.13,2.4,8),labelMats[i%3],x,y+3,z,'Bottle paper label',-18.9);mesh(new THREE.CylinderGeometry(.43,.43,.8,8),black,x,y+9*b.scale.y,z,'Bottle cap',-18.8)}
 for(let i=0;i<25;i++){bottle(137,30,-140+i*11.5,i);bottle(137,50,-140+i*11.5,i+2)}
 // A second mug rack at the far end is visible from the throwing position.
 box(153,39,2,-27,43,213.8,black,'End wall mug display backing',-23);
 const mugGeometry=new THREE.LatheGeometry([[0,-2],[1.7,-2],[2,-1.7],[2.1,1.7],[2.1,2],[1.7,2],[1.7,-1.4],[0,-1.4]].map(([x,y])=>new THREE.Vector2(x,y)),10);
 const handleGeometry=new THREE.TorusGeometry(1.35,.3,4,8);
 function mug(x,y,z,tilt=0,parent=room){const g=new THREE.Group();g.name='Hanging pewter tankard';g.position.set(x,y,z);g.rotation.z=tilt;parent.add(g);mesh(mugGeometry,pewter,0,0,0,'Pewter mug body',-19,g);mesh(handleGeometry,pewter,2.7,0,0,'Mug handle',-18.9,g);return g}
 for(const y of [30,43,56]){rod([-99,y+4,211],[46,y+4,211],.25,brass,'Mug rack rail');for(let i=0;i<12;i++)mug(-95+i*12,y,209,.35+(i%2)*.2)}
 for(const z of [-152,-64,24,112])for(const x of [-100,-78,78,100]){rod([x,76,z],[x,70,z],.13,brass,'Tankard hanging hook',ceiling);mug(x,67,z,.65,ceiling)}
 // Brass draft tower with a curved gooseneck and wooden tap handles.
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(98,14,8),new THREE.Vector3(98,26,8),new THREE.Vector3(98,32,13),new THREE.Vector3(98,26,18)]);
 mesh(new THREE.TubeGeometry(curve,16,.85,8,false),brass,0,0,0,'Curved brass draft tower',-18);
 for(const z of [11,16]){rod([98,26,z],[94,26,z],.55,brass,'Draft tap');rod([95,26,z],[95,31,z],.7,black,'Wooden tap handle')}
 // Small table opposite the bar, safely outside the playing and camera corridor.
 mesh(new THREE.CylinderGeometry(16,16,1.4,24),oak,-94,2,77,'Round pub table');
 rod([-94,-28,77],[-94,1.3,77],2,black,'Pub table pedestal');mesh(new THREE.CylinderGeometry(12,13,1.3,16),black,-94,-27,77,'Pub table base');
 for(const z of [48,105]){mesh(stoolGeometry,leather,-96,-9,z,'Pub chair red seat');for(const dx of [-5,5])for(const dz of [-5,5])rod([-96+dx,-28,z+dz],[-96+dx,-10,z+dz],.65,legWood,'Pub chair leg')}
 function wallArt(tex,w,h,x,y,z,name,emissive=false){box(w+2,h+2,1.6,x,y,z+1.3,black,name+' frame',-20);const mat=new THREE.MeshStandardMaterial({map:tex,roughness:emissive?.4:.85,...(emissive?{emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.35}:{})});const m=mesh(new THREE.PlaneGeometry(w,h),mat,x,y,z,name,-19);m.rotation.y=Math.PI;return m}
 const sign=texture(768,192,(c,w,h)=>{c.fillStyle='#17231e';c.fillRect(0,0,w,h);c.strokeStyle='#aa8d51';c.lineWidth=6;c.strokeRect(10,10,w-20,h-20);c.textAlign='center';c.fillStyle='#dfc58c';c.font='bold 68px Georgia';c.fillText('ROADSIDE BAR',w/2,98);c.font='21px Georgia';c.fillText('COLD BEER  ·  GOOD COMPANY',w/2,146)});
 wallArt(sign,78,19.5,-28,76,211,'Roadside Bar carved sign');
 const tv=texture(512,288,(c,w,h)=>{c.fillStyle='#10191b';c.fillRect(0,0,w,h);c.fillStyle='#3b573d';c.fillRect(0,38,w,204);c.strokeStyle='#b4b9a3';c.lineWidth=2;for(let i=0;i<11;i++){c.beginPath();c.moveTo(i*52,38);c.lineTo(i*52,242);c.stroke()}c.strokeRect(0,64,w,148);for(let i=0;i<12;i++){c.fillStyle=i%2?'#e0cfb4':'#924537';c.fillRect(130+rnd()*240,80+rnd()*110,5,12)}c.fillStyle='#172b3d';c.fillRect(0,0,w,38);c.fillStyle='#dcd8cb';c.font='bold 20px Arial';c.fillText('HOME 14    AWAY 10    3RD',16,26);c.fillStyle='#18242b';c.fillRect(0,242,w,46);c.font='17px Arial';c.fillStyle='#b3c5cd';c.fillText('LIVE SPORTS     ·     ROADSIDE',17,272)});
 wallArt(tv,36,20.25,101,56,212,'Television football broadcast',true);
 const clock=texture(256,256,(c,w,h)=>{c.fillStyle='#c4ae77';c.beginPath();c.arc(128,128,122,0,Math.PI*2);c.fill();c.strokeStyle='#483723';c.lineWidth=9;c.stroke();c.fillStyle='#362a21';c.textAlign='center';c.textBaseline='middle';c.font='23px Georgia';for(let i=1;i<=12;i++){const a=i*Math.PI/6;c.fillText(String(i),128+Math.sin(a)*91,128-Math.cos(a)*91)}c.strokeStyle='#30271e';c.lineWidth=5;c.beginPath();c.moveTo(128,128);c.lineTo(78,99);c.moveTo(128,128);c.lineTo(187,94);c.stroke()});
 mesh(new THREE.CylinderGeometry(11,11,1.5,32),brass,-119,56,212,'Brass wall clock rim',-20).rotation.x=Math.PI/2;
 const face=mesh(new THREE.CircleGeometry(10,32),new THREE.MeshStandardMaterial({map:clock,roughness:.85}),-119,56,210.9,'Clock face',-19);face.rotation.y=Math.PI;
 // Empty coat hooks and a rear door keep the room grounded without blocking play.
 box(32,76,1.5,-97,10,-213,dark,'Rear timber door',-23);box(24,24,.3,-97,27,-211.9,cream,'Frosted door glass',-22);mesh(new THREE.SphereGeometry(.8,8,6),brass,-85,3,-210.8,'Door knob',-21);
 for(const z of [-130,0,130]){const light=new THREE.PointLight(0xffcd8e,1600,170,2);light.position.set(94,60,z);room.add(light)}
 const ceilingLight=new THREE.PointLight(0xffdfb1,1700,250,2);ceilingLight.position.set(-30,77,25);room.add(ceilingLight);
 floor.geometry.dispose();floor.geometry=new THREE.PlaneGeometry(288,432,16,24);floor.position.y=-28;floor.material=new THREE.MeshStandardMaterial({roughness:.62});floor.userData.layer=-30;floor.name='Roadside oak floor';floor.receiveShadow=true;
 let lastStain=-1;try{lastStain=Number(localStorage.getItem('shuffleboard-roadside-stain')??-1)}catch{}
 let refresh=()=>{};
 room.userData.randomizeFloor=()=>{let stain=Math.floor(Math.random()*(lastStain<0?5:4));if(lastStain>=0&&stain>=lastStain)stain++;lastStain=stain;try{localStorage.setItem('shuffleboard-roadside-stain',String(stain))}catch{}const old=floor.material.map;const t=texture(1024,1536,(c,w,h)=>{const colors=['#b27d41','#956534','#7d542e','#664526','#4f3622'];c.fillStyle=colors[stain];c.fillRect(0,0,w,h);const pw=w*4/288;for(let col=0;col<72;col++){let x=col*pw;c.fillStyle=col%3?'#e1bc7b15':'#25130614';c.fillRect(x,0,pw,h);c.fillStyle='#21160f80';c.fillRect(x,0,.7,h);for(let y=(col%4)*105;y<h;y+=420)c.fillRect(x,y,pw,.7);for(let j=0;j<6;j++){c.strokeStyle=j%2?'#20100720':'#f7cd8a15';c.lineWidth=.5;c.beginPath();for(let y=0;y<h;y+=24){const xx=x+2+j*pw/7+Math.sin(y*.012+col+j)*.6;y?c.lineTo(xx,y):c.moveTo(xx,y)}c.stroke()}}});floor.material.map=t;floor.material.needsUpdate=true;if(old){old.dispose();textures.delete(old)}scene.userData.floorStain=stain;refresh()};
 let probe;if(renderer.isWebGLRenderer){probe=new THREE.WebGLCubeRenderTarget(128,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});const camera=new THREE.CubeCamera(.5,900,probe);camera.position.set(0,10,0);refresh=()=>{const previous=scene.environment;scene.environment=null;camera.update(renderer,scene);scene.environment=previous||probe.texture};scene.environmentIntensity=.4}
 room.userData.setOverhead=blend=>{const visible=blend<.12;if(ceiling.visible!==visible)ceiling.visible=visible};
 room.userData.dispose=()=>probe?.dispose();
 room.userData.randomizeFloor();
 return room;
}
