// YarKeshavarz Offline Loader V5 - Global Agriculture Brain
(async function(){
  try{
    const mod=await import("../offline/offline-ai.js?v=20260921-global-v1");
    window.YarKeshavarzOffline={...(window.YarKeshavarzOffline||{}),findOfflineAnswer:mod.findOfflineAnswer||mod.default||window.YarKeshavarzOffline?.findOfflineAnswer,searchKnowledge:mod.searchKnowledge};
    console.log("YarKeshavarz Offline Global Agriculture Brain V1 loaded");
  }catch(error){console.error("Offline AI load failed:",error);}
})();
