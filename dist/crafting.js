import {validStock,MAX_STOCK} from './inventory.js';

// Recipes consume and produce the same shared block inventory used for building.
export const RECIPES=Object.freeze([
  {id:'planks',output:{type:7,count:4},inputs:[{type:3,count:1}]},
  {id:'bricks',output:{type:6,count:4},inputs:[{type:2,count:2},{type:5,count:1}]},
  {id:'grass',output:{type:0,count:2},inputs:[{type:1,count:2},{type:4,count:1}]}
]);
export function craftResult(stock,id){
  const recipe=RECIPES.find(r=>r.id===id);if(!recipe||!validStock(stock))return {ok:false,reason:'invalid'};
  if(recipe.inputs.some(i=>stock[i.type]<i.count))return {ok:false,reason:'materials'};
  const next=[...stock];for(const item of recipe.inputs)next[item.type]-=item.count;
  if(next[recipe.output.type]+recipe.output.count>MAX_STOCK)return {ok:false,reason:'full'};
  next[recipe.output.type]+=recipe.output.count;return {ok:true,stock:next,recipe};
}
export function setupCrafting({types,getStock,request,pause}){
  const panel=document.createElement('div');panel.className='multi-panel hidden';panel.innerHTML=`<section class="multi-card craft-card" role="dialog" aria-modal="true" aria-labelledby="craftTitle"><header><h2 id="craftTitle">クラフト</h2><button id="craftClose" class="multi-x" aria-label="閉じる">×</button></header><p>持っているブロックを組み合わせて作ろう。</p><div id="craftStatus" role="status">レシピを選んでね</div><div id="craftRecipes" class="craft-recipes"></div></section>`;document.body.append(panel);
  const $=id=>panel.querySelector('#'+id), rows=[];
  for(const recipe of RECIPES){const row=document.createElement('div');row.className='craft-recipe';const info=document.createElement('div'),title=document.createElement('strong'),ingredients=document.createElement('div'),button=document.createElement('button');title.textContent=`${types[recipe.output.type][0]} × ${recipe.output.count}`;ingredients.className='craft-ingredients';info.append(title,ingredients);button.textContent='つくる';button.addEventListener('click',()=>request(recipe.id));row.append(info,button);$('craftRecipes').append(row);rows.push({recipe,ingredients,button})}
  function refresh(){const stock=getStock();for(const {recipe,ingredients,button} of rows){ingredients.textContent=recipe.inputs.map(i=>`${types[i.type][0]} ${stock[i.type]}/${i.count}`).join('　・　');const result=craftResult(stock,recipe.id);button.disabled=!result.ok;button.title=result.reason==='full'?'ストックがいっぱいです':result.reason==='materials'?'材料が足りません':''}}
  const open=document.createElement('button');open.className='tool';open.textContent='クラフト';open.addEventListener('click',()=>{pause();refresh();panel.classList.remove('hidden');$('craftClose').focus()});document.querySelector('.topright').prepend(open);
  $('craftClose').addEventListener('click',()=>panel.classList.add('hidden'));panel.addEventListener('click',e=>{if(e.target===panel)panel.classList.add('hidden')});panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();panel.classList.add('hidden');open.focus()}});
  return {refresh,status(text){$('craftStatus').textContent=text}};
}
