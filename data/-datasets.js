/*eslint id-length: 0*/
var COLORaxisSCALE = 100,
parameterDatasets = {
  PBf: {
    name: "Lead (Fine)",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1000,
    percentiles: "0% to 99%",
		percentileBottom: 0,
    percentileTop: 0.0087
  },
  ALf: {
    name: "Aluminum (Fine)",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: false,
    scale: 1,
    percentiles: "0% to 95%",
		percentileBottom: 0,
    percentileTop: 0.23
  },
  CUf: {
    name: "Copper (Fine)",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1000,
    percentiles: "0% to 95%",
		percentileBottom: 0,
    percentileTop: 0.0062
  },
  dv: {
    name: "Deciview",
    unit: "dv",
    isDisplay: false,
    scale: 1,
    percentiles: "0% to 98%",
		percentileBottom: 0,
    percentileTop: 28.14
  },
  NH4f: {
    name: "Ammonium Ion (Fine)",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1,
    percentiles: "0% to 95%",
		percentileBottom: 0,
    percentileTop: 2.98
  },
  ECf: {
    name: "Carbon, Elemental Total (Fine)",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1,
    percentiles: "0% to 95%",
		percentileBottom: 0,
    percentileTop: 0.72
  },
  NO3f: {
    name: "Nitrate (Fine)",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1,
    percentiles: "0% to 95%",
		percentileBottom: 0,
    percentileTop: 1.74
  },
  SIf: {
    name: "Silicon (Fine)",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1,
    percentiles: "0% to 95%",
		percentileBottom: 0,
    percentileTop: 0.5
  },
  OCf: {
    name: "Carbon, Organic Total (Fine)",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1,
    percentiles: "0% to 95%",
		percentileBottom: 0,
    percentileTop: 3
  },
  SO4f: {
    name: "Sulfate (Fine)",
    unit: "µg/m<sup>3</sup> LC",
    isDisplay: true,
    scale: 1,
    percentiles: "0% to 98%",
		percentileBottom: 0,
    percentileTop: 6.57
  }
};
