(function(){
'use strict';

function getLand(){
  try{
    if(typeof selected==='undefined'||typeof land!=='function')return null;
    return land(selected);
  }catch(e){return null;}
}

function getPoints(l){
  var p=l&&l.measurement&&Array.isArray(l.measurement.points)
    ?l.measurement.points
    :(l&&Array.isArray(l.points)?l.points:[]);

  return p.filter(function(x){
    return Array.isArray(x)&&x.length>=2&&
      isFinite(Number(x[0]))&&isFinite(Number(x[1]));
  });
}

function drawPlan(points){
  if(points.length<3)return '';

  var W=520,H=310,P=45;
  var xs=points.map(function(p){return Number(p[1]);});
  var ys=points.map(function(p){return Number(p[0]);});

  var minX=Math.min.apply(null,xs);
  var maxX=Math.max.apply(null,xs);
  var minY=Math.min.apply(null,ys);
  var maxY=Math.max.apply(null,ys);

  var dx=Math.max(maxX-minX,.000001);
  var dy=Math.max(maxY-minY,.000001);

  function sx(x){
    return P+(x-minX)/dx*(W-P*2);
  }

  function sy(y){
    return P+(maxY-y)/dy*(H-P*2);
  }

  var pts=points.map(function(p){
    return [sx(Number(p[1])),sy(Number(p[0]))];
  });

  var poly=pts.map(function(p){
    return p[0].toFixed(1)+','+p[1].toFixed(1);
  }).join(' ');

  var grid='';

  for(var x=20;x<W;x+=50){
    grid+='<line x1="'+x+'" y1="15" x2="'+x+'" y2="295" class="yk-grid"/>';
  }

  for(var y=15;y<H;y+=50){
    grid+='<line x1="15" y1="'+y+'" x2="505" y2="'+y+'" class="yk-grid"/>';
  }

  var marks=pts.map(function(p,i){
    return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="9" class="yk-point"/>'+
           '<text x="'+p[0]+'" y="'+(p[1]+4)+'" class="yk-number">'+(i+1)+'</text>';
  }).join('');

  var cx=pts.reduce(function(a,p){return a+p[0];},0)/pts.length;
  var cy=pts.reduce(function(a,p){return a+p[1];},0)/pts.length;

  return '<svg viewBox="0 0 520 310" class="yk-plan-svg">'+
    '<defs>'+
      '<linearGradient id="ykField" x1="0" y1="0" x2="1" y2="1">'+
        '<stop offset="0%" stop-color="#79bd72"/>'+
        '<stop offset="100%" stop-color="#c5df91"/>'+
      '</linearGradient>'+
    '</defs>'+
    '<rect x="0" y="0" width="520" height="310" rx="22" class="yk-plan-bg"/>'+
    grid+
    '<polygon points="'+poly+'" class="yk-field"/>'+
    '<polyline points="'+poly+' '+pts[0][0]+','+pts[0][1]+'" class="yk-border"/>'+
    marks+
    '<circle cx="'+cx+'" cy="'+cy+'" r="5" class="yk-center"/>'+
    '<text x="478" y="38" class="yk-north">N</text>'+
    '<path d="M478 47l-8 20h16z" class="yk-north-arrow"/>'+
    '<text x="25" y="288" class="yk-label">پلان شماتیک محدوده واقعی زمین</text>'+
  '</svg>';
}

function addStyles(){
  if(document.getElementById('yk-plan-style'))return;

  var s=document.createElement('style');
  s.id='yk-plan-style';

  s.textContent=
  '#landPlanCard{margin-top:15px;overflow:hidden}'+
  '.yk-plan-svg{display:block;width:100%;height:auto;border-radius:20px}'+
  '.yk-plan-bg{fill:#f5f8f3}'+
  '.yk-grid{stroke:#dce8dc;stroke-width:1}'+
  '.yk-field{fill:url(#ykField);fill-opacity:.48}'+
  '.yk-border{fill:none;stroke:#176b38;stroke-width:4;stroke-linejoin:round}'+
  '.yk-point{fill:#fff;stroke:#176b38;stroke-width:3}'+
  '.yk-number{font:700 11px sans-serif;fill:#176b38;text-anchor:middle}'+
  '.yk-center{fill:#fff;stroke:#e49a25;stroke-width:3}'+
  '.yk-north{font:700 19px sans-serif;fill:#173b2a;text-anchor:middle}'+
  '.yk-north-arrow{fill:#173b2a}'+
  '.yk-label{font:600 12px sans-serif;fill:#60736a}';

  document.head.appendChild(s);
}

function addPlan(){
  var l=getLand();
  if(!l)return;
  if(document.getElementById('landPlanCard'))return;

  var points=getPoints(l);
  if(points.length<3)return;

  var anchor=document.querySelector('.measured-card');
  if(!anchor)return;

  addStyles();

  var area=Number(l.areaM2||Number(l.area||0)*10000);
  var hectare=Number(l.area||area/10000);
  var perimeter=Number(l.perimeter||0);

  var card=document.createElement('div');
  card.id='landPlanCard';
  card.className='card';

  card.innerHTML=
    '<div class="section-head">'+
      '<div>'+
        '<h3>🗺️ پلان شماتیک زمین</h3>'+
        '<span class="muted">محدوده ثبت‌شده در اندازه‌گیری</span>'+
      '</div>'+
      '<span class="badge">'+points.length+' نقطه مرزی</span>'+
    '</div>'+
    drawPlan(points)+
    '<div style="display:flex;gap:14px;flex-wrap:wrap;margin:10px 2px;color:#60736a;font-size:12px">'+
      '<span>● نقاط مرزی</span>'+
      '<span>━ مرز زمین</span>'+
      '<span>● مرکز
