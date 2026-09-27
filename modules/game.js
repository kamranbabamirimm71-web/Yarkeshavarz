/* YarKeshavarz — game.js */

function loadGame(){try{let g=JSON.parse(localStorage.getItem('yk-strategy-v1')||'null');if(g&&Array.isArray(g.cells)&&g.cells.length===6)return g}catch{}return{money:5000,water:100,day:1,level:1,cells:Array.from({length:6},()=>({crop:null})),log:['🌱 بازی شروع شد؛ اولین قطعه را انتخاب کن.']}}

function saveGame(g){localStorage.setItem('yk-strategy-v1',JSON.stringify(g))}

function gameCell(i){let g=loadGame();if(g.cells[i].crop){alert(`این قطعه زیر کشت ${g.cells[i].crop} است.`);return}document.body.insertAdjacentHTML('beforeend',`<div class="game-modal" id="gm"><div><div class="row"><b>🌱 انتخاب محصول</b><button class="secondary" onclick="document.getElementById('gm').remove()">بستن</button></div><p class="small muted">برای قطعه ${i+1} محصول انتخاب کن.</p><div class="crop-choice"><button onclick="plantGame(${i},'گندم','🌾',90,145,2)">🌾<br>گندم<br><small>۹۰ سکه</small></button><button onclick="plantGame(${i},'ذرت','🌽',110,180,2)">🌽<br>ذرت<br><small>۱۱۰ سکه</small></button><button onclick="plantGame(${i},'سیب‌زمینی','🥔',130,210,3)">🥔<br>سیب‌زمینی<br><small>۱۳۰ سکه</small></button></div></div></div>`)}

function plantGame(i,crop,icon,cost,revenue,days){let g=loadGame();if(g.money<cost){alert('سرمایه کافی نیست.');return}g.money-=cost;g.cells[i]={crop,icon,cost,revenue,days,age:0,watered:false};g.log.unshift(`🌱 قطعه ${i+1}: ${crop} کاشته شد.`);g.log=g.log.slice(0,12);saveGame(g);document.getElementById('gm')?.remove();game()}

function gameWater(){let g=loadGame(),count=0;g.cells.forEach(x=>{if(x.crop&&!x.watered){x.watered=true;count++}});g.water=Math.max(0,g.water-count*10);g.log.unshift(count?`💧 ${count} قطعه آبیاری شد.`:'💧 قطعه‌ای برای آبیاری آماده نبود.');g.log=g.log.slice(0,12);saveGame(g);game()}

function gameHarvest(){let g=loadGame(),count=0,earn=0;g.cells.forEach((x,i)=>{if(x.crop&&x.age>=x.days){earn+=x.revenue;g.cells[i]={crop:null};count++}});g.money+=earn;g.log.unshift(count?`🌾 ${count} قطعه برداشت شد و ${earn.toLocaleString('fa-IR')} سکه درآمد داشتی.`:'🌾 هنوز محصولی به زمان برداشت نرسیده است.');g.log=g.log.slice(0,12);saveGame(g);game()}

function gameMarket(){let g=loadGame(),bonus=50+g.level*20;g.money+=bonus;g.log.unshift(`🛒 فروش بازار: ${bonus.toLocaleString('fa-IR')} سکه.`);g.log=g.log.slice(0,12);saveGame(g);game()}

function gameNextDay(){let g=loadGame();g.day++;g.cells.forEach(x=>{if(x.crop){x.age++;x.watered=false}});if(g.day%5===0){g.level++;g.log.unshift(`⭐ سطح مزرعه به ${g.level} رسید.`)}g.log.unshift(`🌅 روز ${g.day} شروع شد.`);g.log=g.log.slice(0,12);saveGame(g);game()}

function resetGame(){if(confirm('بازی از اول شروع شود؟')){localStorage.removeItem('yk-strategy-v1');game()}}
