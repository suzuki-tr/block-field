import * as THREE from './three.module.js';

// A single optional slime keeps the cost and the amount of synchronized state small.
export function createMobSystem({scene,groundAt,player,notice,respawn,onDamage=()=>{},protection=()=>0}) {
  const group=new THREE.Group(), bodyMaterial=new THREE.MeshLambertMaterial({color:0x76bf78}), dark=new THREE.MeshBasicMaterial({color:0x20382c});
  const body=new THREE.Mesh(new THREE.BoxGeometry(.85,.75,.85),bodyMaterial);group.add(body);
  for(const x of [-.19,.19]){const eye=new THREE.Mesh(new THREE.BoxGeometry(.1,.12,.03),dark);eye.position.set(x,.08,.43);group.add(eye)}
  const mouth=new THREE.Mesh(new THREE.BoxGeometry(.22,.05,.03),dark);mouth.position.set(0,-.13,.43);group.add(mouth);group.visible=false;scene.add(group);
  let enabled=false,alive=false,hp=3,health=5,hitCooldown=0,contactCooldown=0,respawnTimer=0,walkTime=0,flashTimer=0,deathTimer=0;
  const hud=document.createElement('div');hud.className='mob-hud hidden';hud.setAttribute('aria-live','polite');document.body.append(hud);
  function showHealth(){hud.textContent='たいりょく '+ '♥'.repeat(Math.ceil(health))+'♡'.repeat(5-Math.ceil(health));hud.classList.toggle('hidden',!enabled)}
  function spawn(){const p=player();for(const [dx,dz] of [[0,-5],[5,0],[-5,0],[0,5],[3,3]]){const x=p.x+dx,z=p.z+dz,g=groundAt(x,z,p.y-1.6,8);if(g!==null){group.position.set(x,g+.9,z);hp=3;alive=true;group.visible=true;respawnTimer=0;flashTimer=deathTimer=0;group.scale.set(1,1,1);group.rotation.z=0;return true}}alive=false;group.visible=false;respawnTimer=3;return false}
  function enable(on){enabled=!!on;health=5;contactCooldown=hitCooldown=0;flashTimer=deathTimer=0;group.scale.set(1,1,1);group.rotation.z=0;bodyMaterial.color.setHex(0x76bf78);if(enabled)spawn();else{alive=false;group.visible=false}showHealth()}
  function hit(damage=1){if(!enabled||!alive||hitCooldown>0)return false;hitCooldown=.4;hp=Math.max(0,hp-Math.max(1,Math.min(4,Math.floor(damage))));flashTimer=.22;if(hp<=0){alive=false;deathTimer=.5;respawnTimer=10;notice('スライムをたおした！')}return true}
  function update(dt,active,authoritative,other){if(!enabled)return;
    // Visual timers run for both host and guest, independent of simulation authority.
    flashTimer=Math.max(0,flashTimer-dt);bodyMaterial.color.setHex(flashTimer>0?0xffc4b3:0x76bf78);
    if(deathTimer>0){deathTimer=Math.max(0,deathTimer-dt);const t=1-deathTimer/.5;group.scale.setScalar(Math.max(.02,1-t));group.rotation.z=t*1.1;if(deathTimer===0&&!alive)group.visible=false}
    else if(alive){const t=flashTimer/.22;group.scale.set(1+t*.18,1-t*.2,1+t*.18);group.rotation.z=0}
    if(active)contactCooldown=Math.max(0,contactCooldown-dt);if(authoritative&&active){hitCooldown=Math.max(0,hitCooldown-dt);if(!alive){respawnTimer-=dt;if(respawnTimer<=0)spawn()}else{const p=player(), targets=[p];if(other)targets.push(other);let target=targets.reduce((a,b)=>Math.hypot(group.position.x-a.x,group.position.z-a.z)<Math.hypot(group.position.x-b.x,group.position.z-b.z)?a:b);const dx=target.x-group.position.x,dz=target.z-group.position.z,d=Math.hypot(dx,dz);if(d>.8&&d<16){const nx=group.position.x+dx/d*1.3*dt,nz=group.position.z+dz/d*1.3*dt,g=groundAt(nx,nz,group.position.y-.9,1);if(g!==null&&Math.abs(g+.9-group.position.y)<=1.05){group.position.set(nx,g+.9,nz);group.rotation.y=Math.atan2(dx,dz)}}walkTime+=dt*5;body.scale.y=1+Math.sin(walkTime)*.07}}
    if(active&&alive&&contactCooldown<=0){const p=player();if(Math.hypot(group.position.x-p.x,group.position.z-p.z)<.85&&Math.abs(group.position.y-(p.y-1.15))<1.3){health=Math.max(0,health-Math.max(.25,1-protection()));contactCooldown=1.5;onDamage();showHealth();if(health<=0){health=5;respawn();showHealth();notice('スタート地点にもどったよ')}}}}
  function state(){return {enabled,alive,x:group.position.x,y:group.position.y,z:group.position.z,hp}}
  function apply(s){if(!s||typeof s.enabled!=='boolean'||typeof s.alive!=='boolean'||!['x','y','z'].every(k=>Number.isFinite(s[k])&&Math.abs(s[k])<1000)||!Number.isInteger(s.hp)||s.hp<0||s.hp>3)return;const changed=enabled!==s.enabled,wasAlive=alive,oldHp=hp;enabled=s.enabled;alive=s.alive&&enabled;hp=s.hp;if(enabled&&wasAlive&&(!alive||hp<oldHp)){flashTimer=.22;if(!alive)deathTimer=.5}if(alive&&!wasAlive){deathTimer=flashTimer=0;group.scale.set(1,1,1);group.rotation.z=0}if(!enabled){deathTimer=flashTimer=0;group.scale.set(1,1,1);group.rotation.z=0}group.visible=alive||(enabled&&deathTimer>0);group.position.set(s.x,s.y,s.z);if(changed){health=5;showHealth()}}
  return {enable,hit,update,state,apply,object:group,isEnabled:()=>enabled,isAlive:()=>alive};
}
