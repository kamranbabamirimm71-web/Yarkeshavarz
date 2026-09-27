import baseDB from "./agriculture-db-extended.js";
import brain from "./global-agriculture-brain.js";
import cropProfiles from "./crop-profiles.js";
import {extractEntities} from "./intent-engine.js";
import {remember,contextHint} from "./context-engine.js";

const KNOWLEDGE_KEY="yk-admin-knowledge-v1";
const PROFILE_UI_MARKER="__YK_CROP_PROFILE_V1__";

const SMALL_TALK=[
  "ممنون","مرسی","متشکرم","سپاس","سپاسگزارم","خیلی ممنون",
  "دمت گرم","دستت درد نکنه","خسته نباشی","عالی بود","ممنونم"
];

function isSmallTalk(q=""){
  const n=normalize(q);
  return SMALL_TALK.some(x=>n===normalize(x)||n.startsWith(normalize(x)+" "));
}

function smallTalkAnswer(q=""){
  const n=normalize(q);
  if(n.includes("ممنون")||n.includes("مرسی")||n.includes("متشکرم")||n.includes("سپاس"))
    return "خواهش می‌کنم داداش 🌱❤️ هر سؤال کشاورزی داشتی بپرس.";
  if(n.includes("عالی")||n.includes("دمت گرم"))
    return "قربانت داداش 🌱❤️ خوشحالم که به کارت اومد.";
  return "خواهش می‌کنم داداش 🌱🌾";
}

function normalize(t=""){
  return String(t).toLowerCase()
    .replace(/[يى]/g,"ی")
    .replace(/ك/g,"ک")
    .replace(/\u200c/g," ")
    .replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[^\p{L}\p{N}\s]/gu," ")
    .replace(/\s+/g," ")
    .trim();
}

const STOP=new Set([
  "چیست","چیه","چه","چگونه","چطور","چرا","کی","زمان","زمانی","است","هست","هستند",
  "دارد","دارند","شود","باید","برای","در","از","به","با","را","که","این","آن","یک",
  "و","یا","من","می","کنم","کنیم","کنید","مناسب","لازم","نیاز","پیشنهاد"
]);

function toks(t){return normalize(t).split(" ").filter(x=>x.length>1&&!STOP.has(x));}

function contains(text,term){
  const a=normalize(text).split(" ").filter(Boolean);
  const b=normalize(term).split(" ").filter(Boolean);
  if(!b.length)return false;
  if(b.length===1)return a.includes(b[0]);
  for(let i=0;i<=a.length-b.length;i++){
    let ok=true;
    for(let j=0;j<b.length;j++)if(a[i+j]!==b[j]){ok=false;break;}
    if(ok)return true;
  }
  return false;
}

function managerDB(){
  try{
    const d=JSON.parse(localStorage.getItem(KNOWLEDGE_KEY)||"[]");
    return Array.isArray(d)?d.map(x=>({
      category:"مدیریت",
      topic:x.title||x.topic||"دانش مدیریت",
      keywords:x.keywords||[],
      general:x.answer||x.general||"",
      solution:x.solution||""
    })):[];
  }catch{return[]}
}

function score(q,qt,item,e){
  let s=0;
  const topic=normalize(item.topic||"");
  if(topic&&q===topic)s+=45;
  if(topic&&contains(q,topic))s+=20;
  for(const t of toks(topic))if(qt.includes(t))s+=5;
  for(const raw of item.keywords||[]){
    const k=normalize(raw);
    if(contains(q,k))s+=k.includes(" ")?11:7;
  }
  if(e.crop?.crop&&contains(topic,e.crop.crop))s+=16;
  if(e.intent?.id&&normalize(item.category||"").includes(e.intent.id))s+=3;
  return s;
}

export function searchKnowledge(question){
  const q=normalize(question);
  const entities=extractEntities(q);
  const e=contextHint(entities,q);
  const db=[
    ...(Array.isArray(baseDB)?baseDB:[]),
    ...(brain.records||[]),
    ...managerDB()
  ];
  const ranked=db.map(item=>({item,score:score(q,toks(q),item,e)}))
    .filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  return {item:ranked[0]?.item||null,score:ranked[0]?.score||0,ranked:ranked.slice(0,3),entities:e};
}

function clarification(q,r){
  if(r.entities?.explicitCropLike&&!r.entities?.crop?.crop){
    return "🌱 محصول جدیدت را دیدم، اما هنوز آن محصول در دانش آفلاین من با اطمینان شناسایی نشده است. نام محصول را دقیق بنویس یا همراهش منطقه و مرحله رشد را بگو تا پاسخ عمومیِ امن بدهم؛ من محصول قبلی گفتگو را جایگزینش نمی‌کنم.";
  }
  return "🌱 برای این سؤال تطبیق مطمئن کافی پیدا نکردم. نام محصول، مشکل، مرحله رشد یا شرایط زمین را دقیق‌تر بنویس؛ مثلاً «گل محمدی، آبیاری تابستان» یا «گندم، برگ زرد».";
}

function list(value){
  if(!Array.isArray(value))return "";
  return value.map(x=>`• ${x}`).join("\n");
}

function cropNameOf(profile){
  return Object.keys(cropProfiles).find(k=>cropProfiles[k]===profile)||"محصول";
}

function profileData(profile){
  return {
    name:cropNameOf(profile),
    scientificName:profile.scientificName||"",
    summary:profile.summary||"",
    sections:[
      {id:"climate",icon:"🌤️",title:"شرایط و اقلیم",items:[
        ["اقلیم",profile.climate],["دما",profile.temperature],
        ["فصل مناسب",profile.season],["دوره رشد/رسیدگی",profile.growthDays]
      ]},
      {id:"soil",icon:"🌱",title:"خاک و شرایط زمین",items:[
        ["خاک مناسب",profile.soil],["pH",profile.ph],["شوری / EC",profile.ec]
      ]},
      {id:"planting",icon:"🌾",title:"کاشت و تکثیر",items:[
        ["روش تکثیر",profile.propagation],["روش و عمق کاشت",profile.planting]
      ]},
      {id:"irrigation",icon:"💧",title:"آبیاری",items:[
        ["نیاز و مدیریت آب",profile.irrigation],["مراحل حساس",profile.irrigationStages]
      ]},
      {id:"nutrition",icon:"🧪",title:"تغذیه و کود",items:[
        ["تغذیه",profile.nutrition],["راهنمای کود",profile.fertilizer]
      ]},
      {id:"care",icon:"🌿",title:"داشت و مراقبت",items:[
        ["عملیات مهم",profile.care]
      ]},
      {id:"pests",icon:"🐛",title:"آفات",items:[
        ["آفات مهم",profile.pests]
      ]},
      {id:"diseases",icon:"🦠",title:"بیماری‌ها",items:[
        ["بیماری‌های مهم",profile.diseases]
      ]},
      {id:"harvest",icon:"🧺",title:"برداشت",items:[
        ["زمان / نشانه برداشت",profile.harvest]
      ]},
      {id:"post",icon:"📦",title:"پس از برداشت و انبار",items:[
        ["پس از برداشت",profile.postHarvest],["انبارداری",profile.storage]
      ]},
      {id:"economics",icon:"💰",title:"عملکرد و اقتصاد",items:[
        ["عملکرد",profile.yield],["اقتصاد",profile.economics]
      ]},
      {id:"risks",icon:"⚠️",title:"ریسک‌های مهم",items:[
        ["ریسک‌ها",profile.risks]
      ]}
    ].map(s=>({...s,items:s.items.filter(x=>x[1])}))
     .filter(s=>s.items.length)
  };
}

function profileAnswer(profile,e,question){
  const q=normalize(question);
  const intent=e.intent?.id||"general";
  const name=cropNameOf(profile);

  // برای معرفی عمومی: داده کامل را به‌صورت payload فشرده برمی‌گردانیم.
  // yarRender آن را به آکاردئون قابل کلیک تبدیل می‌کند.
  if(intent==="definition"||intent==="general"||q===normalize(profile.aliases?.[0]||"")){
    return PROFILE_UI_MARKER+JSON.stringify(profileData(profile));
  }

  let a=`🌱 ${name}\n\n`;
  const section=(title,icon,fields)=>{
    let out=`${icon} ${title}\n`,any=false;
    for(const [label,key] of fields){
      if(profile[key]){
        any=true;
        out+=`• ${label}: ${Array.isArray(profile[key])?list(profile[key]):profile[key]}\n`;
      }
    }
    return any?out+"\n":"";
  };

  if(intent==="planting")a+=section("کاشت و تکثیر","🌾",[["فصل مناسب","season"],["دوره رشد/رسیدگی","growthDays"],["تکثیر","propagation"],["روش و عمق کاشت","planting"]]);
  else if(intent==="irrigation")a+=section("آبیاری","💧",[["مدیریت آب","irrigation"],["مراحل حساس","irrigationStages"]]);
  else if(intent==="fertilizer")a+=section("تغذیه و کود","🧪",[["تغذیه","nutrition"],["راهنمای کود","fertilizer"]]);
  else if(intent==="pest")a+=section("آفات","🐛",[["آفات مهم","pests"]]);
  else if(intent==="disease")a+=section("بیماری‌ها","🦠",[["بیماری‌های مهم","diseases"]]);
  else if(intent==="harvest")a+=section("برداشت و پس از برداشت","🧺",[["برداشت","harvest"],["پس از برداشت","postHarvest"],["انبارداری","storage"]]);
  else if(intent==="soil")a+=section("خاک و شرایط محیطی","🌱",[["خاک","soil"],["pH","ph"],["EC/شوری","ec"],["اقلیم","climate"]]);
  else a+=section("اطلاعات محصول","📋",[["اقلیم","climate"],["خاک","soil"],["کاشت","planting"],["آبیاری","irrigation"],["داشت","care"],["برداشت","harvest"]]);

  a+="ℹ️ این شناسنامه، راهنمای پایه آفلاین است؛ تاریخ کاشت، مقدار آب، کود و سایر اعداد باید با رقم، منطقه، آزمون خاک/آب و شرایط واقعی مزرعه تطبیق داده شوند.";
  return a.trim();
}

export function findCropProfileAnswer(question,entities){
  const cropName=entities?.crop?.crop;
  if(!cropName)return null;
  const profile=cropProfiles[cropName]||
    Object.entries(cropProfiles).find(([name,p])=>
      name===cropName||(p.aliases||[]).some(a=>normalize(a)===normalize(cropName))
    )?.[1];
  if(!profile)return null;
  return profileAnswer(profile,entities,question);
}

// نصب رندر آکاردئونی روی رابط فعلی، بدون نیاز به دستکاری مستقیم yarRender در index.html.
function installCropProfileRenderer(){
  if(typeof window==="undefined")return;
  if(!document.getElementById("yk-crop-accordion-style")){
    const style=document.createElement("style");
    style.id="yk-crop-accordion-style";
    style.textContent=`
      .yk-crop-profile{direction:rtl;color:#17362a;font-family:inherit}
      .yk-crop-intro{display:flex;align-items:flex-start;gap:12px;padding:14px;background:linear-gradient(135deg,#eef8f2,#ffffff);border:1px solid #dbe9e1;border-radius:18px;margin-bottom:10px}
      .yk-crop-intro-icon{width:46px;height:46px;flex:0 0 46px;border-radius:15px;display:grid;place-items:center;background:#e2f2e8;font-size:25px}
      .yk-crop-intro h3{margin:0 0 5px;font-size:16px;color:#145b40}
      .yk-crop-intro p{margin:6px 0 0;font-size:11px;line-height:1.9;color:#4d6258}
      .yk-crop-scientific{font-size:10px;color:#6b7b73}
      .yk-crop-hint{font-size:10px;color:#6b7b73;background:#f5f8f6;border-radius:12px;padding:9px 11px;margin:8px 0}
      .yk-crop-sections{display:grid;gap:7px}
      .yk-crop-section{background:#fff;border:1px solid #dce8e1;border-radius:15px;overflow:hidden;box-shadow:0 4px 13px rgba(13,55,40,.05)}
      .yk-crop-section summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:8px;padding:12px 11px;font-weight:800;color:#173f32}
      .yk-crop-section summary::-webkit-details-marker{display:none}
      .yk-crop-icon{width:31px;height:31px;flex:0 0 31px;border-radius:10px;background:#eaf4ee;display:grid;place-items:center;font-size:17px}
      .yk-crop-title{flex:1;font-size:11px}
      .yk-crop-chevron{font-size:17px;color:#6d8177;transition:transform .18s}
      .yk-crop-section[open] .yk-crop-chevron{transform:rotate(180deg)}
      .yk-crop-section[open] summary{background:#f4f9f6}
      .yk-crop-body{padding:0 11px 10px;border-top:1px solid #edf2ef}
      .yk-crop-item{padding:9px 2px;border-bottom:1px dashed #e5ece8}
      .yk-crop-item:last-child{border-bottom:0}
      .yk-crop-item>b{display:block;font-size:10px;color:#25624b;margin-bottom:4px}
      .yk-crop-item p{margin:0;font-size:10px;line-height:1.9;color:#334c41}
      .yk-crop-item ul{margin:4px 0 0;padding-right:18px;font-size:10px;line-height:1.9;color:#334c41}
      .yk-crop-note{margin-top:9px;padding:10px 11px;border-radius:13px;background:#fffaf0;border:1px solid #eee0bd;color:#6b6042;font-size:9px;line-height:1.8}
      @media(max-width:420px){
        .yk-crop-intro{padding:12px}
        .yk-crop-intro h3{font-size:15px}
        .yk-crop-intro p{font-size:10px}
      }
    `;
    document.head.appendChild(style);
  }
  if(typeof window.yarRender!=="function"||window.__ykCropProfileRendererInstalled)return;
  const original=window.yarRender;
  const escLocal=(v="")=>String(v).replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
  const listHtml=(v)=>{
    if(Array.isArray(v))return `<ul>${v.map(x=>`<li>${escLocal(x)}</li>`).join("")}</ul>`;
    return `<p>${escLocal(v)}</p>`;
  };
  const profileHtml=(payload)=>{
    let p;
    try{p=JSON.parse(payload.slice(PROFILE_UI_MARKER.length))}catch{return null;}
    if(!p||!p.name)return null;
    const sections=(p.sections||[]).map((s,i)=>`
      <details class="yk-crop-section" ${i===0?"":""}>
        <summary><span class="yk-crop-icon">${s.icon||"📋"}</span><span class="yk-crop-title">${escLocal(s.title)}</span><span class="yk-crop-chevron">⌄</span></summary>
        <div class="yk-crop-body">
          ${(s.items||[]).map(x=>`<div class="yk-crop-item"><b>${escLocal(x[0])}</b>${listHtml(x[1])}</div>`).join("")}
        </div>
      </details>`).join("");
    return `<div class="yk-crop-profile">
      <div class="yk-crop-intro">
        <div class="yk-crop-intro-icon">🌱</div>
        <div><h3>${escLocal(p.name)}</h3>
        ${p.scientificName?`<div class="yk-crop-scientific">🔬 ${escLocal(p.scientificName)}</div>`:""}
        <p>${escLocal(p.summary||"")}</p></div>
      </div>
      <div class="yk-crop-hint">برای دیدن جزئیات هر موضوع، روی همان بخش بزن.</div>
      <div class="yk-crop-sections">${sections}</div>
      <div class="yk-crop-note">ℹ️ این شناسنامه راهنمای پایه آفلاین است؛ تاریخ کاشت، مقدار آب، کود و سایر اعداد باید با رقم، منطقه، آزمون خاک/آب و شرایط واقعی مزرعه تطبیق داده شوند.</div>
    </div>`;
  };

  window.yarRender=function(){
    const b=document.getElementById("yarChat");
    const msgs=window.yarMessages;
    if(!b||!Array.isArray(msgs))return original();
    b.innerHTML=msgs.map(m=>{
      const isUser=m.role==="user";
      let body="";
      if(m.image)body+=`<img class="yar-msg-image" src="${escLocal(m.image)}" alt="عکس ارسالی">`;
      if(m.text){
        if(!isUser&&m.text.startsWith(PROFILE_UI_MARKER)){
          body+=profileHtml(m.text)||`<span>${escLocal(m.text).replace(/\n/g,"<br>")}</span>`;
        }else{
          body+=`<span>${escLocal(m.text).replace(/\n/g,"<br>")}</span>`;
        }
      }
      if(Array.isArray(m.images)&&m.images.length){
        body+=`<div class="yar-image-results">${m.images.slice(0,6).map(x=>`<figure class="yar-image-card"><img src="${escLocal(x.thumb||x.url||"")}" alt="${escLocal(x.title||"تصویر کشاورزی")}" loading="lazy" referrerpolicy="no-referrer"><figcaption>${escLocal(x.title||"تصویر کشاورزی")}</figcaption></figure>`).join("")}</div>`;
      }
      return `<div class="yar-msg ${isUser?"user":"bot"}"><div>${body}</div></div>`;
    }).join("");
    b.scrollTop=b.scrollHeight;
  };
  window.__ykCropProfileRendererInstalled=true;
}

export function findOfflineAnswer(question=""){
  const q=normalize(question);
  if(!q)return "🌱 سؤال کشاورزی‌ات را بنوی.";
  if(isSmallTalk(q))return smallTalkAnswer(q);

  const entities=extractEntities(q);
  const e=contextHint(entities,q);
  const prof=findCropProfileAnswer(q,e);

  if(prof){
    installCropProfileRenderer();
    remember("user",question,e);
    remember("bot",prof,e);
    return prof;
  }

  const r=searchKnowledge(q);
  remember("user",question,r.entities);
  if(!r.item||r.score<7)return clarification(q,r);

  let a=`🌱 ${r.item.topic||"موضوع کشاورزی"}\n\n`;
  if(r.item.symptoms)a+=`🔎 نشانه‌ها:\n${r.item.symptoms}\n\n`;
  if(r.item.cause)a+=`⚠️ علت یا توضیح:\n${r.item.cause}\n\n`;
  if(r.item.general)a+=r.item.general+"\n\n";
  if(r.item.solution)a+=`✅ راهکار کلی:\n${r.item.solution}\n\n`;
  if(r.entities?.intent?.id==="irrigation")a+="💧 مقدار و زمان آبیاری به مرحله رشد، بافت خاک، رطوبت و کیفیت آب وابسته است.\n\n";
  if(r.entities?.intent?.id==="fertilizer")a+="🧪 نسخه دقیق کود بهتر است بر پایه آزمون خاک/برگ، کیفیت آب و نیاز مرحله رشد تنظیم شود.\n\n";
  a+="ℹ️ برای سموم و درمان‌های حساس، برچسب رسمی، قوانین محلی و نظر کارشناس را هم در نظر بگیر.";
  const answer=a.trim();
  remember("bot",answer,r.entities);
  return answer;
}

export default findOfflineAnswer;

if(typeof window!=="undefined"){
  window.YarKeshavarzOffline={
    ...(window.YarKeshavarzOffline||{}),
    findOfflineAnswer,searchKnowledge,findCropProfileAnswer
  };
  // اگر رابط کشاورزیار از قبل ساخته شده باشد، رندر جدید را فعال کن.
  installCropProfileRenderer();
}
