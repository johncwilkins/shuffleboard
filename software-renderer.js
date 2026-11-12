import * as THREE from './vendor/three.module.js';
// CPU fallback projects the same room, table, and pucks as the WebGL renderer.
export function clipNear(vertices,near=.2){let out=[];for(let i=0;i<vertices.length;i++){const a=vertices[i],b=vertices[(i+1)%vertices.length],insideA=a.view.z<=-near,insideB=b.view.z<=-near;if(insideA)out.push(a);if(insideA!==insideB){const t=(-near-a.view.z)/(b.view.z-a.view.z);out.push({world:a.world.clone().lerp(b.world,t),view:a.view.clone().lerp(b.view,t),u:THREE.MathUtils.lerp(a.u,b.u,t),v:THREE.MathUtils.lerp(a.v,b.v,t)})}}return out}
export class SoftwareRenderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.shadowMap={};this.capabilities={getMaxAnisotropy:()=>1};this.ratio=1;this.w=innerWidth;this.h=innerHeight}
 setPixelRatio(r){this.ratio=Math.min(r,1.4)}
 setSize(w,h){this.w=w;this.h=h;this.canvas.width=w*this.ratio;this.canvas.height=h*this.ratio}
 render(scene,camera){
  const ctx=this.ctx,w=this.w,h=this.h;ctx.setTransform(this.ratio,0,0,this.ratio,0,0);ctx.globalAlpha=1;ctx.fillStyle=scene.background?.isColor?scene.background.getStyle():'#292824';ctx.fillRect(0,0,w,h);scene.updateMatrixWorld();camera.updateMatrixWorld();
  const triangles=[],light=new THREE.Vector3(-.25,.94,-.18).normalize(),normal=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3();
  scene.traverse(mesh=>{
   if(!mesh.isMesh)return;for(let parent=mesh;parent;parent=parent.parent)if(!parent.visible)return;
   const geo=mesh.geometry,pos=geo.attributes.position,uv=geo.attributes.uv,index=geo.index,materials=mesh.material,vertices=[];
   for(let i=0;i<pos.count;i++){const world=new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(mesh.matrixWorld);vertices.push({world,view:world.clone().applyMatrix4(camera.matrixWorldInverse),u:uv?.getX(i)||0,v:uv?.getY(i)||0})}
   const count=index?index.count:pos.count;
   for(let i=0;i<count;i+=3){const material=Array.isArray(materials)?materials[geo.groups.find(g=>i>=g.start&&i<g.start+g.count)?.materialIndex||0]:materials;if(!material||material.visible===false)continue;
    const ids=[0,1,2].map(k=>index?index.getX(i+k):i+k),original=ids.map(k=>vertices[k]);if(original.every(v=>v.view.z>-.2))continue;
    normal.crossVectors(a.subVectors(original[1].world,original[0].world),b.subVectors(original[2].world,original[0].world)).normalize();const facing=normal.dot(a.subVectors(camera.position,original[0].world));if(material.side!==THREE.DoubleSide&&((material.side===THREE.BackSide&&facing>=0)||(material.side!==THREE.BackSide&&facing<=0)))continue;const shade=material.isMeshBasicMaterial?1:.58+Math.max(0,normal.dot(light))*.42;
    const clipped=original.some(v=>v.view.z>-.2)?clipNear(original):original;if(clipped.length<3)continue;
    for(let k=1;k<clipped.length-1;k++){const tri=[clipped[0],clipped[k],clipped[k+1]],p=tri.map(v=>{const q=v.view.clone().applyMatrix4(camera.projectionMatrix);return{x:(q.x*.5+.5)*w,y:(-.5*q.y+.5)*h}});
     if(p.every(q=>q.x<0)||p.every(q=>q.x>w)||p.every(q=>q.y<0)||p.every(q=>q.y>h))continue;
     triangles.push({p,z:tri.reduce((sum,v)=>sum+v.view.z,0)/3,layer:mesh.userData.layer||0,uv:tri.map(v=>({x:v.u,y:v.v})),material,shade});
    }
   }
  });
  triangles.sort((a,b)=>a.layer-b.layer||a.z-b.z);
  for(const f of triangles){const p=f.p,mat=f.material;ctx.globalAlpha=mat.opacity??1;ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);ctx.lineTo(p[1].x,p[1].y);ctx.lineTo(p[2].x,p[2].y);ctx.closePath();const image=mat.map?.image;
   if(image){const s=f.uv.map(t=>({x:t.x*image.width,y:(1-t.y)*image.height})),[a,b,c]=s,den=a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y);if(Math.abs(den)<.001)continue;
    const af=(p[0].x*(b.y-c.y)+p[1].x*(c.y-a.y)+p[2].x*(a.y-b.y))/den,bf=(p[0].y*(b.y-c.y)+p[1].y*(c.y-a.y)+p[2].y*(a.y-b.y))/den,cf=(p[0].x*(c.x-b.x)+p[1].x*(a.x-c.x)+p[2].x*(b.x-a.x))/den,df=(p[0].y*(c.x-b.x)+p[1].y*(a.x-c.x)+p[2].y*(b.x-a.x))/den,ef=p[0].x-af*a.x-cf*a.y,ff=p[0].y-bf*a.x-df*a.y;
    ctx.save();ctx.clip();ctx.transform(af,bf,cf,df,ef,ff);ctx.drawImage(image,0,0);ctx.restore();if(f.shade<.99){ctx.save();ctx.clip();ctx.globalAlpha=(1-f.shade)*(mat.opacity??1);ctx.fillStyle='#000';ctx.fill();ctx.restore()}
   }else{ctx.fillStyle=mat.color.clone().multiplyScalar(f.shade).getStyle();ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.35;ctx.stroke()}
  }ctx.globalAlpha=1;
 }
}
