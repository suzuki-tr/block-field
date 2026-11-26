import {validStock,validGear,initialGear,copyGear,equipGear,GEAR,GEAR_SLOTS,MAX_STOCK} from './inventory.js';
const blockRecipes=[{id:'planks',output:{type:7,count:4},inputs:[{type:3,count:1}]},{id:'bricks',output:{type:6,count:4},inputs:[{type:2,count:2},{type:5,count:1}]},{id:'grass',output:{type:0,count:2},inputs:[{type:1,count:2},{type:4,count:1}]}];
const equipmentRecipes=Object.values(GEAR).map(item=>({id:item.id,gear:item.id,inputs:[{type:{wood:7,iron:8,diamond:9}[item.material],count:{sword:2,armor:5,helmet:3}[item.slot]}]}));
export const RECIPES=Object.freeze([...blockRecipes,...equipmentRecipes]);
export function craftResult(stock,id,gear=initialGear()){
 const recipe=RECIPES.find(r=>r.id===id);if(!recipe||!validStock(stock)||!validGear(gear))return {ok:false,reason:'invalid'};
 if(recipe.gear&&gear.owned.includes(recipe.gear))return {ok:false,reason:'owned'};
 if(recipe.inputs.some(i=>stock[i.type]<i.count))return {ok:false,reason:'materials'};
 const next=[...stock];for(const item of recipe.inputs)next[item.type]-=item.count;
 let nextGear=copyGear(gear);if(recipe.gear){nextGear.owned.push(recipe.gear);nextGear=equipGear(nextGear,recipe.gear)}else{if(next[recipe.output.type]+recipe.output.count>MAX_STOCK)return {ok:false,reason:'full'};next[recipe.output.type]+=recipe.output.count}
 return {ok:true,stock:next,gear:nextGear,recipe};
}
export function setupCrafting({types,getStock,getGear,request,requestEquip,openGame,closeGame}){
 const panel=document.createElement('div');panel.className='multi-panel hidden';panel.innerHTML=`<section class="multi-card craft-card" role="dialog" aria-modal="true" aria-labelledby="craftTitle"><header><h2 id="craftTitle">クラフト・装備</h2><button id="craftClose" class="multi-x" aria-label="閉じる">×</button></header><p>素材を集めてつくろう。装備はつくると身につきます。</p><div id="craftStatus" role="status">レシピを選んでね</div><div id="equipment" class="equipment"></div><div id="craftRecipes" class="craft-recipes"></div></section>`;document.body.append(panel);
 const $=id=>panel.querySelector('#'+id),rows=[];
 for(const recipe of RECIPES){const row=document.createElement('div');row.className='craft-recipe';const info=document.createElement('div'),title=document.createElement('strong'),ingredients=document.createElement('div'),button=document.createElement('button');title.textContent=recipe.gear?GEAR[recipe.gear].name:`${types[recipe.output.type][0]} × ${recipe.output.count}`;ingredients.className='craft-ingredients';info.append(title,ingredients);button.textContent='つくる';button.addEventListener('click',()=>request(recipe.id));row.append(info,button);$('craftRecipes').append(row);rows.push({recipe,ingredients,button})}
 function refresh(){const stock=getStock(),gear=getGear(),container=$('equipment');container.replaceChildren();const heading=document.createElement('strong');heading.textContent='いまの装備（2人プレイでは共有）';container.append(heading);for(const slot of GEAR_SLOTS){const line=document.createElement('div');line.className='equipment-line';const label=document.createElement('span');label.textContent=({sword:'剣',armor:'鎧',helmet:'兜'})[slot]+'：';line.append(label);for(const id of gear.owned.filter(id=>GEAR[id].slot===slot)){const b=document.createElement('button');b.textContent=GEAR[id].name+(gear.equipped[slot]===id?' ✓':'');b.disabled=gear.equipped[slot]===id;b.addEventListener('click',()=>requestEquip(id));line.append(b)}if(!gear.owned.some(id=>GEAR[id].slot===slot))line.append(document.createTextNode('なし'));container.append(line)}for(const {recipe,ingredients,button} of rows){ingredients.textContent=recipe.inputs.map(i=>`${types[i.type][0]} ${stock[i.type]}/${i.count}`).join('　・　');const result=craftResult(stock,recipe.id,gear);button.disabled=!result.ok;button.textContent=result.reason==='owned'?'作成済み':'つくる';button.title=result.reason==='full'?'ストックがいっぱいです':result.reason==='materials'?'材料が足りません':''}}
 function open(){if(!openGame())return;refresh();panel.classList.remove('hidden');$('craftClose').focus()}
 function close(){panel.classList.add('hidden');closeGame()}
 const touch=document.createElement('button');touch.className='craft-touch';touch.textContent='クラフト';document.querySelector('.touch-actions').insertBefore(touch,document.querySelector('#jump'));touch.addEventListener('pointerdown',e=>{e.preventDefault();open()});
 const desktop=document.createElement('button');desktop.className='tool craft-shortcut';desktop.textContent='クラフト [E]';document.body.append(desktop);desktop.addEventListener('click',open);
 $('craftClose').addEventListener('click',close);panel.addEventListener('click',e=>{if(e.target===panel)close()});panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close()}});
 return {refresh,open,status(text){$('craftStatus').textContent=text}};
}
