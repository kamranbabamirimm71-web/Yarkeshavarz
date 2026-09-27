/* YarKeshavarz — weather.js */
const WX = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌧️',
  56: '🌧️',
  57: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  66: '🌧️',
  67: '🌧️',
  71: '🌨️',
  73: '🌨️',
  75: '❄️',
  77: '🌨️',
  80: '🌦️',
  81: '🌧️',
  82: '🌧️',
  85: '🌨️',
  86: '❄️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️'
};

function fmtHour(iso){try{return new Date(iso).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})}catch{return iso.slice(11,16)}}

function offlineWeather(label){label=label||'حالت آفلاین';const seed=[...String(label)].reduce((a,c)=>a+c.charCodeAt(0),0),now=Date.now(),baseT=18+seed%14,codes=[0,1,2,3,61,2,1],hourly={time:[],weather_code:[],temperature_2m:[],relative_humidity_2m:[],precipitation_probability:[],wind_speed_10m:[]},daily={time:[],weather_code:[],temperature_2m_min:[],temperature_2m_max:[],precipitation_probability_max:[]};for(let i=0;i<24;i++){let d=new Date(now+i*3600000);hourly.time.push(d.toISOString());hourly.weather_code.push(codes[(seed+i)%codes.length]);hourly.temperature_2m.push(baseT+Math.round(Math.sin(i/3)*4));hourly.relative_humidity_2m.push(45+(seed+i*3)%35);hourly.precipitation_probability.push((seed+i*7)%45);hourly.wind_speed_10m.push(7+(seed+i)%13)}for(let i=0;i<7;i++){let d=new Date(now+i*86400000);daily.time.push(d.toISOString());daily.weather_code.push(codes[(seed+i+2)%codes.length]);daily.temperature_2m_min.push(baseT-5+i%3);daily.temperature_2m_max.push(baseT+5+i%4);daily.precipitation_probability_max.push((seed+i*9)%55)}return {current:{temperature_2m:baseT,apparent_temperature:baseT-1,relative_humidity_2m:hourly.relative_humidity_2m[0],wind_speed_10m:hourly.wind_speed_10m[0],precipitation:0,weather_code:hourly.weather_code[0]},hourly,daily}}

function nearestHourly(d,count=12){return Array.from({length:Math.min(count,d.hourly.time.length)},(_,i)=>i)}

function hourlyHtml(d,count=12,compact=false){let idx=nearestHourly(d,count);return `<div class="${compact?'home-hourly':'hourly-grid'}">${idx.map(i=>`<div class="${compact?'home-hour':'hour-card'}"><b>${fmtHour(d.hourly.time[i])}</b><span class="${compact?'':'hi'}">${WX[d.hourly.weather_code[i]]||'🌤️'}</span><strong>${Math.round(d.hourly.temperature_2m[i])}°</strong><small>💧 ${d.hourly.relative_humidity_2m[i]}%<br>🌧️ ${d.hourly.precipitation_probability[i]}%<br>💨 ${Math.round(d.hourly.wind_speed_10m[i])} km/h</small></div>`).join('')}</div>`}

function loadHomeWeather(){
  const box=document.getElementById('homeWeather');
  if(!box)return;

  const l=state.lands.find(x=>x.lat!=null&&x.lng!=null);
  const d=offlineWeather(l?l.name:'حالت آفلاین');
  const c=d.current;

  const daily=d.daily.time.map((day,i)=>`
    <div class="home-day-card">
      <b>${new Date(day).toLocaleDateString('fa-IR',{weekday:'short',month:'numeric',day:'numeric'})}</b>
      <span>${WX[d.daily.weather_code[i]]||'🌤️'}</span>
      <strong>${Math.round(d.daily.temperature_2m_max[i])}° / ${Math.round(d.daily.temperature_2m_min[i])}°</strong>
      <small>🌧️ ${d.daily.precipitation_probability_max[i]}%</small>
    </div>
  `).join('');

  box.innerHTML=`
    <div class="home-weather-head">
      <b>🌤️ آب‌وهوای آفلاین</b>
      <button class="secondary" onclick="go('weather')">جزئیات</button>
    </div>

    <div class="home-weather-main">
      <div>
        <div class="small muted">${esc(l?l.name:'بدون داده زنده')}</div>
        <div class="home-weather-temp">${Math.round(c.temperature_2m)}°C</div>
        <div class="small">
          احساس ${Math.round(c.apparent_temperature)}°
          · رطوبت ${c.relative_humidity_2m}%
          · باد ${Math.round(c.wind_speed_10m)} km/h
        </div>
      </div>

      <div class="home-weather-icon">
        ${WX[c.weather_code]||'🌤️'}
      </div>
    </div>

    <div class="weather-section-label">⏱️ پیش‌بینی ساعتی</div>
    ${hourlyHtml(d,8,true)}

    <div class="weather-section-label">📅 پیش‌بینی روزانه</div>
    <div class="home-daily">
      ${daily}
    </div>

    <div class="small muted weather-offline-note">
      پیش‌بینی نمونه محلی — بدون اینترنت
    </div>
  `;
}
function loadLandWeather(l){let box=document.getElementById('landWeather');if(!box)return;if(l.lat==null||l.lng==null){box.classList.remove('loading');box.innerHTML="📍 موقعیت این زمین ثبت نشده است.<br><button class='secondary' style='margin-top:7px' onclick=\"go(\'measure\')\">ثبت موقعیت آفلاین</button>";return}let d=offlineWeather(l.name),c=d.current;box.classList.remove('loading');box.innerHTML=`<div class="row"><div><div class="small muted">آب‌وهوای آفلاین ${esc(l.name)}</div><div class="temp">${Math.round(c.temperature_2m)}°C</div></div><div style="font-size:45px">${WX[c.weather_code]||'🌤️'}</div></div><div class="small muted" style="margin-top:5px">رطوبت ${c.relative_humidity_2m}% · باد ${Math.round(c.wind_speed_10m)} km/h</div>`}

function loadGeneralWeather(){head('آب‌وهوا');let d=offlineWeather('حالت آفلاین'),c=d.current;app.innerHTML=`<div class="weather-now"><div class="row"><div><div class="small">حالت آفلاین</div><div class="weather-temp">${Math.round(c.temperature_2m)}°</div><div class="small">${WX[c.weather_code]||'🌤️'} · احساس ${Math.round(c.apparent_temperature)}° · رطوبت ${c.relative_humidity_2m}%</div></div><div class="weather-icon">${WX[c.weather_code]||'🌤️'}</div></div><div class="small" style="margin-top:8px">داده نمونه محلی؛ برای پیش‌بینی زنده از نسخه آنلاین استفاده کن.</div></div><div class="section"><h3>⏱️ پیش‌بینی ساعتی آفلاین</h3></div>${hourlyHtml(d,12,false)}<div class="section"><h3>📅 پیش‌بینی ۷ روزه آفلاین</h3></div><div class="forecast">${d.daily.time.map((day,i)=>`<div class="day"><b>${new Date(day).toLocaleDateString('fa-IR',{weekday:'long',month:'numeric',day:'numeric'})}</b><span>${WX[d.daily.weather_code[i]]||'🌤️'}</span><span>${Math.round(d.daily.temperature_2m_min[i])}° / ${Math.round(d.daily.temperature_2m_max[i])}°</span><span>${d.daily.precipitation_probability_max[i]}%</span></div>`).join('')}</div>`}

function weatherFor(id){let l=state.lands.find(x=>x.id===id);if(!l)return;if(l.lat==null||l.lng==null){head('آب‌وهوای زمین');app.innerHTML=`<div class="card empty"><div style="font-size:45px">📍</div><b>موقعیت این زمین ثبت نشده است.</b><p class="small muted">در نسخه آفلاین می‌توانی اطلاعات زمین را محلی ثبت کنی.</p><button class="primary" onclick="go('measure')">اندازه‌گیری آفلاین</button></div>`;return}loadWeather(l)}

function loadWeather(l){head('آب‌وهوای '+l.name);let d=offlineWeather(l.name),c=d.current;app.innerHTML=`<div class="weather-now"><div class="row"><div><div class="small">${esc(l.name)}</div><div class="weather-temp">${Math.round(c.temperature_2m)}°</div><div class="small">${WX[c.weather_code]||'🌤️'} · احساس ${Math.round(c.apparent_temperature)}° · رطوبت ${c.relative_humidity_2m}%</div></div><div class="weather-icon">${WX[c.weather_code]||'🌤️'}</div></div><div class="small" style="margin-top:8px">بارش ۰ mm · باد ${Math.round(c.wind_speed_10m)} km/h</div></div><div class="section"><h3>⏱️ پیش‌بینی ساعتی آفلاین</h3></div>${hourlyHtml(d,12,false)}<div class="section"><h3>📅 پیش‌بینی ۷ روزه آفلاین</h3></div><div class="forecast">${d.daily.time.map((day,i)=>`<div class="day"><b>${new Date(day).toLocaleDateString('fa-IR',{weekday:'long',month:'numeric',day:'numeric'})}</b><span>${WX[d.daily.weather_code[i]]||'🌤️'}</span><span>${Math.round(d.daily.temperature_2m_min[i])}° / ${Math.round(d.daily.temperature_2m_max[i])}°</span><span>${d.daily.precipitation_probability_max[i]}%</span></div>`).join('')}</div><p class="small muted" style="text-align:center">داده نمونه محلی — بدون اینترنت.</p>`}
