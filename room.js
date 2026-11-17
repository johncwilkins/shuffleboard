import * as THREE from './vendor/three.module.js';
import {addRoadsideBar} from './roadside-room.js';
// Every dimension is in inches, matching the 20 x 252-inch playing surface.
const ROOM={width:216,length:432,floor:-28,height:112};
function random(seed){return()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296)}
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function map(c,renderer){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t}
function plaster(renderer){const c=canvas(512,512),x=c.getContext('2d'),r=random(117);x.fillStyle='#817666';x.fillRect(0,0,512,512);for(let i=0;i<26000;i++){x.fillStyle=r()>.5?'#eee5d00b':'#20190d0a';x.fillRect(r()*512,r()*512,1+r()*2,1+r()*2)}return map(c,renderer)}
function walnut(renderer){const c=canvas(256,1024),x=c.getContext('2d'),r=random(762);x.fillStyle='#473424';x.fillRect(0,0,256,1024);for(let i=0;i<350;i++){const a=r()*256;x.strokeStyle=r()>.4?'#bd966719':'#170e0925';x.lineWidth=.3+r();x.beginPath();x.moveTo(a,0);for(let y=0;y<=1024;y+=24)x.lineTo(a+Math.sin(y*.009+i)*1.8,y);x.stroke()}return map(c,renderer)}
function oakFloor(renderer,stain=2){const c=canvas(1024,2048),x=c.getContext('2d'),r=random(811),width=1024*5/ROOM.width,length=2048*60/ROOM.length;for(let i=0;i<Math.ceil(1024/width);i++){const left=i*width;x.fillStyle=['#64503b','#6d5941','#766148','#604c38','#6e5740'][i%5];x.fillRect(left,0,width,2048);x.fillStyle='#251e16';x.fillRect(left,0,.7,2048);for(let y=(i%3)*length/3;y<2048;y+=length){x.fillStyle='#2e251b';x.fillRect(left,y,width,.8)}for(let j=0;j<15;j++){const a=left+r()*width;x.strokeStyle=r()>.5?'#21170e1a':'#d6b98b15';x.lineWidth=.4;x.beginPath();x.moveTo(a,0);for(let y=0;y<=2048;y+=25)x.lineTo(a+Math.sin(y*.008+j)*.6,y);x.stroke()}}x.globalCompositeOperation='multiply';x.fillStyle=['#fff8e9','#e1d1bb','#bfaa8e','#9a8369','#79634e'][stain];x.fillRect(0,0,1024,2048);return map(c,renderer)}
function leather(renderer){const c=canvas(256,256),x=c.getContext('2d'),r=random(398);x.fillStyle='#8a2925';x.fillRect(0,0,256,256);for(let i=0;i<14000;i++){x.fillStyle=r()>.5?'#e6a19a15':'#260c0a22';x.fillRect(r()*256,r()*256,.5+r()*1.3,.5+r()*1.3)}return map(c,renderer)}
// Grayscale in the texture canvas preserves each uploaded photograph in full.
function photo(renderer,url,onLoad){const c=canvas(1000,750),x=c.getContext('2d');x.fillStyle='#ded9cc';x.fillRect(0,0,c.width,c.height);const texture=map(c,renderer),image=new Image();image.onload=()=>{x.fillStyle='#ded9cc';x.fillRect(0,0,c.width,c.height);const scale=Math.min(c.width/image.width,c.height/image.height),w=image.width*scale,h=image.height*scale;x.drawImage(image,(c.width-w)/2,(c.height-h)/2,w,h);const pixels=x.getImageData(0,0,c.width,c.height);for(let i=0;i<pixels.data.length;i+=4){const gray=Math.round(pixels.data[i]*.2126+pixels.data[i+1]*.7152+pixels.data[i+2]*.0722);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=gray}x.putImageData(pixels,0,0);texture.needsUpdate=true;onLoad()};image.src=new URL(url,import.meta.url).href;return texture}
export function addRoom(scene,floor,renderer,theme='roadside'){
 if(theme==='roadside')return addRoadsideBar(scene,floor,renderer);
 scene.background=new THREE.Color('#292824');scene.fog=new THREE.FogExp2('#292824',.00045);scene.environment=null;
 delete scene.userData.roomPanorama;delete scene.userData.roomFloor;
 scene.userData.roomDimensions={...ROOM,stoolSeatHeight:30,stoolDiameter:16,frameWidth:26,frameHeight:21,plankWidth:5};
 const group=new THREE.Group();group.name='Scaled 18 by 36 foot room';scene.add(group);
 const wood=walnut(renderer),paint=plaster(renderer);
 const plasterMat=new THREE.MeshStandardMaterial({map:paint,roughness:.93,bumpMap:paint,bumpScale:.022});
 const panelMat=new THREE.MeshStandardMaterial({map:wood,roughness:.59});
 const trimMat=new THREE.MeshStandardMaterial({color:0x392b20,roughness:.5});
 const iron=new THREE.MeshStandardMaterial({color:0x302d28,metalness:.5,roughness:.6});
 function mesh(geo,mat,x,y,z,name,layer=-20){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.name=name;m.castShadow=m.receiveShadow=true;m.userData.layer=layer;group.add(m);return m}
 function box(w,h,d,x,y,z,mat,name,layer=-20){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,name,layer)}
 floor.geometry.dispose();floor.geometry=new THREE.PlaneGeometry(ROOM.width,ROOM.length,12,24);floor.position.y=ROOM.floor;floor.material=new THREE.MeshStandardMaterial({map:oakFloor(renderer),roughness:.74});floor.name='Five inch oak floorboards';floor.userData.layer=-30;floor.receiveShadow=true;
 const centerY=ROOM.floor+ROOM.height/2;
 for(const sign of [-1,1]){
  box(ROOM.width+6,ROOM.height,3,0,centerY,sign*(ROOM.length/2+1.5),plasterMat,'End plaster wall',-25);
  box(3,ROOM.height,ROOM.length,sign*(ROOM.width/2+1.5),centerY,0,plasterMat,'Side plaster wall',-25);
  box(ROOM.width,36,1.5,0,-10,sign*(ROOM.length/2-.75),panelMat,'End walnut wainscot',-24);
  box(1.5,36,ROOM.length,sign*(ROOM.width/2-.75),-10,0,panelMat,'Side walnut wainscot',-24);
  box(ROOM.width,2,2.2,0,9,sign*(ROOM.length/2-1.1),trimMat,'End chair rail',-23);
  box(2.2,2,ROOM.length,sign*(ROOM.width/2-1.1),9,0,trimMat,'Side chair rail',-23);
  box(ROOM.width,5,1.9,0,-25.5,sign*(ROOM.length/2-.95),trimMat,'End baseboard',-23);
  box(1.9,5,ROOM.length,sign*(ROOM.width/2-.95),-25.5,0,trimMat,'Side baseboard',-23);
  for(let z=-204;z<=204;z+=24)box(.7,33,1,sign*(ROOM.width/2-1.7),-10,z,trimMat,'Panel join',-23);
 }
 // Stand frames off the wall; separated front faces avoid depth fighting at distance.
 let refreshReflections=()=>{};
 for(const [i,x] of [-75,-25,25,75].entries()){
  box(26,21,1.5,x,35,213.75,trimMat,'26 by 21 inch picture frame');
  box(23.5,18.5,.2,x,35,212.65,new THREE.MeshStandardMaterial({color:0xded9cc,roughness:.95}),'Picture mat',-19.8);
  const image=mesh(new THREE.PlaneGeometry(21,15.75),new THREE.MeshStandardMaterial({map:photo(renderer,`./photos/boat-${i+1}.jpg`,()=>refreshReflections()),roughness:1}),x,35,212.25,'Framed monochrome boat photograph',-19.6);image.rotation.y=Math.PI;
 }
 // Narrow counter and full-size stools along one side, clear of the table.
 box(15,2,132,97,13,24,panelMat,'42 inch high side counter');
 const hide=leather(renderer),leatherMat=new THREE.MeshStandardMaterial({map:hide,bumpMap:hide,bumpScale:.025,roughness:.62});
 const cushionProfile=[[0,-.8],[7.3,-.8],[7.8,-.5],[8,0],[7.8,.6],[7.1,.85],[0,.85]].map(([x,y])=>new THREE.Vector2(x,y));
 const pipingMat=new THREE.MeshStandardMaterial({color:0x581915,roughness:.7});
 for(const z of [-24,26,76]){
  mesh(new THREE.CylinderGeometry(8,8,.6,32),panelMat,66,.3,z,'Stool wooden seat base');
  mesh(new THREE.LatheGeometry(cushionProfile,32),leatherMat,66,1.15,z,'30 inch stool red leather cushion');
  const piping=mesh(new THREE.TorusGeometry(7.75,.08,6,32),pipingMat,66,1.7,z,'Leather cushion piping');piping.rotation.x=Math.PI/2;
  for(const [dx,dz] of [[-5,-5],[-5,5],[5,-5],[5,5]])mesh(new THREE.CylinderGeometry(.72,.95,28,8),trimMat,66+dx,-14,z+dz,'Stool leg');
  const foot=mesh(new THREE.TorusGeometry(6,.32,5,20),iron,66,-14,z,'Stool footrest');foot.rotation.x=Math.PI/2;
 }
 // Shaded pendant fixtures are beside, rather than in front of, the playing line.
 const brass=new THREE.MeshStandardMaterial({color:0x71604a,metalness:.62,roughness:.48,side:THREE.DoubleSide});
 const shade=new THREE.MeshStandardMaterial({color:0xbdb49c,roughness:.83,side:THREE.DoubleSide});
 const glow=new THREE.MeshStandardMaterial({color:0xffe2a3,emissive:0xffd18a,emissiveIntensity:2.1});
 for(const [x,z] of [[-44,-55],[44,75]]){
  mesh(new THREE.CylinderGeometry(.13,.13,20,5),iron,x,74,z,'Pendant suspension');
  mesh(new THREE.ConeGeometry(8,9,24,1,true),shade,x,59.5,z,'16 inch pendant shade');
  const rim=mesh(new THREE.TorusGeometry(8,.18,5,24),brass,x,55,z,'Pendant shade rim');rim.rotation.x=Math.PI/2;
  mesh(new THREE.SphereGeometry(1.1,10,6),glow,x,56.5,z,'Warm pendant bulb');
  const lamp=new THREE.SpotLight(0xffe3b8,2600,210,Math.PI/3,.7,2);lamp.position.set(x,56,z);lamp.target.position.set(0,0,z+15);group.add(lamp,lamp.target);
 }
 // Subtle contact shadows keep the table and stools grounded even in fallback rendering.
 const c=canvas(128,128),ctx=c.getContext('2d'),gradient=ctx.createRadialGradient(64,64,8,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,.24)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const shadowMat=new THREE.MeshBasicMaterial({map:map(c,renderer),transparent:true,depthWrite:false});
 const under=mesh(new THREE.PlaneGeometry(48,286,1,12),shadowMat,0,-27.97,0,'Table contact shadow',-29);under.rotation.x=-Math.PI/2;
 for(const z of [-24,26,76]){const m=mesh(new THREE.PlaneGeometry(23,23),shadowMat,66,-27.96,z,'Stool contact shadow',-29);m.rotation.x=-Math.PI/2}
 // Reflections are captured from the modeled room, never a photographic backdrop.
 if(renderer.isWebGLRenderer){const probe=new THREE.WebGLCubeRenderTarget(128,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});const camera=new THREE.CubeCamera(.5,900,probe);camera.position.set(0,10,0);refreshReflections=()=>{if(!group.parent)return;const previous=scene.environment;scene.environment=null;camera.update(renderer,scene);scene.environment=previous||probe.texture};refreshReflections();scene.environmentIntensity=.32;group.userData.dispose=()=>probe.dispose()}
 let lastStain=-1;try{const saved=Number(localStorage.getItem('shuffleboard-floor-stain')??-1);if(Number.isInteger(saved)&&saved>=0&&saved<5)lastStain=saved}catch{}
 group.userData.randomizeFloor=()=>{let stain=Math.floor(Math.random()*(lastStain<0?5:4));if(stain>=lastStain&&lastStain>=0)stain++;lastStain=stain;try{localStorage.setItem('shuffleboard-floor-stain',String(stain))}catch{}const old=floor.material.map;floor.material.map=oakFloor(renderer,stain);floor.material.needsUpdate=true;old.dispose();scene.userData.floorStain=stain;refreshReflections()};
 return group;
}
