(function(){
'use strict';

const KEY='yk-v3-clean';
const MEASURE='yk-last-measure';

function fa(v){
  return String(v??'')
    .replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
}

function num(v){
  return Number(fa(v).replace(/[٬,\s]/g,''))||0;
}

function readMeasure(){
  try{
    return JSON.parse(localStorage.getItem(MEASURE)||'null');
  }catch(e){
    return null;
  }
}

function readState(){
  try{
    return JSON.parse(localStorage.getItem(KEY)||'null');
  }catch(e){
    return null;
  }
}

function saveState(s){
  localStorage.setItem(KEY,JSON.stringify(s));
}

function syncMeasured(){
  const m=readMeasure();
  if(!m || num(m.area)<=0) return;

  sessionStorage.setItem('yk-measured-area',num(m.area));
  sessionStorage.setItem('yk-measured-perimeter',num(m.perimeter));

  if(Array.isArray(m.points) && m.points[0]){
    sessionStorage.setItem('yk-measured-lat',m.points[0][0]);
    sessionStorage.setItem('yk-measured-lng',m.points[0][1]);
  }
}

document.addEventListener('click',function(e){
  const add=e.target.closest&&e.target.closest('[data-route="add"]');

  if(add){
    syncMeasured();
    setTimeout(syncMeasured,100);
  }

  if(e.target.closest&&e.target.closest('#useBtn')){
    setTimeout(syncMeasured,100);
  }
},true);

document.addEventListener('submit',function(e){
  if(!e.target || e.target.id!=='landForm') return;

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  const form=e.target;
  const fd=new FormData(form);
  const state=readState();

  if(!state || !Array.isArray(state.lands)){
    alert('خطا در اطلاعات برنامه. صفحه را یک‌بار تازه‌سازی کن.');
    return;
  }

  const m=readMeasure();

  let hectares=num(fd.get('area'));

  const areaM2=
    num(m&&m.area) ||
    num(sessionStorage.getItem('yk-measured-area'));

  const perimeter=
    num(m&&m.perimeter) ||
    num(sessionStorage.getItem('yk-measured-perimeter'));

  if(areaM2>0){
    hectares=areaM2/10000;
  }

  if(!String(fd.get('name')||'').trim()){
    alert('نام زمین را وارد کن.');
    return;
  }

  if(hectares<=0){
    alert('مساحت زمین را وارد کن.');
    return;
  }

  const land={
    id:'id_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),
    name:String(fd.get('name')||'').trim(),
    area:hectares,
    region:String(fd.get('region')||'').trim(),
    ownership:fd.get('ownership')==='rent'?'rent':'own',
    soil:String(fd.get('soil')||'').trim(),
    water:String(fd.get('water')||'').trim(),
    irrigation:String(fd.get('irrigation')||'').trim(),
    crop:String(fd.get('crop')||'').trim(),
    notes:String(fd.get('notes')||'').trim(),
    photos:[]
  };

  if(areaM2>0){
    land.areaM2=areaM2;
    land.perimeter=perimeter;
    land.measured=true;

    land.measurement={
      area:areaM2,
      hectare:hectares,
      perimeter:perimeter,
      points:Array.isArray(m&&m.points)?m.points:[]
    };

    if(m&&Array.isArray(m.points)&&m.points[0]){
      land.lat=Number(m.points[0][0]);
      land.lng=Number(m.points[0][1]);
    }
  }

  state.lands.push(land);
  saveState(state);

  sessionStorage.removeItem('yk-measured-area');
  sessionStorage.removeItem('yk-measured-perimeter');
  sessionStorage.removeItem('yk-measured-lat');
  sessionStorage.removeItem('yk-measured-lng');
  localStorage.removeItem(MEASURE);

  alert('زمین با موفقیت ثبت شد.');

  location.reload();
},true);

window.YKLandSaveFix={
  syncMeasured:syncMeasured
};

})();
