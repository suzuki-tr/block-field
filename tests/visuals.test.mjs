import assert from 'node:assert/strict';
import * as THREE from '../dist/three.module.js';
import {makeBlockMaterials,addScenery,makeBreakParticles} from '../dist/visuals.js';
globalThis.document={createElement(tag){assert.equal(tag,'canvas');return {width:0,height:0,getContext(){return {fillRect(){},createLinearGradient(){return {addColorStop(){}}}}}}}};
const types=[['grass',0x70a84d],['dirt',0x91643d]];
const materials=makeBlockMaterials(types);assert.equal(materials.length,2);assert.equal(materials[0].map.magFilter,THREE.NearestFilter);
const scene=new THREE.Scene();const update=addScenery(scene),camera=new THREE.PerspectiveCamera();camera.position.set(1,2,3);update(camera);assert.ok(scene.background);
const particles=makeBreakParticles(scene,types);particles.burst('1,2,3',0);particles.update(.01);const mesh=scene.children.at(-1);assert.equal(mesh.count,8);particles.update(1);assert.equal(mesh.count,0);particles.burst('1,2,3',9);particles.update(.01);assert.equal(mesh.count,0);
console.log('texture creation, scenery, and particle lifetime: OK');
