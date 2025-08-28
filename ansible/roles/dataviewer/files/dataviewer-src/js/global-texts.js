const globalText =  {
    recreationAreas: 'Recreatiegebieden',
    pesticides: 'Bestrijdingsmiddelen'
}

const featureBase = 'NatuurMilieu';
const bmaYears = [2021, 2022, 2023];
const waterMonstersYears = [2021, 2022, 2023];
const krw = [2021, 2022, 2023];
const stikstofFosforYears = [2021];
const features = {
    bma: bmaYears.map((year) => `${featureBase}:bma_${year}_toxischedruk`),
    waterMonsters: waterMonstersYears.map((year) => `${featureBase}:watermonsters_${year}`),
    krw: krw.map((year) => `${featureBase}:krw_${year}`),
    stikstof: [`${featureBase}:ntot_per_m2`],
    fosfor: [`${featureBase}:ptot_per_m2`],
    recreationAreas: [`${featureBase}:recreation_areas`]
}