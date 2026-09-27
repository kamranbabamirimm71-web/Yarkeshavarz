/* =====================================
   Yar Keshavarz
   Land Schematic Map V1
   ===================================== */

(function(){

"use strict";


function createSchematic(points, areaM2, perimeter){

if(!points || points.length < 3)
return "";


let canvas=document.createElement("canvas");

canvas.width=900;
canvas.height=600;


let ctx=canvas.getContext("2d");


// background
ctx.fillStyle="#ffffff";
ctx.fillRect(0,0,900,600);


// calculate bounds

let xs=points.map(p=>p[1]);
let ys=points.map(p=>p[0]);

let minX=Math.min(...xs);
let maxX=Math.max(...xs);

let minY=Math.min(...ys);
let maxY=Math.max(...ys);



let scale=Math.min(
500/(maxX-minX||1),
350/(maxY-minY||1)
);



let centerX=450;
let centerY=300;



let mapped=points.map(p=>{

return [

centerX+
(p[1]-((minX+maxX)/2))*scale,


centerY-
(p[0]-((minY+maxY)/2))*scale

];

});



// title

ctx.font="28px sans-serif";
ctx.fillStyle="#14532d";

ctx.fillText(
"پلان شماتیک زمین",
330,
45
);



// draw polygon

ctx.beginPath();

mapped.forEach((p,i)=>{

if(i===0)
ctx.moveTo(p[0],p[1]);

else
ctx.lineTo(p[0],p[1]);

});

ctx.closePath();


ctx.fillStyle="rgba(34,197,94,.25)";
ctx.fill();


ctx.strokeStyle="#15803d";
ctx.lineWidth=5;
ctx.stroke();




// points

mapped.forEach((p,i)=>{

ctx.beginPath();

ctx.arc(
p[0],
p[1],
10,
0,
Math.PI*2
);

ctx.fillStyle="#166534";
ctx.fill();


ctx.font="20px sans-serif";
ctx.fillStyle="#000";

ctx.fillText(
(i+1),
p[0]+12,
p[1]
);


});




// compass

ctx.font="30px sans-serif";
ctx.fillStyle="#111";


ctx.fillText(
"N ↑",
430,
90
);

ctx.fillText(
"S ↓",
430,
520
);

ctx.fillText(
"W ←",
100,
310
);

ctx.fillText(
"→ E",
740,
310
);




// info box

ctx.fillStyle="#f0fdf4";
ctx.fillRect(
40,
430,
300,
120
);


ctx.fillStyle="#000";
ctx.font="22px sans-serif";


ctx.fillText(
"مساحت: "+
Math.round(areaM2)
+" مترمربع",
60,
470
);


ctx.fillText(
"محیط: "+
Math.round(perimeter)
+" متر",
60,
510
);



return canvas.toDataURL(
"image/png"
);

}




// اضافه کردن به پرونده زمین

window.addEventListener(
"load",
function(){


setTimeout(()=>{


if(typeof state==="undefined")
return;



document.querySelectorAll(
".land-card"
).forEach(()=>{});



let land=state.lands[state.lands.length-1];


if(!land)
return;



if(
land.measurement &&
land.measurement.points
){


let img=createSchematic(
land.measurement.points,
land.measurement.area,
land.measurement.perimeter
);



land.schematic=img;

try{

localStorage.setItem(
"yk-v3-clean",
JSON.stringify(state)
);

}catch(e){}



}


},1500);



});



})();
(function(){

"use strict";

const style=document.createElement("style");

style.textContent=`
.land-plan-inside > div:last-child{
  display:none !important;
}
`;

document.head.appendChild(style);

})();
(function(){
  "use strict";

  const style = document.createElement("style");

  style.textContent = `
    .land-plan-inside > img + div{
      display:none !important;
    }

    .land-plan-inside > div:last-child{
      display:none !important;
    }
  `;

  document.head.appendChild(style);
})();
