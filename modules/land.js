/* YarKeshavarz — land.js */

function landThumb(l){
  const ps=l&&l.measurement&&Array.isArray(l.measurement.points)?l.measurement.points:[];
  let poly='38,62 72,30 126,24 178,43 196,84 160,106 94,104 48,86';
  if(ps.length>=3){
    const xs=ps.map(p=>+p[1]),ys=ps.map(p=>+p[0]);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const dx=maxX-minX||1e-6,dy=maxY-minY||1e-6;
    poly=ps.map(p=>`${22+((+p[1]-minX)/dx)*176},${24+((maxY-+p[0])/dy)*82}`).join(' ');
  }
  return `<div class="land-thumb" aria-label="شماتیک ${esc(l.name||'زمین')}"><svg viewBox="0 0 220 130" role="img"><defs><pattern id="thg-${esc(l.id)}" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M18 0H0V18" fill="none" stroke="#dcebe3" stroke-width="1"/></pattern><linearGradient id="thf-${esc(l.id)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38a169"/><stop offset="1" stop-color="#176b43"/></linearGradient></defs><rect width="220" height="130" rx="18" fill="url(#thg-${esc(l.id)})"/><polygon points="${poly}" fill="url(#thf-${esc(l.id)})" fill-opacity=".18" stroke="#176b43" stroke-width="4" stroke-linejoin="round"/><path d="M28 105 C65 88 82 101 112 89 S166 74 194 91" fill="none" stroke="#7abf9b" stroke-width="3" stroke-linecap="round" opacity=".75"/><circle cx="22" cy="18" r="11" fill="#fff" stroke="#d7e7df"/><text x="22" y="22" text-anchor="middle" font-size="11" font-weight="800" fill="#176b43">N</text></svg></div>`;
}

function landCard(l){let t=totals(l.id);return `<article class="card"><div class="row land-title-row"><div class="land-title-wrap">${landThumb(l)}<div class="land-title-text"><h3>${esc(l.name)}</h3><span class="badge">${l.ownership==='rent'?'اجاره‌ای':'مالک'}</span></div></div><b>${n(l.area).toLocaleString('fa-IR')} هکتار</b></div><p class="muted small">${esc(l.region||'موقعیت ثبت نشده')} · ${esc(l.crop||'کشت ثبت نشده')}</p><div class="row small"><span>هزینه: ${money(t.cost)}</span><span>سود: ${money(t.profit)}</span></div><div class="actions"><button class="primary" onclick="openLand('${l.id}')">پرونده زمین</button><button class="secondary" onclick="weatherFor('${l.id}')">هوا</button></div></article>`}


/* =========================================================
   YarKeshavarz — Add Land / Registration
   ========================================================= */

function add(){
  head('ثبت زمین');

  let pending = null;
  try {
    const raw = sessionStorage.getItem('yk-pending-measure');
    if(raw) pending = JSON.parse(raw);
  } catch(e) {
    pending = null;
  }

  const area = pending && Number.isFinite(Number(pending.areaM2))
    ? Number(pending.areaM2)
    : 0;

  const lat = pending ? Number(pending.lat) : '';
  const lng = pending ? Number(pending.lng) : '';

  app.innerHTML = `
    <div class="section register-page">
      <div class="page-header-row">
        <div>
          <h2>🌾 ثبت زمین</h2>
          <p class="small muted">اطلاعات زمین را ثبت کن یا ابتدا آن را روی نقشه اندازه‌گیری کن.</p>
        </div>
        <button type="button" class="secondary" onclick="go('home')">بازگشت</button>
      </div>

      <div class="register-card">
        <div class="register-actions-top">
          <button type="button" class="primary" onclick="startMeasureForNewLand()">
            📐 اندازه‌گیری روی نقشه
          </button>
          ${area > 0 ? `<span class="measure-pending">✅ اندازه‌گیری آماده ثبت — ${Math.round(area).toLocaleString('fa-IR')} مترمربع</span>` : ''}
        </div>

        <form id="landRegisterForm" class="register-form">
          <div class="register-two">
            <div class="field">
              <label>نام زمین *</label>
              <input name="name" required placeholder="مثلاً زمین شمالی">
            </div>

            <div class="field">
              <label>روستا / شهر / منطقه</label>
              <input name="region" placeholder="مثلاً گوکتپه">
            </div>

            <div class="field">
              <label>مساحت (هکتار)</label>
              <input name="area" inputmode="decimal" value="${area ? (area/10000).toFixed(4) : ''}" placeholder="مثلاً ۲٫۵">
            </div>

            <div class="field">
              <label>محصول</label>
              <input name="crop" placeholder="مثلاً گندم میهن">
            </div>

            <div class="field">
              <label>نوع خاک</label>
              <input name="soil" placeholder="مثلاً لومی">
            </div>

            <div class="field">
              <label>منبع آب</label>
              <input name="water" placeholder="چاه، قنات، رودخانه...">
            </div>

            <div class="field">
              <label>روش آبیاری</label>
              <input name="irrigation" placeholder="قطره‌ای، بارانی، غرقابی">
            </div>

            <div class="field">
              <label>نوع مالکیت</label>
              <select name="ownership">
                <option value="own">🏠 ملکی</option>
                <option value="rent">🔑 اجاره‌ای</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>توضیحات</label>
            <textarea name="notes" placeholder="توضیحات مهم درباره زمین..."></textarea>
          </div>

          <div class="register-actions">
            <button type="button" class="secondary" onclick="go('lands')">انصراف</button>
            <button type="submit" class="primary">💾 ثبت زمین</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('landRegisterForm');
  if(!form) return;

  form.addEventListener('submit', function(e){
    e.preventDefault();

    const f = new FormData(form);
    const name = String(f.get('name') || '').trim();

    if(!name){
      toast('نام زمین را وارد کن.');
      return;
    }

    const areaHa = n(f.get('area'));
    const points = pending && Array.isArray(pending.points)
      ? pending.points.map(p => [Number(p[0]), Number(p[1])])
      : [];

    const land = {
      id: uid(),
      name,
      area: areaHa,
      areaM2: pending && pending.areaM2 ? Number(pending.areaM2) : areaHa * 10000,
      perimeter: pending && pending.perimeter ? Number(pending.perimeter) : 0,
      lat: Number.isFinite(lat) && lat ? lat : null,
      lng: Number.isFinite(lng) && lng ? lng : null,
      region: String(f.get('region') || '').trim(),
      crop: String(f.get('crop') || '').trim(),
      soil: String(f.get('soil') || '').trim(),
      water: String(f.get('water') || '').trim(),
      irrigation: String(f.get('irrigation') || '').trim(),
      ownership: String(f.get('ownership') || 'own'),
      notes: String(f.get('notes') || '').trim(),
      photos: [],
      measurement: points.length >= 3 ? {
        points,
        areaM2: Number(pending.areaM2 || areaHa * 10000),
        perimeter: Number(pending.perimeter || 0),
        source: 'online-map',
        updatedAt: new Date().toISOString()
      } : null
    };

    state.lands.push(land);
    save();

    try {
      sessionStorage.removeItem('yk-pending-measure');
    } catch(e) {}

    selected = land.id;

    toast('✅ زمین با موفقیت ثبت شد.');
    setTimeout(() => openLand(land.id), 250);
  });
}

/* مسیرهای سازگار با نسخه‌های قبلی */
window.addLand = add;

function setOwnership(v){const hidden=document.getElementById('ownershipValue');if(hidden)hidden.value=v;document.querySelectorAll('.ownership-option').forEach(b=>b.classList.toggle('active',b.dataset.value===v));const box=document.getElementById('rentDetails');if(box)box.hidden=v!=='rent'}

function startMeasureForNewLand(){selected=null;measureReturn='add';go('measure')}

function editLandPoints(id){selected=id;measureReturn='land';measure(id)}

function editLand(id){
  let l=state.lands.find(x=>x.id===id);if(!l)return;head('ویرایش زمین');
  app.innerHTML=`<div class="section"><h2>✏️ ویرایش اطلاعات زمین</h2><button class="secondary" onclick="openLand('${id}')">بازگشت</button></div>
    <form class="card form" id="editForm">
    <div class="field"><label>نام زمین *</label><input name="name" value="${esc(l.name||'')}" required></div>
    <div class="register-two">
      <div class="field"><label>مساحت (هکتار)</label><input name="area" inputmode="decimal" value="${l.area||''}"></div>
      <div class="field"><label>روستا / شهر / منطقه</label><input name="region" value="${esc(l.region||'')}"></div>
      <div class="field"><label>نوع خاک</label><input name="soil" value="${esc(l.soil||'')}" placeholder="مثلاً لومی"></div>
      <div class="field"><label>منبع آب</label><input name="water" value="${esc(l.water||'')}"></div>
      <div class="field"><label>روش آبیاری</label><input name="irrigation" value="${esc(l.irrigation||'')}"></div>
      <div class="field"><label>محصول</label><input name="crop" value="${esc(l.crop||'')}"></div>
    </div>
    <div class="field"><label>نوع مالکیت</label><select name="ownership"><option value="own" ${l.ownership!=='rent'?'selected':''}>🏠 ملکی</option><option value="rent" ${l.ownership==='rent'?'selected':''}>🔑 اجاره‌ای</option></select></div>
    <div id="editRentDetails" class="register-rent" ${l.ownership==='rent'?'':'hidden'}><div class="register-two">
      <div class="field"><label>مبلغ اجاره</label><input name="rentAmount" inputmode="numeric" value="${l.rentAmount||''}"></div>
      <div class="field"><label>نام مالک</label><input name="landlord" value="${esc(l.landlord||'')}"></div>
      <div class="field"><label>شروع اجاره</label><input name="rentStart" value="${esc(l.rentStart||'')}"></div>
      <div class="field"><label>پایان اجاره</label><input name="rentEnd" value="${esc(l.rentEnd||'')}"></div>
    </div></div>
    <div class="field"><label>توضیحات</label><textarea name="notes">${esc(l.notes||'')}</textarea></div>
    <button class="primary">💾 ذخیره همه اطلاعات</button>
    <button type="button" class="edit-points-btn" onclick="editLandPoints('${id}')">📍 ویرایش نقاط زمین روی نقشه</button>
    <button type="button" class="danger" onclick="deleteLand('${id}')">حذف زمین</button>
  </form>`;
  const eo=document.querySelector('#editForm select[name="ownership"]');if(eo)eo.onchange=()=>{let rb=document.getElementById('editRentDetails');if(rb)rb.hidden=eo.value!=='rent'};
  document.getElementById('editForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);Object.assign(l,{name:f.get('name'),area:n(f.get('area')),region:f.get('region'),soil:f.get('soil'),water:f.get('water'),irrigation:f.get('irrigation'),crop:f.get('crop'),ownership:f.get('ownership'),rentAmount:n(f.get('rentAmount')),landlord:f.get('landlord'),rentStart:f.get('rentStart'),rentEnd:f.get('rentEnd'),notes:f.get('notes')});save();openLand(id)}
}

function deleteLand(id){if(confirm('این زمین حذف شود؟')){state.lands=state.lands.filter(x=>x.id!==id);state.transactions=state.transactions.filter(x=>x.landId!==id);save();go('lands')}}

function updateMeasure(){
  const A=document.getElementById('ma');
  const H=document.getElementById('mh');
  const P=document.getElementById('mp');
  const N=document.getElementById('mn');
  const R=document.getElementById('register');
  const S=document.getElementById('measureStatus');

  const count=Array.isArray(points)?points.length:0;

  if(N)N.textContent=String(count);
  if(R)R.disabled=count<3;

  if(S){
    S.textContent=count<3
      ?'حداقل ۳ نقطه لازم است.'
      :'آماده ثبت — '+count+' نقطه';
  }

  if(!count){
    if(A)A.textContent='۰';
    if(H)H.textContent='۰.۰۰۰۰';
    if(P)P.textContent='۰';
    return;
  }

  let a=0;
  let p=0;

  try{
    a=Number(areaM(points))||0;
    p=Number(perimeter(points))||0;
  }catch(e){
    console.error('measurement error',e);
  }

  if(A)A.textContent=Math.round(a).toLocaleString('fa-IR');
  if(H)H.textContent=(a/10000).toFixed(4);
  if(P)P.textContent=Math.round(p).toLocaleString('fa-IR');
  }

function geoDistance(a,b){
  const R=6371008.8;
  const toRad=v=>v*Math.PI/180;
  const lat1=toRad(Number(a[0]));
  const lat2=toRad(Number(b[0]));
  const dLat=lat2-lat1;
  const dLon=toRad(Number(b[1])-Number(a[1]));
  const s1=Math.sin(dLat/2);
  const s2=Math.sin(dLon/2);
  const h=s1*s1+Math.cos(lat1)*Math.cos(lat2)*s2*s2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
}

function perimeter(ps){
  if(!Array.isArray(ps)||ps.length<2)return 0;
  let total=0;
  for(let i=0;i<ps.length;i++){
    total+=geoDistance(ps[i],ps[(i+1)%ps.length]);
  }
  return total;
}

function areaM(ps){
  if(!Array.isArray(ps)||ps.length<3)return 0;

  const R=6371008.8;
  const toRad=v=>v*Math.PI/180;
  const lat0=ps.reduce((s,p)=>s+Number(p[0]),0)/ps.length;

  const pts=ps.map(p=>[
    R*toRad(Number(p[1]))*Math.cos(toRad(lat0)),
    R*toRad(Number(p[0]))
  ]);

  let sum=0;

  for(let i=0;i<pts.length;i++){
    const a=pts[i];
    const b=pts[(i+1)%pts.length];
    sum+=a[0]*b[1]-b[0]*a[1];
  }

  return Math.abs(sum)/2;
  }

function measure(landId){if(landId)selected=landId;if(!measureReturn)measureReturn=landId?'land':'add';head('اندازه‌گیری آفلاین');app.innerHTML=`<div class="measure-wrap"><div id="measureMap" class="measure-map" style="background:linear-gradient(145deg,#edf7f0,#dcefe3);display:flex;align-items:center;justify-content:center;overflow:hidden"><svg id="offlineMeasureSvg" viewBox="0 0 360 520" width="100%" height="100%" style="touch-action:none"><defs><pattern id="offlineGrid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#cfe3d8" stroke-width="1"/></pattern></defs><rect width="360" height="520" fill="url(#offlineGrid)"/><text x="180" y="35" text-anchor="middle" fill="#17664b" font-size="15" font-weight="800">📐 اندازه‌گیری آفلاین</text><text x="180" y="57" text-anchor="middle" fill="#60756a" font-size="10">با لمس صفحه نقاط زمین را مشخص کن</text></svg></div><div class="measure-tools"><button onclick="locate()">⌖</button><button onclick="toggleSat()">🛰️</button><button onclick="undo()">↶</button><button onclick="clearMeasure()">↺</button><button onclick="closeMeasure()">×</button></div><div class="measure-bottom"><div class="measure-stats"><div><span>مساحت</span><b id="ma">۰</b></div><div><span>هکتار</span><b id="mh">۰</b></div><div><span>محیط</span><b id="mp">۰</b></div><div><span>نقاط</span><b id="mn">۰</b></div></div><div class="measure-actions"><button class="gps" id="gpsBtn" onclick="toggleGPS()">▶ ثبت با GPS</button><button class="primary" id="register" disabled onclick="registerMeasured()">📐 ثبت زمین</button></div><div id="measureStatus" class="hint">حداقل ۳ نقطه لازم است.</div></div></div>`;setTimeout(initMap,20)}

function initMap(){points=[];if(selected&&measureReturn==='land'){let ll=state.lands.find(x=>x.id===selected);if(ll&&ll.measurement&&Array.isArray(ll.measurement.points))points=ll.measurement.points.map(x=>[+x[0],+x[1]])}const svg=document.getElementById('offlineMeasureSvg');if(!svg)return;svg.addEventListener('click',offlineMeasureClick);redraw()}

function offlineMeasureClick(e){const svg=document.getElementById('offlineMeasureSvg'),r=svg.getBoundingClientRect(),x=Math.max(0,Math.min(360,(e.clientX-r.left)/r.width*360)),y=Math.max(0,Math.min(520,(e.clientY-r.top)/r.height*520));addPoint(35.7+(260-y)*.00001,51.4+(x-180)*.00001)}

function coordToXY(p){if(!points.length)return[180,260];const xs=points.map(q=>q[1]),ys=points.map(q=>q[0]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),pad=55,w=Math.max(maxX-minX,1e-9),h=Math.max(maxY-minY,1e-9);return[pad+(p[1]-minX)/w*(360-pad*2),pad+(maxY-p[0])/h*(520-pad*2)]}

function redraw(){const svg=document.getElementById('offlineMeasureSvg');if(!svg)return;svg.querySelectorAll('.dyn').forEach(x=>x.remove());if(points.length){const xy=points.map(coordToXY),poly=xy.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');svg.insertAdjacentHTML('beforeend',`<polygon class="dyn" points="${poly}" fill="#17664b" fill-opacity=".18" stroke="#17664b" stroke-width="3"/>`);xy.forEach((p,i)=>svg.insertAdjacentHTML('beforeend',`<circle class="dyn" cx="${p[0]}" cy="${p[1]}" r="7" fill="#fff" stroke="#17664b" stroke-width="3"/><text class="dyn" x="${p[0]+9}" y="${p[1]-9}" fill="#17664b" font-size="11" font-weight="800">${i+1}</text>`))}updateMeasure()}

function addPoint(lat,lng){points.push([lat,lng]);redraw()}

function undo(){points.pop();redraw()}

function clearMeasure(){points=[];redraw()}

function locate(){if(!navigator.geolocation)return toast('GPS در دسترس نیست');navigator.geolocation.getCurrentPosition(p=>{addPoint(p.coords.latitude,p.coords.longitude);toast('موقعیت GPS اضافه شد')},()=>toast('دریافت موقعیت GPS ناموفق بود'),{enableHighAccuracy:true,timeout:15000,maximumAge:1000})}

function toggleGPS(){if(watch!==null){stopGPS();return}if(!navigator.geolocation)return toast('GPS در دسترس نیست');watch=navigator.geolocation.watchPosition(p=>addPoint(p.coords.latitude,p.coords.longitude),()=>{stopGPS();toast('سیگنال GPS دریافت نشد')},{enableHighAccuracy:true,maximumAge:1000,timeout:15000});let b=document.getElementById('gpsBtn');if(b)b.textContent='■ توقف GPS'}

function stopGPS(){if(watch!==null){navigator.geolocation.clearWatch(watch);watch=null}let b=document.getElementById('gpsBtn');if(b)b.textContent='▶ ثبت با GPS'}

function closeMeasure(){stopGPS();let r=measureReturn||'home';measureReturn=null;go(r)}

function resetMapBearing(){toast('نسخه آفلاین قطب‌نما ندارد.')}

function toggleSat(){toast('تصویر ماهواره‌ای آفلاین در دسترس نیست.')}

function searchPlace(){toast('جستجوی مکان در نسخه آفلاین خاموش است.')}

function registerMeasured(){
  if(points.length<3){toast('حداقل ۳ نقطه لازم است');return}
  let a=areaM(points), p=perimeter(points), lat=points.reduce((s,x)=>s+x[0],0)/points.length, lng=points.reduce((s,x)=>s+x[1],0)/points.length;
  let l=selected?state.lands.find(x=>x.id===selected):null;
  if(l){
    l.areaM2=a;l.perimeter=p;l.area=a/10000;l.lat=lat;l.lng=lng;l.measurement={points:points.map(x=>[x[0],x[1]])};
    save();toast('متراژ با موفقیت ذخیره شد');measureReturn='land';setTimeout(()=>{closeMeasure();openLand(l.id)},150);return;
  }
  let old=document.getElementById('measureRegisterBox');if(old)old.remove();
  let box=document.createElement('div');box.id='measureRegisterBox';box.className='register-modal';
  box.innerHTML=`<div class="register-card register-card-complete">
    <div class="register-modal-head"><div><h3>📐 ثبت کامل زمین</h3><p class="small muted">متراژ انجام شد؛ مشخصات زمین را همین‌جا کامل کن.</p></div><button type="button" class="register-x" id="cancelRegister">×</button></div>
    <div class="register-summary"><b>${Math.round(a).toLocaleString('fa-IR')} مترمربع</b><span>${(a/10000).toLocaleString('fa-IR',{maximumFractionDigits:3})} هکتار · محیط ${Math.round(p).toLocaleString('fa-IR')} متر</span></div>
    <div class="register-fields">
      <div class="field"><label>نام زمین *</label><input id="newLandName" placeholder="مثلاً زمین شمالی" autofocus></div>
      <div class="field"><label>روستا / شهر / منطقه</label><input id="newLandRegion" placeholder="مثلاً روستای شمالی"></div>
      <div class="field"><label>نوع مالکیت</label><div class="register-ownership"><button type="button" class="reg-own active" data-v="own">🏠 ملکی</button><button type="button" class="reg-own" data-v="rent">🔑 اجاره‌ای</button></div></div>
      <div id="regRentBox" class="register-rent" hidden><div class="register-two"><div class="field"><label>مبلغ اجاره</label><input id="newRentAmount" data-money-fmt="1" inputmode="numeric" placeholder="تومان"></div><div class="field"><label>نام مالک</label><input id="newLandlord" placeholder="نام مالک"></div><div class="field"><label>شروع اجاره</label><input id="newRentStart" placeholder="۱۴۰۵/۰۷/۰۱"></div><div class="field"><label>پایان اجاره</label><input id="newRentEnd" placeholder="۱۴۰۶/۰۶/۳۱"></div></div></div>
      <div class="register-two">
        <div class="field"><label>نوع خاک</label><input id="newSoil" placeholder="مثلاً لومی، رسی، شنی"></div>
        <div class="field"><label>منبع آب</label><input id="newWater" placeholder="چاه، قنات، رودخانه..."></div>
        <div class="field"><label>روش آبیاری</label><input id="newIrrigation" placeholder="قطره‌ای، بارانی، غرقابی..."></div>
        <div class="field"><label>محصول</label><input id="newCrop" placeholder="مثلاً گندم"></div>
      </div>
      <div class="field"><label>توضیحات</label><textarea id="newLandNotes" placeholder="هر نکته مهم درباره این زمین..."></textarea></div>
    </div>
    <div class="actions register-actions"><button class="secondary" id="cancelRegister2" type="button">بعداً تکمیل می‌کنم</button><button class="primary" id="saveMeasuredLand" type="button">💾 ثبت کامل زمین</button></div>
  </div>`;
  document.body.appendChild(box);
  let regOwnership='own';
  document.querySelectorAll('.reg-own').forEach(b=>b.onclick=()=>{regOwnership=b.dataset.v;document.querySelectorAll('.reg-own').forEach(x=>x.classList.toggle('active',x.dataset.v===regOwnership));document.getElementById('regRentBox').hidden=regOwnership!=='rent'});
  const buildLand=()=>({id:uid(),name:document.getElementById('newLandName').value.trim(),area:a/10000,areaM2:a,perimeter:p,lat,lng,region:document.getElementById('newLandRegion').value.trim(),ownership:regOwnership,soil:document.getElementById('newSoil').value.trim(),water:document.getElementById('newWater').value.trim(),irrigation:document.getElementById('newIrrigation').value.trim(),crop:document.getElementById('newCrop').value.trim(),notes:document.getElementById('newLandNotes').value.trim(),photos:[],measurement:{points:points.map(x=>[x[0],x[1]])},rentAmount:n(document.getElementById('newRentAmount').value),landlord:document.getElementById('newLandlord').value.trim(),rentStart:document.getElementById('newRentStart').value.trim(),rentEnd:document.getElementById('newRentEnd').value.trim()});
  const closeReg=()=>box.remove();
  document.getElementById('cancelRegister').onclick=closeReg;
  document.getElementById('cancelRegister2').onclick=()=>{let name=document.getElementById('newLandName').value.trim()||'زمین جدید';document.getElementById('newLandName').value=name;let nl=buildLand();state.lands.push(nl);save();selected=nl.id;closeReg();toast('زمین ثبت شد؛ بعداً هم می‌توانی همه مشخصات را تکمیل کنی');measureReturn='land';setTimeout(()=>{closeMeasure();openLand(nl.id)},120)};
  document.getElementById('saveMeasuredLand').onclick=()=>{let nl=buildLand();if(!nl.name){toast('نام زمین را وارد کن');document.getElementById('newLandName').focus();return}state.lands.push(nl);save();selected=nl.id;closeReg();toast('زمین با همه مشخصات ذخیره شد');measureReturn='land';setTimeout(()=>{closeMeasure();openLand(nl.id)},120)};
}
