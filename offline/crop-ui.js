// YarKeshavarz Crop Accordion UI V1
// Converts __YK_CROP_PROFILE_V1__ payloads produced by offline-ai.js into clickable sections.
(function(){
  if(window.__YK_CROP_UI_V1__) return;
  window.__YK_CROP_UI_V1__=true;

  const MARK="__YK_CROP_PROFILE_V1__";
  const esc=v=>String(v??"").replace(/[&<>\"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
  const val=v=>Array.isArray(v)
    ? `<ul>${v.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`
    : `<p>${esc(v)}</p>`;

  function addStyle(){
    if(document.getElementById("yk-crop-ui-style")) return;
    const s=document.createElement("style");
    s.id="yk-crop-ui-style";
    s.textContent=`
      .yk-crop-profile{direction:rtl;color:#17362a;font-family:inherit}
      .yk-crop-intro{display:flex;align-items:flex-start;gap:12px;padding:14px;background:linear-gradient(135deg,#eef8f2,#fff);border:1px solid #dbe9e1;border-radius:18px;margin-bottom:10px}
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
    `;
    document.head.appendChild(s);
  }

  function render(raw){
    if(!raw.startsWith(MARK)) return null;
    let p;
    try{p=JSON.parse(raw.slice(MARK.length))}catch{return null}
    if(!p?.name) return null;
    const sections=(p.sections||[]).map(s=>`
      <details class="yk-crop-section">
        <summary>
          <span class="yk-crop-icon">${s.icon||"📋"}</span>
          <span class="yk-crop-title">${esc(s.title)}</span>
          <span class="yk-crop-chevron">⌄</span>
        </summary>
        <div class="yk-crop-body">
          ${(s.items||[]).map(x=>`<div class="yk-crop-item"><b>${esc(x[0])}</b>${val(x[1])}</div>`).join("")}
        </div>
      </details>`).join("");

    return `<div class="yk-crop-profile">
      <div class="yk-crop-intro">
        <div class="yk-crop-intro-icon">🌱</div>
        <div>
          <h3>${esc(p.name)}</h3>
          ${p.scientificName?`<div class="yk-crop-scientific">🔬 ${esc(p.scientificName)}</div>`:""}
          <p>${esc(p.summary||"")}</p>
        </div>
      </div>
      <div class="yk-crop-hint">برای دیدن جزئیات هر موضوع، روی همان بخش بزن.</div>
      <div class="yk-crop-sections">${sections}</div>
      <div class="yk-crop-note">ℹ️ این شناسنامه راهنمای پایه آفلاین است؛ تاریخ کاشت، مقدار آب، کود و سایر اعداد باید با رقم، منطقه، آزمون خاک/آب و شرایط واقعی مزرعه تطبیق داده شوند.</div>
    </div>`;
  }

  function process(){
    addStyle();
    const box=document.getElementById("yarChat");
    if(!box) return;
    box.querySelectorAll(".yar-msg.bot").forEach(msg=>{
      if(msg.dataset.ykCropDone==="1") return;
      const holder=msg.querySelector(":scope > div");
      const span=holder?.querySelector(":scope > span");
      if(!span) return;
      const html=render(span.textContent||"");
      if(!html) return;
      holder.innerHTML=html;
      msg.dataset.ykCropDone="1";
    });
  }

  const start=()=>{
    process();
    const observer=new MutationObserver(process);
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
    window.__YK_CROP_UI_OBSERVER__=observer;
  };

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();