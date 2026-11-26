import assert from 'node:assert/strict';
import {craftResult,RECIPES} from '../dist/crafting.js';
import {initialStock,initialGear,equipGear,swordDamage,armorProtection,MAX_STOCK} from '../dist/inventory.js';
let stock=initialStock(),before=[...stock],result=craftResult(stock,'planks');
assert.equal(result.ok,true);assert.equal(result.stock[3],15);assert.equal(result.stock[7],20);assert.deepEqual(stock,before);
result=craftResult(stock,'bricks');assert.equal(result.ok,true);assert.equal(result.stock[2],14);assert.equal(result.stock[5],15);assert.equal(result.stock[6],20);
stock[2]=1;before=[...stock];assert.equal(craftResult(stock,'bricks').reason,'materials');assert.deepEqual(stock,before);
stock=initialStock();stock[7]=MAX_STOCK-3;before=[...stock];assert.equal(craftResult(stock,'planks').reason,'full');assert.deepEqual(stock,before);
assert.equal(craftResult(stock,'__proto__').reason,'invalid');assert.equal(craftResult([], 'planks').reason,'invalid');assert.equal(RECIPES.length,12);
let gear=initialGear();stock=initialStock();let sword=craftResult(stock,'wood_sword',gear);assert.equal(sword.ok,true);assert.equal(sword.stock[7],14);assert.equal(sword.gear.equipped.sword,'wood_sword');assert.equal(swordDamage(sword.gear),2);assert.equal(craftResult(sword.stock,'wood_sword',sword.gear).reason,'owned');assert.equal(craftResult(stock,'iron_sword',gear).reason,'materials');stock[8]=10;const armor=craftResult(stock,'iron_armor',gear);assert.equal(armor.ok,true);assert.equal(armor.gear.equipped.armor,'iron_armor');assert.equal(armorProtection(armor.gear),.2);assert.equal(equipGear(gear,'iron_armor'),null);
console.log('craft recipes, insufficient ingredients, capacity, and atomicity: OK');

for(const material of ['wood','iron','diamond'])for(const slot of ['sword','armor','helmet']){let st=initialStock();st[7]=st[8]=st[9]=20;const id=`${material}_${slot}`,r=craftResult(st,id,initialGear());assert.equal(r.ok,true,id);assert.equal(r.gear.equipped[slot],id);assert.ok(r.gear.owned.includes(id));}
const oldSave=JSON.stringify({blocks:[['0,0,0',2]],stock:Array(8).fill(5)});assert.equal(JSON.parse(oldSave).stock.length,8);
