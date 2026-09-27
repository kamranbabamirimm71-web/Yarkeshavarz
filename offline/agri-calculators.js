/* YarKeshavarz - Legacy agricultural calculator bridge
   Restores the old calculation layer without changing the new app data model. */
(function(){
  'use strict';
  const faDigits=s=>String(s??'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const num=v=>{const x=Number(faDigits(v).replace(/[٬,\s]/g,''));return Number.isFinite(x)?x:0};
  const fmt=v=>Number(v||0).toLocaleString('fa-IR',{maximumFractionDigits:3});
  const money=v=>Math.round(Number(v||0)).toLocaleString('fa-IR')+' تومان';
  const safe=(v)=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  function seedRate(areaHa,kgPerHa){return areaHa>=0&&kgPerHa>=0?areaHa*kgPerHa:null}
  function plantCount(areaM2,rowSpacingCm,plantSpacingCm){const r=rowSpacingCm/100,p=plantSpacingCm/100;return areaM2>0&&r>0&&p>0?Math.round(areaM2/(r*p)):null}
  function irrigationVolume(areaM2,depthMm){return areaM2>0&&depthMm>=0?areaM2*depthMm:null} // L; 1 mm over 1 m² = 1 L
  function fertilizerProduct(nutrientKg,analysisPercent){return nutrientKg>=0&&analysisPercent>0?nutrientKg/(analysisPercent/100):null}
  function breakEven(fixedCost,variableCostPerUnit,pricePerUnit){return pricePerUnit>variableCostPerUnit?fixedCost/(pricePerUnit-variableCostPerUnit):null}

  window.YK_AGRI_CALCS={seedRate,plantCount,irrigationVolume,fertilizerProduct,breakEven};

  function input(id,label,placeholder=''){return `<div class="field"><label>${label}</label><input id="${id}" inputmode="decimal" placeholder="${placeholder}"></div>`}
  function result(id,title,unit=''){return `<div><span>${title}</span><b id="${id}">—</b>${unit?`<small>${unit}</small>`:''}</div>`}

  window.calculator=function(){
    const ctx=typeof window.__YK_APP_CONTEXT__==='function'?window.__YK_APP_CONTEXT__():{state:{lands:[]},selected:null};
    const selected=(ctx.state?.lands||[]).find(x=>x.id===ctx.selected);
    const area=selected?.area||'';
    if(typeof window.head==='function') head('محاسبه‌گر کشاورزی');
    const app=document.getElementById('app'); if(!app)return;
    app.innerHTML=`
      <div class="section"><div><h2>🧮 محاسبه‌گر کشاورزی</h2><div class="small muted">محاسبات فنی نسخه قدیمی، با ظاهر نسخه جدید</div></div><button class="secondary" onclick="go('home')">بازگشت</button></div>
      ${selected?`<div class="card calc-land-head"><div><b>🌾 زمین انتخاب‌شده</b><div class="small muted">${safe(selected.name||'زمین')}</div></div><div class="calc-area"><b>${fmt(area)}</b><small>هکتار</small></div></div>`:''}
      <div class="card crop-card"><div class="row"><b>🌱 محصول</b><span class="badge">بانک محصولات آفلاین</span></div><div class="field" style="margin-top:9px"><select id="calcCrop"><option value="">محصول را انتخاب کن</option>${(window.YK_CROP_NAMES||[]).map(x=>`<option>${safe(x)}</option>`).join('')}</select></div><div class="small muted">انتخاب محصول فعلاً برای ثبت زمینه محاسبه است؛ فرمول‌ها عددی و مستقل از حدس محصول هستند.</div></div>
      <div class="card"><div class="row"><b>🌾 مقدار بذر</b><span class="badge">کیلوگرم</span></div><div class="calc-form-grid">${input('seedArea','مساحت (هکتار)',area||'مثلاً ۲.۵')}${input('seedRate','میزان بذر در هکتار (کیلوگرم)','مثلاً ۱۸۰')}</div><button class="primary" style="width:100%;margin-top:9px" onclick="ykCalcSeed()">محاسبه مقدار بذر</button><div class="calc-total"><span>مقدار کل بذر</span><strong id="seedOut">—</strong><small>مساحت × میزان بذر در هکتار</small></div></div>
      <div class="card"><div class="row"><b>🌱 تعداد بوته / نشا</b><span class="badge">عدد تقریبی</span></div><div class="calc-form-grid">${input('plantArea','مساحت (مترمربع)','مثلاً ۱۰۰۰۰')}${input('rowSpace','فاصله ردیف (سانتی‌متر)','مثلاً ۷۵')}${input('plantSpace','فاصله بوته (سانتی‌متر)','مثلاً ۲۰')}</div><button class="primary" style="width:100%;margin-top:9px" onclick="ykCalcPlants()">محاسبه تعداد</button><div class="calc-result-grid">${result('plantOut','تعداد تقریبی بوته')}</div></div>
      <div class="card"><div class="row"><b>💧 حجم آب آبیاری</b><span class="badge">لیتر</span></div><div class="calc-form-grid">${input('irrArea','مساحت (مترمربع)','مثلاً ۱۰۰۰۰')}${input('irrDepth','عمق آب (میلی‌متر)','مثلاً ۳۰')}</div><button class="primary" style="width:100%;margin-top:9px" onclick="ykCalcIrr()">محاسبه حجم آب</button><div class="calc-result-grid">${result('irrOut','حجم آب','لیتر')}</div></div>
      <div class="card"><div class="row"><b>🧪 مقدار محصول کودی</b><span class="badge">کیلوگرم</span></div><div class="calc-form-grid">${input('nutrient','ماده غذایی موردنیاز (کیلوگرم)','مثلاً ۴۶')}${input('analysis','درصد ماده مؤثر کود','مثلاً ۴۶')}</div><button class="primary" style="width:100%;margin-top:9px" onclick="ykCalcFert()">محاسبه مقدار کود</button><div class="calc-result-grid">${result('fertOut','مقدار محصول کودی','کیلوگرم')}</div></div>
      <div class="card"><div class="row"><b>💰 نقطه سربه‌سر</b><span class="badge">واحد محصول</span></div><div class="calc-form-grid">${input('fixedCost','هزینه ثابت (تومان)','مثلاً ۵۰۰۰۰۰۰۰')}${input('varCost','هزینه متغیر هر واحد','مثلاً ۱۲۰۰۰')}${input('unitPrice','قیمت فروش هر واحد','مثلاً ۲۰۰۰۰')}</div><button class="primary" style="width:100%;margin-top:9px" onclick="ykCalcBE()">محاسبه نقطه سربه‌سر</button><div class="calc-result-grid">${result('beOut','مقدار فروش لازم','واحد')}</div></div>
      <div class="card" style="background:#f7faf8"><b>📌 منطق محاسبات</b><div class="small muted" style="line-height:2;margin-top:7px">مقادیر عددی از فرمول‌های ثبت‌شده در لایه محاسبات استفاده می‌شوند. برای کود و آب، نتیجه یک برآورد ریاضی است و جای توصیه تخصصی بر اساس آزمون خاک/آب و شرایط مزرعه را نمی‌گیرد.</div></div>`;
  };
  const val=id=>num(document.getElementById(id)?.value);
  window.ykCalcSeed=()=>{const r=seedRate(val('seedArea'),val('seedRate'));document.getElementById('seedOut').textContent=r==null?'—':fmt(r)+' کیلوگرم'};
  window.ykCalcPlants=()=>{const r=plantCount(val('plantArea'),val('rowSpace'),val('plantSpace'));document.getElementById('plantOut').textContent=r==null?'—':fmt(r)};
  window.ykCalcIrr=()=>{const r=irrigationVolume(val('irrArea'),val('irrDepth'));document.getElementById('irrOut').textContent=r==null?'—':fmt(r)};
  window.ykCalcFert=()=>{const r=fertilizerProduct(val('nutrient'),val('analysis'));document.getElementById('fertOut').textContent=r==null?'—':fmt(r)};
  window.ykCalcBE=()=>{const r=breakEven(val('fixedCost'),val('varCost'),val('unitPrice'));document.getElementById('beOut').textContent=r==null?'—':fmt(r)};
})();
