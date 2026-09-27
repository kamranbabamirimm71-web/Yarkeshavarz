/* YarKeshavarz — cultivation.js */

function moneyInput(id){
 let e=document.getElementById(id);if(!e)return;
 e.addEventListener('focus',()=>{e.value=String(n(e.value)||'')});
 e.addEventListener('blur',()=>{if(e.value.trim())e.value=n(e.value).toLocaleString('fa-IR')});
}

function activeCultivationId(l){return l.activeCultivationId||'legacy'}

function cultivationTx(l){
 const cid=activeCultivationId(l);
 return (state.transactions||[]).filter(x=>x.landId===l.id && (!x.cultivationId || x.cultivationId===cid));
}

function saveCultivation(){
 let l=state.lands.find(x=>x.id===selected);if(!l)return;
 if(l.cultivationStatus==='archived'){toast('این کشت بایگانی شده است؛ برای کشت جدید از گزینه شروع کشت جدید استفاده کن');return}
 l.crop=(document.getElementById('fieldCrop').value||'').trim();l.cropVariety=(document.getElementById('fieldVariety').value||'').trim();l.plantDate=parseJalaliDate(document.getElementById('fieldPlantDate').value)||'';l.cropNotes=document.getElementById('fieldCropNotes').value||'';if(!l.activeCultivationId)l.activeCultivationId=uid();l.cultivationStatus='active';save();toast('اطلاعات کشت ذخیره شد');cultivation()
}

function archiveCultivation(id){
 let l=state.lands.find(x=>x.id===id);if(!l)return;if(l.cultivationStatus==='archived'){toast('این کشت قبلاً بایگانی شده است');return}
 if(!confirm('برداشت این زمین کاملاً تمام شده و می‌خواهی پرونده کشت این سال بایگانی شود؟'))return;
 let tx=cultivationTx(l),cost=tx.filter(x=>x.type==='expense').reduce((a,x)=>a+n(x.amount),0),income=tx.filter(x=>x.type==='income').reduce((a,x)=>a+n(x.amount),0),harvest=new Date();let year=jalaliDate(harvest).slice(0,4);
 state.transactions.forEach(x=>{if(x.landId===id&&(!x.cultivationId||x.cultivationId===activeCultivationId(l)))x.cultivationId=l.activeCultivationId||'legacy'});
 l.cultivationArchive=Array.isArray(l.cultivationArchive)?l.cultivationArchive:[];l.cultivationArchive.push({id:uid(),cultivationId:l.activeCultivationId||'legacy',year,crop:l.crop||'',variety:l.cropVariety||'',area:n(l.area),plantDate:l.plantDate||'',harvestDate:harvest.toISOString(),cost,income,profit:income-cost,notes:l.cropNotes||''});l.cultivationStatus='archived';l.lastHarvestDate=harvest.toISOString();save();toast('پرونده کشت این سال بایگانی شد');cultivation()
}

function startNewCultivation(id){
 let l=state.lands.find(x=>x.id===id);if(!l)return;l.activeCultivationId=uid();l.cultivationStatus='active';l.crop='';l.cropVariety='';l.plantDate='';l.cropNotes='';save();toast('پرونده کشت جدید آماده شد');cultivation()
}

function addLandExpense(id, existing){
 let l=state.lands.find(x=>x.id===id);if(!l)return;
 let old=document.getElementById('expenseModal');if(old)old.remove();let box=document.createElement('div');box.id='expenseModal';box.className='register-modal';
 let e=existing||{};
 box.innerHTML=`<div class="register-card expense-card"><div class="register-modal-head"><div><h3>${existing?'✏️ ویرایش مرحله هزینه':'💰 افزودن مرحله هزینه'} — ${esc(l.name)}</h3><p class="small muted">برای هر نوبت یک مورد جدا ثبت کن؛ کود، سم و ادوات می‌توانند چند مرحله داشته باشند.</p></div><button type="button" class="register-x" id="expenseClose">×</button></div><div class="expense-cats">${['بذر','کود','سم','آبیاری','کارگر','ماشین‌آلات','سایر'].map((c,i)=>`<button type="button" class="expense-cat ${((e.category||'بذر')===c)?'active':''}" data-v="${c}">${c==='بذر'?'🌾':c==='کود'?'🧪':c==='سم'?'🧴':c==='آبیاری'?'💧':c==='کارگر'?'👷':c==='ماشین‌آلات'?'🚜':'📌'} ${c}</button>`).join('')}</div><div class="form"><div class="field"><label>مرحله / نوبت</label><input id="expenseStage" value="${esc(e.stage||'')}" placeholder="مثلاً کود اول فصل، سم‌پاشی دوم، ادوات شخم"></div><div class="field"><label>مقدار مصرف (اختیاری)</label><input id="expenseQty" inputmode="decimal" value="${e.qty||''}" placeholder="مثلاً ۲۵۰"></div><div class="field"><label>واحد (اختیاری)</label><input id="expenseUnit" value="${esc(e.unit||'')}" placeholder="کیلو، لیتر، نوبت، ساعت..."></div><div class="field"><label>قیمت واحد (اختیاری)</label><input id="expenseUnitPrice" data-money-fmt="1" inputmode="numeric" value="${e.unitPrice?Number(e.unitPrice).toLocaleString('fa-IR'):''}" placeholder="مثلاً ۶۰۰,۰۰۰"></div><div class="field"><label>مبلغ نهایی این مرحله برای کل زمین (تومان) *</label><input id="expenseAmount" data-money-fmt="1" inputmode="numeric" value="${e.amount?Number(e.amount).toLocaleString('fa-IR'):''}" placeholder="مثلاً ۱۵,۰۰۰,۰۰۰"></div><div class="field"><label>شرح</label><input id="expenseNote" value="${esc(e.note||'')}" placeholder="توضیح بیشتر"></div></div><div class="actions"><button class="secondary" id="expenseCancel">انصراف</button><button class="primary" id="expenseSave">💾 ${existing?'ذخیره تغییرات':'ثبت مرحله'}</button></div></div>`;
 document.body.appendChild(box);moneyInput('expenseAmount');moneyInput('expenseUnitPrice');let cat=e.category||'بذر';document.querySelectorAll('#expenseModal .expense-cat').forEach(x=>x.onclick=()=>{cat=x.dataset.v;document.querySelectorAll('#expenseModal .expense-cat').forEach(y=>y.classList.toggle('active',y===x))});let close=()=>box.remove();document.getElementById('expenseClose').onclick=close;document.getElementById('expenseCancel').onclick=close;
 document.getElementById('expenseSave').onclick=()=>{let amount=n(document.getElementById('expenseAmount').value||0);let qty=n(document.getElementById('expenseQty').value||0);let unitPrice=n(document.getElementById('expenseUnitPrice').value||0);if(amount<=0 && qty>0 && unitPrice>0)amount=qty*unitPrice;if(amount<=0){toast('مبلغ نهایی این مرحله را وارد کن');return}state.transactions=state.transactions||[];let obj={id:e.id||uid(),landId:id,cultivationId:activeCultivationId(l),type:'expense',amount,category:cat,stage:(document.getElementById('expenseStage').value||'').trim(),qty,unit:(document.getElementById('expenseUnit').value||'').trim(),unitPrice,note:(document.getElementById('expenseNote').value||'').trim(),date:e.date||new Date().toISOString()};if(existing){let ix=state.transactions.findIndex(x=>x.id===existing.id);if(ix>=0)state.transactions[ix]=obj}else state.transactions.push(obj);if(save()){close();toast(existing?'مرحله هزینه ویرایش شد':'مرحله هزینه ثبت شد');cultivation()}}
}

function editLandExpense(txId){let l=state.lands.find(x=>x.id===selected);let e=(state.transactions||[]).find(x=>x.id===txId);if(!l||!e)return;addLandExpense(l.id,e)}

function deleteLandExpense(txId){let e=(state.transactions||[]).find(x=>x.id===txId);if(!e)return;if(!confirm('این مرحله هزینه حذف شود؟'))return;state.transactions=state.transactions.filter(x=>x.id!==txId);save();toast('مرحله هزینه حذف شد');cultivation()}

function addLandIncome(id){
 let l=state.lands.find(x=>x.id===id);if(!l)return;let old=document.getElementById('incomeModal');if(old)old.remove();let box=document.createElement('div');box.id='incomeModal';box.className='register-modal';box.innerHTML=`<div class="register-card expense-card"><div class="register-modal-head"><div><h3>💵 ثبت درآمد کل برداشت — ${esc(l.name)}</h3><p class="small muted">درآمد واقعی فروش محصول را برای کل زمین وارد کن.</p></div><button type="button" class="register-x" id="incomeClose">×</button></div><div class="form"><div class="field"><label>درآمد کل (تومان) *</label><input id="incomeAmount" data-money-fmt="1" inputmode="numeric" placeholder="مثلاً ۵۰۰,۰۰۰,۰۰۰"></div><div class="field"><label>شرح درآمد</label><input id="incomeNote" placeholder="مثلاً فروش کامل گندم برداشت‌شده"></div></div><div class="actions"><button class="secondary" id="incomeCancel">انصراف</button><button class="primary" id="incomeSave">💾 ثبت درآمد کل</button></div></div>`;document.body.appendChild(box);moneyInput('incomeAmount');let close=()=>box.remove();document.getElementById('incomeClose').onclick=close;document.getElementById('incomeCancel').onclick=close;document.getElementById('incomeSave').onclick=()=>{let amount=n(document.getElementById('incomeAmount').value||0);if(amount<=0){toast('مبلغ درآمد را وارد کن');return}state.transactions=state.transactions||[];state.transactions.push({id:uid(),landId:id,cultivationId:activeCultivationId(l),type:'income',amount,note:(document.getElementById('incomeNote').value||'').trim(),category:'فروش/درآمد',date:new Date().toISOString()});if(save()){close();toast('درآمد کل برداشت ثبت شد');cultivation()}}
}
