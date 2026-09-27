/* YarKeshavarz — manager.js */

function managerLoad(){
  try{
    const a=JSON.parse(localStorage.getItem(MANAGER_CHAT_KEY)||'[]');
    if(Array.isArray(a))return a;
  }catch(e){}
  return [];
}

function managerSave(a){try{localStorage.setItem(MANAGER_CHAT_KEY,JSON.stringify(a.slice(-100)))}catch(e){}}

function managerTime(ts){
  try{return new Date(ts).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})}catch(e){return ''}
}

function managerRender(){
  const box=document.getElementById('managerChat');if(!box)return;
  const msgs=managerLoad();
  box.innerHTML=msgs.map(m=>`<div class="manager-msg ${m.role==='user'?'user':'manager'}"><div class="manager-bubble">${esc(m.text).replace(/\n/g,'<br>')}<span class="manager-time">${managerTime(m.ts)}</span></div></div>`).join('');
  box.scrollTop=box.scrollHeight;
}

function managerQuick(q){
  const i=document.getElementById('managerInput');if(!i)return;
  i.value=q;i.focus();i.dispatchEvent(new Event('input'));
}

function managerSend(){
  const i=document.getElementById('managerInput'),q=(i?.value||'').trim();
  if(!q)return;
  const msgs=managerLoad();
  msgs.push({role:'user',text:q,ts:Date.now()});
  managerSave(msgs);
  if(i){i.value='';i.style.height='auto'}
  managerRender();
  toast('پیامت ثبت شد 🌱 برای ارسال واقعی به مدیر، اتصال سرور پیام‌رسان باید فعال شود.');
}

function managerClear(){
  if(confirm('گفت‌وگوی ارتباط با مدیر پاک شود؟')){
    localStorage.removeItem(MANAGER_CHAT_KEY);managerChat();
  }
}
