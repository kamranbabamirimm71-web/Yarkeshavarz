// YarKeshavarz Global Crop Registry V4
// One registry for crop identity, aliases, categories and automatic fallback profiles.
// This V4 removes the old crop-profiles-detailed.js dependency.

const GROUPS = {
  cereals:"غلات",
  pulses:"حبوبات",
  oilseeds:"دانه‌های روغنی",
  vegetables:"سبزی و صیفی",
  herbs_spices:"گیاهان دارویی و ادویه‌ای",
  orchards:"میوه‌ها و باغی",
  nuts:"خشکبار و مغزها",
  tropical_arid:"گرمسیری و نیمه‌خشک",
  forage:"علوفه‌ای",
  industrial:"صنعتی",
  ornamentals:"زینتی"
};

const seed = {
  cereals:["گندم","جو","ذرت","برنج","یولاف","چاودار","سورگوم","ارزن"],
  pulses:["نخود","عدس","لوبیا","باقلا","ماش","لپه"],
  oilseeds:["کلزا","سویا","آفتابگردان","کنجد","گلرنگ","بادام زمینی"],
  vegetables:["گوجه فرنگی","خیار","فلفل","بادمجان","کدو","کدو سبز","کاهو","اسفناج","کلم","گل کلم","بروکلی","هویج","تربچه","شلغم","چغندر","کرفس","کرفس برگی","جعفری","گشنیز","شوید","ریحان","تره","پیاز","سیر","موسیر"],
  herbs_spices:["زعفران","گل محمدی","نعناع","آویشن","رزماری","مریم گلی","رازیانه","زیره","سیاه دانه","بابونه","اسطوخودوس"],
  orchards:["سیب","گلابی","به","هلو","شلیل","زردآلو","گیلاس","آلبالو","آلو","انگور","انار","انجیر","خرمالو","کیوی","مرکبات","پرتقال","نارنگی","لیمو","گریپ فروت"],
  nuts:["بادام","پسته","گردو","فندق","بادام زمینی"],
  tropical_arid:["زیتون","خرما","انبه","موز","آووکادو","پاپایا"],
  forage:["یونجه","شبدر","ذرت علوفه ای","سورگوم علوفه ای"],
  industrial:["پنبه","چغندر قند","نیشکر","توتون","کتان"],
  ornamentals:["رز","گل رز","گل داوودی","ژربرا","لیلیوم","لاله"]
};

const extra = {
  vegetables:["سیب زمینی","کاسنی","مارچوبه","کنگر","بامیه","لوبیا سبز","ذرت شیرین","چغندر برگی"],
  herbs_spices:["هل","دارچین","زنجبیل","زردچوبه","فلفل سیاه","وانیل","شنبلیله","مرزه","ترخون","کرفس کوهی","رازیانه"],
  orchards:["شاه توت","توت","ازگیل","تمشک","توت فرنگی","بلوبری","پکان","خرنوب"],
  tropical_arid:["نارگیل","آناناس","کاکائو","قهوه","کائوچو","کسافا","سیب هندی"],
  industrial:["چای","قهوه","نخل روغنی","کرچک","کنف","شاهدانه صنعتی"],
  forage:["ذرت علوفه‌ای","چغندر علوفه‌ای","سورگوم علوفه‌ای","چاودار علوفه‌ای"],
  ornamentals:["یاس","یاسمن","شمعدانی","بگونیا","بنفشه","داوودی","گلایول","نرگس","سنبل"]
};

function normalize(s=""){
  return String(s).toLowerCase()
    .replace(/[يى]/g,"ی").replace(/ك/g,"ک")
    .replace(/\u200c/g," ").replace(/‌/g," ")
    .replace(/[^\p{L}\p{N}\s]/gu," ")
    .replace(/\s+/g," ").trim();
}

const aliases = {
  "گوجه":"گوجه فرنگی","گوجه‌فرنگی":"گوجه فرنگی",
  "سیب زمینی":"سیب زمینی","سیب‌زمینی":"سیب زمینی",
  "گل رز":"رز","گل محمدی":"گل محمدی",
  "مو":"انگور","تاک":"انگور",
  "پرتقال":"مرکبات","نارنگی":"مرکبات","لیمو":"مرکبات",
  "ذرت علوفه‌ای":"ذرت علوفه ای"
};

const registry = {};
for (const [group,names] of Object.entries(seed)){
  for(const name of names) registry[name]={id:normalize(name).replace(/\s+/g,"-"),name,category:group,label:GROUPS[group]||group,aliases:[]};
}
for (const [group,names] of Object.entries(extra)){
  for(const name of names){
    if(!registry[name]) registry[name]={id:normalize(name).replace(/\s+/g,"-"),name,category:group,label:GROUPS[group]||group,aliases:[]};
  }
}
for(const [a,n] of Object.entries(aliases)){
  if(registry[n]) registry[n].aliases.push(a);
}

export {GROUPS, registry, aliases, normalize};
export default registry;
