/* YarKeshavarz — backup.js */

function backup(){let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download='yar-keshavarz-backup.json';a.click()}
