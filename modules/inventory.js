/* YarKeshavarz — inventory.js */

function renderStockList(){
  return state.inventory.map((x,i)=>`<div class="card stock-card"><div class="row"><div><b>${esc(x.name)}</b><div class="small muted">موجودی فعلی</div></div><b>${n(x.qty).toLocaleString('fa-IR')} ${esc(x.unit||'عدد')}</b></div><div class="stock-actions"><button class="stock-plus" type="button" onclick="changeStock(${i},1)">＋<br><small>ورودی</small></button><button class="stock-minus" type="button" onclick="changeStock(${i},-1)">−<br><small>مصرف</small></button></div><div class="actions"><button class="danger" type="button" onclick="removeStock(${i})">🗑️ حذف</button></div></div>`).join('')||'<div class="card empty">انبار خالی است.</div>';
}

function saveNewStock(){
  const name=(document.getElementById('stockName')?.value||'').trim();
  const qty=n(document.getElementById('stockQty')?.value||0);
  const unit=document.getElementById('stockUnit')?.value||'عدد';
  if(!name){toast('نام ماده را وارد کن');return}
  if(qty<=0){toast('مقدار باید بیشتر از صفر باشد');return}
  const item={id:uid(),name,qty,unit,createdAt:new Date().toISOString()};
  state.inventory.push(item);
  if(!save()){state.inventory.pop();return}
  toast('ماده با موفقیت ثبت شد');
  inventory();
}

function changeStock(i,dir){
  const item=state.inventory[i];if(!item)return;
  const label=dir>0?'مقدار ورودی':'مقدار مصرف';
  const raw=prompt(label+' را وارد کن');
  if(raw===null)return;
  const amount=n(raw);
  if(amount<=0){toast('مقدار باید بیشتر از صفر باشد');return}
  const old=n(item.qty);
  const next=dir>0?old+amount:Math.max(0,old-amount);
  item.qty=next;
  if(!save()){item.qty=old;return}
  inventory();
}

function stockIn(i){changeStock(i,1)}

function stockOut(i){changeStock(i,-1)}

function removeStock(i){
  if(!state.inventory[i])return;
  if(confirm('این قلم از انبار حذف شود؟')){
    const old=state.inventory[i];state.inventory.splice(i,1);
    if(!save()){state.inventory.splice(i,0,old);return}
    inventory();
  }
}
