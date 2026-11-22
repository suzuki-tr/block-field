import * as THREE from './three.module.js';

// Small procedural textures avoid image downloads and keep pixel-art edges crisp.
export function makeBlockMaterials(types) {
  return types.map(([name, color], type) => {
    const canvas=document.createElement('canvas'); canvas.width=canvas.height=16;
    const ctx=canvas.getContext('2d');
    const rgb=[(color>>16)&255,(color>>8)&255,color&255];
    function pixel(x,y,offset){ctx.fillStyle=`rgb(${rgb.map(v=>Math.max(0,Math.min(255,v+offset))).join(',')})`;ctx.fillRect(x,y,1,1)}
    for(let y=0;y<16;y++)for(let x=0;x<16;x++){
      const n=(((x*37+y*71+type*113)*(x*13+y*17+23))%19)-9;
      let detail=n;
      if(type===3)detail+=x%5===0?-22:((x+1)%5===0?9:0);
      if(type===7)detail+=y%5===0?-30:(x%7===0?-8:0);
      if(type===6)detail+=(y%5===0||(x+(Math.floor(y/5)%2)*4)%8===0)?-30:0;
      if(type===2)detail+=(x*7+y*11)%31===0?-35:0;
      if(type===4)detail+=(x*11+y*7)%13<3?-20:4;
      pixel(x,y,detail);
    }
    const map=new THREE.CanvasTexture(canvas);map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestMipmapNearestFilter;map.colorSpace=THREE.SRGBColorSpace;
    return new THREE.MeshLambertMaterial({map});
  });
}

export function addScenery(scene) {
  const canvas=document.createElement('canvas');canvas.width=4;canvas.height=256;
  const ctx=canvas.getContext('2d'),g=ctx.createLinearGradient(0,0,0,256);
  g.addColorStop(0,'#5da8dd');g.addColorStop(.46,'#a9d8e8');g.addColorStop(.54,'#d5ecdf');g.addColorStop(1,'#a9d8e8');ctx.fillStyle=g;ctx.fillRect(0,0,4,256);
  const sky=new THREE.CanvasTexture(canvas);sky.mapping=THREE.EquirectangularReflectionMapping;sky.colorSpace=THREE.SRGBColorSpace;scene.background=sky;
  const clouds=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xf7fcf5,fog:true}),18),dummy=new THREE.Object3D();
  const centers=[[-32,25,-27],[-8,31,-39],[24,26,-34],[40,29,-2],[31,32,34],[-24,27,32]];
  let i=0;for(const [x,y,z] of centers)for(const [dx,dz,sx,sz] of [[0,0,8,4],[-3,0,4,3],[2,1,5,4]]){dummy.position.set(x+dx,y,z+dz);dummy.scale.set(sx,.65,sz);dummy.updateMatrix();clouds.setMatrixAt(i++,dummy.matrix)}clouds.computeBoundingSphere();scene.add(clouds);
  const sun=new THREE.Mesh(new THREE.PlaneGeometry(8,8),new THREE.MeshBasicMaterial({color:0xffedaa,fog:false,side:THREE.DoubleSide}));scene.add(sun);
  return camera=>{sun.position.copy(camera.position).add(new THREE.Vector3(-50,48,-70));sun.quaternion.copy(camera.quaternion)};
}

export function makeBreakParticles(scene,types){
  const max=24, particles=[], mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.12,.12,.12),new THREE.MeshBasicMaterial({vertexColors:true}),max),dummy=new THREE.Object3D(),color=new THREE.Color();
  mesh.count=0;mesh.frustumCulled=false;scene.add(mesh);
  return {
    burst(key,type){if(!types[type])return;const [x,y,z]=key.split(',').map(Number);for(let i=0;i<8;i++){if(particles.length>=max)particles.shift();particles.push({x:x+(Math.random()-.5)*.5,y:y+(Math.random()-.5)*.5,z:z+(Math.random()-.5)*.5,vx:(Math.random()-.5)*3,vy:Math.random()*2.4+1,vz:(Math.random()-.5)*3,life:.35+Math.random()*.2,color:types[type][1]})}},
    update(dt){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;if(p.life<=0){particles.splice(i,1);continue}p.vy-=10*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt}mesh.count=particles.length;particles.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.setScalar(Math.min(1,p.life*5));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,color.setHex(p.color))});if(particles.length){mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true}}
  };
}
