/* YarKeshavarz — Page renderers. Functions intentionally remain global for the SPA router. */
function home(){
  head('خانه');

  const t = totals();
  const area = state.lands.reduce((a,l) => a + n(l.area), 0);

  app.innerHTML = `
  <div class="home-page" style="max-width:760px;margin:auto;padding:12px 12px 100px;">

    <!-- هدر اصلی -->
    <section style="
      height:230px;
      border-radius:28px;
      overflow:hidden;
      position:relative;
      margin-bottom:14px;
      background:
        linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,35,24,.82)),
        url('assets/wheat-hero.jpg') center/cover no-repeat;
      box-shadow:0 12px 30px rgba(0,0,0,.12);
    ">
      <div style="
        position:absolute;
        inset:0;
        display:flex;
        flex-direction:column;
        justify-content:flex-end;
        padding:22px;
        color:#fff;
      ">
        <div style="font-size:30px;font-weight:900;line-height:1.2;">
          یار کشاورز
        </div>
        <div style="font-size:13px;margin-top:7px;opacity:.94;">
          مدیریت حرفه‌ای زمین، کشت، هزینه و مزرعه
        </div>
      </div>
    </section>

    <!-- آمار -->
    <section style="
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:10px;
      margin-bottom:16px;
    ">

      <div class="card" style="padding:15px;border-radius:20px;">
        <div class="muted small">🌾 زمین‌ها</div>
        <div style="
          font-size:25px;
          font-weight:900;
          color:#17664b;
          margin-top:6px;
        ">
          ${state.lands.length.toLocaleString('fa-IR')}
        </div>
        <div class="small muted">قطعه ثبت‌شده</div>
      </div>

      <div class="card" style="padding:15px;border-radius:20px;">
        <div class="muted small">📐 مساحت</div>
        <div style="
          font-size:23px;
          font-weight:900;
          color:#17664b;
          margin-top:6px;
        ">
          ${area.toLocaleString('fa-IR',{maximumFractionDigits:3})}
        </div>
        <div class="small muted">هکتار</div>
      </div>

      <div class="card" style="padding:15px;border-radius:20px;">
        <div class="muted small">💸 هزینه</div>
        <div style="
          font-size:17px;
          font-weight:900;
          margin-top:8px;
        ">
          ${money(t.cost)}
        </div>
        <div class="small muted">مجموع هزینه‌ها</div>
      </div>

      <div class="card" style="padding:15px;border-radius:20px;">
        <div class="muted small">💰 درآمد</div>
        <div style="
          font-size:17px;
          font-weight:900;
          color:#17664b;
          margin-top:8px;
        ">
          ${money(t.income)}
        </div>
        <div class="small muted">مجموع درآمد</div>
      </div>

    </section>

    <!-- آب و هوا -->
    <section id="homeWeather" style="
      margin-bottom:18px;
      border-radius:22px;
      overflow:hidden;
      box-shadow:0 8px 24px rgba(0,0,0,.08);
      background:#fff;
    ">
      <div style="
        padding:16px 18px;
        background:linear-gradient(135deg,#17664b,#23815e);
        color:#fff;
      ">
        <div style="
          display:flex;
          align-items:center;
          justify-content:space-between;
        ">
          <div>
            <div style="font-size:17px;font-weight:900;">
              🌤️ آب‌وهوای امروز
            </div>
            <div style="font-size:11px;opacity:.82;margin-top:4px;">
              وضعیت هوای محل زمین
            </div>
          </div>

          <div style="font-size:34px;line-height:1;">
            🌦️
          </div>
        </div>
      </div>

      <div style="padding:14px 16px;">
        <div class="muted small">
          در حال دریافت اطلاعات آب‌وهوا…
        </div>
      </div>
    </section>

    <!-- دسترسی سریع -->
    <section style="margin-bottom:18px;">

      <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin-bottom:10px;
      ">
        <h3 style="margin:0;font-size:17px;">
          دسترسی سریع
        </h3>

        <span class="small muted">
          ابزارهای پرکاربرد
        </span>
      </div>

      <div style="
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:9px;
      ">

        <button
          onclick="go('add')"
          style="
            border:1px solid #e3ebe7;
            border-radius:18px;
            background:#fff;
            padding:13px 5px;
            box-shadow:0 5px 15px rgba(0,0,0,.05);
            font-weight:800;
          "
        >
          <div style="font-size:25px;margin-bottom:6px;">🌱</div>
          <div style="font-size:11px;">ثبت زمین</div>
        </button>

        <button
          onclick="go('measure')"
          style="
            border:1px solid #e3ebe7;
            border-radius:18px;
            background:#fff;
            padding:13px 5px;
            box-shadow:0 5px 15px rgba(0,0,0,.05);
            font-weight:800;
          "
        >
          <div style="font-size:25px;margin-bottom:6px;">📐</div>
          <div style="font-size:11px;">اندازه‌گیری</div>
        </button>

        <button
          onclick="go('inventory')"
          style="
            border:1px solid #e3ebe7;
            border-radius:18px;
            background:#fff;
            padding:13px 5px;
            box-shadow:0 5px 15px rgba(0,0,0,.05);
            font-weight:800;
          "
        >
          <div style="font-size:25px;margin-bottom:6px;">📦</div>
          <div style="font-size:11px;">انبار</div>
        </button>

        <button
          onclick="go('equipment')"
          style="
            border:1px solid #e3ebe7;
            border-radius:18px;
            background:#fff;
            padding:13px 5px;
            box-shadow:0 5px 15px rgba(0,0,0,.05);
            font-weight:800;
          "
        >
          <div style="font-size:25px;margin-bottom:6px;">🚜</div>
          <div style="font-size:11px;">ادوات</div>
        </button>

      </div>
    </section>

    <!-- زمین‌های اخیر -->
    <section>

      <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin-bottom:10px;
      ">
        <h3 style="margin:0;font-size:17px;">
          زمین‌های اخیر
        </h3>

        <button
          class="secondary"
          onclick="go('lands')"
          style="padding:7px 12px;"
        >
          همه
        </button>
      </div>

      <div class="list">
        ${
          state.lands.slice(0,3).map(landCard).join('')
          ||
          '<div class="card empty">هنوز زمینی ثبت نشده است.</div>'
        }
      </div>

    </section>

    <!-- نوار پایین -->
    <nav style="
      position:fixed;
      z-index:1000;
      bottom:0;
      left:0;
      right:0;
      background:rgba(255,255,255,.96);
      backdrop-filter:blur(12px);
      border-top:1px solid #e4ebe7;
      box-shadow:0 -6px 20px rgba(0,0,0,.08);
      padding:7px 8px calc(7px + env(safe-area-inset-bottom));
    ">

      <div style="
        max-width:760px;
        margin:auto;
        display:grid;
        grid-template-columns:repeat(5,1fr);
        gap:4px;
      ">

        <button
          onclick="go('home')"
          style="border:0;background:transparent;padding:6px 2px;border-radius:14px;font-size:10px;font-weight:800;"
        >
          <div style="font-size:21px;">🏠</div>
          خانه
        </button>

        <button
          onclick="go('news')"
          style="border:0;background:transparent;padding:6px 2px;border-radius:14px;font-size:10px;font-weight:800;"
        >
          <div style="font-size:21px;">📰</div>
          اخبار
        </button>

        <button
          onclick="go('yar')"
          style="border:0;background:transparent;padding:6px 2px;border-radius:14px;font-size:10px;font-weight:800;"
        >
          <div style="font-size:21px;">🌾</div>
          کشاورزیار
        </button>

        <button
          onclick="go('ads')"
          style="border:0;background:transparent;padding:6px 2px;border-radius:14px;font-size:10px;font-weight:800;"
        >
          <div style="font-size:21px;">📢</div>
          تبلیغات
        </button>

        <button
          onclick="go('account')"
          style="border:0;background:transparent;padding:6px 2px;border-radius:14px;font-size:10px;font-weight:800;"
        >
          <div style="font-size:21px;">👤</div>
          اکانت
        </button>

      </div>
    </nav>

  </div>
  `;

  loadHomeWeather();
}
function lands(){
  head('زمین‌ها');

  app.innerHTML = `
    <div class="section">
      <h2>زمین‌های من</h2>
      <button class="primary" onclick="go('add')">
        ＋ زمین جدید
      </button>
    </div>

    <div class="list">
      ${
        state.lands.map(landCard).join('')
        ||
        '<div class="card empty">هنوز زمینی ثبت نشده است.</div>'
      }
    </div>
  `;
}
            
function landSchematic(l){
  const ps=l&&l.measurement&&Array.isArray(l.measurement.points)?l.measurement.points:[];
  if(ps.length<3) return '<div class="land-schematic empty"><div>📐</div><b>شماتیک زمین هنوز ثبت نشده</b><small>بعد از اندازه‌گیری زمین، شکل شماتیک آن اینجا نمایش داده می‌شود.</small></div>';
  let minLat=Math.min(...ps.map(p=>p[0])),maxLat=Math.max(...ps.map(p=>p[0])),minLng=Math.min(...ps.map(p=>p[1])),maxLng=Math.max(...ps.map(p=>p[1]));
  let w=Math.max(maxLng-minLng,1e-9),h=Math.max(maxLat-minLat,1e-9),pad=28;
  let xy=ps.map(p=>[(pad+(p[1]-minLng)/w*(320-pad*2)),(pad+(1-(p[0]-minLat)/h)*(220-pad*2))]);
  let poly=xy.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ');
  let dots=xy.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="#fff" stroke="#17664b" stroke-width="2"/><text x="${p[0]+7}" y="${p[1]-7}" font-size="9" font-weight="700" fill="#31584a">${i+1}</text>`).join('');
  let m2=l.areaM2||n(l.area)*10000, ha=m2/10000, per=l.perimeter||0;
  return `<div class="schematic-modern"><div class="schematic-head"><b>📐 شماتیک زمین</b><span class="badge">${ps.length.toLocaleString('fa-IR')} نقطه</span></div><svg viewBox="0 0 320 220" role="img" aria-label="شماتیک ${esc(l.name||'زمین')}"><defs><linearGradient id="sg-${esc(l.id)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0"/><stop offset="1" stop-color="#17664b"/></linearGradient><pattern id="grid-${esc(l.id)}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0L0 0 0 20" fill="none" stroke="#dce9e2" stroke-width="1"/></pattern></defs><rect width="320" height="220" fill="url(#grid-${esc(l.id)})" rx="17"/><polygon points="${poly}" fill="#17664b" fill-opacity=".14" stroke="#17664b" stroke-width="3.5" stroke-linejoin="round"/>${dots}<g transform="translate(278 18)"><circle cx="12" cy="12" r="12" fill="#fff" stroke="#d8e5df"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="#17664b">N</text></g></svg><div class="schematic-meta"><div><span>المساحت</span><b>${Math.round(m2).toLocaleString('fa-IR')} مترمربع</b></div><div><span>هکتار</span><b>${ha.toLocaleString('fa-IR',{maximumFractionDigits:3})}</b></div><div><span>محیط</span><b>${Math.round(per).toLocaleString('fa-IR')} متر</b></div></div><div class="edit-points"><button class="edit-points-btn" onclick="editLandPoints('${l.id}')">✏️ ویرایش نقاط زمین روی نقشه</button></div></div>`;
}

function openLandView(id){
 selected=id;localStorage.setItem('yk-last-land',id);let l=state.lands.find(x=>x.id===id);if(!l)return;head(l.name);
 let photos=l.photos||[];
 app.innerHTML=`<div class="section"><h2>${esc(l.name)}</h2><button class="secondary" onclick="go('lands')">بازگشت</button></div>
 <div class="card yar-land-entry" style="margin:12px 0;border:1px solid rgba(72,190,125,.38);background:linear-gradient(135deg,rgba(16,78,52,.92),rgba(20,55,74,.92));box-shadow:0 10px 28px rgba(0,0,0,.18)">
 <div class="row"><div><b style="font-size:18px;color:#fff">🌾 کشاورزیار این زمین</b><div class="small" style="margin-top:5px;color:#e5f3eb">هر سؤالی درباره «${esc(l.name)}» داری بپرس یا عکس زمین، برگ، محصول و آفت را بفرست.</div></div>
 <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button class="primary" onclick="yarLandMode=true;selected='${id}';go('yar')">🤖 ورود به کشاورزیار</button><button class="secondary" onclick="yarAnalyzeLand('${id}')">🔎 تحلیل وضعیت فعلی</button></div></div></div>
 <div class="grid"><div class="card"><span class="muted">مساحت</span><div class="metric">${n(l.area).toLocaleString('fa-IR')} هکتار</div></div></div>
 <div class="tabs"><button class="active">نمای کلی</button><button onclick="weatherFor('${id}')">🌤️ آب‌وهوا</button><button onclick="selected='${id}';go('cultivation')">🌱 کشت و اقتصاد</button><button onclick="editLand('${id}')">✏️ ویرایش</button></div>
 <div class="card"><div class="row"><b>مشخصات زمین</b><span class="badge">${l.ownership==='rent'?'🔑 اجاره‌ای':'🏠 ملکی'}</span></div>
 <p class="small muted">منطقه: ${esc(l.region||'-')}</p><p class="small muted">خاک: ${esc(l.soil||'-')}</p><p class="small muted">آب: ${esc(l.water||'-')}</p><p class="small muted">آبیاری: ${esc(l.irrigation||'-')}</p><p class="small muted">محصول: ${esc(l.crop||'-')}</p></div>
 <div id="landWeather" class="card weather-mini loading">🌤️ در حال دریافت آب‌وهوای این زمین…</div><div class="card">${landSchematic(l)}</div>
 <div class="card"><div class="row"><b>📸 عکس‌های زمین</b><label class="secondary" style="cursor:pointer">＋ افزودن عکس<input id="landPhoto" type="file" accept="image/*" capture="environment" hidden></label></div><div class="photo-grid">${photos.map(p=>`<img src="${p}" alt="عکس زمین">`).join('')||'<div class="empty" style="grid-column:1/-1;padding:18px">هنوز عکسی ثبت نشده است.</div>'}</div></div>
 <div class="card">
 <div class="row"><b>🤖 تاریخچه تحلیل عکس کشاورزیار</b><span class="badge">${(l.aiAnalyses||[]).length} تحلیل</span></div>
 <div class="analysis-history">${(l.aiAnalyses||[]).map(a=>`<div class="analysis-item"><div class="row"><b>📷 تحلیل عکس</b><span class="small muted">${esc(a.date||'')}</span></div><div class="small">🌱 محصول: ${esc(a.crop||l.crop||'-')}</div><div class="small">🔎 نتیجه: ${esc(a.result||'در انتظار تحلیل')}</div><div class="small">💡 پیشنهاد: ${esc(a.action||'در انتظار پیشنهاد')}</div></div>`).join('')||'<div class="empty" style="padding:15px">هنوز تحلیلی برای این زمین ثبت نشده است.</div>'}</div>
 </div>`;
 loadLandWeather(l);
 document.getElementById('landPhoto').onchange=async e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{l.photos=l.photos||[];l.photos.unshift(r.result);l.photos=l.photos.slice(0,12);save();openLand(id)};r.readAsDataURL(f)}
}

function inventory(){
  head('انبار');
  app.innerHTML=`<div class="section"><h2>📦 انبار</h2><button class="secondary" onclick="go('home')">بازگشت</button></div>
  <div class="card form" id="stockNewForm">
    <b>ثبت ماده جدید</b>
    <div class="field"><label>نام ماده / نهاده</label><input id="stockName" placeholder="مثلاً کود اوره" autocomplete="off"></div>
    <div class="calc-form-grid">
      <div class="field"><label>مقدار اولیه</label><input id="stockQty" inputmode="decimal" placeholder="مثلاً 100"></div>
      <div class="field"><label>واحد</label><select id="stockUnit"><option>کیلوگرم</option><option>لیتر</option><option>عدد</option><option>کیسه</option><option>تن</option><option>دستگاه</option></select></div>
    </div>
    <button class="primary" id="saveStockBtn" type="button" style="width:100%;min-height:48px">💾 ثبت در انبار</button>
  </div>
  <div class="section"><h3>موجودی انبار</h3><span class="badge">${state.inventory.length.toLocaleString('fa-IR')} قلم</span></div>
  <div class="list" id="stockList">${renderStockList()}</div>`;
  document.getElementById('saveStockBtn').onclick=saveNewStock;
}

function cultivation(){
 let l=state.lands.find(x=>x.id===selected);if(!l){toast('ابتدا یک زمین را انتخاب کن');return go('lands')}
 head('کشت و اقتصاد — '+l.name);
 let archived=l.cultivationStatus==='archived', tx=cultivationTx(l), expenses=tx.filter(x=>x.type==='expense').reduce((a,x)=>a+n(x.amount),0), incomes=tx.filter(x=>x.type==='income').reduce((a,x)=>a+n(x.amount),0), profit=incomes-expenses;
 let archives=Array.isArray(l.cultivationArchive)?l.cultivationArchive:[];
 let status=archived?'کشت این سال بایگانی شده است':'کشت جاری';
 let expenseRows=tx.filter(x=>x.type==='expense').slice().reverse().map(x=>`<div class="expense-row"><div><b>${esc(x.category||'سایر')}</b><div class="small muted">${esc(x.stage||x.note||'مرحله ثبت نشده')} ${x.date?' · '+jalaliDate(x.date):''}</div>${x.qty?`<div class="small">مقدار: <b>${n(x.qty).toLocaleString('fa-IR')} ${esc(x.unit||'واحد')}</b>${x.unitPrice?` · قیمت واحد: <b>${money(x.unitPrice)}</b>`:''}</div>`:''}</div><div class="expense-row-actions"><b>${money(x.amount)}</b>${archived?'':`<button class="secondary mini-btn" onclick="editLandExpense('${x.id}')">✏️</button><button class="danger mini-btn" onclick="deleteLandExpense('${x.id}')">🗑️</button>`}</div></div>`).join('')||'<div class="small muted" style="padding:12px 0">هنوز هزینه‌ای برای این کشت ثبت نشده است.</div>';
 app.innerHTML=`<div class="section"><div><h2>🌱 کشت و اقتصاد</h2><div class="small muted">${esc(l.name)} · ${status}</div></div><button class="secondary" onclick="openLand('${l.id}')">بازگشت</button></div>
 <div class="card crop-focus"><div><b>${esc(l.crop||'محصول ثبت نشده')}</b><div class="small muted">مساحت کل زمین: ${n(l.area).toLocaleString('fa-IR')} هکتار</div></div><span class="badge">${archived?'📁 بایگانی شده':'🌱 کشت جاری'}</span></div>
 <div class="economy-grid"><div class="economy-box income"><span>💵 درآمد کل</span><b>${money(incomes)}</b></div><div class="economy-box cost"><span>💸 هزینه مصرفی کل زمین</span><b>${money(expenses)}</b></div><div class="economy-box ${profit>=0?'profit':'loss'}"><span>${profit>=0?'📈 سود':'📉 زیان'}</span><b>${money(Math.abs(profit))}</b></div></div>
 ${archived?`<div class="card"><div class="row"><div><b>📁 پرونده این سال بایگانی شده</b><div class="small muted">اطلاعات کشت، هزینه‌ها و درآمدها داخل پرونده زمین نگهداری شده‌اند.</div></div><button class="primary" onclick="startNewCultivation('${l.id}')">🌱 شروع کشت جدید</button></div></div>`:`<div class="card"><div class="row"><div><b>🌾 اطلاعات کشت جاری</b><div class="small muted">فقط اطلاعات واقعی همین کشت را ثبت کن؛ هزینه‌ها می‌توانند در چند مرحله ثبت شوند.</div></div><span class="badge">${l.plantDate?jalaliDate(l.plantDate):'تاریخ کاشت ثبت نشده'}</span></div>
 <div class="form"><div class="field"><label>محصول</label><input id="fieldCrop" value="${esc(l.crop||'')}" placeholder="مثلاً گندم"></div><div class="field"><label>رقم / گونه</label><input id="fieldVariety" value="${esc(l.cropVariety||'')}"></div><div class="field"><label>تاریخ کاشت</label><input id="fieldPlantDate" type="text" inputmode="numeric" dir="ltr" placeholder="۱۴۰۵/۰۷/۱۵" value="${l.plantDate?jalaliDate(l.plantDate):''}"></div><div class="field"><label>یادداشت کشت</label><textarea id="fieldCropNotes">${esc(l.cropNotes||'')}</textarea></div></div><button class="primary" style="width:100%" onclick="saveCultivation()">💾 ذخیره اطلاعات کشت</button></div>`}
 <div class="card"><div class="row"><div><b>💸 هزینه‌های واقعی مصرف‌شده</b><div class="small muted">هر مرحله را جدا ثبت کن؛ مثلاً کود اول فصل، کود وسط فصل، سم‌پاشی اول، سم‌پاشی دوم و چند نوبت ادوات. مبلغ همیشه برای <b>کل زمین</b> است.</div></div>${archived?'':`<button class="primary" onclick="addLandExpense('${l.id}')">＋ افزودن مرحله هزینه</button>`}</div>
 <div class="expense-breakdown">${['بذر','کود','سم','آبیاری','کارگر','ماشین‌آلات','سایر'].map(c=>{let v=tx.filter(x=>x.type==='expense'&&x.category===c).reduce((a,x)=>a+n(x.amount),0);return `<div><span>${c==='بذر'?'🌾':c==='کود'?'🧪':c==='سم'?'🧴':c==='آبیاری'?'💧':c==='کارگر'?'👷':c==='ماشین‌آلات'?'🚜':'📌'} ${c}</span><b>${money(v)}</b></div>`}).join('')}</div>
 <div class="expense-list">${expenseRows}</div><div class="crop-cost-total"><span>جمع هزینه مصرفی کل زمین</span><b>${money(expenses)}</b></div></div>
 <div class="card"><div class="row"><div><b>💵 درآمد کل برداشت</b><div class="small muted">بعد از فروش محصول، درآمد واقعی را ثبت کن.</div></div>${archived?'':`<button class="primary" onclick="addLandIncome('${l.id}')">＋ ثبت درآمد کل</button>`}</div><div class="expense-mini-list">${tx.filter(x=>x.type==='income').slice(-10).reverse().map(x=>`<div><span>${esc(x.note||'فروش/درآمد')}</span><b>${money(x.amount)}</b></div>`).join('')||'<div class="small muted" style="padding-top:10px">هنوز درآمدی ثبت نشده است.</div>'}</div></div>
 ${archived?'':`<div class="card" style="border:1px solid #d8b24c;background:#fffaf0"><div class="row"><div><b>📦 پایان برداشت و بایگانی</b><div class="small muted">وقتی برداشت کاملاً تمام شد، پرونده کشت این سال را داخل پرونده زمین بایگانی کن.</div></div><button class="primary" onclick="archiveCultivation('${l.id}')">📁 پایان برداشت و بایگانی سال</button></div></div>`}
  ${archives.length?`<div class="card"><div class="row"><b>🗂️ آرشیو سال‌های کشت</b><span class="badge">${archives.length} سال</span></div>${archives.slice().reverse().map(a=>`<div class="card" style="margin-top:10px;background:#f7faf8"><div class="row"><div><b>${esc(a.crop||'کشت ثبت‌شده')}</b><div class="small muted">${esc(a.year||a.harvestDate||'')} · ${n(a.area).toLocaleString('fa-IR')} هکتار</div></div><span class="badge">${money(a.income||0)}</span></div><div class="small" style="margin-top:6px">هزینه: <b>${money(a.cost||0)}</b> · ${a.profit>=0?'سود':'زیان'}: <b>${money(Math.abs(a.profit||0))}</b></div></div>`).join('')}</div>`:''}`;
}

function profile(){head('پروفایل');let p=state.profile||{};app.innerHTML=`<div class="card"><div class="profile-head"><div class="avatar">${p.photo?`<img class="avatar" src="${p.photo}" alt="پروفایل">`:'👤'}</div><div><h2 style="margin:0">${esc(p.name||'کشاورز')}</h2><div class="small muted">پروفایل کشاورز</div></div></div></div><form class="card form" id="profileForm" style="margin-top:10px"><div class="field"><label>عکس پروفایل</label><input id="profilePhoto" type="file" accept="image/*" capture="user"></div><div class="field"><label>نام و نام خانوادگی</label><input name="name" value="${esc(p.name||'')}" placeholder="مثلاً احمد رضایی"></div><div class="field"><label>شماره تماس</label><input name="phone" inputmode="tel" value="${esc(p.phone||'')}" placeholder="09xxxxxxxxx"></div><div class="field"><label>ایمیل</label><input name="email" type="email" value="${esc(p.email||'')}" placeholder="example@email.com"></div><div class="field"><label>شهر / روستا</label><input name="location" value="${esc(p.location||'')}" placeholder="محل فعالیت کشاورزی"></div><div class="field"><label>توضیحات</label><textarea name="bio" placeholder="اطلاعات تکمیلی کشاورز">${esc(p.bio||'')}</textarea></div><button class="primary">💾 ذخیره پروفایل</button></form>`;document.getElementById('profileForm').onsubmit=async e=>{e.preventDefault();let f=new FormData(e.target);let photo=p.photo||'';let file=document.getElementById('profilePhoto').files[0];if(file){photo=await new Promise(res=>{let r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(file)})}state.profile={name:f.get('name'),phone:f.get('phone'),email:f.get('email'),location:f.get('location'),bio:f.get('bio'),photo};save();toast('پروفایل ذخیره شد');profile()}}

function managerChat(){
  head('ارتباط با مدیر');
  let msgs=managerLoad();
  if(!msgs.length){
    msgs=[{role:'manager',text:'سلام 🌱 خوش اومدی. اینجا می‌تونی پیشنهاد، انتقاد، گزارش مشکل یا درخواستت درباره یار کشاورز رو برای مدیر اپلیکیشن بنویسی.',ts:Date.now()}];
    managerSave(msgs);
  }
  app.innerHTML=`<div class="manager-wrap">
    <section class="manager-hero">
      <div class="manager-profile"><div class="manager-avatar">👨‍💼</div><div><h2>ارتباط با مدیر اپلیکیشن</h2><div class="manager-status">مدیر یار کشاورز</div></div></div>
      <p class="manager-note">پیامت را واضح بنویس. برای گزارش مشکل، اگر امکانش هست نام بخش و کاری که انجام دادی را هم بگو.</p>
    </section>
    <div class="manager-topics">
      <button type="button" onclick="managerQuick('گزارش یک مشکل در برنامه')">🐞 گزارش مشکل</button>
      <button type="button" onclick="managerQuick('پیشنهاد برای بهتر شدن برنامه')">💡 پیشنهاد</button>
      <button type="button" onclick="managerQuick('درخواست اضافه شدن یک قابلیت')">🛠️ قابلیت جدید</button>
      <button type="button" onclick="managerQuick('انتقاد یا نظر درباره برنامه')">📝 انتقاد و نظر</button>
    </div>
    <div id="managerChat" class="manager-chat"></div>
    <form class="manager-compose" onsubmit="event.preventDefault();managerSend()">
    <textarea id="managerInput" rows="1" placeholder="پیامت برای مدیر را بنویس…"></textarea>
      <button type="submit" aria-label="ارسال پیام">➤</button>
    </form>
    <div class="manager-actions">
      <button class="secondary" type="button" onclick="managerClear()">پاک کردن گفت‌وگو</button>
      <button class="secondary" type="button" onclick="go('account')">بازگشت به اکانت</button>
    </div>
  </div>`;
  managerRender();
  const inp=document.getElementById('managerInput');
  if(inp){
    inp.addEventListener('input',()=>{inp.style.height='auto';inp.style.height=Math.min(inp.scrollHeight,110)+'px'});
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();managerSend()}});
  }
}

function settings(){
  head('تنظیمات');
  let s={};
  try{s=JSON.parse(localStorage.getItem('yk-settings-v1')||'{}')}catch(e){}
  const dark=!!s.dark;
  const notify=s.notify!==false;
  const sound=s.sound!==false;
  const font=s.font||'normal';
  app.innerHTML=`<div class="settings-wrap">
    <div class="card" style="margin-bottom:12px">
      <h2>⚙️ تنظیمات یار کشاورز</h2>
      <p class="small muted">تنظیمات این بخش روی همین دستگاه ذخیره می‌شود.</p>
    </div>

    <section class="settings-section">
      <div class="settings-title">🎨 ظاهر برنامه</div>
      <div class="setting-row">
        <div class="setting-info"><div class="setting-name">حالت شب</div><div class="setting-desc">ظاهر تیره برای استفاده در محیط کم‌نور.</div></div>
        <label class="settings-switch setting-action"><input id="setDark" type="checkbox" ${dark?'checked':''} onchange="settingsApply()"><span class="settings-slider"></span></label>
      </div>
      <div class="setting-row">
        <div class="setting-info"><div class="setting-name">اندازه نوشته</div><div class="setting-desc">اندازه متن برنامه و گفتگوها.</div></div>
        <select id="setFont" class="settings-select" onchange="settingsApply()">
          <option value="small" ${font==='small'?'selected':''}>کوچک</option>
          <option value="normal" ${font==='normal'?'selected':''}>معمولی</option>
          <option value="large" ${font==='large'?'selected':''}>بزرگ</option>
        </select>
      </div>
    </section>

    <section class="settings-section">
      <div class="settings-title">🔔 اعلان‌ها</div>
      <div class="setting-row">
        <div class="setting-info"><div class="setting-name">اعلان‌ها</div><div class="setting-desc">آماده‌سازی برای اعلان‌های برنامه در نسخه آنلاین.</div></div>
        <label class="settings-switch setting-action"><input id="setNotify" type="checkbox" ${notify?'checked':''} onchange="settingsApply()"><span class="settings-slider"></span></label>
      </div>
      <div class="setting-row">
        <div class="setting-info"><div class="setting-name">صدای ارسال پیام</div><div class="setting-desc">کنترل صدای رابط کاربری؛ در صورت پشتیبانی مرورگر.</div></div>
        <label class="settings-switch setting-action"><input id="setSound" type="checkbox" ${sound?'checked':''} onchange="settingsApply()"><span class="settings-slider"></span></label>
      </div>
    </section>

    <section class="settings-section">
      <div class="settings-title">💬 گفتگو و اطلاعات</div>
      <div class="setting-row">
        <div class="setting-info"><div class="setting-name">پاک کردن گفت‌وگوی کشاورزیار</div><div class="setting-desc">پیام‌های ذخیره‌شده روی این دستگاه حذف می‌شوند.</div></div>
        <button class="secondary settings-danger setting-action" type="button" onclick="settingsClearYar()">پاک کردن</button>
      </div>
      <div class="setting-row">
        <div class="setting-info"><div class="setting-name">پاک کردن گفت‌وگوی مدیر</div><div class="setting-desc">پیام‌های ارتباط با مدیر از این دستگاه حذف می‌شوند.</div></div>
        <button class="secondary settings-danger setting-action" type="button" onclick="settingsClearManager()">پاک کردن</button>
      </div>
    </section>

    <section class="settings-section">
      <div class="settings-title">ℹ️ درباره برنامه</div>
      <div class="setting-row"><div class="setting-info"><div class="setting-name">یار کشاورز</div><div class="setting-desc">دستیار هوشمند کشاورزی و ابزار مدیریت مزرعه</div></div><span class="small muted">V3</span></div>
      <div class="setting-row"><div class="setting-info"><div class="setting-name">حریم خصوصی</div><div class="setting-desc">اطلاعات محلی برنامه در حافظه مرورگر همین دستگاه نگهداری می‌شود.</div></div></div>
    </section>

    <button class="secondary settings-back" type="button" onclick="go('account')">← بازگشت به اکانت</button>
  </div>`;
  settingsApply(false);
}

function account(){head('اکانت');app.innerHTML=`<div class="card"><h2>👤 حساب کاربری</h2><p class="small muted">اطلاعات برنامه روی همین دستگاه ذخیره می‌شود.</p><button class="primary" onclick="go('profile')">پروفایل کشاورز</button><button class="primary" style="margin-top:8px" onclick="go('manager')">👨‍💼 ارتباط با مدیر اپلیکیشن</button><button class="primary" style="margin-top:8px" onclick="go('settings')">⚙️ تنظیمات</button></div><div class="card" style="margin-top:10px"><b>💾 پشتیبان‌گیری</b><p class="small muted">اطلاعات زمین‌ها، انبار، ادوات و پروفایل را ذخیره یا بازیابی کن.</p><div class="actions"><button class="secondary" onclick="backup()">خروجی پشتیبان</button><button class="secondary" onclick="document.getElementById('restore').click()">بازیابی پشتیبان</button></div></div><div class="card" style="margin-top:10px"><b>نسخه آزمایشی</b><p class="small muted">V3 Trial — قبل از جایگزینی GitHub ابتدا روی گوشی تست شود.</p></div>`}

function ads(){head('تبلیغات');let items=[{icon:'🌱',cat:'بذر',title:'بذرهای اصلاح‌شده و پربازده',text:'انواع بذر مناسب کشت‌های مختلف؛ قبل از خرید شرایط منطقه و رقم را بررسی کن.',price:'تماس برای قیمت'},{icon:'🧪',cat:'نهاده',title:'کود و نهاده کشاورزی',text:'معرفی محصولات و خدمات تأمین نهاده برای کشاورزان.',price:'استعلام قیمت'},{icon:'🚜',cat:'تجهیزات',title:'ماشین‌آلات و تجهیزات مزرعه',text:'آگهی‌های مرتبط با ادوات و تجهیزات کشاورزی در این بخش نمایش داده می‌شود.',price:'تماس با فروشنده'}];app.innerHTML=`<div class="ads-hero"><h2>📢 بازار و تبلیغات کشاورزی</h2><p>محصولات، تجهیزات و خدماتی که برای کشاورز کاربردی هستند.</p></div><div class="filter-row"><button class="active">همه</button><button>🌱 بذر</button><button>🧪 نهاده</button><button>🚜 تجهیزات</button><button>🛠️ خدمات</button></div><div class="ads-grid">${items.map((x,i)=>`<article class="ad-item"><div class="ad-top"><span style="font-size:30px">${x.icon}</span><span class="badge-ad">${x.cat}</span></div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p><div class="meta-line"><span class="ad-price">${esc(x.price)}</span></div><button class="primary ad-contact" onclick="toast('اطلاعات تماس این آگهی در نسخه آنلاین فعال می‌شود')">☎️ اطلاعات تماس</button></article>`).join('')}</div><div class="card" style="margin-top:12px"><b>📌 ثبت آگهی</b><p class="small muted">در مرحله اتصال آنلاین، کشاورزان و فروشندگان می‌توانند آگهی ثبت کنند.</p></div>`}

function news(){head('اخبار');let items=[{icon:'🌾',cat:'کشت',title:'مدیریت مرحله‌ای کشت؛ از آماده‌سازی تا برداشت',text:'ثبت عملیات و مشاهده وضعیت زمین کمک می‌کند تصمیم‌های مزرعه بر اساس سابقه واقعی گرفته شوند.',date:'امروز'},{icon:'🌦️',cat:'هوا',title:'هشدارهای آب‌وهوایی را جدی بگیرید',text:'پیش از آبیاری، سم‌پاشی یا عملیات حساس، شرایط جوی و پیش‌بینی روزهای آینده را بررسی کنید.',date:'امروز'},{icon:'💧',cat:'آبیاری',title:'آبیاری دقیق‌تر با ثبت مصرف آب',text:'ثبت زمان و مقدار آبیاری برای مقایسه عملکرد زمین و مدیریت بهتر منابع مفید است.',date:'این هفته'},{icon:'📦',cat:'بازار',title:'مدیریت موجودی انبار از هزینه‌های اضافی جلوگیری می‌کند',text:'ورودی و مصرف نهاده‌ها را جداگانه ثبت کن تا موجودی واقعی همیشه مشخص باشد.',date:'این هفته'}];app.innerHTML=`<div class="news-hero"><h2>📰 اخبار کشاورزی</h2><p>مطالب کاربردی برای تصمیم‌های بهتر در مزرعه.</p></div><div class="filter-row"><button class="active">همه</button><button>🌾 کشت</button><button>🌦️ هوا</button><button>💧 آبیاری</button><button>📈 بازار</button></div><div class="news-grid">${items.map((x,i)=>`<article class="news-item"><div class="news-top"><span style="font-size:29px">${x.icon}</span><span class="badge-news">${x.cat}</span></div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p><div class="meta-line">${esc(x.date)} · یار کشاورز</div><button class="secondary" style="width:100%;margin-top:11px" onclick="openNewsDetail(${i})">ادامه مطلب ←</button></article>`).join('')}</div>`;window.__ykNews=items}

function equipment(){head('ادوات');let list=state.equipment||[];app.innerHTML=`<div class="section"><h2>🚜 ادوات و ماشین‌آلات</h2><button class="primary" onclick="addEquipment()">＋ ثبت وسیله</button></div><div class="equip-grid">${list.map((x,i)=>`<article class="card equip-item"><div class="equip-icon">${esc(x.icon||'🚜')}</div><div><b>${esc(x.name)}</b><div class="equip-meta">نوع: ${esc(x.type||'-')}<br>مدل: ${esc(x.model||'-')} · وضعیت: ${esc(x.status||'فعال')}</div></div><div class="actions" style="margin:0"><button class="secondary" onclick="editEquipment(${i})">✏️</button><button class="danger" onclick="deleteEquipment(${i})">🗑️</button></div></article>`).join('')||'<div class="card empty">هنوز ادواتی ثبت نشده است.</div>'}</div>`}

function weather(){head('آب‌وهوا');let l=state.lands.find(x=>x.lat!=null&&x.lng!=null);if(l){weatherFor(l.id);return}loadGeneralWeather()}

function yar(){
const l=selected?yarLand(selected):null;
  
  head(l?'کشاورزیار — '+l.name:'کشاورزیار');
  if(!yarMessages.length)yarMessages=[{role:'bot',text:l?`سلام 🌱 من کشاورزیارِ «${l.name}» هستم. پرونده این قطعه را در اختیار دارم و می‌توانی هر سؤال، عکس یا درخواست تحلیل را مطرح کنی.`:'سلام 🌱 من کشاورزیارم. دستیار عمومی کشاورزی هستم؛ بدون انتخاب زمین، هر سؤال کشاورزی یا عکس را می‌توانی برای بررسی بفرستی.'}];
  const c=yarContext();
  const analysis=l?yarQuickAnalysis(l.id):yarQuickAnalysis(null);
  const analysisClass=analysis.level==='نیازمند توجه'?'warn':'ok';
  app.innerHTML=`<section class="yarpro yar-final">
    <header class="yarpro-head">
      <button type="button" class="yarpro-switch" onclick="go('home')">✕</button>
      <div class="yarpro-brand"><div class="yarpro-avatar">✦</div><div><h2>کشاورزیار</h2><span>${l?'متخصص پرونده «'+esc(l.name)+'»':'دستیار هوشمند عمومی کشاورزی'}</span></div></div>
      ${l?`<button class="yarpro-switch" onclick="yarLandMode=false;selected=null;go('yar')">عمومی</button>`:''}
    </header>

    <div id="yarChat" class="yarpro-chat"></div>
    <input id="yarPhotoInputGallery" type="file" accept="image/*" onchange="yarPhotoSelected(this)" hidden>
    <input id="yarPhotoInputCamera" type="file" accept="image/*" capture="environment" onchange="yarPhotoSelected(this)" hidden>
    <div id="yarPhotoPreview" class="yar-photo-preview" style="display:none"><img id="yarPhotoPreviewImg" alt="پیش‌نمایش عکس"><button type="button" onclick="yarRemovePhoto()">×</button></div>
    <form class="yarpro-form yar-final-form" onsubmit="event.preventDefault();yarSend()"><button type="button" class="yarpro-type" onclick="yarFocusInput()" aria-label="تایپ پیام" title="تایپ پیام">⌨️</button><button type="button" class="yarpro-camera" onclick="yarPickCamera()" aria-label="افزودن عکس">📷</button><input id="yarInput" autocomplete="off" placeholder="${l?'درباره همین زمین سؤال کن…':'هر سؤال کشاورزی که داری…'}"><button type="submit" class="yarpro-send" aria-label="ارسال پیام" title="ارسال پیام">➤</button></form>
    <div class="yar-final-tools" aria-label="ابزارهای کشاورزیار">
      <button type="button" onclick="${l?`yarAnalyzeLand('${l.id}')`:`yarAsk('اطلاعات و وضعیت مزرعه را بررسی کن')`}"><span>🌾</span><b>تحلیل مزرعه</b></button>
      <button type="button" onclick="openCropAdvisor()"><span>🌱</span><b>مشاور کشت</b></button>
      <button type="button" onclick="yarAsk('وضعیت انبار و نهاده را بررسی کن')"><span>📦</span><b>انبار و نهاده</b></button>
      <button type="button" onclick="yarAsk('اقتصاد مزرعه و هزینه و درآمد را بررسی کن')"><span>💰</span><b>اقتصاد مزرعه</b></button>
      <button type="button" onclick="yarPickPhoto()"><span>📷</span><b>تحلیل عکس</b></button>
    </div>
    <div class="yarpro-hint">${l?'این گفت‌وگو به پرونده همین زمین متصل است.':'حالت عمومی فعال است؛ برای سؤال درباره یک قطعه، از داخل پرونده همان زمین وارد کشاورزیار شو.'}</div>
  </section>`;
  yarRender();
  yarBindInput();
}

function game(){
  head('سرگرمی');
  let g=loadGame();
  const cell=i=>{let x=g.cells[i];return `<button class="farm-cell" onclick="gameCell(${i})"><b>${x.crop?x.icon:'➕'}</b><small>${x.crop?x.crop:'زمین خالی'}</small></button>`};
  app.innerHTML=`<div class="game-wrap"><section class="game-hero"><h2>🎮 کشاورز استراتژی</h2><p>مزرعه‌ات را مدیریت کن، محصول بکار، آب را کنترل کن و سرمایه‌ات را افزایش بده.</p><div class="game-stats"><div class="game-stat"><b>${g.money.toLocaleString('fa-IR')}</b><small>💰 سرمایه</small></div><div class="game-stat"><b>${g.water.toLocaleString('fa-IR')}</b><small>💧 آب</small></div><div class="game-stat"><b>${g.day.toLocaleString('fa-IR')}</b><small>📅 روز</small></div><div class="game-stat"><b>${g.level.toLocaleString('fa-IR')}</b><small>⭐ سطح</small></div></div></section><div class="game-card"><div class="section" style="margin-top:0"><h3>🚜 مزرعه من</h3><span class="badge">۶ قطعه</span></div><div class="farm-grid">${[0,1,2,3,4,5].map(cell).join('')}</div></div><div class="game-card"><b>⚡ اقدامات امروز</b><div class="game-actions" style="margin-top:9px"><button class="primary" onclick="gameWater()">💧 آبیاری</button><button class="secondary" onclick="gameHarvest()">🌾 برداشت</button><button class="secondary" onclick="gameMarket()">🛒 بازار</button><button class="secondary" onclick="gameNextDay()">🌅 روز بعد</button></div></div><div class="game-card"><div class="row"><b>📜 گزارش مزرعه</b><button class="secondary" onclick="resetGame()">شروع دوباره</button></div><div class="game-log" style="margin-top:9px">${g.log.map(x=>`<div>${x}</div>`).join('')}</div></div></div>`;
}
