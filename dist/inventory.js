export const BLOCK_TYPES=8, INITIAL_STOCK=16, MAX_STOCK=9999;
export function initialStock(){return Array(BLOCK_TYPES).fill(INITIAL_STOCK)}
export function validStock(stock){return Array.isArray(stock)&&stock.length===BLOCK_TYPES&&stock.every(n=>Number.isInteger(n)&&n>=0&&n<=MAX_STOCK)}
export function validKey(k){return typeof k==='string'&&/^-?\d{1,3},-?\d{1,3},-?\d{1,3}$/.test(k)}
export function validSnapshot(s){return !!s&&Array.isArray(s.blocks)&&s.blocks.length<=100000&&s.blocks.every(a=>Array.isArray(a)&&a.length===2&&validKey(a[0])&&Number.isInteger(a[1])&&a[1]>=0&&a[1]<BLOCK_TYPES)&&new Set(s.blocks.map(a=>a[0])).size===s.blocks.length&&validStock(s.stock)}
// Host or solo player calls this once to commit an edit and its stock change together.
export function transact(world,stock,k,value){
  if(!validKey(k)||!validStock(stock)||!(value===null||Number.isInteger(value)&&value>=0&&value<BLOCK_TYPES))return {ok:false,reason:'invalid'};
  if(value===null){if(!world.has(k))return {ok:false,reason:'missing'};const type=world.get(k);if(stock[type]>=MAX_STOCK)return {ok:false,reason:'full'};world.delete(k);stock[type]++;return {ok:true,removed:type}}
  if(world.has(k))return {ok:false,reason:'occupied'};if(stock[value]===0)return {ok:false,reason:'empty'};world.set(k,value);stock[value]--;return {ok:true};
}
