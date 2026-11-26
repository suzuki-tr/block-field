import assert from 'node:assert/strict';
import {initialStock,initialGear,normalizeSnapshot,validSnapshot,transact,MAX_STOCK,miningDrop} from '../dist/inventory.js';
const stock=initialStock(),world=new Map([['0,0,0',2]]);
assert.equal(transact(world,stock,'0,0,0',null).removed,2);assert.equal(stock[2],17);assert.equal(world.size,0);
assert.equal(transact(world,stock,'1,0,0',2).ok,true);assert.equal(stock[2],16);assert.equal(world.get('1,0,0'),2);
assert.equal(transact(world,stock,'1,0,0',3).reason,'occupied');stock[3]=0;assert.equal(transact(world,stock,'2,0,0',3).reason,'empty');assert.equal(world.has('2,0,0'),false);
stock[2]=MAX_STOCK;assert.equal(transact(world,stock,'1,0,0',null).reason,'full');assert.equal(world.has('1,0,0'),true);assert.equal(transact(world,stock,'not a key',1).reason,'invalid');
const saved=JSON.parse(JSON.stringify({blocks:[...world],stock,gear:initialGear(),mined:[]}));assert.ok(validSnapshot(saved));assert.equal(saved.stock[2],MAX_STOCK);assert.ok(validSnapshot({blocks:[],stock:initialStock(),gear:initialGear(),mined:[]}));assert.equal(validSnapshot({blocks:[['1,0,0',0],['1,0,0',1]],stock,gear:initialGear(),mined:[]}),false);console.log('stock collection, placement, limits and saved state: OK');

const legacy=normalizeSnapshot({blocks:[['1,2,3',2]],stock:Array(8).fill(7)});assert.deepEqual(legacy.stock,[7,7,7,7,7,7,7,7,0,0]);assert.deepEqual(legacy.mined,[]);let k;for(let x=1;x<100;x++){if(miningDrop(`${x},0,0`,2)!==null){k=`${x},0,0`;break}}assert.ok(k);const deposits=new Set(), rocks=new Map([[k,2]]),items=initialStock();const first=transact(rocks,items,k,null,deposits);assert.notEqual(first.drop,null);rocks.set(k,2);const second=transact(rocks,items,k,null,deposits);assert.equal(second.drop,null);
