/* =========================================================
   YarKeshavarz — Crop Advisor V2
   Category -> Product -> Numeric calculation
   Data lives in data/crop-catalog.js so UI can be changed independently.
   ========================================================= */
(function(){
  const catalog=()=>window.YK_CROP_CATALOG||{categories:[],seedRates:{}};
  let activeCategory='';
  let activeCrop='';

  const catByName=()=>catalog().categories.find(x=>x.name===activeCategory);
  const landById=id=>(Array.isArray(state.lands)?state.lands:[]).find(l=>String(l.id)===String(id));
  const currentLand=()=>landById(document.getElementById('cropLand')?.value)||landById(selected);
  const fmt=(x,max=2)=>Number(x||0).toLocaleString('fa-IR',{maximumFractionDigits:max});

  function cropHeader(step,title,sub,back='go(\'yar\')'){
    return `<div class="crop-clean-head"><button type="button" onclick="${back}">‹</button><div><h2>🌱 ${title}</h2><p>${sub}</p></div></div><div class="crop-progress">${[1,2,3,4].map(n=>`<span class="${n<=step?'on':''}"></span>`).join('')}</div>`;
  }
  function openCropAdvisor(){
    activeCategory=''; activeCrop='';
    head('مشاور کشت');
    renderLandStep();
  }
  function renderLandStep(){
    const lands=Array.isArray(state.lands)?state.lands:[];
    const selectedLand=landById(selected);
    app.innerHTML=`<div class="crop-advisor-page">${cropHeader(1,'مشاور کشت','مرحله ۱ از ۴ · فقط یک زمین را انتخاب کن.')}
      <div class="crop-single-step"><h3>انتخاب زمین</h3><p>زمین موردنظر را انتخاب کن تا ادامه برنامه کشت بر اساس مساحت همان زمین انجام شود.</p>
        <select id="cropLand" class="crop-big-select"><option value="">انتخاب زمین</option>${lands.map(l=>`<option value="${esc(l.id)}" ${selectedLand&&String(l.id)===String(selectedLand.id)?'selected':''}>${esc(l.name||'زمین')} — ${fmt(l.area||0,3)} هکتار</option>`).join('')}</select>
        ${!lands.length?'<div class="small muted" style="margin-top:10px">هنوز زمینی ثبت نشده؛ ابتدا یک زمین ثبت کن.</div>':''}
        <button class="crop-next" type="button" onclick="cropProceedToCategories()">ادامه ← انتخاب محصول</button>
      </div></div>`;
    document.getElementById('cropLand')?.addEventListener('change',()=>{selected=document.getElementById('cropLand').value||selected;});
  }
  function cropProceedToCategories(){
    const land=currentLand();
    if(!land){toast('ابتدا یک زمین انتخاب کن');return}
    if(Number(land.area||0)<=0){toast('برای این زمین مساحت ثبت نشده است');return}
    renderCategories();
  }
  function renderCategories(){
    head('مشاور کشت');
    app.innerHTML=`<div class="crop-advisor-page">${cropHeader(2,'انتخاب دسته محصول','مرحله ۲ از ۴ · فقط دسته موردنظر را انتخاب کن.','renderLandStep()')}
      <div class="crop-single-step"><h3>زمین انتخاب‌شده</h3><p>🌾 ${esc(currentLand()?.name||'زمین')} · ${fmt(currentLand()?.area||0,3)} هکتار</p>
      <div class="crop-choice-grid">${catalog().categories.map(c=>`<button type="button" onclick="cropChooseCategory('${esc(c.name)}')"><span>${c.icon}</span><b>${esc(c.name)}</b><small>${fmt(c.items.length,0)} محصول</small></button>`).join('')}</div></div></div>`;
  }

  function cropChooseCategory(name){
    activeCategory=name;
    activeCrop='';
    const c=catByName();
    if(!c)return;
    const land=currentLand();
    head('مشاور کشت');
    app.innerHTML=`<div class="crop-advisor-page">${cropHeader(3,c.icon+' '+esc(c.name),'مرحله ۳ از ۴ · محصول را انتخاب کن.','renderCategories()')}
      <div class="crop-single-step"><h3>🌾 زمین: ${esc(land?.name||'انتخاب نشده')}</h3><p>${land?fmt(land.area||0,3)+' هکتار':''}</p><div class="crop-choice-grid">${c.items.map(x=>`<button class="crop-product-card" onclick="cropChooseProduct('${esc(x)}')"><span>${cropIcon(x,c.name)}</span><b>${esc(x)}</b><small>${esc(c.name)}</small></button>`).join('')}</div></div></div>`;
  }

  function cropChooseProduct(name){
    activeCrop=name;
    const land=currentLand();
    const area=Number(land?.area||0);
    const seedRate=Number(catalog().seedRates?.[name]||0);
    head('مشاور کشت');
    const backToCategory=`cropChooseCategory('${esc(activeCategory)}')`;
    app.innerHTML=`<div class="crop-advisor-page">${cropHeader(4,'🌱 '+esc(name),'مرحله ۴ از ۴ · محاسبه و ثبت برنامه کشت.',backToCategory)}
      <div class="crop-detail-card crop-focus-card"><div><b>🌾 زمین: ${esc(land?.name||'انتخاب نشده')}</b><div class="small muted">مساحت: <strong id="cropAreaText">${fmt(area,3)} هکتار</strong></div></div><span class="badge">${esc(activeCategory)}</span></div>
      <div class="crop-detail-card">
        <div class="crop-rate-note">ℹ️ نرخ‌های بذرِ نمونه قابل ویرایش‌اند. برای کود و سم، مقدار را بر اساس آزمون، برچسب محصول مجاز و توصیه کارشناس منطقه وارد کن؛ برنامه دوز ثابت برای کود و سم تجویز نمی‌کند.</div>
        <div class="register-two">
          <div class="field"><label>🌾 بذر — کیلوگرم در هکتار</label><input id="seedRate" type="number" min="0" step="0.01" value="${seedRate||''}" placeholder="مثلاً ۱۸۰"></div>
          <div class="field"><label>🧪 کود — کیلوگرم در هکتار</label><input id="fertRate" type="number" min="0" step="0.01" placeholder="بر اساس برنامه تغذیه"></div>
          <div class="field"><label>🛡️ سم — لیتر در هکتار</label><input id="pestRate" type="number" min="0" step="0.01" placeholder="طبق برچسب همان محصول"></div>
          <div class="field"><label>💧 آب — میلی‌متر در هکتار</label><input id="waterRate" type="number" min="0" step="0.1" placeholder="عمق آبیاری هر نوبت"></div>
        </div>
        <div class="crop-result-grid">
          <div class="crop-calc"><span>🌾 کل بذر</span><b id="calcSeed">۰ کیلوگرم</b></div>
          <div class="crop-calc"><span>🧪 کل کود</span><b id="calcFert">۰ کیلوگرم</b></div>
          <div class="crop-calc"><span>🛡️ کل سم</span><b id="calcPest">۰ لیتر</b></div>
          <div class="crop-calc"><span>💧 حجم آب</span><b id="calcWater">۰ لیتر</b></div>
        </div>
        <div class="crop-advisor-actions"><button class="secondary" onclick="cropReReadArea()">📐 دریافت مساحت زمین</button><button class="primary" onclick="calculateCropPlan()">🧮 محاسبه</button></div>
        <div id="cropCalcStatus" class="measure-status">برای محاسبه، نرخ‌ها را وارد کن.</div>
      </div>
      <div class="crop-detail-card"><div class="row"><div><b>🌱 ثبت محصول برای این زمین</b><div class="small muted">محصول انتخاب‌شده در پرونده زمین ذخیره می‌شود.</div></div><button class="primary" onclick="cropSaveToLand()">ذخیره محصول</button></div></div>
    </div>`;
    calculateCropPlan();
  }

  function cropReReadArea(){
    const land=currentLand();
    const el=document.getElementById('cropAreaText');
    if(el)el.textContent=fmt(land?.area||0,3)+' هکتار';
    calculateCropPlan();
  }

  function calculateCropPlan(){
    const land=currentLand();
    const area=Number(land?.area||0);
    const seed=area*Number(document.getElementById('seedRate')?.value||0);
    const fert=area*Number(document.getElementById('fertRate')?.value||0);
    const pest=area*Number(document.getElementById('pestRate')?.value||0);
    const mm=Number(document.getElementById('waterRate')?.value||0);
    const water=area*10000*mm;
    setText('calcSeed',fmt(seed)+' کیلوگرم');
    setText('calcFert',fmt(fert)+' کیلوگرم');
    setText('calcPest',fmt(pest)+' لیتر');
    setText('calcWater',fmt(water)+' لیتر');
    const s=document.getElementById('cropCalcStatus');
    if(s)s.textContent=area>0?`محاسبه برای ${fmt(area,3)} هکتار انجام شد.`:'ابتدا زمین دارای مساحت مشخص را انتخاب کن.';
  }

  function cropSaveToLand(){
    const land=currentLand();
    if(!land){toast('ابتدا یک زمین انتخاب کن');return}
    land.crop=activeCrop;
    land.cropCategory=activeCategory;
    if(typeof save==='function'&&save()){toast(`محصول «${activeCrop}» برای «${land.name}» ثبت شد`)}
  }

  function setText(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
  function cropIcon(name,cat){
    const m={'گندم':'🌾','جو':'🌾','ذرت':'🌽','برنج':'🌾','سیب زمینی':'🥔','پیاز':'🧅','سیر':'🧄','گوجه فرنگی':'🍅','خیار':'🥒','فلفل':'🌶️','بادمجان':'🍆','کاهو':'🥬','هویج':'🥕','سیب':'🍎','انار':'🍎','انگور':'🍇','هلو':'🍑','زیتون':'🫒','خرما':'🌴','پسته':'🥜','بادام':'🥜','رز':'🌹','زعفران':'🌸'};
    return m[name]||({'غلات':'🌾','حبوبات':'🫘','دانه‌های روغنی':'🌻','سبزی و صیفی':'🥬','گیاهان دارویی و ادویه‌ای':'🌿','میوه‌ها و باغی':'🍎','گرمسیری و نیمه‌خشک':'🌴','خشکبار و مغزها':'🥜','علوفه‌ای':'🌱','صنعتی':'🏭','زینتی':'🌸'}[cat]||'🌱');
  }

  window.openCropAdvisor=openCropAdvisor;
  window.cropChooseCategory=cropChooseCategory;
  window.cropChooseProduct=cropChooseProduct;
  window.calculateCropPlan=calculateCropPlan;
  window.cropReReadArea=cropReReadArea;
  window.cropSaveToLand=cropSaveToLand;
})();
