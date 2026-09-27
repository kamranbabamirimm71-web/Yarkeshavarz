/* YarKeshavarz — equipment.js */

function addEquipment(){let name=prompt('نام وسیله؟');if(!name)return;let type=prompt('نوع؟ مثلاً تراکتور، سمپاش، کمباین')||'ادوات';let model=prompt('مدل؟')||'';let status=prompt('وضعیت؟')||'فعال';let icon=type.includes('تراکت')?'🚜':type.includes('کمباین')?'🌾':type.includes('سمپ')?'🧴':'🔧';(state.equipment||=[]).push({id:uid(),name,type,model,status,icon});save();equipment()}

function editEquipment(i){let x=state.equipment[i];if(!x)return;x.name=prompt('نام وسیله؟',x.name)||x.name;x.type=prompt('نوع؟',x.type)||x.type;x.model=prompt('مدل؟',x.model)||x.model;x.status=prompt('وضعیت؟',x.status)||x.status;save();equipment()}

function deleteEquipment(i){if(confirm('این وسیله حذف شود؟')){state.equipment.splice(i,1);save();equipment()}}
