/* YarKeshavarz — yar.js */

function saveYarChat(){try{const clean=[];for(const m of yarMessages){const last=clean[clean.length-1];if(last&&last.role===m.role&&String(last.text||'')===String(m.text||'')&&!m.image&&!last.image)continue;clean.push(m)}yarMessages=clean.slice(-60);localStorage.setItem(YAR_CHAT_KEY,JSON.stringify(yarMessages))}catch(e){}}

function yarNum(x){return Number(x||0).toLocaleString('fa-IR',{maximumFractionDigits:2})}

function yarMoney(x){return Math.round(Number(x||0)).toLocaleString('fa-IR')+' تومان'}

function yarLand(id){return state.lands.find(x=>x.id===(id||selected))||null}

function yarLandPhotos(id){
  const l=yarLand(id);
  return l?.aiAnalyses||[];
}

function yarAiContext(id){
  const c=yarContext(id), l=c.l||null;
  const tx=l?(state.transactions||[]).filter(x=>x.landId===l.id).slice(-30):[];
  return {
    land:l?{id:l.id,name:l.name,area:l.area,region:l.region,ownership:l.ownership,soil:l.soil,water:l.water,irrigation:l.irrigation,crop:l.crop,notes:l.notes,rentAmount:l.rentAmount}:null,
    economics:l?{cost:c.t?.cost||0,income:c.t?.income||0,profit:c.t?.profit||0}:c?{cost:c.cost||0,income:c.income||0,profit:c.profit||0}:null,
    inventory:(state.inventory||[]).slice(0,80).map(x=>({name:x.name,qty:x.qty,unit:x.unit,category:x.category})),
    weather:l?.weather||null,
    recentTransactions:tx.map(x=>({type:x.type,amount:x.amount,category:x.category,note:x.note,date:x.date})),
    otherLands:(state.lands||[]).filter(x=>!id||x.id!==id).slice(0,30).map(x=>({id:x.id,name:x.name,area:x.area,crop:x.crop,region:x.region}))
  };
}

function yarRecordImageAnalysis(id, patch){
  if(!id)return null;
  const l=yarLand(id);if(!l)return null;
  l.aiAnalyses=l.aiAnalyses||[];
  const rec={id:uid(),date:new Date().toISOString(),crop:l.crop||'',...patch};
  l.aiAnalyses.push(rec);
  l.aiAnalyses=l.aiAnalyses.slice(-20);
  save();
  return rec.id;
}

function yarUpdateImageAnalysis(id,analysisId,patch){
  if(!id||!analysisId)return;
  const l=yarLand(id);if(!l)return;
  const rec=(l.aiAnalyses||[]).find(x=>x.id===analysisId);
  if(rec)Object.assign(rec,patch);
  save();
}

function yarAllContext(){
  const lands=state.lands||[], stock=state.inventory||[], equipment=state.equipment||[];
  let cost=0,income=0,area=0;
  lands.forEach(l=>{const t=totals(l.id);cost+=n(t.cost);income+=n(t.income);area+=n(l.area)});
  return {lands,stock,equipment,cost,income,profit:income-cost,area};
}

function yarContext(id){
  const l=yarLand(id);
  if(!l)return {mode:'general',...yarAllContext()};
  const t=totals(l.id);
  return {mode:'land',l,t,stock:state.inventory||[],equipment:state.equipment||[]};
}

function yarQuickAnalysis(id){
  const c=yarContext(id), l=c.l;
  if(!l){
    const total=c.lands.length, crops=c.lands.filter(x=>x.crop).length;
    return {title:'تحلیل وضعیت فعلی مزرعه',level:total?'نیازمند تکمیل اطلاعات':'اطلاعات ناکافی',items:[
      `🌾 ${total.toLocaleString('fa-IR')} قطعه ثبت شده و مجموع مساحت ${yarNum(c.area)} هکتار است.`,
      `🌱 اطلاعات محصول برای ${crops.toLocaleString('fa-IR')} قطعه ثبت شده است.`,
      `💰 هزینه ثبت‌شده ${yarMoney(c.cost)} و درآمد ثبت‌شده ${yarMoney(c.income)} است.`,
      c.stock.length?`📦 ${c.stock.length.toLocaleString('fa-IR')} قلم در انبار ثبت شده است.`:'📦 هنوز اطلاعات کافی از انبار ثبت نشده است.',
      '⚠️ برای تحلیل دقیق‌تر، اطلاعات محصول، آب، خاک، فعالیت‌ها و عکس‌های زمین‌ها را کامل کن.'
    ]};
  }
  const t=c.t, notes=[];
  if(!l.crop)notes.push('🌱 محصول این قطعه ثبت نشده؛ مرحله رشد قابل ارزیابی دقیق نیست.');
  else notes.push(`🌱 محصول ثبت‌شده: ${l.crop}.`);
  notes.push(`📐 مساحت: ${yarNum(l.area)} هکتار.`);
  notes.push(`💰 هزینه: ${yarMoney(t.cost)} | درآمد: ${yarMoney(t.income)} | سود ثبت‌شده: ${yarMoney(t.profit)}.`);
  notes.push(l.water?`💧 منبع آب: ${l.water}.`:'💧 منبع آب ثبت نشده است.');
  notes.push(l.irrigation?`🚿 آبیاری: ${l.irrigation}.`:'🚿 روش آبیاری ثبت نشده است.');
  notes.push(l.soil?`🪨 خاک: ${l.soil}.`:'🪨 نوع خاک ثبت نشده است.');
  notes.push((l.photos||[]).length?`📷 ${l.photos.length.toLocaleString('fa-IR')} عکس از این زمین ثبت شده است.`:'📷 هنوز عکس جدیدی برای این زمین ثبت نشده است.');
  if(t.profit<0)notes.push('⚠️ بر اساس اعداد ثبت‌شده، هزینه از درآمد بیشتر است و وضعیت اقتصادی نیاز به بررسی دارد.');
  else notes.push('✅ بر اساس اعداد ثبت‌شده، درآمد از هزینه بیشتر است؛ برای قضاوت کامل، اطلاعات عملیات و محصول هم لازم است.');
  return {title:`تحلیل وضعیت فعلی «${l.name}»`,level:t.profit<0?'نیازمند توجه':'قابل قبول',items:notes};
}

function yarAnalysisText(id){const a=yarQuickAnalysis(id);return `📊 ${a.title}\n\n${a.items.map(x=>'• '+x).join('\n')}`}

function yarReply(q,id){
  const x=(q||'').trim().toLowerCase();
  if(/^(سلام|درود)[!؟?.،\s]*$/.test(x)) return 'سلام داداش 🌱 در خدمتم. بگو ببینم چه کمکی ازم برمیاد.';
  if(/(سلام.*(خوبی|چطوری)|^(خوبی|چطوری)|خوبه.*(خوبی|چطوری))/.test(x)) return 'مرسی داداش 🌱 خوبم، در خدمتم. تو خوبی؟ بگو ببینم چه کمکی ازم برمیاد.';
  if(/^(ممنون|مرسی|سپاس|متشکرم)[!؟?.،\s]*$/.test(x)) return 'خواهش می‌کنم داداش 🌱 در خدمتم.';
  return 'برای اینکه دقیق راهنماییت کنم، چندتا اطلاعات بیشتر بده 🌱 مثلاً نوع محصول، مرحله رشد، منطقه یا شهر، و مشکلی که مشاهده کردی. اگر عکس داری، عکس واضح هم بفرست.';
}

function yarPickPhoto(){
  const e=document.getElementById('yarPhotoInputGallery');
  if(e){e.value='';e.click()}
}

function yarPickCamera(){
  const e=document.getElementById('yarPhotoInputCamera');
  if(e){e.value='';e.click()}
}

function yarPhotoSelected(input){
  const f=input?.files?.[0];
  if(!f)return;
  if(!f.type.startsWith('image/'))return toast('فقط فایل تصویری انتخاب کن');
  if(f.size>12*1024*1024)return toast('حجم عکس باید کمتر از ۱۲ مگابایت باشد');
  const r=new FileReader();
  r.onload=()=>{
    yarPhotoData=r.result;
    yarPhotoName=f.name||'photo.jpg';
    const p=document.getElementById('yarPhotoPreview'),
          im=document.getElementById('yarPhotoPreviewImg');
    if(im)im.src=yarPhotoData;
    if(p)p.style.display='flex';
    toast('عکس آماده ارسال است؛ متن سؤال را بنویس و ➤ را بزن');
  };
  r.readAsDataURL(f);
}

function yarRemovePhoto(){
  yarPhotoData=null;
  yarPhotoName='';
  const p=document.getElementById('yarPhotoPreview');
  const a=document.getElementById('yarPhotoInputGallery');
  const c=document.getElementById('yarPhotoInputCamera');
  if(p)p.style.display='none';
  if(a)a.value='';
  if(c)c.value='';
}

function yarAddImageMessage(data,caption){yarMessages.push({role:'user',text:caption||'این عکس را تحلیل کن',image:data})}

function yarImageIntent(q){const x=String(q||'').trim();return /^(?:یک|یه|یه دونه|یک دونه)?\s*(?:عکس|تصویر)(?:\s*(?:می.?خوام|می.?خواهم|لازم دارم))?[!؟?.،\s]*$/i.test(x)||/(?:عکس|تصویر|تصاویر|عکس‌ها)\s*(?:از|برای)?\s*\S+|(?:می.?خوام|می.?خواهم|نشون|نشان|بیار|بده|لازم دارم).*?(?:عکس|تصویر|تصاویر)/i.test(x)}

function yarSearchImages(){return []}

async function yarOfflineAnswer(question, id=null){
  try{
    const mod = await import('../offline/offline-ai.js?v=20260921-registry-v2');
    return mod.findOfflineAnswer(question, yarAiContext(id));
  }catch(e){
    return '🌱 پاسخ آفلاین در دسترس نیست. فایل‌های پوشه offline را بررسی کنید.';
  }
  }

async function yarSend(){const i=document.getElementById('yarInput'),q=(i?.value||'').trim(),id=selected||null;if(!q&&!yarPhotoData)return;const question=q||'این عکس را در چارچوب کشاورزی بررسی کن.';yarMessages.push({role:'user',text:q||'📷 عکس ارسال شد'});if(yarPhotoData){yarAddImageMessage(yarPhotoData,question);yarRemovePhoto();yarMessages.push({role:'bot',text:'📷 عکس ذخیره شد. تحلیل تصویری هوش مصنوعی در نسخه آفلاین انجام نمی‌شود؛ برای تحلیل تصویر از نسخه آنلاین استفاده کن.'})}else{yarMessages.push({role:'bot',text:await yarOfflineAnswer(question,id)})}saveYarChat();yarRender();if(i){i.value='';i.focus()}}

function yarAnalyzeLand(id){
  const l=yarLand(id);if(!l)return;
  yarLandMode=true; selected=id;localStorage.setItem('yk-last-land',id);yarMessages.push({role:'user',text:'تحلیل وضعیت فعلی این زمین را بده'});yarMessages.push({role:'bot',text:yarAnalysisText(id)});saveYarChat();go('yar');
}

function yarPriorityPlan(id){
  const l=id?state.lands.find(x=>x.id===id):null;
  const c=id?yarContext(id):yarContext();
  const out=[];
  if(l){
    if(!l.crop) out.push({k:'urgent',t:'محصول این زمین هنوز ثبت نشده؛ محصول را ثبت کن تا توصیه‌های کشت دقیق‌تر شوند.'});
    if(!l.area || Number(l.area)<=0) out.push({k:'urgent',t:'متراژ زمین مشخص نیست؛ مساحت را ثبت یا با ابزار اندازه‌گیری تعیین کن.'});
    if(Number(c.t.cost)>0 && Number(c.t.income)===0) out.push({k:'normal',t:'برای این زمین هزینه ثبت شده ولی درآمدی ثبت نشده؛ درآمد فروش را وارد کن تا سود واقعی محاسبه شود.'});
    if(Number(c.t.stock)===0) out.push({k:'normal',t:'موجودی انبار برای این پرونده خالی است؛ نهاده‌های موجود را بررسی و ثبت کن.'});
    if(!out.length) out.push({k:'normal',t:'اطلاعات اصلی زمین کامل به نظر می‌رسد؛ برای تصمیم بعدی، تحلیل کشت، آب‌وهوا و اقتصاد زمین را بررسی کن.'});
  }else{
    if(!c.lands.length) out.push({k:'urgent',t:'هنوز زمینی ثبت نشده؛ ابتدا یک زمین اضافه کن.'});
    if(c.lands.length && !c.area) out.push({k:'normal',t:'مساحت زمین‌ها کامل ثبت نشده؛ اطلاعات متراژ را تکمیل کن.'});
    if(c.cost>0 && c.income===0) out.push({k:'normal',t:'هزینه ثبت شده اما درآمد ثبت نشده؛ برای دید اقتصادی بهتر، درآمدها را تکمیل کن.'});
    if(!out.length) out.push({k:'normal',t:'وضعیت کلی ثبت‌ها مناسب است؛ برای تصمیم دقیق‌تر از کشاورزیار سؤال مشخص بپرس.'});
  }
  return out.slice(0,3);
}

function yarRender(){const b=document.getElementById('yarChat');if(!b)return;b.innerHTML=yarMessages.map(m=>{const imgs=Array.isArray(m.images)&&m.images.length?`<div class="yar-image-results">${m.images.slice(0,6).map(x=>`<figure class="yar-image-card"><img src="${esc(x.thumb||x.url||'')}" alt="${esc(x.title||'تصویر کشاورزی')}" loading="lazy" referrerpolicy="no-referrer"><figcaption>${esc(x.title||'تصویر کشاورزی')}</figcaption></figure>`).join('')}</div>`:'';return `<div class="yar-msg ${m.role==='user'?'user':'bot'}"><div>${m.image?`<img class="yar-msg-image" src="${esc(m.image)}" alt="عکس ارسالی">`:''}${m.text?`<span>${esc(m.text).replace(/\n/g,'<br>')}</span>`:''}${imgs}</div></div>`}).join('');b.scrollTop=b.scrollHeight}

function yarAsk(q){const i=document.getElementById('yarInput');if(i){i.value=q;yarSend()}}

function yarBindInput(){const i=document.getElementById('yarInput');if(!i||i.dataset.bound==='1')return;i.dataset.bound='1';i.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();const f=i.closest('form');if(f)f.requestSubmit();else yarSend();}})}

function yarFocusInput(){const i=document.getElementById('yarInput');if(!i)return;i.focus();try{i.scrollIntoView({block:'center',behavior:'smooth'})}catch(e){}}

function yarClear(){yarMessages=[];saveYarChat();yar()}
