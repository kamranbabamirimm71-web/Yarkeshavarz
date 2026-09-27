// YarKeshavarz Offline Global Brain V2 - safe contextual follow-ups
const KEY="yk-offline-context-v3",MAX=10;

function clean(x=""){
  return String(x).trim().slice(0,1200);
}

function norm(t=""){
  return String(t)
    .toLowerCase()
    .replace(/[يى]/g,"ی")
    .replace(/ك/g,"ک")
    .replace(/\u200c/g," ")
    .replace(/[^\p{L}\p{N}\s]/gu," ")
    .replace(/\s+/g," ")
    .trim();
}

export function getContext(){
  try{
    const x=JSON.parse(localStorage.getItem(KEY)||"[]");
    return Array.isArray(x)?x.slice(-MAX):[];
  }catch{
    return[];
  }
}

export function remember(role,text,entities={}){
  const d=getContext();
  d.push({role,text:clean(text),entities,ts:Date.now()});
  localStorage.setItem(KEY,JSON.stringify(d.slice(-MAX)));
}

export function clearContext(){
  localStorage.removeItem(KEY);
}

export function lastCrop(){
  const d=getContext();
  for(let i=d.length-1;i>=0;i--){
    if(d[i]?.entities?.crop?.crop) return d[i].entities.crop.crop;
  }
  return null;
}

// Explicit references to the previously discussed product.
const refs=[
  "همین محصول","این محصول","همین گیاه","این گیاه","همین درخت","این درخت",
  "همین مورد","آبیاریش","کودش","بیماریش","آفتش","هرسش","برداشتش",
  "این محصولم","محصول قبلی"
];

// Generic follow-up questions where the user is clearly continuing the
// previous crop discussion without naming a new crop.
const genericFollowUps=[
  "برای کشت چه پیشنهادی داری",
  "برای کشت چه پیشنهادی",
  "برای کشت چی پیشنهاد میدی",
  "برای کشت چه محصولی پیشنهاد میکنی",
  "برای کشت چه محصولی پیشنهاد میدی",
  "برای کاشت چی پیشنهاد میدی",
  "برای کاشت چه پیشنهادی داری",
  "چه محصولی بکارم",
  "چی بکارم",
  "چه بکارم",
  "پیشنهاد کشت",
  "پیشنهاد کاشت",
  "چه محصولی برای کشت پیشنهاد میکنی",
  "چه محصولی برای کاشت پیشنهاد میکنی"
];

export function isGenericFollowUp(question=""){
  const q=norm(question);
  if(!q) return false;
  if(genericFollowUps.some(x=>q===norm(x))) return true;

  // Flexible patterns for common Persian follow-up wording.
  if(
    /برای (کشت|کاشت) (چه|چی) پیشنهاد/.test(q) ||
    /(چه|چی) محصولی (بکارم|برای کشت|برای کاشت)/.test(q) ||
    /پیشنهاد (کشت|کاشت)/.test(q)
  ) return true;

  return false;
}

export function shouldUseMemory(question=""){
  const q=norm(question);
  if(!q) return false;

  if(refs.some(r=>q.includes(norm(r)))) return true;

  // If the user asks a generic planting/cropping follow-up and does not
  // name a new crop, keep continuity with the last discussed crop.
  return isGenericFollowUp(q);
}

export function contextHint(entities={},question=""){
  if(entities.crop?.crop) return entities;
  if(!shouldUseMemory(question)) return entities;

  const c=lastCrop();
  return c
    ? {
        ...entities,
        crop:{crop:c,matched:"از حافظه گفتگو",score:1},
        fromMemory:true
      }
    : entities;
}

export default {
  getContext,
  remember,
  clearContext,
  lastCrop,
  isGenericFollowUp,
  shouldUseMemory,
  contextHint
};
