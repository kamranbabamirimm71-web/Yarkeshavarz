// YarKeshavarz Offline V2 - Agricultural calculators
export function seedRate({areaHa=1,kgPerHa=0}={}){const a=Number(areaHa),r=Number(kgPerHa);return a>=0&&r>=0?a*r:null;}
export function plantCount({areaM2=0,rowSpacingCm=0,plantSpacingCm=0}={}){const a=Number(areaM2),r=Number(rowSpacingCm)/100,p=Number(plantSpacingCm)/100;return a>0&&r>0&&p>0?Math.round(a/(r*p)):null;}
export function irrigationVolume({areaM2=0,depthMm=0}={}){const a=Number(areaM2),d=Number(depthMm);return a>0&&d>=0?a*d:null;}
export function fertilizerProduct({nutrientKg=0,analysisPercent=0}={}){const n=Number(nutrientKg),p=Number(analysisPercent);return n>=0&&p>0?n/(p/100):null;}
export function breakEven({fixedCost=0,variableCostPerUnit=0,pricePerUnit=0}={}){const f=Number(fixedCost),v=Number(variableCostPerUnit),p=Number(pricePerUnit);return p>v?f/(p-v):null;}
export default {seedRate,plantCount,irrigationVolume,fertilizerProduct,breakEven};
