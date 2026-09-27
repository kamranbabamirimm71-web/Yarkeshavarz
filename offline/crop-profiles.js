// YarKeshavarz Crop Profiles V5
// Specialized profiles override the universal registry profile when available.
import universal, {findRegisteredCrop} from "./universal-crop-engine.js";
import specialized from "./specialized-crop-profiles.js";

const profiles={...universal};
for(const [name,detail] of Object.entries(specialized||{})){
  const base=profiles[name]||findRegisteredCrop(name)?.profile||{};
  profiles[name]={...base,...detail,aliases:[...new Set([...(base.aliases||[]),...(detail.aliases||[]),name])]};
}

export function findCropProfile(name=""){
  const n=String(name).trim();
  if(profiles[n])return profiles[n];
  const hit=Object.entries(profiles).find(([key,p])=>
    key===n||(p.aliases||[]).some(a=>String(a).trim()===n)
  );
  return hit?.[1]||findRegisteredCrop(name)?.profile||null;
}
export function listCropProfiles(){return Object.keys(profiles);}
export function profileFields(profile){
  if(!profile)return[];
  return Object.entries(profile).filter(([k])=>!["aliases","category","scientificName","summary","sources"].includes(k));
}
export {profiles};
export default profiles;
