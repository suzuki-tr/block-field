export const BLOCK_TYPES=8, RESOURCE_TYPES=10, INITIAL_STOCK=16, MAX_STOCK=9999;
export const GEAR_SLOTS=['sword','armor','helmet'];
export const GEAR=Object.freeze(Object.fromEntries(['wood','iron','diamond'].flatMap((material,tier)=>GEAR_SLOTS.map(slot=>{const id=`${material}_${slot}`;return [id,{id,material,slot,tier:tier+1,name:`${['木','鉄','ダイヤモンド'][tier]}の${{sword:'剣',armor:'鎧',helmet:'兜'}[slot]}`}]}))));
export function initialStock(){return [...Array(BLOCK_TYPES).fill(INITIAL_STOCK),0,0]}
export function initialGear(){return {owned:[],equipped:{sword:null,armor:null,helmet:null}}}
export function validStock(stock){return Array.isArray(stock)&&stock.length===RESOURCE_TYPES&&stock.every(n=>Number.isInteger(n)&&n>=0&&n<=MAX_STOCK)}
export function validGear(g){return !!g&&Array.isArray(g.owned)&&g.owned.length<=9&&new Set(g.owned).size===g.owned.length&&g.owned.every(id=>Object.hasOwn(GEAR,id))&&!!g.equipped&&GEAR_SLOTS.every(slot=>g.equipped[slot]===null||(Object.hasOwn(GEAR,g.equipped[slot])&&GEAR[g.equipped[slot]].slot===slot&&g.owned.includes(g.equipped[slot])))}
export function copyGear(g){return {owned:[...g.owned],equipped:{...g.equipped}}}
export function normalizeSnapshot(s){if(!s||!Array.isArray(s.blocks)||!Array.isArray(s.stock))return null;const stock=s.stock.length===BLOCK_TYPES?[...s.stock,0,0]:[...s.stock];const gear=s.gear===undefined?initialGear():s.gear;const mined=s.mined===undefined?[]:s.mined;const result={blocks:s.blocks,stock,gear,mined};return validSnapshot(result)?result:null}
export function validKey(k){return typeof k==='string'&&/^-?\d{1,3},-?\d{1,3},-?\d{1,3}$/.test(k)}
export function validSnapshot(s){return !!s&&Array.isArray(s.blocks)&&s.blocks.length<=100000&&s.blocks.every(a=>Array.isArray(a)&&a.length===2&&validKey(a[0])&&Number.isInteger(a[1])&&a[1]>=0&&a[1]<BLOCK_TYPES)&&new Set(s.blocks.map(a=>a[0])).size===s.blocks.length&&validStock(s.stock)&&validGear(s.gear)&&Array.isArray(s.mined)&&s.mined.length<=100000&&s.mined.every(validKey)&&new Set(s.mined).size===s.mined.length}
export function miningDrop(k,type){if(type!==2)return null;const [x,y,z]=k.split(',').map(Number);const n=Math.abs(Math.imul(x,73856093)^Math.imul(y,19349663)^Math.imul(z,83492791))%100;return n<5?9:n<25?8:null}
export function transact(world,stock,k,value,mined=new Set()){
  if(!validKey(k)||!validStock(stock)||!(value===null||Number.isInteger(value)&&value>=0&&value<BLOCK_TYPES))return {ok:false,reason:'invalid'};
  if(value===null){if(!world.has(k))return {ok:false,reason:'missing'};const type=world.get(k);if(stock[type]>=MAX_STOCK)return {ok:false,reason:'full'};world.delete(k);stock[type]++;const drop=type===2&&!mined.has(k)?miningDrop(k,type):null;if(type===2)mined.add(k);const collected=drop!==null&&stock[drop]<MAX_STOCK;if(collected)stock[drop]++;return {ok:true,removed:type,drop:collected?drop:null}}
  if(world.has(k))return {ok:false,reason:'occupied'};if(stock[value]===0)return {ok:false,reason:'empty'};world.set(k,value);stock[value]--;return {ok:true};
}
export function equipGear(gear,id){if(!validGear(gear)||!Object.hasOwn(GEAR,id)||!gear.owned.includes(id))return null;const next=copyGear(gear);next.equipped[GEAR[id].slot]=id;return next}
export function swordDamage(gear){const id=gear.equipped.sword;return id?GEAR[id].tier+1:1}
export function armorProtection(gear){return ['armor','helmet'].reduce((sum,slot)=>sum+(gear.equipped[slot]?GEAR[gear.equipped[slot]].tier*.1:0),0)}
