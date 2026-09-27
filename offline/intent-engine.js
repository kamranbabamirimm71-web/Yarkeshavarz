// YarKeshavarz Offline Global Brain V1 - entity and intent engine
// V2 fix: crop detection now uses the global registry as well as the legacy brain.
// This fixes registry-only crops such as قهوه، کاکائو، سیب زمینی and future bulk-imported crops.

import brain from "./global-agriculture-brain.js";
import registry, {normalize as registryNormalize} from "./global-crop-registry.js";

function normalize(t=""){
  return String(t).toLowerCase()
    .replace(/[يى]/g,"ی").replace(/ك/g,"ک")
    .replace(/\u200c/g," ")
    .replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[^\p{L}\p{N}\s]/gu," ")
    .replace(/\s+/g," ").trim();
}

function exact(text,term){
  const a=normalize(text).split(" ").filter(Boolean);
  const b=normalize(term).split(" ").filter(Boolean);
  if(!b.length)return false;
  if(b.length===1)return a.includes(b[0]);
  for(let i=0;i<=a.length-b.length;i++){
    let ok=true;
    for(let j=0;j<b.length;j++){
      if(a[i+j]!==b[j]){ok=false;break;}
    }
    if(ok)return true;
  }
  return false;
}

const intentMap={
  definition:["چیست","چیه","تعریف","معنی","یعنی"],
  irrigation:["آبیاری","آبدهی","کم آبی","تنش خشکی"],
  fertilizer:["کود","کوددهی","تغذیه","اوره","ازت","نیتروژن","فسفر","پتاس"],
  soil:["خاک","پی اچ","ph","ec خاک","شوری خاک","زهکشی","ماده آلی","بافت خاک"],
  pest:["آفت","شته","کنه","سفیدبالک","تریپس","کرم"],
  disease:["بیماری","قارچ","باکتری","ویروس","پوسیدگی","لکه","سفیدک","زنگ"],
  weed:["علف هرز","علفکش","هرز"],
  planting:["کاشت","بذر","نشا","تراکم","فاصله کاشت","تاریخ کاشت"],
  harvest:["برداشت","رسیدگی","بلوغ","خشک کردن","انبار","سردخانه"],
  greenhouse:["گلخانه","هیدروپونیک","کوکوپیت","پرلیت","تهویه"],
  economics:["هزینه","درآمد","سود","قیمت","اقتصاد","سرمایه","نقطه سربه سر"],
  machinery:["تراکتور","سمپاش","کمباین","دروگر","نازل"],
  livestock:["دام","گاو","گوسفند","بز","مرغ","طیور","جیره"],
  beekeeping:["زنبور","کندو","ملکه","عسل"],
  climate:["هوا","دما","یخبندان","گرما","سرما","بارندگی","رطوبت","خشکسالی"],
  precision:["کشاورزی دقیق","gps","پهپاد","ماهواره","نقشه","سنجش از دور"],
  management:["مزرعه","زمین","قطعه","برنامه کشت","ثبت عملیات","موجودی"]
};

export function detectIntent(text=""){
  const q=normalize(text);
  let best={id:"general",score:0};
  for(const [id,words] of Object.entries(intentMap)){
    const s=words.reduce((n,w)=>n+(exact(q,w)?2:0),0);
    if(s>best.score)best={id,score:s};
  }
  return best;
}

// Build a normalized registry index once.
// Registry entries are the source of truth for the expanding global crop list.
const registryEntries=Object.values(registry||{});
const registryByName=registryEntries.map(x=>({
  name:x.name,
  normalized:registryNormalize(x.name),
  aliases:(x.aliases||[]).map(a=>({raw:a,normalized:registryNormalize(a)}))
}));

export function detectCrop(text=""){
  const q=normalize(text);
  let best=null;

  // 1) Global registry: catches all registry-only crops.
  for(const item of registryByName){
    if(exact(q,item.name)){
      best={crop:item.name,matched:item.name,score:14};
      break;
    }
    for(const a of item.aliases){
      if(exact(q,a.raw) && (!best || best.score<13)){
        best={crop:item.name,matched:a.raw,score:13};
      }
    }
  }

  // 2) Legacy brain remains supported for compatibility.
  for(const c of brain.crops?Object.values(brain.crops).flat():[]){
    if(exact(q,c) && (!best || best.score<12)){
      best={crop:c,matched:c,score:12};
    }
  }
  for(const [alias,crop] of Object.entries(brain.aliases||{})){
    if(exact(q,alias) && (!best || best.score<11)){
      best={crop,matched:alias,score:11};
    }
  }

  return best;
}

const GENERIC_AFTER_ACTION=new Set([
  "چه","چی","چیه","چگونه","چطور","پیشنهاد","پیشنهادی","مناسب",
  "خوب","بهتر","بهترین","محصول","محصولی","گیاه","گیاهی",
  "دارم","داری","دارد","داریم","دارید","دارند"
]);

export function hasExplicitCropLikeText(text=""){
  const q=normalize(text);
  if(detectCrop(q)) return true;

  const tokens=q.split(" ").filter(Boolean);
  const actions=new Set([
    "کاشت","کشت","پرورش","آبیاری","کوددهی","بیماری","آفت","قیمت","هزینه"
  ]);

  for(let i=0;i<tokens.length-1;i++){
    if(!actions.has(tokens[i])) continue;
    const candidate=tokens[i+1];
    if(!GENERIC_AFTER_ACTION.has(candidate)) return true;
  }
  return false;
}

export function extractEntities(text=""){
  return {
    crop:detectCrop(text),
    intent:detectIntent(text),
    explicitCropLike:hasExplicitCropLikeText(text)
  };
}

export default {detectIntent,detectCrop,extractEntities};
