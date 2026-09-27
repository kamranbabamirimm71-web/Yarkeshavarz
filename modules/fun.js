/* YarKeshavarz — Entertainment module */
const FUN_KEY='yk-fun-v2';
let funState=(()=>{try{return Object.assign({score:0,high:0,streak:0,played:0},JSON.parse(localStorage.getItem(FUN_KEY)||'{}'))}catch(e){return {score:0,high:0,streak:0,played:0}}})();
let funType='',funIndex=0,funAnswered=false;
const FUN_DATA={
riddle:[{q:'کدام کار به کاهش تبخیر آب از سطح خاک کمک می‌کند؟',o:['مالچ‌پاشی','حذف پوشش خاک','افزایش باد','شخم هر روز'],a:0},{q:'ریشه بیشتر گیاهان برای رشد سالم به چه چیزهایی نیاز دارد؟',o:['فقط نور','آب و اکسیژن خاک','فقط کود','فقط گرما'],a:1}],
crop:[{q:'محصولی با خوشه و دانه زرد که برای آرد بسیار مهم است؟',o:['گندم','پنبه','پیاز','سیب‌زمینی'],a:0},{q:'محصولی غده‌ای که زیر خاک تشکیل می‌شود؟',o:['ذرت','سیب‌زمینی','گندم','کلزا'],a:1}],
tool:[{q:'کدام وسیله برای شخم و زیرورو کردن خاک کاربرد دارد؟',o:['گاوآهن','سمپاش','کمباین','تریلر'],a:0},{q:'کدام دستگاه برای برداشت غلات و جداسازی دانه کاربرد دارد؟',o:['کمباین','بیل','سمپاش','غلتک'],a:0}],
quiz:[{q:'کدام مورد از عوامل مهم رشد گیاه است؟',o:['آب','نور','مواد غذایی','همه موارد'],a:3},{q:'تصمیم‌گیری مناسب برای مصرف کود بیشتر بر چه اساسی است؟',o:['حدس','آزمایش خاک و نیاز گیاه','هرچه بیشتر بهتر','فقط رنگ برگ'],a:1}]
};
const FUN_FACTS=['🌱 ریشه گیاهان با بسیاری از موجودات مفید خاک ارتباط دارند.','💧 زمان و روش آبیاری روی بهره‌وری آب اثر زیادی دارد.','🌾 تناوب زراعی یکی از روش‌های مهم مدیریت مزرعه است.','🐝 بسیاری از محصولات برای گرده‌افشانی به حشرات وابسته‌اند.'];
function funSave(){try{localStorage.setItem(FUN_KEY,JSON.stringify(funState))}catch(e){}}
function funRenderScore(){funScore.textContent=faNum(funState.score);funHigh.textContent=faNum(funState.high);funStreak.textContent=faNum(funState.streak)}
function openFun(){funShell.classList.add('show');funShell.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';funRenderScore();funHome()}
function closeFun(){funShell.classList.remove('show');funShell.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function funHome(){document.getElementById('funHome').style.display='grid';document.getElementById('funPanel').style.display='none'}
function funStart(t){funType=t;funIndex=0;funAnswered=false;funHome.style.display='none';funPanel.style.display='block';funQuestion()}
function funQuestion(){const q=FUN_DATA[funType][funIndex%FUN_DATA[funType].length];funAnswered=false;funPanel.innerHTML='<div class="row"><b>'+({riddle:'🧠 معمای کشاورزی',crop:'🌾 حدس محصول',tool:'🚜 حدس ادوات',quiz:'❓ سؤال کشاورزی'}[funType])+'</b><button class="fun-back" onclick="funHome()">منو</button></div><div class="fun-question" style="margin-top:14px">'+q.q+'</div><div class="fun-options">'+q.o.map((x,i)=>'<button class="fun-option" onclick="funAnswer('+i+','+q.a+')">'+x+'</button>').join('')+'</div>'}
function funAnswer(i,a){if(funAnswered)return;funAnswered=true;document.querySelectorAll('#funPanel .fun-option').forEach((x,n)=>{if(n===a)x.classList.add('correct');if(n===i&&i!==a)x.classList.add('wrong')});if(i===a){funState.score+=10;funState.streak++;funState.high=Math.max(funState.high,funState.score)}else funState.streak=0;funState.played++;funSave();funRenderScore();const b=document.createElement('button');b.className='fun-btn';b.textContent='سؤال بعدی ➜';b.onclick=()=>{funIndex++;funQuestion()};funPanel.appendChild(b)}
function funFact(){funHome.style.display='none';funPanel.style.display='block';funPanel.innerHTML='<div class="row"><b>😂 دانستنی جالب</b><button class="fun-back" onclick="funHome()">بازگشت</button></div><div class="fun-fact" style="margin-top:18px">'+FUN_FACTS[Math.floor(Math.random()*FUN_FACTS.length)]+'</div><button class="fun-btn" onclick="funFact()">یکی دیگر</button>'}
