import assert from 'node:assert/strict';
import {initialStock,validSnapshot,transact,MAX_STOCK} from '../dist/inventory.js';
const stock=initialStock(),world=new Map([['0,0,0',2]]);
assert.deepEqual(transact(world,stock,'0,0,0',null),{ok:true,removed:2});assert.equal(stock[2],17);assert.equal(world.size,0);
assert.equal(transact(world,stock,'1,0,0',2).ok,true);assert.equal(stock[2],16);assert.equal(world.get('1,0,0'),2);
assert.equal(transact(world,stock,'1,0,0',3).reason,'occupied');stock[3]=0;assert.equal(transact(world,stock,'2,0,0',3).reason,'empty');assert.equal(world.has('2,0,0'),false);
stock[2]=MAX_STOCK;assert.equal(transact(world,stock,'1,0,0',null).reason,'full');assert.equal(world.has('1,0,0'),true);assert.equal(transact(world,stock,'not a key',1).reason,'invalid');
const saved=JSON.parse(JSON.stringify({blocks:[...world],stock}));assert.ok(validSnapshot(saved));assert.equal(saved.stock[2],MAX_STOCK);assert.ok(validSnapshot({blocks:[],stock:initialStock()}));assert.equal(validSnapshot({blocks:[['1,0,0',0],['1,0,0',1]],stock}),false);console.log('stock collection, placement, limits and saved state: OK');
