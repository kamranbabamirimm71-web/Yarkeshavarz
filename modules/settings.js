/* YarKeshavarz — settings.js */

function settingsRead(){
  const s={
    dark:!!document.getElementById('setDark')?.checked,
    notify:document.getElementById('setNotify')?.checked!==false,
    sound:document.getElementById('setSound')?.checked!==false,
    font:document.getElementById('setFont')?.value||'normal'
  };
  try{localStorage.setItem('yk-settings-v1',JSON.stringify(s))}catch(e){}
  return s;
}

function settingsApply(save=true){
  const s=save?settingsRead():settingsRead();
  document.documentElement.classList.toggle('yk-dark',s.dark);
  document.documentElement.classList.toggle('yk-font-small',s.font==='small');
  document.documentElement.classList.toggle('yk-font-large',s.font==='large');
  if(save)toast('تنظیمات ذخیره شد 🌱');
}

function settingsClearYar(){
  if(!confirm('گفت‌وگوی کشاورزیار پاک شود؟')) return;

  try{
    localStorage.removeItem('yk-yar-chat-v4');
    localStorage.removeItem('yk-yar-chat-v3');

    if(typeof yarMessages !== 'undefined'){
      yarMessages.length = 0;
    }

    if(typeof yarPhotoData !== 'undefined'){
      yarPhotoData = null;
    }

    if(typeof yarPhotoName !== 'undefined'){
      yarPhotoName = '';
    }

    if(typeof yarRender === 'function'){
      yarRender();
    }

    toast('گفت‌وگوی کشاورزیار پاک شد');
    settings();

  }catch(e){
    console.error(e);
    toast('پاک کردن گفتگو انجام نشد');
  }
  }

function settingsClearManager(){
  if(confirm('گفت‌وگوی مدیر پاک شود؟')){
    try{localStorage.removeItem(MANAGER_CHAT_KEY)}catch(e){}
    toast('گفت‌وگوی مدیر پاک شد');settings();
  }
}
